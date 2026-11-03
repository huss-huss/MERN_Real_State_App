const jwt = require('jsonwebtoken')
const { isProduction } = require('../config/env')

const COOKIE_NAME = 'access_token'
const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60

const cookieOptions = () => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: 'lax',
  path: '/',
})

const signToken = (user) =>
  jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: TOKEN_TTL_SECONDS,
  })

const setAuthCookie = (res, user) =>
  res.cookie(COOKIE_NAME, signToken(user), {
    ...cookieOptions(),
    maxAge: TOKEN_TTL_SECONDS * 1000,
  })

const clearAuthCookie = (res) => res.clearCookie(COOKIE_NAME, cookieOptions())

module.exports = { COOKIE_NAME, setAuthCookie, clearAuthCookie }
