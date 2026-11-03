const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const User = require('../models/userModel')
const { customError } = require('../utils/errorHandler')
const { setAuthCookie, clearAuthCookie } = require('../utils/auth')
const asyncHandler = require('../utils/asyncHandler')
const { verifyFirebaseIdToken } = require('../services/firebaseAuth')

const BCRYPT_ROUNDS = 10
// Case-insensitive match so accounts created before emails were normalised still resolve.
const CASE_INSENSITIVE = { locale: 'en', strength: 2 }

// Used to keep sign-in timing similar whether or not the email exists.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_ROUNDS)

const findByEmail = (email) => User.findOne({ email }).collation(CASE_INSENSITIVE)

const signUp = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body
  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS)
  const user = await User.create({ username, email, password: hashedPassword })
  res.status(201).json(user.toJSON())
})

const signIn = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body
  const user = await findByEmail(email).select('+password')
  const isMatch = await bcrypt.compare(password, user?.password || DUMMY_HASH)
  if (!user || !isMatch) return next(customError(401, 'Invalid email or password'))

  setAuthCookie(res, user).status(200).json(user.toJSON())
})

const usernameFrom = (name, email) => {
  const base =
    (name || email.split('@')[0]).replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 20) ||
    'user'
  return `${base}${crypto.randomBytes(3).toString('hex')}`
}

const google = asyncHandler(async (req, res) => {
  const profile = await verifyFirebaseIdToken(req.body.idToken)

  let user = await findByEmail(profile.email)
  if (!user) {
    const randomPassword = crypto.randomBytes(32).toString('hex')
    user = await User.create({
      username: usernameFrom(profile.name, profile.email),
      email: profile.email,
      password: await bcrypt.hash(randomPassword, BCRYPT_ROUNDS),
      ...(profile.picture && { avatar: profile.picture }),
    })
  }

  setAuthCookie(res, user).status(200).json(user.toJSON())
})

const signOut = (req, res) => {
  clearAuthCookie(res).status(200).json({ message: 'User has been signed out' })
}

module.exports = { signUp, signIn, google, signOut }
