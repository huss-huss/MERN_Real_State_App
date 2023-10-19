const express = require('express')
const verifyUser = require('../utils/verifyUser')
const { updateUser, deleteUser } = require('../controllers/userCtrl')

const router = express.Router()

router.post('/update/:id', verifyUser, updateUser)
router.delete('/delete/:id', verifyUser, deleteUser)

module.exports = router
