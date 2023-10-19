const Listing = require('../models/listingModel')

const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create(req.body)
    res.status(201).json(listing)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createListing,
}
