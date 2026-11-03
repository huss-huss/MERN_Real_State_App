const jwt = require('jsonwebtoken')
const { customError } = require('./errorHandler')
const { COOKIE_NAME } = require('./auth')

const verifyUser = (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME]
  if (!token) return next(customError(401, 'Unauthorized'))

  jwt.verify(
    token,
    process.env.JWT_SECRET,
    { algorithms: ['HS256'] },
    (err, payload) => {
      if (err || !payload?.id) return next(customError(401, 'Unauthorized'))
      req.user = { id: String(payload.id) }
      next()
    }
  )
}

module.exports = verifyUser
