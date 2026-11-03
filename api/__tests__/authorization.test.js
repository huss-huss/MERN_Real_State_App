const request = require('supertest')
const jwt = require('jsonwebtoken')
const { createApp } = require('../app')
const Listing = require('../models/listingModel')
const User = require('../models/userModel')
const { useTestDb } = require('./helpers/db')
const { listingInput, signedInAgent } = require('./helpers/factory')

useTestDb()
const app = createApp()

describe('authentication required', () => {
  it.each([
    ['post', '/api/listing/create'],
    ['post', '/api/listing/update/0123456789abcdef01234567'],
    ['delete', '/api/listing/delete/0123456789abcdef01234567'],
    ['post', '/api/user/update/0123456789abcdef01234567'],
    ['delete', '/api/user/delete/0123456789abcdef01234567'],
    ['get', '/api/user/listings/0123456789abcdef01234567'],
    ['get', '/api/user/0123456789abcdef01234567'],
  ])('%s %s returns 401 without a session', async (method, url) => {
    const res = await request(app)[method](url).send({})
    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })

  it('rejects a token signed with another secret', async () => {
    const forged = jwt.sign({ id: '0123456789abcdef01234567' }, 'wrong-secret')
    await request(app)
      .post('/api/listing/create')
      .set('Cookie', `access_token=${forged}`)
      .send(listingInput())
      .expect(401)
  })

  it('rejects an expired token', async () => {
    const expired = jwt.sign({ id: '0123456789abcdef01234567' }, process.env.JWT_SECRET, {
      expiresIn: -10,
    })
    await request(app)
      .post('/api/listing/create')
      .set('Cookie', `access_token=${expired}`)
      .send(listingInput())
      .expect(401)
  })

  it('rejects alg=none tokens', async () => {
    const none = jwt.sign({ id: '0123456789abcdef01234567' }, null, { algorithm: 'none' })
    await request(app)
      .post('/api/listing/create')
      .set('Cookie', `access_token=${none}`)
      .send(listingInput())
      .expect(401)
  })
})

describe('ownership checks', () => {
  let owner
  let intruder
  let listingId

  beforeEach(async () => {
    owner = await signedInAgent(app)
    intruder = await signedInAgent(app)
    const res = await owner.agent.post('/api/listing/create').send(listingInput()).expect(201)
    listingId = res.body._id
  })

  it("forbids updating someone else's listing", async () => {
    await intruder.agent
      .post(`/api/listing/update/${listingId}`)
      .send({ name: 'Hijacked listing' })
      .expect(403)
    expect((await Listing.findById(listingId)).name).toBe('Sunny two bedroom flat')
  })

  it("forbids deleting someone else's listing", async () => {
    await intruder.agent.delete(`/api/listing/delete/${listingId}`).expect(403)
    expect(await Listing.findById(listingId)).not.toBeNull()
  })

  it("forbids updating, deleting or listing another user's account", async () => {
    const id = owner.user._id
    await intruder.agent.post(`/api/user/update/${id}`).send({ username: 'pwned' }).expect(403)
    await intruder.agent.delete(`/api/user/delete/${id}`).expect(403)
    await intruder.agent.get(`/api/user/listings/${id}`).expect(403)
    expect((await User.findById(id)).username).toBe(owner.user.username)
  })
})
