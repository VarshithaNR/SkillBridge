# SkillBridge

**Turn real-world problems into real opportunities.**

SkillBridge is an AI-powered marketplace connecting businesses with
real-world software problems to developers, students, and freelancers who
want real-world experience or paid project work.

> **Status:** Phase 5 — Proposals. Auth, problems, and proposals are built;
> profiles and the rest of the feature set are being built incrementally.
> See [docs/architecture/overview.md](docs/architecture/overview.md) for
> what's implemented so far.

## The Problem

Businesses often have small, well-defined software problems that don't
justify hiring a full-time engineer or an expensive agency. Developers —
especially students and early-career freelancers — often lack real,
verifiable project experience to prove their skills. SkillBridge structures
that gap into a matching workflow: a business posts a problem, developers
propose solutions, and the resulting project produces both working software
and a track record for the developer.

## Core Workflow

```
Business posts a problem
  → Problem is structured into requirements
  → Developers discover matching problems
  → Developers submit proposals
  → Business selects a developer
  → A project workspace is created
  → Work is divided into milestones
  → Project is completed and paid
  → Both sides review each other
```

## Tech Stack

**Frontend:** React, TypeScript, Vite, React Router, Tailwind CSS, TanStack
Query, Zustand, Axios, React Hook Form, Zod

**Backend:** Node.js, Express, TypeScript, REST API

**Database:** MongoDB, Mongoose

**Auth:** JWT (access + refresh token architecture), bcrypt password
hashing, role-based authorization

**Tooling:** ESLint, Prettier, Git

Currently a modular monolith by design — see
[docs/architecture/overview.md](docs/architecture/overview.md) for why.

## Project Structure

```
skillbridge/
├── client/           React + TypeScript frontend (Vite)
├── server/           Express + TypeScript REST API
├── docs/
│   ├── architecture/ System design docs
│   ├── api/           Endpoint documentation
│   └── database/      Schema documentation
├── .env.example      Documents all required environment variables
└── .gitignore
```

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB instance (local install or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### 1. Clone and install
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment variables

Copy `.env.example` to `server/.env` and fill in real values:
```bash
cp .env.example server/.env
```

Required server variables:

| Variable | Description |
|---|---|
| `MONGODB_URI` | Your MongoDB connection string |
| `JWT_ACCESS_SECRET` | Random string, 32+ characters (`openssl rand -base64 48`) |
| `JWT_REFRESH_SECRET` | A **different** random string, 32+ characters |
| `JWT_ACCESS_EXPIRY` | Access token lifetime, default `15m` |
| `JWT_REFRESH_EXPIRY` | Refresh token lifetime, default `7d` |
| `CLIENT_URL` | Frontend origin for CORS, default `http://localhost:5173` |
| `PORT` | API port, default `5001` |

Create `client/.env` with:
```
VITE_API_URL=http://localhost:5001/api
```

**Never commit `.env` files.** Only `.env.example` is tracked in git.

### 3. Run the app

In one terminal:
```bash
cd server && npm run dev
```

In another:
```bash
cd client && npm run dev
```

- API: `http://localhost:5001/api/health` should return
  `{"success":true,"message":"SkillBridge API is running"}`
- Client: `http://localhost:5173`

### 4. Lint and build checks
```bash
# server
cd server && npm run lint && npm run build

# client
cd client && npm run lint && npm run build
```

## Documentation

- [Architecture overview](docs/architecture/overview.md)
- [Database schema](docs/database/schema.md)
- [API endpoints](docs/api/endpoints.md)

## Roadmap

Implemented and planned modules, in rough build order: Authentication →
User/Developer/Business profiles → Skills → Problems → Search/filtering →
Proposals → Project workspace → Milestones → Messaging → Notifications →
Reviews → Payments → AI problem analysis → AI developer matching → GitHub
integration → Admin dashboard → Analytics/moderation.

AI features (problem analysis, developer matching, project assistance,
portfolio analysis) are designed to be modular and explainable — they
inform decisions but don't make critical business decisions unilaterally.

## License

Not yet decided.
