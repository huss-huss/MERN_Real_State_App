require('dotenv').config()
const express = require('express')

const dbConnect = require('./config/db')
const userRoute = require('./routes/userRoute')
const authRoute = require('./routes/authRoute')
const { notFound, errorHandler } = require('./utils/errorHandler')
const cookieParser = require('cookie-parser')

const app = express()

// Connect to MongoDB
dbConnect()

// Middleware
app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/api/auth', authRoute)
app.use('/api/user', userRoute)

app.use(notFound)
app.use(errorHandler)

app.listen(3000, () => {
  console.log('Server listening on port 3000...')
})
