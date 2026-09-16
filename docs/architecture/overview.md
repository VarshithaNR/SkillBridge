# Architecture Overview

## Style: Modular Monolith

SkillBridge is built as a modular monolith — one deployable server, one deployable
client — organized so internal module boundaries are clean enough to split into
separate services later *if* a specific module genuinely needs to scale
independently (e.g. AI matching, notifications).

We deliberately avoid microservices at this stage. With no users and no traffic
yet, microservices would add network calls, distributed transactions, and
deployment overhead with no corresponding benefit. Premature service boundaries
are one of the most common ways early-stage projects accumulate complexity they
can't afford.

## High-Level Diagram

```
┌─────────────────┐        HTTPS/REST        ┌──────────────────────┐
│   React Client   │ ───────────────────────► │   Express API Server │
│  (Vite + TS)      │ ◄─────────────────────── │   (Node.js + TS)     │
└─────────────────┘        JSON responses      └──────────┬───────────┘
                                                            │ Mongoose
                                                            ▼
                                                   ┌──────────────────┐
                                                   │     MongoDB       │
                                                   └──────────────────┘
```

## Server Layering

```
Request
  │
  ▼
Middleware (helmet, cors, rate-limit, cookie-parser, json body parser)
  │
  ▼
Route (maps URL + method → controller)
  │
  ▼
Auth/Role middleware (verifies JWT, checks role/ownership — never trusts
                       role claims sent by the client)
  │
  ▼
Validator (Zod schema checks the request body/params/query)
  │
  ▼
Controller (thin — parses request, calls service, shapes response)
  │
  ▼
Service (business logic lives here — the only layer with real logic)
  │
  ▼
Model (Mongoose schema — talks to MongoDB)
  │
  ▼
Response (consistent JSON shape) or thrown ApiError → central error handler
```

**Why controllers stay thin:** business logic in services (not controllers)
means that logic can be unit-tested without spinning up Express, and reused
across multiple controllers (e.g. both a REST controller and, later, a
background job) without duplication.

## Client Layering

```
pages/      → route-level components (one per screen)
components/ → reusable, presentation-focused pieces
layouts/    → shared page shells (e.g. dashboard sidebar layout)
hooks/      → TanStack Query hooks wrapping services (useProblems(), etc.)
services/   → one file per resource, wraps Axios calls (problems.service.ts)
stores/     → Zustand stores for client-only state (auth session, UI state)
types/      → shared TypeScript types/interfaces
utils/      → pure helper functions
```

Server state (anything that lives in the database) is managed by **TanStack
Query**, not Zustand — Zustand is reserved for genuinely client-only state
(e.g. "is the sidebar open", the current auth session). Mixing these up is a
common source of stale-cache bugs in React apps.

## Authentication Architecture

- **Access token**: short-lived (15 min default), JWT, kept in memory on the
  client (not localStorage) to reduce exposure to XSS.
- **Refresh token**: long-lived (7 days default), JWT, stored in an
  **httpOnly cookie** — inaccessible to JavaScript entirely, which removes it
  from the XSS attack surface.
- Role is embedded in the access token payload but **always re-verified
  against the database** on protected routes — the server never trusts a
  role claim that isn't freshly checked, since a compromised or stale token
  shouldn't be able to grant elevated access forever.

## Environment & Configuration

All environment variables are validated once at startup (`server/src/config/env.ts`)
using a Zod schema. Missing or malformed configuration fails the app fast with a
clear message, rather than surfacing as a confusing runtime error later.

## Status

This document reflects the **Phase 1 foundation**: project scaffolding, health
check, and a small set of module directories. Auth, profiles, problems,
proposals, and the rest of the module list will be documented here as they're
implemented.
