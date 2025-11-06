# Roadmap

This document outlines planned features, improvements, and future development directions for Where's My...?

> **Last Updated**: November 5, 2025  
> **For detailed development plan**: See `Obsidian_Notes/04-Planning/01-Roadmap.md`

---

## 🎯 Vision

Build a comprehensive, user-friendly inventory tracking system that makes it easy to find anything, anywhere, anytime - whether stored at home, in a storage unit, or across multiple locations.

---

## 🐞 Known Issues

### High Priority

- [x] ~~Items can be added and NOT be inside a container~~ **COMPLETED** - Items as Containers feature implemented (Nov 5, 2025)
- [x] ~~Container capacity not enforced or tracked~~ **COMPLETED** - Capacity tracking with warnings implemented (Nov 5, 2025)
- [x] ~~Global search functionality across containers/items/locations~~ **COMPLETED** - Global search with debounced input and categorized results (Nov 5, 2025)
- [ ] No item photo upload UI yet (database ready)
- [ ] Multi-household support: User logins connected to a location. Multiple databases for each house location?
- [ ] Items with isContainer=true need drag-and-drop support in InteractiveRackGrid (schema complete, UI pending)
- [ ] Adjust/improve drag-and-drop grids for better UX
- [ ] Rack display inconsistency between Rack page and Location page views

### Medium Priority

- [ ] Category migration script exists but needs to be run on production data (optional manual step)
- [ ] Create item forms don't yet have category/subcategory selects (only edit dialog has them)

### Low Priority

- [ ] No reason that the Where's My...? Image should go to home and also Home inside the navbar. Maybe just use the image.
- Console Ninja warnings on Next.js v14.2.33 (cosmetic, not blocking)
- Dev server requires host binding for mobile access (documented workaround)
- Rack visualization could be more interactive

---

## 💡 Improvement Ideas

### User Experience

- Add loading states and skeleton screens
- Implement optimistic UI updates
- Add keyboard shortcuts for power users
- Improve error messages and validation feedback
- Add onboarding/tutorial for first-time users

### Performance

- Implement pagination for large container lists
- Add virtual scrolling for items list
- Optimize images with Next.js Image component
- Add service worker for offline caching

### Developer Experience

- Add Storybook for component development
- Implement automated visual regression testing
- Add API documentation with Swagger/OpenAPI
- Set up error tracking (Sentry)
- Add performance monitoring

### Data Management

- Implement soft deletes for containers/items
- Add data export/import functionality
- Create backup and restore system
- Add migration scripts for schema changes

---

## 🚀 Planned Features

### Milestone 0: Bootstrap & Foundation ✅ COMPLETE

- [x] Next.js 14 with App Router and TypeScript
- [x] PostgreSQL database with Prisma ORM
- [x] Authentication setup (NextAuth.js)
- [x] Tailwind CSS + Shadcn/ui components
- [x] GitHub Actions CI/CD pipeline
- [x] Testing infrastructure (Vitest + Playwright)
- [x] PWA configuration
- [x] Production seed script with real data (23 containers, 308 items)

### Milestone 1: Database Schema & Seed ✅ COMPLETE

- [x] Prisma schema finalized with all relationships
- [x] Comprehensive seed data (containers, items, photos)
- [x] Schema includes Container Types with tapered dimensions
- [x] Production seed script with real data (23 containers, 308 items)
- [x] Migration tool to link legacy containers to Container Types

### Milestone 2: Rack Visualization ✅ COMPLETE

- [x] Basic rack grid visualization on locations and racks pages
- [x] Visual slot occupancy indicators (filled/empty)
- [x] Collapsible location cards for space management
- [x] A1-style slot labeling (row 0 → A, col 1 → 1)
- [x] **Visual Rack Grid Selector**: Click-to-assign interface with color-coded slots for intuitive container placement
- [x] **Icon-Only Buttons with Tooltips**: Reduced UI crowding on container cards with hover-to-reveal labels
- [x] **AssignToRackButton Component**: Displays full rack layout with white=available, gray=occupied, blue=current
- [x] **Separated Edit Concerns**: Edit dialog handles name/description only; separate button for location assignment
- [ ] Interactive SVG rack grid with drag-and-drop
- [ ] Rack editing (move containers, change location/name)
- [ ] Server Actions for rack operations
- [ ] E2E tests for rack functionality

### Milestone 3: Container & QR System 🔄 IN PROGRESS

- [x] Container CRUD pages with type grouping
- [x] Container types admin interface with icons
- [x] Auto-populated container naming based on type
- [x] QR codes stored in database
- [x] QR codes downloadable as PNG
- [x] **Container code prefixes with size** (TOTE27 for 27-gallon, CASE for suitcases based on HDX standards)
- [ ] **[HIGH PRIORITY]** Container editing with admin/user approval workflow
- [x] **[HIGH PRIORITY]** QR code scanner opens container with item management interface
- [ ] QR code scanner using ZXing library (camera access needs fix)
- [ ] Deep link support (scan → container detail)
- [ ] QR label generation button/UI
- [ ] Batch label printing (Avery 5160 format)

### Milestone 4: Item Management & Photos 🔄 IN PROGRESS

- [x] Item CRUD with basic forms
- [x] Item listing on container detail pages
- [x] Check-in/check-out status tracking
- [x] Database schema ready for photos
- [x] **Category/Subcategory System**: Expanded ItemCategory to 35+ values, added ItemSubcategory with 30+ specialized types
- [x] **Quick-Move Dropdown**: Inline container selector on item cards for instant relocations
- [x] **Edit Dialog**: Category and subcategory dropdowns in item edit form with grouped optgroups
- [x] **Item check-out/check-in UI** with timestamp logging
- [x] **Item move/remove/edit functions** from container view
- [x] **Activity log** for all item operations (who, what, when)
- [x] **Status badge updates** (In Storage → Checked Out)
- [x] **UI Layout Fixes**: Restored inventory page card grid, fixed container detail layout, relocated edit button
- [x] **Items as Containers**: Items can now act as standalone containers with `isContainer` flag and `currentSlotId` for slot assignment (Nov 5, 2025)
- [x] **Container Capacity Tracking**: Volume-based capacity tracking with progress bars and color-coded warnings (green < 75%, yellow < 90%, red >= 90%) (Nov 5, 2025)
- [x] **Capacity Warnings**: Auto-check capacity before adding items, warn at 90%+, allow override with confirmation dialog (Nov 5, 2025)
- [x] **HDX Tote Dimensions**: Complete HDX tote size spectrum (12-55 gallon) with accurate tapered dimensions and calculated capacities (Nov 5, 2025)
- [ ] **Items in rack slots**: InteractiveRackGrid support for dragging item-containers into slots (foundation complete, UI pending)
- [ ] **[HIGH PRIORITY]** 7-day checkout notification system for overdue items
- [ ] Photo upload UI (camera or file upload)
- [ ] Photo upload to S3/MinIO with presigned URLs
- [ ] Multiple photos per item
- [ ] Add category/subcategory to create item forms (currently only in edit)
- [ ] Tag management with autocomplete

### Milestone 5: History & Search 🔄 IN PROGRESS

- [x] **Global search across containers/items/locations**: Debounced real-time search with categorized results (Nov 5, 2025)
- [ ] Movement history page with filters
- [ ] Fuzzy search support (currently exact/contains matching)
- [ ] Export history to CSV
- [ ] Advanced filtering and sorting

### Milestone 6: PWA & Deployment 🔄 IN PROGRESS

- [x] PWA configuration (manifest, icons)
- [x] GitHub Actions CI/CD pipeline
- [ ] Enhanced offline support with service workers
- [ ] Background sync for movements
- [ ] Production deployment to Vercel + Neon
- [ ] Docker Compose setup for self-hosting (Unraid)
- [ ] Custom domain and SSL configuration

### Phase 7: Enhanced UX (Future)

- [x] Collapsible locations for better space management
- [x] Uniform card sizing across containers page
- [x] Visual indicators for containers with checked-out items
- [ ] Mobile-optimized responsive design improvements
- [ ] Dark mode support
- [ ] Bulk item operations (move, delete, update)
- [ ] Recently accessed containers/items
- [ ] Keyboard shortcuts for power users

### Phase 8: Organization & Analytics (Future)

- [ ] Dashboard with inventory statistics
- [ ] Container capacity visualization
- [ ] Low stock alerts for items with quantities
- [ ] Expiration date notifications
- [ ] Tag-based organization system
- [ ] Custom categories and conditions
- [ ] Location hierarchy (Building → Room → Rack → Slot)

### Phase 9: Collaboration (Future)

- [ ] Multi-user support with permissions
- [ ] Shared inventories (family/team access)
- [ ] Item checkout system with user tracking
- [ ] Movement history with user attribution
- [ ] Audit logs for all changes

### Phase 10: Advanced Features (Future)

- [ ] AI-powered item recognition from photos
- [ ] Voice search and commands
- [ ] Smart suggestions for container organization
- [ ] Integration with shopping lists
- [ ] API for third-party integrations
- [ ] Mobile native app (React Native)

---

## 📊 Metrics & Goals

### Short-term Goals (Current Sprint - Nov 2025)

- [x] Complete Container Types system with tapered dimensions
- [x] Implement collapsible locations UI
- [x] Add A1-style slot labeling across app
- [x] **Implement item check-out/check-in workflow with logging**
- [x] **Expand category system with subcategories (35+ categories, 30+ subcategories)**
- [x] **Add quick-move dropdown for instant item relocations**
- [x] **Fix UI layouts (inventory page, container detail, edit button placement)**
- [ ] CSV import with automatic category mapping to new structure
- [ ] Photo upload functionality
- [ ] **[HIGH PRIORITY]** Add activity timestamps and user tracking for items
- [ ] **[HIGH PRIORITY]** Create 7-day overdue notification system
- [ ] **[HIGH PRIORITY]** Update status badges for checked-out items
- [ ] **[HIGH PRIORITY]** Container editing with approval workflow
- [ ] **[HIGH PRIORITY]** QR scan → container detail with item actions
- [ ] Fix QR camera access for scanning
- [ ] Add photo upload UI (camera + file)
- [ ] Add rack editing capabilities
- [ ] Complete migration of legacy container data

### Medium-term Goals (Dec 2025 - Jan 2026) - Milestones 2-3

- [ ] Interactive rack drag-and-drop system
- [ ] QR label generation and batch printing
- [ ] Complete item photo uploads to cloud storage
- [ ] Activity history dashboard with filters
- [ ] Deploy alpha version for personal testing

### Long-term Goals (Feb - Apr 2026) - Milestones 4-6

- [ ] Movement history and global search functional
- [ ] Mobile app fully responsive with PWA features
- [ ] Production deployment on Vercel + Neon
- [ ] Self-hosting documentation complete
- [ ] Beta testing with 5-10 users

---

## 🤝 Contributing

Want to help build a feature? Here's how:

1. Check this roadmap for planned features
2. Open a GitHub Issue to discuss implementation
3. Fork the repo and create a feature branch
4. Submit a Pull Request with tests and documentation

See `CONTRIBUTING.md` for detailed guidelines.

---

## 📝 Notes

- Features are subject to change based on user feedback
- Priorities may shift as development progresses
- Check GitHub Issues for detailed feature discussions
- Completed items moved to CHANGELOG.md

---

## ✅ Completed (Issues & Features)

> Recently shipped improvements are listed here. Completed items are checked, the original issue is struck through, and the resolution is shown in green.

### Resolved Issues

- [x] ~~Inventory Map, Add Location, Add Rack, Add Container, Add Item were not showing success/duplicate prompts~~ — <span style="color:#16a34a">Fixed: standardized toasts for create/update with duplicate detection</span>
- [x] ~~Add Validation for Location/Rack/Item/Container uniqueness~~ — <span style="color:#16a34a">Fixed: server-side Zod validation + toasts</span>
- [x] ~~Racks not loading on overview but worked on detail~~ — <span style="color:#16a34a">Fixed: defensive DB ensures and query fixes</span>
- [x] ~~Inventory Map page layout was confusing~~ — <span style="color:#16a34a">Fixed: forms moved below rack map</span>
- [x] ~~Rack Map not grouped by location~~ — <span style="color:#16a34a">Fixed: grouped and sorted by Location → Rack → Slot</span>
- [x] ~~Racks page error “Unsupported Server Component Type: Undefined”~~ — <span style="color:#16a34a">Fixed: implemented CollapsibleLocation wrapper</span>
- [x] ~~Production seed could erase data on bad CSV~~ — <span style="color:#16a34a">Fixed: CSV validated before any destructive action</span>
- [x] ~~Home page duplicated Scan/Map CTAs~~ — <span style="color:#16a34a">Fixed: simplified to three feature cards</span>

### Shipped Features

- [x] ~~Admin: Container Types CRUD with icon selection~~ — <span style="color:#16a34a">Shipped: create/list/inline edit/delete; validation</span>
- [x] ~~Container Type dimensions (L×W×H)~~ — <span style="color:#16a34a">Shipped in admin form</span>
- [x] ~~Auto-number suggestion when adding containers by type prefix~~ — <span style="color:#16a34a">Shipped</span>
- [x] ~~Type-specific icons shown on rack detail~~ — <span style="color:#16a34a">Shipped</span>
- [x] ~~Containers list grouped by Type with counts and codes~~ — <span style="color:#16a34a">Shipped with responsive cards</span>
- [x] ~~Rack creation visual preview (live grid)~~ — <span style="color:#16a34a">Shipped</span>
- [x] ~~Toasts for CRUD actions~~ — <span style="color:#16a34a">Shipped</span>
- [x] ~~QR codes downloadable as PNG~~ — <span style="color:#16a34a">Shipped</span>
- [x] ~~Auth: NextAuth v5 with Prisma adapter and dev credentials~~ — <span style="color:#16a34a">Shipped</span>
- [x] ~~User registration with admin approval~~ — <span style="color:#16a34a">Shipped (/register, /admin/pending-users)</span>
- [x] ~~Seed test accounts (admin/user)~~ — <span style="color:#16a34a">Shipped via /admin/seed-accounts</span>
- [x] ~~Account profile editing (name, avatar)~~ — <span style="color:#16a34a">Shipped</span>
- [x] ~~Standard container catalog + seeding button~~ — <span style="color:#16a34a">Shipped</span>
- [x] ~~Containers page redesigned with modal-based quick add~~ — <span style="color:#16a34a">Shipped</span>
- [x] ~~Locations page introduced for inventory map (moved from Racks)~~ — <span style="color:#16a34a">Shipped</span>
- [x] ~~Container Types enhanced with tapered dimensions and 3D visuals~~ — <span style="color:#16a34a">Shipped</span>
- [x] ~~Migration tool to link legacy containers to Container Types~~ — <span style="color:#16a34a">Shipped: dry-run + apply under Admin</span>
- [x] ~~Collapsible location cards with expand/collapse~~ — <span style="color:#16a34a">Shipped: Nov 4, 2025</span>
- [x] ~~Uniform container card sizing~~ — <span style="color:#16a34a">Shipped: prevents wide cards from spanning full row</span>
- [x] ~~A1-style slot labeling (A1, B2, etc.)~~ — <span style="color:#16a34a">Shipped: replaced [0,1] format across app</span>
- [x] ~~Auto-populate container fields on type selection~~ — <span style="color:#16a34a">Shipped: removed manual Autofill button</span>

- [x] ~~Container editing with location/slot reassignment~~ — <span style="color:#16a34a">Shipped: EditContainerModalButton with smart slot management (Nov 4, 2025)</span>
- [x] ~~Item check-out/check-in system with user tracking~~ — <span style="color:#16a34a">Shipped: Server actions with movement logging (Nov 4, 2025)</span>
- [x] ~~Item management actions (move, edit, remove)~~ — <span style="color:#16a34a">Shipped: ItemActionsMenu dropdown component (Nov 4, 2025)</span>
- [x] ~~Activity logging for all item operations~~ — <span style="color:#16a34a">Shipped: Movement table logs actor, timestamp, action, containers (Nov 4, 2025)</span>
- [x] ~~Status badge improvements (In Storage → Checked Out)~~ — <span style="color:#16a34a">Shipped: Humanized display with orange highlight (Nov 4, 2025)</span>
- [x] ~~QR scan opens container with item management~~ — <span style="color:#16a34a">Shipped: Full ItemActionsMenu from QR scan (Nov 4, 2025)</span>
- [x] ~~Container type wireframe diagrams~~ — <span style="color:#16a34a">Shipped: Clean wireframes, color-coded dimensions, 220px size (Nov 4, 2025)</span>
- [x] ~~Unit toggle (inches/mm) for container types~~ — <span style="color:#16a34a">Shipped: Button toggle in add form (Nov 4, 2025)</span>
- [x] ~~Tapered container orientation fix~~ — <span style="color:#16a34a">Shipped: Bottom opening larger (realistic) (Nov 4, 2025)</span>
- [x] ~~Quick move dropdown on item cards~~ — <span style="color:#16a34a">Shipped: one-click move on Container + Inventory pages (Nov 4, 2025)</span>
- [x] ~~Inventory page inline actions~~ — <span style="color:#16a34a">Shipped: check-out/in, move, edit, remove with compact cards and icon toolbar (Nov 4, 2025)</span>

---

## 🗓️ Release Schedule

- **v0.1.0** (Nov 2025): ✅ Bootstrap & Foundation complete
- **v0.2.0** (Dec 2025): Milestone 1 & 2 - Database finalization + Rack visualization
- **v0.3.0** (Jan 2026): Milestone 3 - Container management + QR system
- **v0.4.0** (Feb 2026): Milestone 4 - Item management + Photo uploads
- **v0.5.0** (Mar 2026): Milestone 5 - History + Search
- **v1.0.0** (Apr 2026): Milestone 6 - PWA enhancements + Production deployment
- **v2.0.0** (Q4 2026): Multi-user + Collaboration features

---

_This roadmap is a living document and will be updated as the project evolves._
