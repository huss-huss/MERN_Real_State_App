const express = require('express')
const verifyUser = require('../utils/verifyUser')
const validate = require('../middleware/validate')
const { idParams } = require('../validators/common')
const { updateUserSchema } = require('../validators/user')
const {
  updateUser,
  deleteUser,
  getUserListing,
  getUser,
} = require('../controllers/userCtrl')

const router = express.Router()

router.use(verifyUser)

router.post('/update/:id', validate(idParams, 'params'), validate(updateUserSchema), updateUser)
router.delete('/delete/:id', validate(idParams, 'params'), deleteUser)
router.get('/listings/:id', validate(idParams, 'params'), getUserListing)
router.get('/:id', validate(idParams, 'params'), getUser)

module.exports = router
