const Listing = require('../models/listingModel')
const { customError } = require('../utils/errorHandler')

const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create(req.body)
    res.status(201).json(listing)
  } catch (error) {
    next(error)
  }
}

const deleteListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id)
  if (!listing) {
    return next(customError(404, 'Listing not found'))
  }
  if (req.user.id.toString() !== listing.userRef.toString()) {
    return next(customError(401, 'Unauthorized'))
  }
  try {
    await Listing.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: 'Listing deleted' })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createListing,
  deleteListing,
}
