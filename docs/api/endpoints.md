# API Design

REST over HTTPS. All request/response bodies are JSON. Base path: `/api`.

## Conventions

- **Response shape (success):** `{ "success": true, "data": ... }`
- **Response shape (error):** `{ "success": false, "message": "...", "errors"?: {...} }`
- **Auth:** access token expected in memory on the client, sent as
  `Authorization: Bearer <token>`. Refresh token lives in an httpOnly cookie
  and is never touched by client JS.
- **Validation:** every mutating endpoint validates its body with a Zod
  schema before it reaches business logic.
- **Authorization:** role and resource-ownership checks always happen
  server-side against the database — a role or ownership claim from the
  client is never trusted on its own.

## Phase 1 Endpoints

### Health
```
GET /api/health
```
Returns `200` if the API is up. No auth required.

### Auth
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me        (protected)
```

**POST /api/auth/register**
Body: `{ name, email, password, role }` — `role` is `"developer"` or `"business"`
(`"admin"` is intentionally not self-registerable). Returns `201` with the
created user (no password hash) on success, `409` for a duplicate email,
`400` for invalid input.

**POST /api/auth/login**
Body: `{ email, password }`. On success, sets an httpOnly `refreshToken`
cookie (scoped to `/api/auth`) and returns `{ user, accessToken }` in the
JSON body. Returns a generic `401` for any invalid-credentials case — the
response deliberately doesn't reveal whether the email exists.

**POST /api/auth/refresh**
Reads the `refreshToken` cookie, rotates it (old token is invalidated, a new
one is issued), and returns a new `{ accessToken }`.

**POST /api/auth/logout**
Reads and revokes the `refreshToken` cookie server-side, then clears it.

**GET /api/auth/me**
Requires `Authorization: Bearer <accessToken>`. Returns the authenticated
user's safe profile.

## Planned Endpoints (later phases, documented here for consistency)

### Developer Profiles
```
GET   /api/developers/me
PATCH /api/developers/me
GET   /api/developers/:id
```

### Business Profiles
```
GET   /api/businesses/me
PATCH /api/businesses/me
GET   /api/businesses/:id
```

### Skills
```
GET /api/skills
```

### Problems
```
GET    /api/problems
GET    /api/problems/:id
POST   /api/problems           (business only)
PATCH  /api/problems/:id       (owner only)
DELETE /api/problems/:id       (owner only)
```

### Proposals
```
POST /api/problems/:id/proposals   (developer only)
GET  /api/problems/:id/proposals   (business owner only)
GET  /api/proposals/me             (developer's own proposals)
```

Endpoints for projects, milestones, messaging, notifications, reviews,
payments, and AI features will be added and documented here as each module
is implemented.
