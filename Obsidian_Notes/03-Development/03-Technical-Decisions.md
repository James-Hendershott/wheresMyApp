# Technical Decisions & Architecture 🏛️

> **What This Is**: Explains WHY we chose specific technologies and patterns.  
> **Purpose**: Document architectural decisions for future reference and onboarding.  
> **For**: Understanding the reasoning behind tech stack and design choices.  
> **Context**: Written for someone asking "Why did we use X instead of Y?"

---

## 🎯 Core Technology Choices

### Next.js 14+ (App Router)

**Chosen because**:
- ✅ Full-stack in one framework (React + API routes)
- ✅ Server Components reduce client bundle size
- ✅ Built-in routing, no extra libraries needed
- ✅ Great TypeScript support
- ✅ Easy deployment (Vercel, Netlify)

**Why not alternatives?**
- ❌ Vite/Create React App - Need separate backend
- ❌ Remix - Less mature ecosystem
- ❌ Plain React - No SSR, worse SEO, more setup

**Key features we use**:
- Server Actions for database mutations
- Server Components for data fetching
- App Router file-based routing
- API routes for external integrations

---

### TypeScript

**Chosen because**:
- ✅ Catch errors before runtime
- ✅ Better IDE autocomplete
- ✅ Self-documenting code (types = documentation)
- ✅ Easier refactoring (find all usages)

**Why not plain JavaScript?**
- ❌ Runtime errors in production
- ❌ No autocomplete for complex objects
- ❌ Harder to maintain as project grows

**Our TypeScript philosophy**:
- Strict mode enabled
- No `any` types (use `unknown` if needed)
- Infer types when obvious, explicit when complex
- Use Zod for runtime validation

---

### Prisma ORM

**Chosen because**:
- ✅ Type-safe database queries
- ✅ Great TypeScript integration
- ✅ Visual database browser (Prisma Studio)
- ✅ Simple migrations
- ✅ Works with many databases

**Why not alternatives?**
- ❌ Drizzle - Less mature
- ❌ TypeORM - More complex setup
- ❌ Raw SQL - No type safety, more boilerplate

**Prisma features we use**:
- Schema-first development
- Automatic TypeScript types
- Relation handling
- Prisma Studio for debugging

---

### PostgreSQL (via Neon)

**Chosen because**:
- ✅ Robust relational database
- ✅ Free tier on Neon
- ✅ Serverless (auto-scales)
- ✅ Great Prisma support
- ✅ JSONB for flexible data

**Why not alternatives?**
- ❌ MySQL - Less JSON support
- ❌ SQLite - Not great for production
- ❌ MongoDB - Need relational features (containers → items)

**Database philosophy**:
- Normalize data (avoid duplication)
- Use relations (foreign keys)
- Cascade deletes for cleanup
- Keep schema simple

---

### Tailwind CSS

**Chosen because**:
- ✅ Fast styling (no context switching)
- ✅ Small production bundle (tree-shaking)
- ✅ Consistent design system
- ✅ No CSS file management

**Why not alternatives?**
- ❌ Plain CSS - Hard to maintain, naming conflicts
- ❌ CSS Modules - More files to manage
- ❌ Styled Components - Runtime cost

**Tailwind patterns**:
- Use `@apply` sparingly (defeats purpose)
- Components for repeated styles
- Custom theme in `tailwind.config.ts`

---

### Shadcn/ui + Radix UI

**Chosen because**:
- ✅ Copy-paste components (no package lock-in)
- ✅ Accessible by default (Radix)
- ✅ Customizable (own your code)
- ✅ TypeScript first
- ✅ Composable primitives

**Why not alternatives?**
- ❌ Material-UI - Heavy bundle, hard to customize
- ❌ Chakra UI - Package dependency
- ❌ Headless UI - Less components

**Component philosophy**:
- Copy only what we need
- Modify to match design
- Keep in `components/ui/`

---

## 🏗️ Architecture Decisions

### Server Actions vs API Routes

**We use Server Actions for**:
- Database mutations (create, update, delete)
- Form submissions
- Anything requiring database access

**Why?**
- ✅ No API route boilerplate
- ✅ Type-safe from client to server
- ✅ Automatic request handling
- ✅ Built-in revalidation

**We use API Routes for**:
- External webhooks
- Third-party integrations
- Non-database operations

---

### File Structure

```
app/                    # Next.js App Router pages
├── (dashboard)/        # Route groups (URL organization)
├── api/                # API routes
└── layout.tsx          # Root layout

components/
├── ui/                 # Shadcn components
└── [feature]/          # Feature-specific components

lib/                    # Utilities, configs
├── db.ts               # Prisma client singleton
├── utils.ts            # Helper functions
└── validations.ts      # Zod schemas

prisma/
├── schema.prisma       # Database schema
└── seed-production.ts  # Data import

scripts/                # Helper scripts
```

**Why this structure?**
- Clear separation of concerns
- Feature-based organization
- Easy to find files
- Scales with project size

---

### State Management

**We use**:
- React Server Components for server state
- URL search params for filters
- React Context for global UI state (modals, theme)
- Local `useState` for component state

**Why not Redux/Zustand?**
- ❌ Overkill for this project size
- ❌ Server Components handle most state
- ❌ More complexity than needed

**When to add state library?**
- If global client state becomes complex
- If multiple components need same data
- If performance issues arise

---

### Data Fetching Pattern

```typescript
// ✅ Server Component - Direct DB access
async function ContainerList() {
  const containers = await prisma.container.findMany();
  return <List items={containers} />;
}

// ❌ Client Component - Unnecessary API call
'use client';
function ContainerList() {
  const [containers, setContainers] = useState([]);
  useEffect(() => {
    fetch('/api/containers').then(/* ... */);
  }, []);
  return <List items={containers} />;
}
```

**Why direct DB access?**
- ✅ Faster (no HTTP roundtrip)
- ✅ Type-safe
- ✅ Less code
- ✅ No loading states needed

---

## 🎨 Design Decisions

### Mobile-First Approach

**Why?**
- Primary use case: Scanning in storage area
- Easier to enhance desktop than simplify mobile
- Tailwind's breakpoint system encourages it

**Implementation**:
```tsx
// Base styles = mobile
// md: = desktop enhancements
<div className="flex flex-col md:flex-row gap-4 md:gap-8">
```

---

### QR Code Strategy

**Decision**: Generate QR codes, don't scan to create

**Why?**
- ✅ Print and apply to existing containers
- ✅ Codes contain container ID (direct lookup)
- ✅ No need for camera permissions upfront

**Future consideration**:
- Add photo-based inventory (OCR)
- Barcode scanning for items

---

### CSV Import over Manual Entry

**Why?**
- ✅ Already had data in Google Sheets
- ✅ Bulk import faster than UI
- ✅ Can re-import if needed

**Tradeoff**:
- Need seed script maintenance
- CSV format must stay consistent

---

## 🔮 Future Considerations

### Features Deferred (and why)

**Multi-user authentication**:
- Current scope: Single user (personal inventory)
- When needed: If sharing with family/roommates
- Complexity: Auth, permissions, data isolation

**Real-time updates**:
- Current: Standard page refresh
- When needed: If multiple users editing simultaneously
- Tech: WebSockets, Supabase Realtime, Pusher

**Mobile app (native)**:
- Current: PWA (web-based)
- When needed: Need native features (offline, notifications)
- Tech: React Native, Capacitor

**Advanced search (Elasticsearch)**:
- Current: Prisma full-text search
- When needed: >10k items, complex queries
- Cost: Extra service to maintain

---

## 📊 Performance Decisions

### Image Storage

**Decision**: Store in public folder initially

**Why?**
- ✅ Simple to implement
- ✅ No external service needed
- ✅ Fast local access

**When to change**:
- If storage grows beyond GB
- If need image transformations
- Then: Cloudinary, AWS S3, Vercel Blob

---

### Database Indexes

**Current**:
- Prisma auto-indexes IDs and foreign keys
- No custom indexes yet

**When to add**:
- Search queries become slow
- Sort operations lag
- Then: Add indexes on search fields

---

## 🧪 Testing Strategy

**Current approach**:
- Manual testing via Prisma Studio
- Type checking catches many errors
- Production testing (low stakes)

**Why not full test suite?**
- Personal project, low risk
- Fast iteration more valuable
- Tests add maintenance burden

**When to add tests**:
- Before accepting contributions
- Critical business logic emerges
- Refactoring complex code

---

## 📝 Documentation Philosophy

**Approach**: Obsidian-based, beginner-friendly

**Why?**
- ✅ Learn by documenting
- ✅ Help future self remember
- ✅ Easy to share if open-sourcing

**Structure**:
- 01: Start here (onboarding)
- 02: Learn concepts (education)
- 03: Daily work (workflows)
- 04: Future plans (vision)
- 05: Quick lookup (reference)

---

## 💭 Philosophy & Principles

### 1. **Optimize for Learning**
- Choose mainstream tech (easier help)
- Document decisions
- Experiment safely

### 2. **Start Simple, Add Complexity When Needed**
- Don't over-engineer
- Solve today's problems
- Refactor when pattern emerges

### 3. **Type Safety > Runtime Safety**
- Catch errors at compile time
- Use Zod for external data
- Trust TypeScript

### 4. **Convention over Configuration**
- Follow Next.js patterns
- Use framework defaults
- Less configuration = less maintenance

---

## 📚 Related Documentation

- **[Complete Learning Guide](../02-Learning/01-Complete-Learning-Guide.md)** - How these technologies work
- **[Development Workflow](01-Development-Workflow.md)** - How we use these choices daily
- **[Roadmap](../04-Planning/01-Roadmap.md)** - Where we're going with this

---

**Decisions documented, future self thanked!** 🙏
