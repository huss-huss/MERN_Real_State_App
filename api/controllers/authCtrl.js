const User = require('../models/userModel')
const bcrypt = require('bcryptjs')
const { customError } = require('../utils/errorHandler')
const jwt = require('jsonwebtoken')

const signUp = async (req, res, next) => {
  const { username, email, password } = req.body
  try {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    })
    res.status(201).json(newUser)
  } catch (err) {
    next(err)
  }
}

const signIn = async (req, res, next) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user) return next(customError(404, 'User not found'))
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return next(customError(401, 'Invalid credentials'))

    const payload = {
      id: user._id,
      username: user.username,
      email: user.email,
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET)
    const { password: userPassword, ...rest } = user._doc

    res.cookie('access_token', token, { httpOnly: true }).status(200).json(rest)
  } catch (error) {
    next(error)
  }
}

const google = async (req, res, next) => {
  const { name, email, photo } = req.body
  try {
    const user = await User.findOne({ email })
    if (user) {
      const payload = {
        id: user._id,
        username: user.username,
        email: user.email,
      }
      const token = jwt.sign(payload, process.env.JWT_SECRET)
      const { password: userPassword, ...rest } = user._doc

      res
        .cookie('access_token', token, { httpOnly: true })
        .status(200)
        .json(rest)
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8)
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(generatedPassword, salt)
      const newUser = await User.create({
        username:
          name.split(' ').join('').toLowerCase() +
          Math.random().toString(36).slice(-4),
        email,
        password: hashedPassword,
        avatar: photo,
      })
      await newUser.save()
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET)
      const { password: userPassword, ...rest } = newUser._doc
      res
        .cookie('access_token', token, { httpOnly: true })
        .status(200)
        .json(rest)
    }
  } catch (error) {
    next(error)
  }
}

const signOut = (req, res, next) => {
  try {
    res
      .clearCookie('access_token')
      .status(200)
      .json({ message: 'User has been signed out' })
  } catch (error) {
    next
  }
}

module.exports = {
  signUp,
  signIn,
  google,
  signOut,
}
