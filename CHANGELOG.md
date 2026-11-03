# Changelog

## 2026 hardening

### Security
- Google sign-in now verifies the Firebase ID token on the server. Previously the endpoint trusted the email sent
  by the browser, which allowed signing in as any existing user.
- Listing owner is taken from the session; the client-sent `userRef` is ignored on create and update.
- zod validation for auth, user and listing bodies, route ids and search queries (blocks operator injection,
  regex injection and unbounded `limit`).
- helmet security headers with a Firebase-compatible CSP, CORS allowlist, rate limiting, JSON body size limit.
- JWT expires after 7 days and is pinned to HS256; cookie is httpOnly, SameSite=Lax and Secure in production.
- Sign-up no longer returns the password hash; passwords are excluded from all queries and responses.
- Sign-in returns the same error for unknown email and wrong password.
- Stack traces are no longer returned in production.

### Fixed
- Error handler ignored `statusCode` on custom errors, so every error was returned as HTTP 500.
- Search with `type=all` (the default) excluded every listing for sale (`'sell'` was checked, the app stores `'sale'`).
- Search sorted by `created_at`, a field that does not exist; it now sorts by `createdAt`.
- Malformed ids in listing update/delete caused unhandled promise rejections instead of a 400.
- Unknown `/api` routes returned the SPA HTML with status 200; they now return a JSON 404.
- `signOut` swallowed errors (`next` referenced but not called).
- Create/update listing pages checked `data.ok`, which is always undefined, so they showed an error on success
  and navigated away on failure.
- Deleting an account left its listings behind; they are now deleted too.
- Wrong-owner and invalid-token responses use 403 and 401 consistently.

### Added
- Jest + supertest + mongodb-memory-server test suite (70 tests).
- ESLint flat config for the API, `.env.example` files, Dockerfile and docker-compose, GitHub Actions CI.
- `/api/health`, graceful shutdown, configurable `PORT`.

### Changed
- API dependencies updated via `npm audit fix`; zod 4, helmet 8, express-rate-limit 8 added.
- Express app split into `api/app.js` (factory) and `api/index.js` (bootstrap).

## 2023
- Initial MERN learning project: auth, listings, Firebase image upload, search page.
