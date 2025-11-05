# AI Coding Agent Instructions for WheresMy App

## Project Overview
**WheresMy App** is a Next.js 14 inventory management system using the App Router. Track physical items through a Location→Rack→Slot→Container→Item hierarchy with QR codes, movement audit logging, and PWA capabilities.

**Tech Stack**: Next.js 14 (App Router) • TypeScript • Prisma ORM • PostgreSQL • Auth.js (NextAuth v5) • Tailwind CSS • shadcn/ui • Vitest • Playwright

## Critical Patterns & Conventions

### 1. WHY/WHAT/HOW Comment Structure
**Every file** must start with structured comments explaining purpose and implementation:
```typescript
// WHY: Explains the business/architectural reason this code exists
// WHAT: Describes what this code does at a high level
// HOW: Details implementation approach and key techniques
// GOTCHA: (Optional) Warns about non-obvious issues or edge cases
```
**Examples**: See `src/components/items/ItemActionsMenu.tsx`, `src/app/actions/itemActions.ts`, `prisma/schema.prisma`

### 2. Server Actions Pattern
All mutations use Server Actions with Zod validation, transactional updates, and path revalidation:
```typescript
"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

const MyActionSchema = z.object({
  field: z.string().min(1)
});

export async function myAction(data: z.infer<typeof MyActionSchema>) {
  const validated = MyActionSchema.parse(data);
  
  await prisma.$transaction(async (tx) => {
    // Your transactional logic here
  });
  
  revalidatePath("/relevant/path");
}
```
**Examples**: `src/app/actions/itemActions.ts`, `src/app/actions/containerActions.ts`

### 3. Data Model Hierarchy
**Critical**: Understand the 5-level storage hierarchy:
1. **Location** → Physical place (e.g., "Garage")
2. **Rack** → Storage unit within location (e.g., "Shelf A")
3. **Slot** → Position in rack (A1, B2, etc. - use `formatSlotLabel()` utility)
4. **Container** → Physical box/bin with QR code
5. **Item** → Individual tracked object

**All item movements** create `Movement` records with actor (User), timestamp, action type, and from/to containers for audit trail.

### 4. Server vs Client Component Separation
- **Server Components** (default): Data fetching, DB queries, auth checks
  - Use `prisma` directly
  - No `useState`, `useEffect`, or event handlers
  - Example: `src/app/containers/[id]/page.tsx`
  
- **Client Components** (`"use client"`): Interactivity, forms, state
  - Call Server Actions for mutations
  - Use React hooks
  - Example: `src/app/inventory/InventoryClient.tsx`

### 5. Defensive Database Patterns
Always ensure schema integrity before queries that assume data exists:
```typescript
// GOOD: Defensive pattern
await ensureContainerTypesSchema(prisma);
const containerTypes = await prisma.containerType.findMany();

// BAD: Assumes types exist
const containerTypes = await prisma.containerType.findMany(); // May return []
```
**Example**: See `ensureContainerTypesSchema()` in `src/lib/db-helpers.ts`

## Key Workflows & Commands

### Development Workflow
```bash
npm install              # Install deps + auto-run prisma generate
npm run dev              # Start dev server (http://localhost:3000)
npm run db:studio        # Open Prisma Studio (database GUI)
```

### Database Workflows
```bash
npm run db:migrate       # Create and apply migration (dev)
npm run db:generate      # Regenerate Prisma Client after schema changes
npm run db:seed          # Seed dev database with sample data
npm run db:seed:prod     # Seed from CSV (Obsidian_Notes/files/*.csv)
```
**GOTCHA**: After modifying `prisma/schema.prisma`, ALWAYS run `db:migrate` then `db:generate` before using new fields in code.

### Testing Workflow
```bash
npm run test             # Run Vitest unit tests
npm run test:ui          # Vitest with UI
npm run test:e2e         # Run Playwright e2e tests
npm run test:e2e:ui      # Playwright with UI
```

### Production Seed from CSV
CSV files in `Obsidian_Notes/files/` drive production data:
- `locations.csv` → Locations
- `racks.csv` → Racks (references location names)
- `container_types.csv` → ContainerType metadata
- `containers.csv` → Containers (with QR codes)
- `Tote Inventory Intake Form (Responses) - Form Responses 1 (1).csv` → Real inventory data with category mapping

**Run**: `npm run db:seed:prod` (uses `prisma/seed-production.ts`)

**Category Mapping**: The seed script automatically maps old CSV categories (e.g., "Books", "Camping & Outdoors") to the new ItemCategory + ItemSubcategory system. See the `mapCategory()` function in `seed-production.ts` for the full mapping table.

**Idempotent**: The seed script can be run multiple times without duplicating data (uses upsert patterns).

## Common Tasks

### Adding a New Enum to Schema
1. Edit `prisma/schema.prisma` to add enum values
2. Run `npm run db:migrate` (creates migration + applies)
3. Update UI dropdowns/selects in relevant forms
4. (Optional) Create migration script for existing data (see `scripts/migrate-categories.ts`)

### Creating a New Form with Server Action
1. Define Zod schema in `src/app/actions/yourActions.ts`
2. Create Server Action with validation + revalidatePath
3. Build form component (Client Component with `"use client"`)
4. Use React Hook Form + Zod resolver for client validation
5. Call Server Action in form `onSubmit`
6. Show toast notification (Sonner) for feedback

### Adding Movement Audit Logging
When creating/updating items or containers:
```typescript
await prisma.movement.create({
  data: {
    actionType: "CHECK_IN", // or CHECK_OUT, MOVE, REMOVE
    itemId: item.id,
    toContainerId: containerId, // or fromContainerId for checkout
    actorId: session.user.id,
    timestamp: new Date()
  }
});
```

## File Structure Quick Reference
```
src/
├── app/                    # Next.js App Router pages
│   ├── actions/            # Server Actions (itemActions, containerActions, etc.)
│   ├── containers/         # Container pages + [id] detail
│   ├── inventory/          # Main inventory view
│   ├── locations/          # Location management
│   └── racks/              # Rack management
├── components/             # React components
│   ├── items/              # ItemActionsMenu, ItemCard, etc.
│   ├── containers/         # Container-specific components
│   ├── ui/                 # shadcn/ui primitives
│   └── auth/               # Auth components
├── lib/                    # Utilities and shared logic
│   ├── prisma.ts           # Prisma Client singleton
│   ├── db-helpers.ts       # Defensive DB utilities
│   └── auth.ts             # Auth.js configuration
prisma/
├── schema.prisma           # Database schema (source of truth)
├── seed.ts                 # Dev seed script
├── seed-production.ts      # CSV-based production seed
└── migrations/             # Migration history (auto-generated)
```

## Gotchas & Edge Cases

### Slot Label Formatting
- Slots are row+column (e.g., row=0, column=0 → "A1")
- **ALWAYS** use `formatSlotLabel(row, column)` from `src/lib/utils.ts`
- Never manually construct slot labels

### QR Code Uniqueness
- Each Container has a unique `qrCode` field (String @unique)
- Generate via `crypto.randomUUID()` or similar
- QR codes are the primary access method for containers

### Type Casting for Enums
When updating enums from forms (string inputs):
```typescript
// Prisma expects enum type, form gives string
await prisma.item.update({
  where: { id },
  data: {
    category: validated.category as ItemCategory,
    subcategory: validated.subcategory as ItemSubcategory | null
  }
});
```

### revalidatePath Scope
After mutations, revalidate ALL affected routes:
```typescript
revalidatePath("/inventory");        // List view
revalidatePath("/containers");       // Container list
revalidatePath(`/containers/${id}`); // Specific container detail
```

## Documentation Files
- `README.md` → Quick start, project structure, commands
- `learn.md` → Beginner-friendly guides (Prisma, TypeScript, testing)
- `ROADMAP.md` → Vision, known issues, milestones
- `Obsidian_Notes/` → Additional learning resources

## Git Conventions
- **Conventional Commits**: `feat:`, `fix:`, `chore:`, `docs:`
- Commit after each logical feature completion
- Run `npm run format` and `npm run lint` before committing

### Branching Workflow
**CRITICAL**: Always create a feature branch for major updates:

```bash
# Create and checkout new branch for your feature
git checkout -b feature/your-feature-name

# Make changes, commit as you go
git add .
git commit -m "feat: description of change"

# When feature is complete and tested
git checkout main
git merge feature/your-feature-name

# Delete the feature branch after merging
git branch -d feature/your-feature-name
```

**Branch naming conventions**:
- `feature/` - New features (e.g., `feature/photo-upload`)
- `fix/` - Bug fixes (e.g., `fix/qr-scanner`)
- `docs/` - Documentation only (e.g., `docs/api-reference`)
- `refactor/` - Code refactoring (e.g., `refactor/server-actions`)
- `chore/` - Maintenance tasks (e.g., `chore/update-deps`)

**When to branch**:
- ✅ Adding new features (category system, photo upload, etc.)
- ✅ Major refactoring or structural changes
- ✅ Breaking changes to schema or APIs
- ✅ Multi-step updates that span multiple commits
- ❌ Small bug fixes (can commit directly to main)
- ❌ Documentation typos or minor updates
