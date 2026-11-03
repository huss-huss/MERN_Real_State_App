const Listing = require('../models/listingModel')
const { customError } = require('../utils/errorHandler')
const asyncHandler = require('../utils/asyncHandler')

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const findOwnedListing = async (req) => {
  const listing = await Listing.findById(req.params.id)
  if (!listing) throw customError(404, 'Listing not found')
  if (listing.userRef !== req.user.id) {
    throw customError(403, 'You can only modify your own listings')
  }
  return listing
}

const createListing = asyncHandler(async (req, res) => {
  const listing = await Listing.create({ ...req.body, userRef: req.user.id })
  res.status(201).json(listing)
})

const deleteListing = asyncHandler(async (req, res) => {
  const listing = await findOwnedListing(req)
  await listing.deleteOne()
  res.status(200).json({ message: 'Listing deleted' })
})

const updateListing = asyncHandler(async (req, res) => {
  const listing = await findOwnedListing(req)
  const merged = { ...listing.toObject(), ...req.body }
  if (merged.offer && merged.discountPrice >= merged.regularPrice) {
    throw customError(400, 'discountPrice: must be lower than regularPrice')
  }
  listing.set(req.body)
  await listing.save()
  res.status(200).json(listing)
})

const getListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id)
  if (!listing) throw customError(404, 'Listing not found')
  res.status(200).json(listing)
})

const getListings = asyncHandler(async (req, res) => {
  const { searchTerm, type, offer, furnished, parking, sort, order, limit, startIndex } =
    req.validated.query

  // Unchecked boolean filters mean "don't filter", matching the original UI behaviour.
  const filter = {}
  if (searchTerm) filter.name = { $regex: escapeRegex(searchTerm), $options: 'i' }
  if (type !== 'all') filter.type = type
  if (offer) filter.offer = true
  if (furnished) filter.furnished = true
  if (parking) filter.parking = true

  const listings = await Listing.find(filter)
    .sort({ [sort]: order === 'asc' ? 1 : -1, _id: -1 })
    .skip(startIndex)
    .limit(limit)

  res.status(200).json(listings)
})

module.exports = {
  createListing,
  deleteListing,
  updateListing,
  getListing,
  getListings,
}
