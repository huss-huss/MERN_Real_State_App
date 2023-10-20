const express = require('express')
const { createListing } = require('../controllers/listingCtrl')
const verifyUser = require('../utils/verifyUser')
const router = express.Router()

router.post('/create', verifyUser, createListing)

module.exports = router
