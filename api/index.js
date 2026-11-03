require('dotenv').config()
const mongoose = require('mongoose')

const { assertEnv } = require('./config/env')
const dbConnect = require('./config/db')
const { createApp } = require('./app')

const PORT = Number(process.env.PORT) || 3000

const start = async () => {
  assertEnv()
  await dbConnect()

  const server = createApp().listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
  })

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down`)
    server.close(() => {
      mongoose.connection.close(false).finally(() => process.exit(0))
    })
    setTimeout(() => process.exit(1), 10_000).unref()
  }
  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
}

start().catch((err) => {
  console.error('Failed to start server:', err.message)
  process.exit(1)
})
