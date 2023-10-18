const express = require('express')
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userCtrl')
const router = express.Router()

// GET all users
router.get('/all-users', getAllUsers)

// GET a single user by ID
router.get('/single-user/:id', getUserById)

// POST a new user
router.post('/create-user', createUser)

// PUT update an existing user
router.put('/update-user/:id', updateUser)

// DELETE a user by ID
router.delete('/delete-user/:id', deleteUser)

module.exports = router
