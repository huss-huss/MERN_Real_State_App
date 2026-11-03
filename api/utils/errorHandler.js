const { isProduction } = require('../config/env')

class HttpError extends Error {
  constructor(statusCode, message, details) {
    super(message)
    this.statusCode = statusCode
    this.details = details
  }
}

const customError = (statusCode, message, details) =>
  new HttpError(statusCode, message, details)

const notFound = (req, res, next) => {
  next(customError(404, `Not Found - ${req.originalUrl}`))
}

// Translate known library errors into client-facing HTTP errors.
const normalize = (err) => {
  if (err instanceof HttpError) return err
  if (err?.type === 'entity.parse.failed') {
    return customError(400, 'Malformed JSON body')
  }
  if (err?.type === 'entity.too.large') {
    return customError(413, 'Request body too large')
  }
  if (err?.name === 'CastError') {
    return customError(400, `Invalid ${err.path}`)
  }
  if (err?.name === 'ValidationError') {
    return customError(400, 'Validation failed', Object.keys(err.errors || {}))
  }
  if (err?.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field'
    return customError(409, `${field} is already in use`)
  }
  return null
}

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const known = normalize(err)
  const statusCode = known?.statusCode || 500

  if (statusCode >= 500) console.error(err)

  const body = {
    success: false,
    statusCode,
    message: known ? known.message : 'Internal Server Error',
  }
  if (known?.details) body.details = known.details
  if (!isProduction() && statusCode >= 500) body.stack = err?.stack

  res.status(statusCode).json(body)
}

module.exports = { HttpError, customError, notFound, errorHandler }
