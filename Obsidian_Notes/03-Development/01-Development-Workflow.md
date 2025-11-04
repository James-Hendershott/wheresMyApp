# Development Workflow Guide 💻

> **What This Is**: Day-to-day development workflow, Git practices, and coding standards.  
> **Purpose**: Establish consistent workflow for feature development, testing, and deployment.  
> **For**: Daily development work - how to start a feature, test it, and merge it.  
> **Key Topics**: Git workflow, branch strategy, commit conventions, testing checklist.

---

## 🌊 Daily Development Workflow

### Starting Your Day

```bash
# 1. Pull latest changes
git checkout main
git pull origin main

# 2. Check for dependency updates
npm install

# 3. Start development server
npm run dev

# 4. Open Prisma Studio (in separate terminal)
npm run db:studio
```

---

## 🎯 Feature Development Flow

### 1. Create Feature Branch

```bash
# Create and switch to new branch
git checkout -b feat/your-feature-name

# Branch naming conventions:
# feat/   - New features
# fix/    - Bug fixes
# chore/  - Maintenance, refactoring
# docs/   - Documentation updates
```

### 2. Make Changes

```typescript
// Follow coding standards:
// - Add "What This Is" comments to files
// - Use WHY/WHAT/HOW comments for complex logic
// - Keep functions small and focused
// - Type everything (avoid 'any')
```

### 3. Test Your Changes

```bash
# Check types
npm run type-check

# Lint code
npm run lint

# Format code
npm run format

# Run tests
npm run test

# Build to catch production errors
npm run build
```

### 4. Commit Changes

```bash
# Stage files
git add .

# Commit with conventional commit message
git commit -m "feat(scope): description"

# Commit message format:
# feat(rack): add SVG grid visualization
# fix(container): prevent duplicate placement
# chore(deps): update Prisma to 5.20
# docs(readme): add deployment instructions
```

### 5. Push and Merge

```bash
# Push to GitHub
git push origin feat/your-feature-name

# Create Pull Request on GitHub
# - Fill out PR template
# - Add screenshots/GIFs for UI changes
# - Link related issues

# After approval, merge to main
git checkout main
git pull origin main
```

---

## 📝 Commit Message Convention

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Purpose | Example |
|------|---------|---------|
| `feat` | New feature | `feat(qr): add QR code scanner` |
| `fix` | Bug fix | `fix(container): prevent null pointer` |
| `docs` | Documentation | `docs(readme): add setup guide` |
| `style` | Formatting, no code change | `style: format with Prettier` |
| `refactor` | Code refactor | `refactor(db): extract prisma singleton` |
| `test` | Add/update tests | `test(items): add CRUD tests` |
| `chore` | Maintenance | `chore(deps): update dependencies` |

### Scopes

Common scopes in this project:
- `rack` - Rack grid functionality
- `container` - Container management
- `item` - Item tracking
- `qr` - QR code generation/scanning
- `db` - Database/Prisma
- `ui` - UI components
- `auth` - Authentication
- `api` - API routes/Server Actions

---

## ✅ Pre-Commit Checklist

Before committing:

- [ ] Code compiles (`npm run type-check`)
- [ ] Linter passes (`npm run lint`)
- [ ] Code formatted (`npm run format`)
- [ ] Tests pass (`npm run test`)
- [ ] No console.logs left in code
- [ ] Comments explain WHY, not just WHAT
- [ ] Commit message follows convention

---

## 🧪 Testing Strategy

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm run test

# Run specific test file
npm run test path/to/test.test.ts

# Run with UI
npm run test:ui
```

**What to test**:
- Utility functions
- Business logic
- Data transformations
- Validation schemas

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test
npm run test:e2e --grep "container"

# Run with UI
npm run test:e2e:ui
```

**What to test**:
- Critical user flows
- Form submissions
- Navigation
- Error states

---

## 🗃️ Database Workflow

### Schema Changes

```bash
# 1. Edit prisma/schema.prisma
# 2. Push to database
npm run db:push

# 3. Verify in Prisma Studio
npm run db:studio
```

### Seeding Data

```bash
# Load test data
npm run db:seed

# Load production CSV
npm run db:seed:prod
```

### Viewing Data

```bash
# Open Prisma Studio
npm run db:studio
# Visit http://localhost:5555
```

---

## 🚀 Deployment Workflow

### Pre-Deployment

```bash
# 1. Pull latest main
git checkout main
git pull origin main

# 2. Run full test suite
npm run type-check
npm run lint
npm run test
npm run build

# 3. Test production build locally
npm run start
```

### Deploy to Production

```bash
# Automatic deployment via Git push
git push origin main

# Or manual deployment
# (See deployment docs for platform-specific commands)
```

---

## 🐛 Debugging Workflow

### Development Errors

1. **TypeScript errors**: Run `npm run type-check` for details
2. **Runtime errors**: Check terminal and browser console
3. **Database errors**: Check Prisma Studio, verify schema

### Common Issues

**Port already in use**:
```bash
# Kill process on port 3000
npx kill-port 3000
```

**Prisma Client out of sync**:
```bash
npm run db:push
```

**node_modules corrupted**:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Code Quality Standards

### File Organization

```typescript
// 1. Imports (external, then internal)
import { PrismaClient } from '@prisma/client';
import { MyComponent } from '@/components/my-component';

// 2. Types/Interfaces
interface MyProps {
  id: string;
}

// 3. Main code
export function MyComponent({ id }: MyProps) {
  // Implementation
}
```

### Comment Standards

```typescript
// WHY: Explain business reason
// WHAT: Summarize what this does
// HOW: Key implementation details
// GOTCHA: Edge cases or pitfalls

// Example:
// WHY: Prevent double-booking of rack slots
// WHAT: Check if slot is occupied before placement
// HOW: Query database for existing container in slot
// GOTCHA: Race condition possible, use transaction
async function checkSlotAvailability(slotId: string) {
  // Implementation
}
```

---

## 🎓 Learning Resources

While developing, refer to:

- **[Complete Learning Guide](../02-Learning/01-Complete-Learning-Guide.md)** - Technology deep dives
- **[NPM Explained](../02-Learning/02-NPM-Explained.md)** - Understanding npm commands
- **[Quick Reference](../01-Getting-Started/02-Quick-Reference.md)** - Command quick lookup

---

**Happy Coding!** 🚀
