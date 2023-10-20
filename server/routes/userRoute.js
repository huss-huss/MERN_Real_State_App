const express = require('express')
const verifyUser = require('../utils/verifyUser')
const {
  updateUser,
  deleteUser,
  getUserListing,
} = require('../controllers/userCtrl')

const router = express.Router()

router.post('/update/:id', verifyUser, updateUser)
router.delete('/delete/:id', verifyUser, deleteUser)
router.get('/listings/:id', verifyUser, getUserListing)

module.exports = router
