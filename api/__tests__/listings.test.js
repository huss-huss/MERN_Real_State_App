const request = require('supertest')
const { createApp } = require('../app')
const Listing = require('../models/listingModel')
const { useTestDb } = require('./helpers/db')
const { listingInput, signedInAgent } = require('./helpers/factory')

useTestDb()
const app = createApp()

describe('listing CRUD', () => {
  it('creates a listing owned by the signed-in user, ignoring client userRef', async () => {
    const { agent, user } = await signedInAgent(app)
    const res = await agent
      .post('/api/listing/create')
      .send(listingInput({ userRef: '0123456789abcdef01234567' }))
      .expect(201)

    expect(res.body.userRef).toBe(user._id)
    expect(res.body.name).toBe('Sunny two bedroom flat')
  })

  it('coerces numeric strings sent by HTML number inputs', async () => {
    const { agent } = await signedInAgent(app)
    const res = await agent
      .post('/api/listing/create')
      .send(listingInput({ regularPrice: '950', bedrooms: '3' }))
      .expect(201)
    expect(res.body.regularPrice).toBe(950)
    expect(res.body.bedrooms).toBe(3)
  })

  it.each([
    ['no images', { imageUrls: [] }],
    ['too many images', { imageUrls: Array(7).fill('https://example.com/a.jpg') }],
    ['non-http image url', { imageUrls: ['javascript:alert(1)'] }],
    ['unknown type', { type: 'sell' }],
    ['negative price', { regularPrice: -1 }],
    ['discount not below price', { offer: true, regularPrice: 100, discountPrice: 100 }],
  ])('rejects %s with 400', async (_label, overrides) => {
    const { agent } = await signedInAgent(app)
    await agent.post('/api/listing/create').send(listingInput(overrides)).expect(400)
    expect(await Listing.countDocuments()).toBe(0)
  })

  it('reads a listing publicly', async () => {
    const { agent } = await signedInAgent(app)
    const created = await agent.post('/api/listing/create').send(listingInput()).expect(201)
    const res = await request(app).get(`/api/listing/get/${created.body._id}`).expect(200)
    expect(res.body._id).toBe(created.body._id)
  })

  it('returns 404 for a missing listing and 400 for a malformed id', async () => {
    await request(app).get('/api/listing/get/0123456789abcdef01234567').expect(404)
    await request(app).get('/api/listing/get/not-an-id').expect(400)
  })

  it('lets the owner update and delete a listing', async () => {
    const { agent, user } = await signedInAgent(app)
    const created = await agent.post('/api/listing/create').send(listingInput()).expect(201)
    const id = created.body._id

    const updated = await agent
      .post(`/api/listing/update/${id}`)
      .send({ ...created.body, name: 'Renamed flat', userRef: 'someone-else' })
      .expect(200)
    expect(updated.body.name).toBe('Renamed flat')
    expect(updated.body.userRef).toBe(user._id)

    await agent.delete(`/api/listing/delete/${id}`).expect(200)
    expect(await Listing.findById(id)).toBeNull()
  })

  it('validates discount against the stored price on partial updates', async () => {
    const { agent } = await signedInAgent(app)
    const created = await agent
      .post('/api/listing/create')
      .send(listingInput({ regularPrice: 500 }))
      .expect(201)
    await agent
      .post(`/api/listing/update/${created.body._id}`)
      .send({ offer: true, discountPrice: 600 })
      .expect(400)
  })
})
