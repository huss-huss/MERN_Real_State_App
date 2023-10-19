const express = require('express')
const verifyUser = require('../utils/verifyUser')
const { updateUser } = require('../controllers/userCtrl')

const router = express.Router()

router.post('/update/:id', verifyUser, updateUser)

module.exports = router
