const request = require('supertest')

let counter = 0

const userInput = (overrides = {}) => {
  counter += 1
  return {
    username: `user${counter}`,
    email: `user${counter}@example.com`,
    password: 'correct-horse-battery',
    ...overrides,
  }
}

const listingInput = (overrides = {}) => ({
  name: 'Sunny two bedroom flat',
  description: 'Bright flat close to the park with a balcony.',
  address: '12 Example Street',
  regularPrice: 1200,
  discountPrice: 0,
  bathrooms: 1,
  bedrooms: 2,
  furnished: false,
  parking: false,
  type: 'rent',
  offer: false,
  imageUrls: ['https://example.com/photo.jpg'],
  ...overrides,
})

// Signs up a fresh user and returns a supertest agent that carries the auth cookie.
const signedInAgent = async (app, overrides) => {
  const agent = request.agent(app)
  const input = userInput(overrides)
  await agent.post('/api/auth/signup').send(input).expect(201)
  const res = await agent
    .post('/api/auth/signin')
    .send({ email: input.email, password: input.password })
    .expect(200)
  return { agent, user: res.body, input }
}

module.exports = { userInput, listingInput, signedInAgent }
