# Roadmap

This document outlines planned features, improvements, and future development directions for Where's My...?

> **Last Updated**: November 4, 2025  
> **For detailed development plan**: See `Obsidian_Notes/04-Planning/01-Roadmap.md`

---

## 🎯 Vision

Build a comprehensive, user-friendly inventory tracking system that makes it easy to find anything, anywhere, anytime - whether stored at home, in a storage unit, or across multiple locations.

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

### Milestone 1: Database Schema & Seed 🔄 IN PROGRESS
- [x] Prisma schema finalized with all relationships
- [x] Comprehensive seed data (containers, items, photos)
- [ ] Schema documentation in database docs
- [ ] Migration strategy documented

### Milestone 2: Rack Visualization ⏳ PLANNED
- [ ] Interactive SVG rack grid system
- [ ] Visual slot management (place/move/remove containers)
- [ ] Responsive design for mobile rack viewing
- [ ] Server Actions for rack operations
- [ ] E2E tests for rack functionality

### Milestone 3: Container & QR System ⏳ PLANNED
- [ ] Container CRUD pages with search/filter
- [ ] QR code scanner using ZXing library
- [ ] Deep link support (scan → container detail)
- [ ] QR label generation and printing
- [ ] Batch label printing (Avery 5160 format)

### Milestone 4: Item Management & Photos ⏳ PLANNED
- [ ] Item CRUD with React Hook Form validation
- [ ] Photo upload to S3/MinIO with presigned URLs
- [ ] Multiple photos per item
- [ ] Check-in/check-out flow for item movement
- [ ] Item movement history tracking
- [ ] Tag management with autocomplete

### Milestone 5: History & Search ⏳ PLANNED
- [ ] Movement history page with filters
- [ ] Global search across containers/items/locations
- [ ] Fuzzy search support
- [ ] Export history to CSV
- [ ] Advanced filtering and sorting

### Milestone 6: PWA & Deployment ⏳ PLANNED
- [ ] Enhanced offline support with service workers
- [ ] Background sync for movements
- [ ] Production deployment to Vercel + Neon
- [ ] Docker Compose setup for self-hosting (Unraid)
- [ ] Custom domain and SSL configuration

### Phase 7: Enhanced UX (Future)
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

## 🐛 Known Issues

### High Priority
- Console Ninja warnings on Next.js v14.2.33 (cosmetic, not blocking)
- Dev server requires host binding for mobile access (documented workaround)
- [ ] Need to be able to Edit a Rack when you select it. i.e. Drag and drop totes, Change Location, Change Name Etc.
- [ ] Ensure Photos can be added via taking a picture or uploading image.
- [ ] Ensure QR Scanning actually gives the option to access the camera and not just shut it down.
- [ ] In the admin add new container type, support unit toggle (mm/in), larger wireframe visuals, and correct tapered orientation.
- [ ] Icon selector should reset/show all options after a selection.

### Medium Priority
- No item photo upload UI yet (database ready)
- No QR code generation yet (database has codes ready)
- Container capacity not enforced or tracked

### Low Priority
- Rack visualization could be more interactive
- No keyboard shortcuts implemented

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

## 📊 Metrics & Goals

### Short-term Goals (1-2 months) - Milestones 1-3
- [ ] Complete database schema documentation
- [ ] Implement rack visualization system
- [ ] Add QR code scanning and generation
- [ ] Deploy alpha version for personal testing

### Medium-term Goals (3-4 months) - Milestones 4-5
- [ ] Item photo uploads working
- [ ] Movement history and search functional
- [ ] Mobile app fully responsive
- [ ] Beta testing with 5-10 users

### Long-term Goals (5-6 months) - Milestone 6+
- [ ] Production deployment on Vercel
- [ ] PWA offline capabilities
- [ ] Self-hosting documentation complete
- [ ] 50+ active users (if opened to public)

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

*This roadmap is a living document and will be updated as the project evolves.*
