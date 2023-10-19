const User = require('../models/userModel')
const { customError } = require('../utils/errorHandler')
const bcrypt = require('bcryptjs')

const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(customError(401, 'You can only update your account!'))
  try {
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10)
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      { new: true }
    )

    const { password, ...rest } = updatedUser._doc
    res.status(200).json(rest)
  } catch (err) {
    next(err)
  }
}

const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(customError(401, 'You can only delete your account!'))
  try {
    await User.findByIdAndDelete(req.params.id)
    res.status(200).clearCookie('access_token').json('User has been deleted...')
  } catch (err) {
    next(err)
  }
}

module.exports = {
  updateUser,
  deleteUser,
}
