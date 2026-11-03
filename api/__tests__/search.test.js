const request = require('supertest')
const { createApp } = require('../app')
const Listing = require('../models/listingModel')
const { useTestDb } = require('./helpers/db')
const { listingInput } = require('./helpers/factory')

useTestDb()
const app = createApp()

const seed = () =>
  Listing.create([
    listingInput({ name: 'Cheap rental room', type: 'rent', regularPrice: 300, userRef: 'u1' }),
    listingInput({
      name: 'Family house for sale',
      type: 'sale',
      regularPrice: 250000,
      discountPrice: 240000,
      offer: true,
      parking: true,
      userRef: 'u1',
    }),
    listingInput({
      name: 'Furnished city apartment',
      type: 'rent',
      regularPrice: 1500,
      furnished: true,
      parking: true,
      userRef: 'u2',
    }),
  ])

const names = (res) => res.body.map((l) => l.name).sort()

describe('GET /api/listing/get', () => {
  beforeEach(seed)

  it('returns rent and sale listings for type=all (default)', async () => {
    const res = await request(app).get('/api/listing/get').expect(200)
    expect(res.body).toHaveLength(3)
    const all = await request(app).get('/api/listing/get?type=all').expect(200)
    expect(all.body).toHaveLength(3)
  })

  it('filters by type', async () => {
    const res = await request(app).get('/api/listing/get?type=sale').expect(200)
    expect(names(res)).toEqual(['Family house for sale'])
  })

  it('treats unchecked boolean filters as "any"', async () => {
    const res = await request(app)
      .get('/api/listing/get?offer=false&parking=false&furnished=false')
      .expect(200)
    expect(res.body).toHaveLength(3)
  })

  it('combines boolean filters', async () => {
    const res = await request(app).get('/api/listing/get?parking=true&furnished=true').expect(200)
    expect(names(res)).toEqual(['Furnished city apartment'])
  })

  it('searches names case-insensitively and treats regex characters literally', async () => {
    const res = await request(app).get('/api/listing/get?searchTerm=HOUSE').expect(200)
    expect(names(res)).toEqual(['Family house for sale'])
    const regex = await request(app).get('/api/listing/get?searchTerm=.*').expect(200)
    expect(regex.body).toHaveLength(0)
  })

  it('sorts by price in both directions', async () => {
    const asc = await request(app).get('/api/listing/get?sort=regularPrice&order=asc').expect(200)
    expect(asc.body.map((l) => l.regularPrice)).toEqual([300, 1500, 250000])
    const desc = await request(app).get('/api/listing/get?sort=regularPrice&order=desc')
    expect(desc.body.map((l) => l.regularPrice)).toEqual([250000, 1500, 300])
  })

  it('accepts the legacy created_at sort key from the client', async () => {
    await request(app).get('/api/listing/get?sort=created_at&order=desc').expect(200)
  })

  it('paginates with limit and startIndex', async () => {
    const page1 = await request(app).get('/api/listing/get?sort=regularPrice&order=asc&limit=2')
    const page2 = await request(app).get(
      '/api/listing/get?sort=regularPrice&order=asc&limit=2&startIndex=2'
    )
    expect(page1.body.map((l) => l.regularPrice)).toEqual([300, 1500])
    expect(page2.body.map((l) => l.regularPrice)).toEqual([250000])
  })

  it.each([
    ['unknown sort field', 'sort=password'],
    ['oversized limit', 'limit=1000'],
    ['operator injection', 'offer[$ne]=true'],
    ['bad order', 'order=sideways'],
  ])('rejects %s with 400', async (_label, qs) => {
    await request(app).get(`/api/listing/get?${qs}`).expect(400)
  })
})
