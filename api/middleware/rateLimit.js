const { rateLimit } = require('express-rate-limit')

const json = (req, res, next, options) =>
  res.status(options.statusCode).json({
    success: false,
    statusCode: options.statusCode,
    message: 'Too many requests, please try again later',
  })

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AUTH_RATE_LIMIT_MAX) || 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: json,
})

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: Number(process.env.API_RATE_LIMIT_MAX) || 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: json,
})

module.exports = { authLimiter, apiLimiter }
