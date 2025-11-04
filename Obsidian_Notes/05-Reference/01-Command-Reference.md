# Command Reference 📟

> **What This Is**: Quick lookup reference for ALL commands used in the project.  
> **Purpose**: Single place to find any command - no searching through docs.  
> **For**: When you know you need to run something but can't remember the exact command.  
> **Organization**: Commands grouped by purpose (dev, database, testing, git).

---

## 🚀 Development Commands

### Starting the App

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Run production build locally
```

**When to use**:
- `dev` - Daily development (auto-reloads on changes)
- `build` - Before deploying or testing production build
- `start` - Test production build locally

---

## 🗃️ Database Commands

### Prisma Studio (Visual Database UI)

```bash
npm run db:studio    # Open Prisma Studio at http://localhost:5555
```

**What it does**: Opens a web UI to browse and edit database tables

### Schema Management

```bash
npm run db:push      # Sync schema.prisma to database (development)
npm run db:migrate   # Create migration files (production)
npm run db:generate  # Generate Prisma Client (auto-runs after db:push)
```

**When to use**:
- `db:push` - During development after schema changes
- `db:migrate` - When you want migration history
- `db:generate` - Rarely needed (runs automatically)

### Data Seeding

```bash
npm run db:seed      # Load test data
npm run db:seed:prod # Import CSV production data
```

**What they do**:
- `db:seed` - Creates fake data for testing
- `db:seed:prod` - Imports your real inventory from CSV

---

## ✅ Code Quality Commands

### Type Checking

```bash
npm run type-check   # Check TypeScript types (no output files)
```

**When to use**: Before committing, catches type errors

### Linting

```bash
npm run lint         # Check code for errors/style issues
```

**What it checks**:
- Unused variables
- Missing dependencies in useEffect
- Using `<img>` instead of `<Image>`
- Code style violations

### Formatting

```bash
npm run format       # Auto-fix code formatting (Prettier)
npm run format:check # Check formatting without modifying
```

**When to use**:
- `format` - Before committing (makes code pretty)
- `format:check` - In CI/CD pipelines

---

## 🧪 Testing Commands

### Unit Tests (Vitest)

```bash
npm run test         # Run unit tests
npm run test:ui      # Run tests with visual UI
```

### End-to-End Tests (Playwright)

```bash
npm run test:e2e     # Run E2E tests (headless)
npm run test:e2e:ui  # Run E2E tests with UI
```

---

## 📦 NPM/Package Commands

### Installing Dependencies

```bash
npm install          # Install all dependencies from package.json
npm install <pkg>    # Add a new package
npm uninstall <pkg>  # Remove a package
```

### Viewing Packages

```bash
npm list             # Show installed packages
npm outdated         # Check for package updates
```

---

## 🔀 Git Commands

### Branch Management

```bash
git checkout main              # Switch to main branch
git checkout -b feat/name      # Create and switch to new branch
git branch                     # List all branches
git branch -d feat/name        # Delete branch
```

### Committing Changes

```bash
git status                     # See what's changed
git add .                      # Stage all changes
git add file.ts                # Stage specific file
git commit -m "message"        # Commit with message
```

### Syncing with Remote

```bash
git pull origin main           # Get latest changes
git push origin branch-name    # Push your changes
git fetch                      # Check for remote changes
```

### Undoing Changes

```bash
git checkout -- file.ts        # Discard changes to file
git reset HEAD file.ts         # Unstage file
git reset --hard HEAD          # Discard ALL uncommitted changes (⚠️ dangerous!)
```

---

## 🛠️ Helper Scripts

Custom scripts in `scripts/` directory:

```bash
npx tsx scripts/check-db.ts    # Show database summary
npx tsx scripts/analyze-csv.ts # Analyze CSV file contents
```

---

## 🔧 Utility Commands

### Port Management

```bash
npx kill-port 3000   # Kill process using port 3000
```

### Node/NPM Info

```bash
node --version       # Check Node.js version
npm --version        # Check npm version
npx --version        # Check npx version
```

### Clean Reinstall

```bash
rm -rf node_modules package-lock.json
npm install
```

**When to use**: When dependencies seem corrupted or broken

---

## 🎯 Common Workflows

### Daily Start

```bash
git pull origin main
npm install
npm run dev
```

### Before Committing

```bash
npm run type-check
npm run lint
npm run format
npm run test
git add .
git commit -m "feat(scope): description"
```

### After Schema Changes

```bash
npm run db:push
npm run db:studio  # Verify changes
```

### Fresh Database

```bash
npm run db:push
npm run db:seed:prod
npm run db:studio
```

---

## 📚 Related Documentation

- **[NPM Explained](../02-Learning/02-NPM-Explained.md)** - Deep dive into how npm works
- **[Development Workflow](../03-Development/01-Development-Workflow.md)** - Full workflow guide
- **[Quick Reference](../01-Getting-Started/02-Quick-Reference.md)** - Commands with examples

---

## 💡 Quick Tips

**Forget a command?**
- Type `npm run` to see all available scripts
- Check this file (bookmark it!)

**Command not found?**
- Ensure you're in project root directory
- Run `npm install` if node_modules is missing

**Command taking forever?**
- Ctrl+C to cancel
- Check if another instance is running

---

**Everything at your fingertips!** ⚡
