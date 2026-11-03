const request = require('supertest')

describe('auth rate limiting', () => {
  const original = process.env.AUTH_RATE_LIMIT_MAX
  afterAll(() => {
    process.env.AUTH_RATE_LIMIT_MAX = original
  })

  it('returns 429 after the configured number of auth attempts', async () => {
    let app
    jest.isolateModules(() => {
      process.env.AUTH_RATE_LIMIT_MAX = '3'
      app = require('../app').createApp()
    })

    // Validation failures still count, so no database is needed here.
    for (let i = 0; i < 3; i += 1) {
      await request(app).post('/api/auth/signin').send({}).expect(400)
    }
    const res = await request(app).post('/api/auth/signin').send({}).expect(429)
    expect(res.body).toMatchObject({ success: false, statusCode: 429 })
  })
})
