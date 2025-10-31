What WheresMy App does (concise)

Track every storage tote/box, its location on real racks, and the items inside. Scan a tote’s QR code to open its page on your phone, check items in/out (with photos), move totes on a visual rack grid, and see a full history of movements.

Hire-me stack (final)

App: Next.js (App Router) + TypeScript

UI: Tailwind CSS + shadcn/ui

Data: PostgreSQL + Prisma

Auth: Auth.js (email magic link or Google)

Validation/Forms: Zod + React Hook Form

QR: ZXing (scan) + qrcode (label generation)

Images: S3-compatible storage (MinIO on Unraid; Cloudflare R2 optional)

PWA: next-pwa (installable; great mobile UX)

Tests: Vitest (unit) + Playwright (e2e)

CI/CD: GitHub Actions (lint/typecheck/test/build/e2e)

Observability: Sentry (minimal), Plausible (optional)

Deploy: Public (Render/Fly/Vercel + Neon/Railway Postgres) and Unraid (Docker + NPM TLS)

Core data model (v1)

Location(id, name, notes)

Rack(id, locationId, name, rows, cols)

Slot(id, rackId, row, col, containerId?; unique per rack,row,col)

Container(id, code, label, description, status, currentSlotId?, tags[])

Item(id, name, description, status, currentContainerId?, tags[])

ItemPhoto(id, itemId, url, w, h, createdAt)

Movement(id, actorId, itemId, action, fromContainerId?, toContainerId?, fromSlotId?, toSlotId?, note, createdAt)

User(id, name, email, role)

Key screens

/racks/[id]: SVG grid (rows×cols), click empty → place container; click occupied → container sheet.

/c/[code] (QR deep link) + /containers/[id]: contents, check-in/out, photos, print label.

/scan: camera scanner → routes to /c/[code].

/items: search/filter/list or grid.

/history: movement log.

Agent Mode — “Project Agent Charter”

Use this as the Agent’s system prompt (or top instruction) so every action aligns with your standards.

You are the Project Agent for “WheresMy App,” a full-stack Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + Prisma + PostgreSQL application. The product tracks storage totes and items with QR scanning, an SVG rack map, check-in/out flows, photo uploads to S3-compatible storage (MinIO), Auth.js authentication, Zod-validated Server Actions, next-pwa, and CI/CD with GitHub Actions, Vitest, and Playwright.

Operating principles:
1) Mentor voice: teach with concise comments and docstrings (“WHY / WHAT / HOW”).
2) Correctness first, then DX: strong types, Zod validation, accessibility, and tests.
3) Ship in vertical slices: small PRs, green CI, attach GIFs for UI changes.
4) Security: no secrets in client; S3 uploads must use presigned URLs; enforce auth on all mutations.
5) Maintainability: predictable file structure, clear README, conventional commits, and issue-linked TODOs.

Deliverables per task:
- Complete files (runnable), no ellipses.
- Inline teaching comments (// WHY / // WHAT / // HOW / // GOTCHA).
- Update related config (schema, routes, env examples, tests, docs) so nothing breaks.
- Create or update tests and README sections.

Copilot — “Mentor Mode” chat priming

Paste this at the start of Copilot Chat sessions (acts like a mentor persona):

Act as my senior full-stack mentor. We are building “WheresMy App” using:
Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + Prisma + PostgreSQL + Auth.js + Zod + React Hook Form + ZXing + qrcode + next-pwa + S3-compatible storage (MinIO) + Vitest + Playwright + GitHub Actions + Sentry.

Rules:
- Generate production-grade, accessible code with detailed teaching comments using the tags: // WHY, // WHAT, // HOW, // GOTCHA.
- Prefer Server Actions with Zod validation for CRUD; keep components small and typed.
- Keep the data model aligned with the ERD; update prisma schema + migration + seed when needed.
- Add unit tests for utilities and Playwright e2e for critical flows.
- Use conventional commits in examples and include a short PR test plan.
- When adding features, also update README sections and .env.example placeholders.
I will ask for files by path or feature. Output complete files and any touched configs so I can paste and run.

Reusable Copilot task prompts (drop in as you work)

Bootstrap repo

Scaffold Next.js App Router + TS with Tailwind, shadcn/ui, Prisma, Auth.js, Vitest, Playwright, ESLint, Prettier, next-pwa.
Add: README “Getting Started,” .env.example (DATABASE_URL, AUTH_SECRET, S3_*), GitHub Actions workflow (lint, typecheck, test, build, e2e).
Create a protected /dashboard route and a basic nav layout.


Schema + seed

Create Prisma schema for Location, Rack, Slot, Container, Item, ItemPhoto, Movement, User (per ERD). Add indices and FK constraints. Provide migration and a seed script that makes a Garage rack (6x2), two more locations, 3 containers with QR-ready codes, and 8 items across statuses, plus a few Movement entries.


Rack grid (SVG) + actions

Build /racks/[id] with an SVG grid of rows×cols. Occupied cells show container label; empty cells show a plus button. Use Server Actions + Zod to place/move containers, enforcing unique occupancy per slot. Include Playwright tests for place/move and duplicate prevention. Update README with a GIF.


QR scan + label printing

Create /scan using ZXing (camera) that routes to /c/[code] on successful scan. Implement label generation endpoint using 'qrcode' that renders printable PDFs (Avery 5160 and 2x2). Provide unit tests for QR utility and a note in the README about printing.


Items with photos + check-in/out

On the container page, add item CRUD with React Hook Form + Zod. Implement S3 presigned upload flow (MinIO), progress UI, and store ItemPhoto rows. Add actions: check out (status=checked_out, currentContainerId=null), check in (dialog to select destination container, default current). Add Playwright e2e covering add→upload→checkout→checkin.


PWA + Deploy

Configure next-pwa for installable app (cache scan page + assets). Write deploy instructions for Render/Vercel + Neon and Unraid docker-compose behind NPM TLS. Include env and bucket policies. Add a Lighthouse checklist.

Repo governance (GitHub)

Repo name: wheresmy-app (public)

Branches:
main (deploy), develop (integration), short-lived feat/*, fix/*, chore/*.

Conventional commits:
feat(rack): svg grid and placement
fix(container): prevent double-occupancy on move
chore(ci): add playwright e2e to PR workflow
docs(readme): add printing instructions

PR template (high-level)

## Context
What & why.

## Changes
Bullets of key changes.

## Test plan
- [ ] unit tests pass
- [ ] e2e: place/move
- [ ] screenshots/GIF attached

## Notes
Risks, follow-ups, linked issues.


Issue labels: ui, backend, db, auth, infra, tests, docs, good-first-issue.

Milestones:

M0 Bootstrap, M1 Schema/Seed, M2 Rack Map, M3 Containers/QR, M4 Items/Photos, M5 History/Search, M6 PWA/Deploy

Unraid + Public deploy (concise plan)

Public: Vercel + Neon (or Render + managed Postgres). Map wheresmy.yourdomain.com to public host.

Unraid: docker-compose for app, postgres, minio. Put app on shottsproxy; route wheresmy.shottsserver.com via NPM (Let’s Encrypt).

Images: MinIO bucket wheresmy-items (private) with presigned uploads.

Env keys you’ll use:
DATABASE_URL, AUTH_SECRET, AUTH_GOOGLE_ID/SECRET (optional), S3_ENDPOINT, S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, NEXT_PUBLIC_SITE_URL

Commenting style guide (for all generated code)

Use short, instructive comments that teach:

// WHY: Explain the business/user reason (1 line).
// WHAT: Summarize what this function/component does.
// HOW: Key implementation idea (data flow, edge cases, complexity).
// GOTCHA: Caveats or pitfalls future-you should remember.


Keep the section dividers you like:

{/* <!-- ───────────────────── Storage Rack Grid ───────────────────── --> */}

“Definition of Done” (every feature)

Types + Zod validation

Unit + e2e tests

Docs updated (README section)

Screenshots/GIF in PR

CI green; deploy link posted

First 8 issues to open (copy/paste)

M0: Bootstrap project + CI (lint/type/test/build/e2e)

M1: Prisma schema + migration + seed data

M2: Rack SVG grid (render + occupancy states)

M2: Server Actions for place/move with Zod validation

M3: Container page + /c/[code] deep link + label PDF

M3: /scan ZXing integration (mobile)

M4: Item CRUD + S3 presigned uploads (MinIO)

M5: Movement history view + basic search