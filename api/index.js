require('dotenv').config()
const express = require('express')
const path = require('path')

const dbConnect = require('./config/db')
const userRoute = require('./routes/userRoute')
const authRoute = require('./routes/authRoute')
const listingRoute = require('./routes/listingRoute')
const { notFound, errorHandler } = require('./utils/errorHandler')
const cookieParser = require('cookie-parser')

const __local_dirname = path.resolve()

const app = express()

// Connect to MongoDB
dbConnect()

// Middleware
app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/api/auth', authRoute)
app.use('/api/user', userRoute)
app.use('/api/listing', listingRoute)

app.use(express.static(path.join(__local_dirname, '/client/dist')))

app.get('*', (req, res) => {
  res.sendFile(path.join(__local_dirname, 'client', 'dist', 'index.html'))
})

app.use(notFound)
app.use(errorHandler)

app.listen(3000, () => {
  console.log('Server listening on port 3000...')
})
