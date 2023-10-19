const jwt = require('jsonwebtoken')
const { customError } = require('./errorHandler')

const verifyUser = (req, res, next) => {
  const token = req.cookies.access_token
  if (!token) return next(customError(401, 'Unauthorized'))

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(customError(403, 'Forbidden'))
    req.user = user
    next()
  })
}

module.exports = verifyUser
