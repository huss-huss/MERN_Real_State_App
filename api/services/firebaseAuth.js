const { createRemoteJWKSet, jwtVerify } = require('jose')
const { customError } = require('../utils/errorHandler')

// Firebase ID tokens are RS256 JWTs signed by Google's securetoken service.
// https://firebase.google.com/docs/auth/admin/verify-id-tokens#verify_id_tokens_using_a_third-party_jwt_library
const JWKS_URL = new URL(
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
)

let jwks

const verifyFirebaseIdToken = async (idToken) => {
  const projectId = process.env.FIREBASE_PROJECT_ID
  if (!projectId) {
    throw customError(503, 'Google sign-in is not configured on this server')
  }
  jwks = jwks || createRemoteJWKSet(JWKS_URL)

  let payload
  try {
    ;({ payload } = await jwtVerify(idToken, jwks, {
      algorithms: ['RS256'],
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    }))
  } catch {
    throw customError(401, 'Invalid Google credential')
  }

  if (!payload.sub || !payload.email || payload.email_verified !== true) {
    throw customError(401, 'Google account email is not verified')
  }

  return {
    email: String(payload.email).toLowerCase(),
    name: typeof payload.name === 'string' ? payload.name : '',
    picture: typeof payload.picture === 'string' ? payload.picture : undefined,
  }
}

module.exports = { verifyFirebaseIdToken }
