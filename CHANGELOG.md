# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Admin Container Types: create/list UI with optional dimensions (L×W×H) and icon key
- Admin Container Types: inline edit and delete with toasts
- Admin Container Types: icon key dropdown (tote, box, bin, suitcase, carry-on) with server-side validation
- Auth.js (NextAuth v5) integration with Prisma adapter and dev credentials login
- User registration flow with admin approval: /register page captures name/email/reason; admin approves via /admin/pending-users
- Test account seeding: admin@test.local and user@test.local via /admin/seed-accounts
- Account page for profile editing: update name and avatar URL
- Admin menu in navbar with links to Container Types, Pending Users, and Seed Accounts
- Auth menu: Sign in/out, Register link, and account link with user name display
- Defensive DB schema ensure helper for container_types table and containers.containerTypeId column to avoid runtime errors
- PWA icon route handlers to stop 404 for /icon-192.png and /icon-512.png
- Add Container form: Type dropdown with next-number suggestion and Autofill for code/label
- Type-specific icons displayed on rack detail page (tote/suitcase/box/bin)
- Containers list grouped by Type with current/total item counts and checked-out breakdown
- Mobile testing support with network host binding documentation
- Database seed verification scripts and documentation
- Toast notifications with Sonner for user feedback on form submissions
- Client-side CRUD forms with real-time success/error messages
- Duplicate validation for locations, racks, and containers
- Visual rack grid representation organized by location on Inventory Map
- Mini grid previews showing container placement in each rack
- Fill percentage indicators for rack capacity
- Location-based organization with collapsible rack groups

### Changed
- Rack detail page includes a legend listing placed containers with type icons
- Containers list redesigned per type grouping for faster browsing
- Inventory Map page reorganized: Rack visualization now displayed first, CRUD forms moved below
- Racks now grouped by their locations for better spatial understanding
- Rack cards show mini grid visualization with actual slot layout
- Page layout expanded to max-width-7xl for better use of space
- Repository hygiene: ignore Obsidian workspace files (`Obsidian_Notes/.obsidian`, `.trash`)

### Fixed
- QR code labels now downloadable as PNG (alongside print)
- CRUD forms now show proper feedback when creating locations, racks, containers, and items
- Duplicate entries prevented with user-friendly error messages
- Items show warning when similar item exists but still allow creation
- Rack grid visualization on inventory map now shows slot occupancy correctly
- Empty states added to inventory map when no racks exist
- Prevent accidental data wipe in production seed by validating CSV before any deletes
- Resolve “Unsupported Server Component Type: Undefined” on racks page by implementing `CollapsibleLocation`
- Remove unused server-based CRUD forms in favor of `CrudFormsClient`

## [0.1.0] - 2025-11-03

### Added

- Initial project setup with Next.js 14.2.33 and App Router
- PostgreSQL database with Prisma ORM integration
- Comprehensive data model (Containers, Items, Locations, Racks, Slots, Movements)
- Production seed script with CSV import (23 containers, 308 items, 17 photos)
- Interactive homepage with clickable feature cards
- Container management pages (list and detail views)
- Rack management system with slot visualization
- QR code scanning functionality setup
- PWA (Progressive Web App) support with manifest
- Tailwind CSS with Shadcn/ui component library
- GitHub Actions CI/CD pipeline (Lint, Type Check, Unit Tests, Build, E2E Tests)
- Playwright E2E testing framework with smoke tests
- Comprehensive documentation in Obsidian_Notes structure
- TypeScript strict mode throughout codebase

### Changed

- App rebranded from "WheresMy App" to "Where's My...?"
- Converted package manager from pnpm to npm
- Dynamic rendering for database-dependent pages (/containers, /racks)
- Homepage redesigned with hover animations and improved UX

### Fixed

- CI/CD pipeline converted from pnpm to npm (all 5 jobs passing)
- Prettier formatting applied to entire codebase (37+ files)
- Server Action inline "use server" removed from Client Component
- Build errors related to database connection during prerendering
- Deprecated GitHub Actions artifact action updated (v3 → v4)
- TypeScript cache issues with Prisma Client types explained

### Documentation
- Learning docs updated: Prisma model additions (ContainerType), server actions patterns, and UI flows for Container Types

- Created 5-folder Obsidian_Notes structure (Getting Started, Learning, Development, Planning, Reference)
- NPM Explained guide (746 lines, comprehensive npm reference)
- Development workflow and technical decisions documented
- Schema reference with all database models
- Command reference for all npm scripts
- Mobile testing and seed verification guide

### Security

- Environment variables properly configured (.env.example provided)
- Database connection secured with connection pooling
- Authentication setup (NextAuth.js configured)

## [Initial] - 2025-07-18

### Added

- Project initialization
- Basic inventory tracking concept

---

## Version History Notes

### Versioning Strategy

- **Major version (1.0.0)**: Breaking changes or major feature releases
- **Minor version (0.1.0)**: New features, non-breaking changes
- **Patch version (0.0.1)**: Bug fixes, documentation updates

### Links

- [Unreleased]: Compare latest changes
- [0.1.0]: Initial feature-complete version
- [Initial]: Project start
