const bcrypt = require('bcryptjs')
const Listing = require('../models/listingModel')
const User = require('../models/userModel')
const { customError } = require('../utils/errorHandler')
const { clearAuthCookie } = require('../utils/auth')
const asyncHandler = require('../utils/asyncHandler')

const assertSelf = (req, action) => {
  if (req.user.id !== req.params.id) {
    throw customError(403, `You can only ${action} your own account`)
  }
}

const updateUser = asyncHandler(async (req, res) => {
  assertSelf(req, 'update')
  const { username, email, password, avatar } = req.body

  const update = {}
  if (username) update.username = username
  if (email) update.email = email
  if (avatar) update.avatar = avatar
  if (password) update.password = await bcrypt.hash(password, 10)

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: update },
    { new: true, runValidators: true }
  )
  if (!user) throw customError(404, 'User not found')
  res.status(200).json(user.toJSON())
})

const deleteUser = asyncHandler(async (req, res) => {
  assertSelf(req, 'delete')
  const user = await User.findByIdAndDelete(req.params.id)
  if (!user) throw customError(404, 'User not found')
  // Remove the user's listings so they don't linger without an owner.
  await Listing.deleteMany({ userRef: req.params.id })
  clearAuthCookie(res).status(200).json({ message: 'User has been deleted' })
})

const getUserListing = asyncHandler(async (req, res) => {
  assertSelf(req, 'view listings for')
  const listings = await Listing.find({ userRef: req.params.id }).sort({ createdAt: -1 })
  res.status(200).json(listings)
})

// Contact card for signed-in users, used by the listing page ("Contact landlord").
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('username email avatar')
  if (!user) throw customError(404, 'User not found')
  res.status(200).json(user.toJSON())
})

module.exports = { updateUser, deleteUser, getUserListing, getUser }
