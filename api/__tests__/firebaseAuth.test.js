const jose = require('jose')

let mockKeys
jest.mock('jose', () => {
  const actual = jest.requireActual('jose')
  return {
    ...actual,
    // Swap Google's remote JWKS for a local key pair generated in the test.
    createRemoteJWKSet: () => (...args) => actual.createLocalJWKSet(mockKeys.jwks)(...args),
  }
})

const { verifyFirebaseIdToken } = require('../services/firebaseAuth')

const PROJECT = process.env.FIREBASE_PROJECT_ID

const token = (claims = {}, { issuer, audience, key } = {}) =>
  new jose.SignJWT({ email: 'Person@Example.com', email_verified: true, name: 'A Person', ...claims })
    .setProtectedHeader({ alg: 'RS256', kid: 'test-key' })
    .setSubject('firebase-uid')
    .setIssuer(issuer || `https://securetoken.google.com/${PROJECT}`)
    .setAudience(audience || PROJECT)
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(key || mockKeys.privateKey)

beforeAll(async () => {
  const { publicKey, privateKey } = await jose.generateKeyPair('RS256')
  const jwk = { ...(await jose.exportJWK(publicKey)), kid: 'test-key', alg: 'RS256' }
  const other = await jose.generateKeyPair('RS256')
  mockKeys = { privateKey, otherKey: other.privateKey, jwks: { keys: [jwk] } }
})

describe('verifyFirebaseIdToken', () => {
  it('returns the normalised profile for a valid token', async () => {
    await expect(verifyFirebaseIdToken(await token())).resolves.toEqual({
      email: 'person@example.com',
      name: 'A Person',
      picture: undefined,
    })
  })

  it.each([
    ['wrong audience', () => token({}, { audience: 'another-project' })],
    ['wrong issuer', () => token({}, { issuer: 'https://evil.example' })],
    ['wrong signing key', () => token({}, { key: mockKeys.otherKey })],
    ['unverified email', () => token({ email_verified: false })],
  ])('rejects a token with %s', async (_label, make) => {
    await expect(verifyFirebaseIdToken(await make())).rejects.toMatchObject({ statusCode: 401 })
  })

  it('returns 503 when Firebase is not configured', async () => {
    const original = process.env.FIREBASE_PROJECT_ID
    delete process.env.FIREBASE_PROJECT_ID
    try {
      await expect(verifyFirebaseIdToken('x')).rejects.toMatchObject({ statusCode: 503 })
    } finally {
      process.env.FIREBASE_PROJECT_ID = original
    }
  })
})
