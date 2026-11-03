jest.mock('../services/firebaseAuth', () => ({ verifyFirebaseIdToken: jest.fn() }))

const request = require('supertest')
const jwt = require('jsonwebtoken')
const { createApp } = require('../app')
const User = require('../models/userModel')
const { verifyFirebaseIdToken } = require('../services/firebaseAuth')
const { customError } = require('../utils/errorHandler')
const { useTestDb } = require('./helpers/db')
const { userInput } = require('./helpers/factory')

useTestDb()
const app = createApp()

const authCookie = (res) =>
  (res.headers['set-cookie'] || []).find((c) => c.startsWith('access_token='))

describe('POST /api/auth/signup', () => {
  it('creates a user without returning the password hash', async () => {
    const input = userInput()
    const res = await request(app).post('/api/auth/signup').send(input).expect(201)

    expect(res.body).toMatchObject({ username: input.username, email: input.email })
    expect(res.body.password).toBeUndefined()

    const stored = await User.findOne({ email: input.email }).select('+password')
    expect(stored.password).not.toBe(input.password)
  })

  it('normalises email case', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send(userInput({ email: 'Mixed.Case@Example.com' }))
      .expect(201)
    expect(res.body.email).toBe('mixed.case@example.com')
  })

  it.each([
    ['missing email', { email: undefined }],
    ['invalid email', { email: 'not-an-email' }],
    ['short password', { password: 'short' }],
    ['bad username', { username: 'no spaces allowed' }],
  ])('rejects %s with 400', async (_label, overrides) => {
    const res = await request(app).post('/api/auth/signup').send(userInput(overrides)).expect(400)
    expect(res.body.success).toBe(false)
  })

  it('rejects operator injection in fields', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send(userInput({ email: { $gt: '' } }))
      .expect(400)
  })

  it('returns 409 for a duplicate email', async () => {
    const input = userInput()
    await request(app).post('/api/auth/signup').send(input).expect(201)
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ ...userInput(), email: input.email })
      .expect(409)
    expect(res.body.message).toMatch(/email/)
  })
})

describe('POST /api/auth/signin', () => {
  let input
  beforeEach(async () => {
    input = userInput()
    await request(app).post('/api/auth/signup').send(input).expect(201)
  })

  it('sets a hardened, expiring auth cookie', async () => {
    const res = await request(app)
      .post('/api/auth/signin')
      .send({ email: input.email.toUpperCase(), password: input.password })
      .expect(200)

    expect(res.body.password).toBeUndefined()
    const cookie = authCookie(res)
    expect(cookie).toMatch(/HttpOnly/)
    expect(cookie).toMatch(/SameSite=Lax/)
    expect(cookie).toMatch(/Max-Age=604800/)

    const token = cookie.split(';')[0].split('=')[1]
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    expect(payload.id).toBe(res.body._id)
    expect(payload.exp).toBeDefined()
    expect(payload.email).toBeUndefined()
  })

  it('uses the same 401 for wrong password and unknown email', async () => {
    const wrong = await request(app)
      .post('/api/auth/signin')
      .send({ email: input.email, password: 'wrong-password' })
      .expect(401)
    const unknown = await request(app)
      .post('/api/auth/signin')
      .send({ email: 'nobody@example.com', password: 'whatever-password' })
      .expect(401)
    expect(wrong.body.message).toBe(unknown.body.message)
    expect(authCookie(wrong)).toBeUndefined()
  })
})

describe('signout', () => {
  it('clears the auth cookie', async () => {
    const res = await request(app).get('/api/auth/signout').expect(200)
    expect(authCookie(res)).toMatch(/access_token=;/)
  })
})

describe('POST /api/auth/google', () => {
  afterEach(() => verifyFirebaseIdToken.mockReset())

  it('requires an idToken and ignores client-supplied email', async () => {
    await request(app)
      .post('/api/auth/google')
      .send({ email: 'victim@example.com', name: 'Mallory' })
      .expect(400)
    expect(verifyFirebaseIdToken).not.toHaveBeenCalled()
  })

  it('rejects an invalid token', async () => {
    verifyFirebaseIdToken.mockRejectedValue(customError(401, 'Invalid Google credential'))
    await request(app).post('/api/auth/google').send({ idToken: 'forged' }).expect(401)
  })

  it('creates an account from a verified token and signs in', async () => {
    verifyFirebaseIdToken.mockResolvedValue({
      email: 'new.person@example.com',
      name: 'New Person',
      picture: 'https://example.com/avatar.png',
    })
    const res = await request(app).post('/api/auth/google').send({ idToken: 'ok' }).expect(200)

    expect(verifyFirebaseIdToken).toHaveBeenCalledWith('ok')
    expect(res.body).toMatchObject({
      email: 'new.person@example.com',
      avatar: 'https://example.com/avatar.png',
    })
    expect(res.body.username).toMatch(/^newperson[0-9a-f]{6}$/)
    expect(res.body.password).toBeUndefined()
    expect(authCookie(res)).toBeDefined()
  })

  it('signs in an existing account by verified email', async () => {
    const input = userInput()
    const created = await request(app).post('/api/auth/signup').send(input).expect(201)
    verifyFirebaseIdToken.mockResolvedValue({ email: input.email, name: 'Someone' })

    const res = await request(app).post('/api/auth/google').send({ idToken: 'ok' }).expect(200)
    expect(res.body._id).toBe(created.body._id)
    expect(await User.countDocuments()).toBe(1)
  })
})
