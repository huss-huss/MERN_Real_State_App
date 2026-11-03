const { z } = require('./common')
const { email, password, username } = require('./auth')

const updateUserSchema = z
  .object({
    username: username.optional(),
    email: email.optional(),
    password: z.union([password, z.literal('')]).optional(),
    avatar: z.url({ protocol: /^https?$/ }).max(2048).optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined && v !== ''), {
    message: 'Nothing to update',
  })

module.exports = { updateUserSchema }
