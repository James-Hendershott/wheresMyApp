# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Mobile testing support with network host binding documentation
- Database seed verification scripts and documentation

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
