require('dotenv').config()
const express = require('express')

const dbConnect = require('./config/db')
const userRoute = require('./routes/userRoute')
const authRoute = require('./routes/authRoute')
const { notFound, errorHandler } = require('./utils/errorHandler')

const app = express()

// Connect to MongoDB
dbConnect()

// Middleware
app.use(express.json())

// Routes
app.use('/api/auth', authRoute)
app.use('/api/users', userRoute)

app.use(notFound)
app.use(errorHandler)

app.listen(3000, () => {
  console.log('Server listening on port 3000...')
})
