const { customError } = require('../utils/errorHandler')

// Validates and replaces req[source] with the parsed (stripped/coerced) value.
const validate =
  (schema, source = 'body') =>
  (req, res, next) => {
    const result = schema.safeParse(req[source] ?? {})
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }))
      const first = details[0]
      const message = first?.path
        ? `${first.path}: ${first.message}`
        : first?.message || 'Invalid request'
      return next(customError(400, message, details))
    }
    // req.query is a getter in Express 5, so keep parsed values separately.
    req.validated = { ...(req.validated || {}), [source]: result.data }
    if (source === 'body') req.body = result.data
    next()
  }

module.exports = validate
