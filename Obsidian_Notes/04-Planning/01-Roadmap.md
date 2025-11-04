# Development Roadmap 🗺️

> **What This Is**: Detailed development plan with specific GitHub Issues, technical requirements, and acceptance criteria.  
> **Purpose**: Plan what to build next, track progress, and organize work into manageable chunks.  
> **For**: Planning development sprints and knowing exactly how to implement features.  
> **How to Use**: Read milestone descriptions, copy issues to GitHub, track progress.  
> **Public Roadmap**: See `ROADMAP.md` in project root for high-level feature overview.

---

# WheresMy App - Development Roadmap 🗺️

This document outlines the development milestones and initial issues for WheresMy App.

> **Note**: This aligns with the public-facing `ROADMAP.md`. This document provides implementation details.

## 📊 Milestones Overview

| Milestone | Focus                    | Status      | Target   |
| --------- | ------------------------ | ----------- | -------- |
| **M0**    | Bootstrap & Foundation   | ✅ Complete | Week 1   |
| **M1**    | Database Schema & Seed   | 🔄 Next     | Week 2   |
| **M2**    | Rack Visualization       | ⏳ Planned  | Week 3-4 |
| **M3**    | Container & QR System    | ⏳ Planned  | Week 5-6 |
| **M4**    | Item Management & Photos | ⏳ Planned  | Week 7-8 |
| **M5**    | History & Search         | ⏳ Planned  | Week 9   |
| **M6**    | PWA & Deployment         | ⏳ Planned  | Week 10  |

---

## ✅ M0: Bootstrap & Foundation

**Goal**: Set up project infrastructure and tooling

### Completed ✓

- [x] Next.js 14 with App Router
- [x] TypeScript configuration
- [x] Tailwind CSS + shadcn/ui
- [x] Prisma ORM setup
- [x] Auth.js (NextAuth v5) setup
- [x] Testing infrastructure (Vitest + Playwright)
- [x] GitHub Actions CI/CD
- [x] PWA configuration (next-pwa)
- [x] ESLint + Prettier
- [x] Git repository with main/develop branches
- [x] Comprehensive documentation (README.md, learn.md, CONTRIBUTING.md)

---

## 🔄 M1: Database Schema & Seed

**Goal**: Finalize Prisma schema and create realistic seed data

### Issues to Create

#### Issue #1: Prisma Schema Migration & Validation

**Labels**: `db`, `M1`  
**Description**:

- Review and validate the Prisma schema
- Create initial migration
- Test all relationships and constraints
- Document any schema decisions

**Acceptance Criteria**:

- [ ] `pnpm db:migrate` creates first migration
- [ ] All models have proper indexes
- [ ] Foreign keys and cascade rules tested
- [ ] Schema documentation added to README

---

#### Issue #2: Seed Script with Realistic Data

**Labels**: `db`, `M1`  
**Description**:
Create a comprehensive seed script that generates:

- 1 admin user + 2 regular users
- 3 locations (Garage, Basement, Storage Room)
- 4 racks with varying dimensions
- 12 slots across racks
- 8 containers with QR-ready codes
- 25 items with various statuses
- 10 movement history entries

**Acceptance Criteria**:

- [ ] `pnpm db:seed` populates database
- [ ] Seed script is idempotent (can run multiple times)
- [ ] Generated QR codes follow pattern: `BOX-XXXX`
- [ ] Items distributed across containers
- [ ] Movement history shows realistic timeline

**File**: `prisma/seed.ts`

---

## ⏳ M2: Rack Visualization

**Goal**: Build interactive SVG rack grid system

### Issues to Create

#### Issue #3: SVG Rack Grid Component

**Labels**: `ui`, `rack`, `M2`  
**Description**:
Build `/racks/[id]` page with:

- SVG grid rendering based on `rows × cols`
- Empty cells show "+" button
- Occupied cells show container label
- Responsive design for mobile
- Hover states and tooltips

**Acceptance Criteria**:

- [ ] Grid renders correctly for any rows/cols
- [ ] Mobile-friendly touch targets
- [ ] Accessible (keyboard navigation)
- [ ] Loading/error states handled

**Files**:

- `src/app/racks/[id]/page.tsx`
- `src/components/features/rack-grid.tsx`

---

#### Issue #4: Rack Slot Management - Server Actions

**Labels**: `backend`, `rack`, `M2`  
**Description**:
Implement Server Actions for:

- `placeContainer(containerId, slotId)` - Place container in slot
- `moveContainer(containerId, newSlotId)` - Move to different slot
- `removeContainer(slotId)` - Remove from rack
- Zod validation for all inputs
- Prevent double-occupancy

**Acceptance Criteria**:

- [ ] All actions use Zod validation
- [ ] Duplicate placement prevented
- [ ] Movement history created automatically
- [ ] Error messages are user-friendly
- [ ] Unit tests for validation logic

**Files**:

- `src/server/actions/racks.ts`
- `src/lib/validators/rack.ts`

---

#### Issue #5: E2E Tests - Rack Operations

**Labels**: `test`, `e2e`, `M2`  
**Description**:
Playwright tests covering:

- View empty rack
- Place container in slot
- Move container to different slot
- Attempt duplicate placement (error case)
- Remove container from slot

**Acceptance Criteria**:

- [ ] Tests pass in CI/CD
- [ ] Cover happy and error paths
- [ ] Use proper test data fixtures

**Files**:

- `src/test/e2e/racks.spec.ts`

---

## ⏳ M3: Container & QR System

**Goal**: Container management with QR scanning and label generation

### Issues to Create

#### Issue #6: Container CRUD Pages

**Labels**: `ui`, `container`, `M3`  
**Description**:
Build pages:

- `/containers` - List all containers with search/filter
- `/containers/[id]` - Container detail page
- `/c/[code]` - QR code deep link (redirects to detail)

**Acceptance Criteria**:

- [ ] List shows status, location, item count
- [ ] Detail shows all items, photos, history
- [ ] Deep link works for QR codes
- [ ] Loading states with Suspense
- [ ] Error boundaries for 404s

**Files**:

- `src/app/containers/page.tsx`
- `src/app/containers/[id]/page.tsx`
- `src/app/c/[code]/page.tsx`

---

#### Issue #7: QR Code Scanner (ZXing)

**Labels**: `ui`, `qr`, `M3`  
**Description**:
Build `/scan` route with:

- Camera access (requires HTTPS)
- Real-time QR code detection using ZXing
- Redirect to `/c/[code]` on successful scan
- Error handling (no camera, denied permissions)
- Works on mobile devices

**Acceptance Criteria**:

- [ ] Camera opens in viewport
- [ ] Detects QR codes in <2 seconds
- [ ] Handles permission errors gracefully
- [ ] Works on iOS Safari and Android Chrome
- [ ] PWA-friendly

**Files**:

- `src/app/scan/page.tsx`
- `src/components/features/qr-scanner.tsx`

---

#### Issue #8: QR Label Generation & Printing

**Labels**: `backend`, `qr`, `M3`  
**Description**:
Create API endpoints for:

- `/api/labels/generate` - Single label (2x2)
- `/api/labels/batch` - Multiple labels (Avery 5160)
- Use `qrcode` library to generate QR images
- Render printable PDFs

**Acceptance Criteria**:

- [ ] Labels include QR code + container code
- [ ] Print-friendly CSS
- [ ] Works in browser print dialog
- [ ] Both formats (2x2 and Avery) tested

**Files**:

- `src/app/api/labels/generate/route.ts`
- `src/lib/qr-generator.ts`

---

## ⏳ M4: Item Management & Photos

**Goal**: Full item CRUD with photo uploads to S3

### Issues to Create

#### Issue #9: Item CRUD with React Hook Form

**Labels**: `ui`, `item`, `M4`  
**Description**:
Build item management on container page:

- Add item form with validation (React Hook Form + Zod)
- Edit item inline
- Delete item (with confirmation)
- Tag management
- Status updates (IN_STORAGE, CHECKED_OUT, DISCARDED)

**Acceptance Criteria**:

- [ ] Form validates client-side (Zod)
- [ ] Server Action validates server-side
- [ ] Optimistic updates for better UX
- [ ] Tags autocomplete from existing tags

**Files**:

- `src/components/features/item-form.tsx`
- `src/server/actions/items.ts`

---

#### Issue #10: S3 Photo Upload with Presigned URLs

**Labels**: `backend`, `storage`, `M4`  
**Description**:
Implement secure photo upload:

- Server Action generates presigned upload URL
- Client uploads directly to S3/MinIO
- Progress indicator during upload
- Save `ItemPhoto` record with public URL
- Support multiple photos per item

**Acceptance Criteria**:

- [ ] No S3 credentials exposed to client
- [ ] Upload progress shown
- [ ] Image previews work
- [ ] Handles upload errors gracefully
- [ ] Works with MinIO (local) and R2 (production)

**Files**:

- `src/server/actions/upload.ts`
- `src/components/features/photo-upload.tsx`
- `src/lib/s3-client.ts`

---

#### Issue #11: Check-In/Check-Out Flow

**Labels**: `backend`, `item`, `M4`  
**Description**:
Implement item movement actions:

- Check out: Set status=CHECKED_OUT, remove from container
- Check in: Show dialog to select destination container
- Create `Movement` records for audit trail
- Update container item counts

**Acceptance Criteria**:

- [ ] Check-out updates status immediately
- [ ] Check-in dialog shows recent containers
- [ ] Movement history accurate
- [ ] Optimistic UI updates

**Files**:

- `src/server/actions/items.ts`
- `src/components/features/checkout-dialog.tsx`

---

#### Issue #12: E2E Tests - Item Lifecycle

**Labels**: `test`, `e2e`, `M4`  
**Description**:
Playwright test covering:

1. Create container
2. Add item to container
3. Upload photo
4. Check out item
5. Check in to different container
6. Verify movement history

**Acceptance Criteria**:

- [ ] Full flow tested end-to-end
- [ ] Uses mock S3 for uploads
- [ ] Verifies database state

**Files**:

- `src/test/e2e/item-lifecycle.spec.ts`

---

## ⏳ M5: History & Search

**Goal**: Movement history and advanced search

### Issues to Create

#### Issue #13: Movement History Page

**Labels**: `ui`, `history`, `M5`  
**Description**:
Build `/history` page showing:

- All movements in reverse chronological order
- Filter by user, action type, date range
- Pagination (10 per page)
- Export to CSV

**Acceptance Criteria**:

- [ ] Infinite scroll or pagination
- [ ] Filters work correctly
- [ ] Shows user, item, containers, timestamp
- [ ] Export includes all filtered results

**Files**:

- `src/app/history/page.tsx`
- `src/server/actions/movements.ts`

---

#### Issue #14: Global Search

**Labels**: `ui`, `search`, `M5`  
**Description**:
Implement search across:

- Containers (by code, label, tags)
- Items (by name, description, tags)
- Locations/Racks
- Fuzzy search support

**Acceptance Criteria**:

- [ ] Search bar in nav (always accessible)
- [ ] Instant results (debounced)
- [ ] Keyboard navigation (arrow keys)
- [ ] Shows result type (container vs item)

**Files**:

- `src/components/features/global-search.tsx`
- `src/server/actions/search.ts`

---

## ⏳ M6: PWA & Deployment

**Goal**: Production deployment with PWA features

### Issues to Create

#### Issue #15: PWA Offline Support

**Labels**: `pwa`, `M6`  
**Description**:
Enhance PWA:

- Cache critical pages for offline access
- Background sync for movements
- Add to home screen prompt
- App icons (192x192, 512x512)
- Splash screens for iOS

**Acceptance Criteria**:

- [ ] Works offline (view cached data)
- [ ] Lighthouse PWA score >90
- [ ] Install prompt shown appropriately
- [ ] Icons render correctly on all devices

**Files**:

- `public/manifest.json`
- `public/icon-*.png`
- `next.config.js` (PWA config)

---

#### Issue #16: Production Deployment - Vercel + Neon

**Labels**: `deploy`, `infra`, `M6`  
**Description**:
Deploy to production:

- Set up Vercel project
- Connect Neon PostgreSQL
- Configure environment variables
- Set up custom domain
- Enable CI/CD auto-deploys

**Acceptance Criteria**:

- [ ] App accessible at production URL
- [ ] Database migrations run automatically
- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] PR preview deployments work

**Docs**:

- `docs/deployment-vercel.md`

---

#### Issue #17: Unraid Self-Hosted Deployment

**Labels**: `deploy`, `infra`, `docker`, `M6`  
**Description**:
Create Docker Compose setup for Unraid:

- Next.js app container
- PostgreSQL container
- MinIO container
- Nginx Proxy Manager config
- Environment variable template

**Acceptance Criteria**:

- [ ] `docker-compose.yml` runs all services
- [ ] Data persists in volumes
- [ ] Accessible via NPM reverse proxy
- [ ] Let's Encrypt SSL configured
- [ ] Backup/restore scripts included

**Files**:

- `docker-compose.yml`
- `Dockerfile`
- `docs/deployment-unraid.md`

---

## 🎯 Definition of Done

For each issue to be considered "done":

1. ✅ Code implemented and working
2. ✅ Unit tests written (if applicable)
3. ✅ E2E tests written (for user flows)
4. ✅ Types checked (`pnpm type-check`)
5. ✅ Linted (`pnpm lint`)
6. ✅ Formatted (`pnpm format`)
7. ✅ Documentation updated (README, comments)
8. ✅ Screenshots/GIF in PR (for UI)
9. ✅ CI/CD passing
10. ✅ PR approved and merged

---

## 📝 How to Use This Roadmap

1. **Create Issues**: Copy descriptions into GitHub Issues
2. **Add Labels**: Use the suggested labels
3. **Assign to Milestones**: Group by M1, M2, etc.
4. **Create Feature Branches**: Follow `feat/issue-number-description` pattern
5. **Track Progress**: Use GitHub Projects board

### GitHub Project Board Columns

- **Backlog** - All planned issues
- **Ready** - Dependencies met, ready to start
- **In Progress** - Currently being worked on
- **Review** - PR open, awaiting review
- **Done** - Merged and deployed

---

## 🚀 Getting Started

To start development:

1. Create all M1 issues on GitHub
2. Start with Issue #1 (Prisma Migration)
3. Follow the branch strategy in CONTRIBUTING.md
4. Open PRs to `develop` branch
5. Merge to `main` after each milestone

Good luck! 🎉
