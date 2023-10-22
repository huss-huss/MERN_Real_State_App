const express = require('express')
const {
  createListing,
  deleteListing,
  updateListing,
  getListing,
  getListings,
} = require('../controllers/listingCtrl')
const verifyUser = require('../utils/verifyUser')
const router = express.Router()

router.post('/create', verifyUser, createListing)
router.delete('/delete/:id', verifyUser, deleteListing)
router.post('/update/:id', verifyUser, updateListing)
router.get('/get/:id', getListing)
router.get('/get', getListings)

module.exports = router
