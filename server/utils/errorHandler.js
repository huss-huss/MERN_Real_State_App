const customError = (statusCode, message) => {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

//not Found

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(400)
  next(error)
}

//error handler
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode
  res.status(statusCode)
  res.json({
    message: err?.message,
    stack: err?.stack,
    success: false,
  })
}

module.exports = { notFound, errorHandler, customError }
