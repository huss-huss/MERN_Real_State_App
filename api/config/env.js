const REQUIRED = ['MONGODB_URI', 'JWT_SECRET']

const isProduction = () => process.env.NODE_ENV === 'production'

const assertEnv = () => {
  const missing = REQUIRED.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
  if (isProduction() && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production')
  }
}

const allowedOrigins = () =>
  (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

module.exports = { assertEnv, isProduction, allowedOrigins }
