const express = require('express')
const { signUp, signIn, google, signOut } = require('../controllers/authCtrl')
const validate = require('../middleware/validate')
const { authLimiter } = require('../middleware/rateLimit')
const { signUpSchema, signInSchema, googleSchema } = require('../validators/auth')

const router = express.Router()

router.post('/signup', authLimiter, validate(signUpSchema), signUp)
router.post('/signin', authLimiter, validate(signInSchema), signIn)
router.post('/google', authLimiter, validate(googleSchema), google)
// GET kept for the existing client; POST is the preferred form.
router.get('/signout', signOut)
router.post('/signout', signOut)

module.exports = router
