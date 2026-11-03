const { z } = require('./common')

const email = z.string().trim().toLowerCase().pipe(z.email().max(254))
const password = z.string().min(8, 'must be at least 8 characters').max(128)
const username = z
  .string()
  .trim()
  .min(3)
  .max(30)
  .regex(/^[a-zA-Z0-9_.-]+$/, 'may only contain letters, numbers, _ . -')

const signUpSchema = z.object({ username, email, password })

const signInSchema = z.object({
  email,
  password: z.string().min(1, 'is required').max(128),
})

const googleSchema = z.object({
  idToken: z.string().min(1, 'is required').max(4096),
})

module.exports = { signUpSchema, signInSchema, googleSchema, email, password, username }
