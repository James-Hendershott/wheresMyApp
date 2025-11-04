# Quick Reference Guide 🚀

> **What This Is**: Quick command reference and daily workflow guide for development.  
> **Purpose**: Fast lookup for common commands - no need to remember everything!  
> **For**: Daily development work when you need to run a specific command quickly.  
> **When to Use**: Keep this open in a tab for quick copy-paste of commands.

---

# WheresMy App - Quick Reference 🚀

Quick commands and workflows for daily development.

## 📦 Installation & Setup

```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env

# Set up database
pnpm db:migrate      # Create/run migrations
pnpm db:seed         # Populate with test data
pnpm db:studio       # Open Prisma Studio UI

# Start development
pnpm dev             # http://localhost:3000
```

## 🔧 Development Commands

### Running the App

```bash
pnpm dev             # Development mode with hot reload
pnpm build           # Production build
pnpm start           # Run production build
```

### Code Quality

```bash
pnpm lint            # Run ESLint
pnpm format          # Format with Prettier
pnpm format:check    # Check formatting without changes
pnpm type-check      # TypeScript type checking
```

### Testing

```bash
pnpm test            # Run unit tests (Vitest)
pnpm test:ui         # Run tests with UI
pnpm test:e2e        # Run E2E tests (Playwright)
pnpm test:e2e:ui     # Run E2E tests with UI
```

### Database

```bash
pnpm db:generate     # Generate Prisma Client
pnpm db:push         # Push schema without migration
pnpm db:migrate      # Create and run migration
pnpm db:migrate:deploy  # Deploy migrations (production)
pnpm db:seed         # Run seed script
pnpm db:studio       # Open database GUI
```

## 🌿 Git Workflow

### Starting a New Feature

```bash
# 1. Update develop branch
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feat/your-feature-name

# 3. Make changes and commit
git add .
git commit -m "feat(scope): description"

# 4. Push to remote
git push origin feat/your-feature-name

# 5. Open PR on GitHub (develop ← feat/your-feature-name)
```

### Syncing with Develop

```bash
# Update your feature branch with latest develop
git checkout develop
git pull origin develop
git checkout feat/your-feature-name
git merge develop

# Or use rebase for cleaner history
git rebase develop
```

### Common Branch Commands

```bash
git branch                    # List local branches
git branch -a                 # List all branches (including remote)
git checkout -b feat/new      # Create and switch to new branch
git branch -d feat/old        # Delete local branch (safe)
git branch -D feat/old        # Force delete local branch
git push origin --delete feat/old  # Delete remote branch
```

## 📝 Commit Message Examples

```bash
# Feature
git commit -m "feat(rack): add SVG grid visualization"

# Bug fix
git commit -m "fix(container): prevent duplicate slot assignment"

# Documentation
git commit -m "docs(api): add upload endpoint examples"

# Style/Format
git commit -m "style(components): format with prettier"

# Refactor
git commit -m "refactor(db): optimize container queries"

# Test
git commit -m "test(e2e): add rack placement scenarios"

# Chore
git commit -m "chore(deps): update Next.js to 14.2.0"

# Performance
git commit -m "perf(search): add database indexes"

# CI/CD
git commit -m "ci: add test coverage reporting"
```

## 🧪 Pre-Commit Checklist

Before committing, run:

```bash
pnpm lint && pnpm format && pnpm type-check && pnpm test
```

Or create an alias:

```bash
# Add to your shell profile (.bashrc, .zshrc, etc.)
alias precommit="pnpm lint && pnpm format && pnpm type-check && pnpm test"

# Then just run:
precommit
```

## 🔍 Common Tasks

### Add a New Component

```bash
# shadcn/ui component
npx shadcn-ui@latest add dialog

# Custom component
# Create in src/components/features/
# Import and use in pages
```

### Add a New Page

```bash
# Create file: src/app/new-page/page.tsx
# Next.js automatically creates route: /new-page
```

### Add a Server Action

```typescript
// src/server/actions/my-actions.ts
"use server";

import { z } from "zod";

const MySchema = z.object({
  field: z.string(),
});

export async function myAction(data: unknown) {
  const validated = MySchema.parse(data);
  // Do work...
  return { success: true };
}
```

### Create a Database Migration

```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
pnpm db:migrate

# Enter migration name when prompted
# Example: "add_tags_to_items"
```

### Add Environment Variable

```bash
# 1. Add to .env
NEW_VAR="value"

# 2. Add to .env.example (without value)
NEW_VAR=""

# 3. Use in code
process.env.NEW_VAR
```

## 🐛 Debugging

### Check Application Logs

```bash
# Development logs in terminal where pnpm dev is running

# Check database queries
# Add to .env:
DATABASE_URL="...?connect_timeout=10&logging=true"
```

### Debug in VS Code

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "pnpm dev"
    }
  ]
}
```

### Browser DevTools

```bash
# React DevTools extension
# Network tab for API calls
# Console for client-side errors
# Application > Storage for PWA debugging
```

## 📱 Testing on Mobile

### Local Network Access

```bash
# 1. Find your local IP
# Windows:
ipconfig
# Mac/Linux:
ifconfig

# 2. Start dev server
pnpm dev

# 3. Access from phone
# http://192.168.x.x:3000
# (Replace with your IP)
```

### QR Scanner Testing

```bash
# QR scanner requires HTTPS (except localhost)
# Use ngrok for testing:
npx ngrok http 3000

# Or use local HTTPS:
# https://nextjs.org/docs/pages/api-reference/next-config-js/https
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# 1. Push to GitHub
git push origin main

# 2. Import project in Vercel dashboard
# 3. Add environment variables
# 4. Deploy!
```

### Environment Variables Needed

```bash
DATABASE_URL          # PostgreSQL connection
AUTH_SECRET           # Generated secret
NEXTAUTH_URL          # Production URL
S3_ENDPOINT           # S3/MinIO endpoint
S3_BUCKET             # Bucket name
S3_ACCESS_KEY_ID      # S3 credentials
S3_SECRET_ACCESS_KEY  # S3 credentials
NEXT_PUBLIC_SITE_URL  # Public app URL
```

## 📚 Useful Links

- **Project Docs**: Start with `README.md`
- **Learning Guide**: See `learn.md`
- **Contributing**: Read `CONTRIBUTING.md`
- **Roadmap**: Check `ROADMAP.md`
- **Issues**: Track on GitHub

## 🆘 Troubleshooting

### "Module not found" Error

```bash
pnpm install       # Reinstall dependencies
pnpm db:generate   # Regenerate Prisma Client
```

### Database Connection Error

```bash
# Check DATABASE_URL in .env
# Ensure PostgreSQL is running
# Test connection:
pnpm db:studio
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules
pnpm install
```

### Type Errors

```bash
# Regenerate Prisma types
pnpm db:generate

# Check for TypeScript errors
pnpm type-check
```

### Port Already in Use

```bash
# Kill process on port 3000
# Windows:
npx kill-port 3000

# Mac/Linux:
lsof -ti:3000 | xargs kill
```

## 💡 Tips & Tricks

1. **Use `pnpm dlx`** instead of global installs:

   ```bash
   pnpm dlx prisma studio
   ```

2. **Watch mode for tests**:

   ```bash
   pnpm test -- --watch
   ```

3. **Run single test file**:

   ```bash
   pnpm test src/lib/utils.test.ts
   ```

4. **Git commit with ticket**:

   ```bash
   git commit -m "feat(rack): add grid (#42)"
   ```

5. **Check bundle size**:
   ```bash
   pnpm build
   # Check .next/analyze
   ```

---

**Bookmark this page for quick reference! ⭐**
