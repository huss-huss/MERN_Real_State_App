const express = require('express')
const {
  createListing,
  deleteListing,
  updateListing,
  getListing,
  getListings,
} = require('../controllers/listingCtrl')
const verifyUser = require('../utils/verifyUser')
const validate = require('../middleware/validate')
const { idParams } = require('../validators/common')
const {
  createListingSchema,
  updateListingSchema,
  searchQuerySchema,
} = require('../validators/listing')

const router = express.Router()

router.post('/create', verifyUser, validate(createListingSchema), createListing)
router.delete('/delete/:id', verifyUser, validate(idParams, 'params'), deleteListing)
router.post(
  '/update/:id',
  verifyUser,
  validate(idParams, 'params'),
  validate(updateListingSchema),
  updateListing
)
router.get('/get/:id', validate(idParams, 'params'), getListing)
router.get('/get', validate(searchQuerySchema, 'query'), getListings)

module.exports = router
