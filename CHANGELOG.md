# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Icon-only buttons with tooltips on container cards** to reduce UI crowding and improve visual clarity
- **AssignToRackButton component** with visual rack grid selector for intuitive slot assignment
  - Displays all racks with color-coded slot availability (white=available, gray=occupied, blue=current)
  - Click-to-assign interface replaces dropdown for better spatial awareness
  - Icon-only mode with MapPin icon and "Assign to Rack" tooltip
- **Tooltip support for all container action buttons** with hover-to-reveal functionality
- Separated Edit functionality: Edit dialog now only handles container name and description (not location)
- **Category/Subcategory System**: Expanded ItemCategory enum from 14 to 35+ values; added ItemSubcategory enum with 30+ specialized classifications
- **Item Edit Dialog**: Category and subcategory dropdowns in edit form; grouped optgroups for better UX
- **Category Migration Script**: `scripts/migrate-categories.ts` with dry-run/apply modes to transform old categories to new structure
- **Quick Move Dropdown**: Inline container selector on item cards for one-click item moves (Container + Inventory pages)
- **CSV Import Support**: Enhanced production seed script to handle new category/subcategory structure from Google Forms CSV
- Item check-out/check-in system with user attribution and timestamp logging
- ItemActionsMenu dropdown component with check-out, check-in, move, edit, and remove actions
- Activity logging system via Movement table tracking who did what and when
- Move item to different container functionality
- Edit item details (name, description, quantity, condition, category)
- Remove item permanently with confirmation dialog
- Server actions for all item management operations with authentication
- Quick Move: inline container dropdown on item cards (Container + Inventory pages) for one-click move
- Inventory: inline action buttons per item card; optional icon-only compact toolbar
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

- **Container card buttons refactored to icon-only mode** with Edit and Assign to Rack buttons side-by-side in compact horizontal layout
- **EditContainerModalButton simplified** to only edit name/description with helper text directing to AssignToRackButton for location changes
- **Rack grid visual selector** replaces dropdown for slot assignment, showing full rack layout with occupied/available slots
- Container cards now display action buttons in top-right corner with flex gap-1 for reduced crowding
- **Inventory Page Layout**: Restored proper card grid (1-4 columns responsive) with full-size photos and metadata; moved actions to kebab dropdown menu
- **Container Detail Layout**: Fixed item display with photos on left (80x80), metadata on right, action buttons below; improved spacing and readability
- **Edit Container Button**: Relocated from inside container detail page to main containers list (absolute positioned top-right per card)
- **All Item Props**: Added subcategory field throughout codebase (ItemActionsMenu, inventory, container pages, server actions)
- Status badges now display "In Storage" and "Checked Out" instead of raw enum values
- Checked out items highlighted with orange background for visibility
- Item display enhanced with quantity, condition, and category information
- Inventory item cards compacted with 40x40 thumbnails and denser metadata for more items per row
- QR code scan now provides full item management interface directly
- Inventory Map page reorganized: Rack visualization now displayed first, CRUD forms moved below
- Racks now grouped by their locations for better spatial understanding
- Rack cards show mini grid visualization with actual slot layout
- Page layout expanded to max-width-7xl for better use of space
- Repository hygiene: ignore Obsidian workspace files (`Obsidian_Notes/.obsidian`, `.trash`)

### Fixed

- **Database Schema Applied**: Ran `npx prisma migrate dev` to ensure ItemSubcategory and expanded ItemCategory enums are in database
- **UI Layout Restoration**: Fixed inventory page grid that was broken by compact inline buttons; restored card-based layout
- **Container Detail Display**: Repaired item display layout with proper photo positioning and metadata flow
- **Missing Field Props**: Added subcategory to all item type definitions to prevent TypeScript errors
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
