const request = require('supertest')
const { createApp } = require('../app')

const app = createApp()

describe('app', () => {
  it('reports health', async () => {
    const res = await request(app).get('/api/health').expect(200)
    expect(res.body).toEqual({ status: 'ok' })
  })

  it('returns JSON 404 for unknown API routes', async () => {
    const res = await request(app).get('/api/does-not-exist').expect(404)
    expect(res.body).toMatchObject({ success: false, statusCode: 404 })
  })

  it('sets security headers and hides x-powered-by', async () => {
    const res = await request(app).get('/api/health')
    expect(res.headers['x-powered-by']).toBeUndefined()
    expect(res.headers['x-content-type-options']).toBe('nosniff')
    expect(res.headers['content-security-policy']).toContain("default-src 'self'")
  })

  it('rejects malformed JSON with 400', async () => {
    const res = await request(app)
      .post('/api/auth/signin')
      .set('Content-Type', 'application/json')
      .send('{"email":')
      .expect(400)
    expect(res.body.message).toBe('Malformed JSON body')
  })

  it('does not grant CORS to unknown origins', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'https://evil.example')
    expect(res.headers['access-control-allow-origin']).toBeUndefined()
  })
})
