const fs = require('fs')
const path = require('path')
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const userRoute = require('./routes/userRoute')
const authRoute = require('./routes/authRoute')
const listingRoute = require('./routes/listingRoute')
const { apiLimiter } = require('./middleware/rateLimit')
const { notFound, errorHandler } = require('./utils/errorHandler')
const { allowedOrigins } = require('./config/env')

const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist')

const createApp = () => {
  const app = express()

  app.disable('x-powered-by')
  if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1)

  app.use(
    helmet({
      // The client talks to Firebase (Auth popup + Storage) directly from the browser.
      contentSecurityPolicy: {
        directives: {
          'script-src': ["'self'", 'https://apis.google.com'],
          'connect-src': ["'self'", 'https://*.googleapis.com'],
          'img-src': ["'self'", 'data:', 'blob:', 'https:'],
          'frame-src': ['https://*.firebaseapp.com', 'https://accounts.google.com'],
        },
      },
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    })
  )

  // The API is same-origin with the bundled client; only listed origins may call it cross-site.
  const origins = allowedOrigins()
  app.use(
    '/api',
    cors({
      origin: (origin, cb) => cb(null, !origin || origins.includes(origin)),
      credentials: true,
    })
  )

  app.use(express.json({ limit: '100kb' }))
  app.use(cookieParser())

  app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' }))

  app.use('/api', apiLimiter)
  app.use('/api/auth', authRoute)
  app.use('/api/user', userRoute)
  app.use('/api/listing', listingRoute)
  app.use('/api', notFound)

  if (fs.existsSync(CLIENT_DIST)) {
    app.use(express.static(CLIENT_DIST))
    app.get('*', (req, res) => res.sendFile(path.join(CLIENT_DIST, 'index.html')))
  }

  app.use(notFound)
  app.use(errorHandler)

  return app
}

module.exports = { createApp }
