const express = require('express')
const { signUp, signIn, google, signOut } = require('../controllers/authCtrl')
const router = express.Router()

router.post('/signup', signUp)
router.post('/signin', signIn)
router.post('/google', google)
router.get('/signout', signOut)

module.exports = router
