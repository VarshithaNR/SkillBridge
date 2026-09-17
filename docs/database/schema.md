# Database Schema (Phase 1)

MongoDB via Mongoose. Ten core collections are designed at this phase; no
Mongoose models are implemented yet beyond what a future phase requires
(payments, AI-derived fields, etc. are intentionally excluded for now).

## Collections

### User
Auth + role only. Role-specific data lives in `DeveloperProfile` /
`BusinessProfile`, keeping this collection small and avoiding unused fields
per role.

| Field | Type | Notes |
|---|---|---|
| email | String | required, unique, lowercase, indexed |
| passwordHash | String | required, `select: false` so it's never returned by default |
| role | Enum: `developer` \| `business` \| `admin` | required |
| name | String | required |
| isVerified | Boolean | default `false` |
| refreshTokens | [String] | hashed; supports multi-device logout |
| timestamps | — | `createdAt`, `updatedAt` |

### DeveloperProfile
| Field | Type | Notes |
|---|---|---|
| user | ObjectId → User | required, unique, indexed |
| headline | String | |
| bio | String | |
| skills | [ObjectId → Skill] | |
| experienceYears | Number | |
| portfolio | [{ title, description, url, repoUrl }] | embedded subdocuments |
| availability | Enum: `available` \| `busy` \| `unavailable` | |
| rating | Number | default `0`, denormalized, recalculated on new Review |
| reviewCount | Number | default `0` |

### BusinessProfile
| Field | Type | Notes |
|---|---|---|
| user | ObjectId → User | required, unique, indexed |
| companyName | String | required |
| website | String | |
| industry | String | |
| description | String | |
| rating | Number | default `0`, denormalized |
| reviewCount | Number | default `0` |

### Skill
| Field | Type | Notes |
|---|---|---|
| name | String | required, unique, indexed |
| category | String | e.g. "Frontend", "Backend", "DevOps" |

### Problem
| Field | Type | Notes |
|---|---|---|
| business | ObjectId → BusinessProfile | required, indexed |
| title | String | required |
| description | String | required |
| requiredSkills | [ObjectId → Skill] | |
| category | String | indexed |
| budgetMin / budgetMax | Number | |
| status | Enum: `draft` \| `open` \| `in_progress` \| `completed` \| `closed` | default `open`, indexed |
| complexity | Enum: `low` \| `medium` \| `high` | manual for now; AI-derived in a future phase |
| timestamps | — | |

### Problem
`postedBy` references `User` directly (not a `BusinessProfile`) since that
collection doesn't exist yet — see the note in `models/Problem.ts`.

| Field | Type | Notes |
|---|---|---|
| title | String | required, max 150 |
| description | String | required, max 5000 |
| category | String | required, indexed |
| requiredSkills | [String] | lowercased on write for consistent filtering |
| budgetMin / budgetMax | Number | required; `budgetMax >= budgetMin` enforced |
| deadline | Date | optional |
| difficulty | Enum: `beginner` \| `intermediate` \| `advanced` | required, indexed |
| locationType | Enum: `remote` \| `onsite` \| `hybrid` | default `remote`, indexed |
| location | String | optional, meaningful for onsite/hybrid |
| status | Enum: `open` \| `in_review` \| `assigned` \| `in_progress` \| `completed` \| `cancelled` | default `open`, indexed |
| postedBy | ObjectId → User | required, indexed |
| timestamps | — | |

**Indexes:** a text index on `{ title, description }` powers the `search`
query param; a compound `{ status, category, createdAt }` index supports the
common "browse open problems in a category, newest first" query.

### Proposal
| Field | Type | Notes |
|---|---|---|
| problem | ObjectId → Problem | required, indexed |
| developer | ObjectId → DeveloperProfile | required, indexed |
| coverLetter | String | required |
| proposedBudget | Number | required |
| estimatedDuration | String | |
| status | Enum: `pending` \| `accepted` \| `rejected` \| `withdrawn` | default `pending` |
| createdAt | — | |

**Constraint:** compound unique index on `{ problem: 1, developer: 1 }` —
one proposal per developer per problem, enforced at the database layer.

### Project
| Field | Type | Notes |
|---|---|---|
| problem | ObjectId → Problem | required |
| business | ObjectId → BusinessProfile | required, indexed |
| developer | ObjectId → DeveloperProfile | required, indexed |
| acceptedProposal | ObjectId → Proposal | required |
| status | Enum: `active` \| `completed` \| `cancelled` | default `active`, indexed |
| startDate / endDate | Date | |

### Milestone
| Field | Type | Notes |
|---|---|---|
| project | ObjectId → Project | required, indexed |
| title | String | required |
| description | String | |
| amount | Number | |
| dueDate | Date | |
| status | Enum: `pending` \| `in_progress` \| `submitted` \| `approved` \| `paid` | default `pending` |
| order | Number | sequence within the project |

### Review
| Field | Type | Notes |
|---|---|---|
| project | ObjectId → Project | required, indexed |
| reviewer | ObjectId → User | required |
| reviewee | ObjectId → User | required, indexed |
| rating | Number | required, min `1`, max `5` |
| comment | String | |
| createdAt | — | |

**Constraint:** compound unique index on `{ project: 1, reviewer: 1 }` —
one review per person per project. This is a business rule enforced by the
database, not just application code — it's what keeps reviews meaningful
and harder to manipulate.

### Notification
| Field | Type | Notes |
|---|---|---|
| user | ObjectId → User | required, indexed |
| type | String | e.g. `proposal_received`, `milestone_approved` |
| message | String | |
| relatedEntity | { entityType, entityId } | polymorphic reference |
| isRead | Boolean | default `false`, indexed |
| createdAt | — | |

## Design Principles Applied

- **Denormalized ratings**: `rating`/`reviewCount` are stored directly on
  profiles and updated when a new Review is created, rather than computed
  with an aggregation query on every profile view.
- **Database-enforced business rules**: uniqueness constraints on Proposal
  and Review aren't just checked in application code — they're indexes,
  which is strictly more reliable against race conditions and bugs.
- **Role-specific data separated from auth data**: keeps `User` small and
  keeps developer/business concerns from leaking into each other's schema.

## Not Yet Implemented

Payments, disputes, AI-derived fields (compatibility scores, AI-generated
requirements), messaging, and analytics collections are intentionally
excluded from this phase per the project's incremental build plan.
