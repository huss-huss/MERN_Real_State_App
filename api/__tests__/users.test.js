const request = require('supertest')
const { createApp } = require('../app')
const Listing = require('../models/listingModel')
const User = require('../models/userModel')
const { useTestDb } = require('./helpers/db')
const { listingInput, signedInAgent } = require('./helpers/factory')

useTestDb()
const app = createApp()

describe('user routes', () => {
  it('updates own profile and re-hashes a new password', async () => {
    const { agent, user, input } = await signedInAgent(app)
    const res = await agent
      .post(`/api/user/update/${user._id}`)
      .send({ username: 'renamed_user', password: 'a-brand-new-password' })
      .expect(200)
    expect(res.body.username).toBe('renamed_user')
    expect(res.body.password).toBeUndefined()

    await request(app)
      .post('/api/auth/signin')
      .send({ email: input.email, password: 'a-brand-new-password' })
      .expect(200)
  })

  it('keeps the existing password when the form sends an empty one', async () => {
    const { agent, user, input } = await signedInAgent(app)
    await agent
      .post(`/api/user/update/${user._id}`)
      .send({ username: user.username, email: input.email, password: '' })
      .expect(200)
    await request(app)
      .post('/api/auth/signin')
      .send({ email: input.email, password: input.password })
      .expect(200)
  })

  it('returns 409 when changing to an email that is taken', async () => {
    const a = await signedInAgent(app)
    const b = await signedInAgent(app)
    await b.agent.post(`/api/user/update/${b.user._id}`).send({ email: a.input.email }).expect(409)
  })

  it("lists only the user's own listings", async () => {
    const a = await signedInAgent(app)
    const b = await signedInAgent(app)
    await a.agent.post('/api/listing/create').send(listingInput()).expect(201)
    await b.agent.post('/api/listing/create').send(listingInput()).expect(201)

    const res = await a.agent.get(`/api/user/listings/${a.user._id}`).expect(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].userRef).toBe(a.user._id)
  })

  it('returns a contact card without the password hash', async () => {
    const a = await signedInAgent(app)
    const b = await signedInAgent(app)
    const res = await b.agent.get(`/api/user/${a.user._id}`).expect(200)
    expect(Object.keys(res.body).sort()).toEqual(['_id', 'avatar', 'email', 'username'])
  })

  it('deletes the account, its listings and the session', async () => {
    const { agent, user } = await signedInAgent(app)
    await agent.post('/api/listing/create').send(listingInput()).expect(201)

    const res = await agent.delete(`/api/user/delete/${user._id}`).expect(200)
    expect(res.headers['set-cookie'].join(';')).toMatch(/access_token=;/)
    expect(await User.findById(user._id)).toBeNull()
    expect(await Listing.countDocuments({ userRef: user._id })).toBe(0)
  })
})
