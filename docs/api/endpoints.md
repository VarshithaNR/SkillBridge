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

### Problems
```
GET    /api/problems          (public — search/filter/paginate)
GET    /api/problems/:id      (public)
POST   /api/problems          (business only)
PATCH  /api/problems/:id      (owner or admin only)
DELETE /api/problems/:id      (owner or admin only)
```

**GET /api/problems**
Query params (all optional): `page`, `limit` (max 50), `search` (matches
title/description), `category`, `skill`, `difficulty`, `locationType`,
`status` (defaults to `open` if omitted), `minBudget`, `maxBudget`. Returns
`{ problems: Problem[], pagination: { page, limit, total, totalPages } }`.

**POST /api/problems**
Requires a `business`-role access token. Body: `{ title, description,
category, requiredSkills, budgetMin, budgetMax, deadline?, difficulty,
locationType, location? }`. `postedBy` is taken from the authenticated
token — never accepted from the request body.

**PATCH /api/problems/:id** / **DELETE /api/problems/:id**
Requires the authenticated user to be the problem's owner or an admin;
enforced in the service layer since it depends on the specific problem's
data, not just the caller's role.

## Phase 5 Endpoints

### Proposals
```
POST  /api/problems/:problemId/proposals   (developer only)
GET   /api/problems/:problemId/proposals   (problem owner or admin only)
GET   /api/proposals/me                    (developer only — own proposals)
GET   /api/proposals/:id                   (proposal's developer, problem owner, or admin)
PATCH /api/proposals/:id/accept            (problem owner or admin only)
PATCH /api/proposals/:id/reject            (problem owner or admin only)
PATCH /api/proposals/:id/withdraw          (proposal's developer or admin only)
```

**POST /api/problems/:problemId/proposals**
Requires a `developer`-role access token. Body: `{ coverLetter,
proposedBudget, estimatedDuration? }`. `developer` is taken from the
authenticated token, never the request body. Fails with `400` if the problem
isn't `open`, `409` on a duplicate proposal from the same developer for the
same problem (database-enforced via a unique `{ problem, developer }` index).

**GET /api/problems/:problemId/proposals**
Requires the caller to be the problem's owner or an admin — enforced in the
service layer since it depends on data (who posted the problem), not just
role. Same pagination/`status` query params as problem listing.

**GET /api/proposals/me**
Requires a `developer`-role access token. Returns the caller's own proposals,
paginated, each with its parent problem populated.

**PATCH /api/proposals/:id/accept**
Only the problem's owner (or admin) may accept, and only while the proposal
is `pending` and the problem is still `open`. On success: the proposal
becomes `accepted`, the problem becomes `assigned`, and every other pending
proposal on that problem is automatically `rejected` — a problem can only be
assigned to one developer.

**PATCH /api/proposals/:id/reject** / **PATCH /api/proposals/:id/withdraw**
Reject is problem-owner/admin only; withdraw is the proposal's own developer
(or admin) only. Both require the proposal to currently be `pending`.

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

Endpoints for projects, milestones, messaging, notifications, reviews,
payments, and AI features will be added and documented here as each module
is implemented.
