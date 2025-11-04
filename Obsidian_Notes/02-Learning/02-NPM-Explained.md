# NPM Explained - The Complete Guide 📦

> **What This Is**: Beginner-friendly explanation of npm (Node Package Manager) and how it works.  
> **Purpose**: Demystify `npm run` commands, package.json, and node_modules for absolute beginners.  
> **For**: Anyone confused by npm commands or wanting to understand what's happening under the hood.  
> **Key Topics**: What npm does, how `npm run` works, package.json explained, common issues.

---

# NPM Explained - The Complete Guide 📦

> **npm = Node Package Manager** - Your project's command center and library manager

## What is npm?

Think of npm like the **App Store for JavaScript developers**. It does three main things:

### 1. **Downloads Libraries** (Like Installing Apps)

```bash
npm install prisma
# Downloads Prisma from the internet and adds it to node_modules/
```

Just like:
- App Store downloads apps to your phone
- Steam downloads games to your PC
- npm downloads libraries to your project

### 2. **Runs Commands** (Like Shortcuts)

```bash
npm run dev
# Executes the command defined in package.json under "dev"
```

Think of it like:
- Desktop shortcuts on Windows
- Aliases in your terminal
- Quick actions on your phone

### 3. **Manages Dependencies** (Like System Requirements)

```bash
npm install
# Reads package.json and installs ALL required libraries
```

Like when:
- A game requires DirectX 12
- A program needs .NET Framework
- npm ensures all your libraries are present

---

## The Three Core Files

### 1. **package.json** - The Recipe Book 📖

This file lists:
- What your project is called
- What libraries it needs
- What commands you can run

```json
{
  "name": "wheresmy-app",
  "scripts": {
    "dev": "next dev",           // ← These are your shortcuts!
    "lint": "next lint",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "prisma": "^5.20.0",        // ← Libraries your app needs
    "next": "^14.2.13"
  }
}
```

**Analogy**: Like a recipe that says "You need flour, eggs, and a mixer. Here's how to make it."

---

### 2. **package-lock.json** - The Detailed Receipt 🧾

This file locks EXACT versions:
- Ensures everyone gets the same versions
- Prevents "works on my machine" problems
- Auto-generated, don't edit manually

```json
{
  "prisma": {
    "version": "5.20.0",           // Exact version
    "resolved": "https://...",      // Where it came from
    "integrity": "sha512-..."       // Security checksum
  }
}
```

**Analogy**: Like a detailed store receipt with SKU numbers and barcodes.

---

### 3. **node_modules/** - The Warehouse 📦

This folder contains:
- All downloaded libraries
- Their dependencies (libraries they need)
- Can be HUGE (hundreds of MBs)
- Can be deleted and regenerated

```
node_modules/
├── prisma/           ← The Prisma library
├── next/             ← Next.js framework
├── react/            ← React library
└── ...thousands more
```

**Analogy**: Like the Program Files folder on Windows - where installed software lives.

**Why it's so big**: Libraries depend on other libraries!
```
prisma needs → @prisma/client
             → @prisma/engines
             → typescript
             → ...50 more libraries
```

---

## How `npm run` Works

When you type `npm run dev`:

```
┌─────────────────────────────────────────────┐
│ 1. You type: npm run dev                    │
├─────────────────────────────────────────────┤
│ 2. npm reads package.json                   │
│    Finds: "dev": "next dev"                 │
├─────────────────────────────────────────────┤
│ 3. npm executes: next dev                   │
│    (Uses the 'next' command from            │
│     node_modules/.bin/next)                 │
├─────────────────────────────────────────────┤
│ 4. Next.js starts development server        │
│    Output: "Ready on http://localhost:3000" │
└─────────────────────────────────────────────┘
```

### Behind the Scenes

Every library you install can provide **commands**:

```bash
npm install prisma
# Installs Prisma AND adds these commands:
# - prisma generate
# - prisma db push
# - prisma studio
```

These commands are stored in `node_modules/.bin/` and npm knows how to find them!

---

## Common Commands Explained

### Project Setup Commands

```bash
npm install
# - Reads package.json
# - Downloads all dependencies to node_modules/
# - Creates package-lock.json (if missing)
# 
# When to use: After cloning a project, or when package.json changes
```

```bash
npm install <package-name>
# - Downloads a specific library
# - Adds it to package.json dependencies
# - Updates package-lock.json
#
# Example: npm install qrcode
# When to use: Adding a new library to your project
```

### Development Commands

```bash
npm run dev
# Actually runs: next dev
# What it does:
# - Starts Next.js development server
# - Watches for file changes
# - Auto-reloads when you save
# - Available at http://localhost:3000
#
# When to use: While coding
```

```bash
npm run build
# Actually runs: next build
# What it does:
# - Compiles TypeScript to JavaScript
# - Optimizes code for production
# - Creates .next/static/ folder
# - Checks for errors
#
# When to use: Before deploying
```

```bash
npm run start
# Actually runs: next start
# What it does:
# - Runs the production build (from npm run build)
# - No auto-reload
# - Faster than dev mode
#
# When to use: Testing production build locally
```

### Code Quality Commands

```bash
npm run lint
# Actually runs: next lint
# What it does:
# - Runs ESLint (code checker)
# - Finds bugs, unused variables, style issues
# - Shows warnings and errors
# - Does NOT modify files
#
# When to use: Before committing code
```

```bash
npm run format
# Actually runs: prettier --write .
# What it does:
# - Runs Prettier (code formatter)
# - Auto-fixes spacing, indentation, quotes
# - Modifies files in place
# - Makes code pretty and consistent
#
# When to use: After writing messy code
```

```bash
npm run type-check
# Actually runs: tsc --noEmit
# What it does:
# - Runs TypeScript compiler
# - Checks types but doesn't output files
# - Catches type errors
#
# When to use: Before committing, in CI/CD
```

### Database Commands

```bash
npm run db:push
# Actually runs: prisma db push
# What it does:
# - Reads prisma/schema.prisma
# - Updates PostgreSQL database to match
# - Generates Prisma Client
# - No migration files created
#
# When to use: During development, after schema changes
```

```bash
npm run db:migrate
# Actually runs: prisma migrate dev
# What it does:
# - Creates migration files (SQL scripts)
# - Applies migrations to database
# - Generates Prisma Client
# - Tracks database history
#
# When to use: Production, when you need migration history
```

```bash
npm run db:seed
# Actually runs: tsx prisma/seed.ts
# What it does:
# - Runs the seed.ts script
# - Populates database with test data
# - Can be run multiple times
#
# When to use: Setting up dev environment
```

```bash
npm run db:seed:prod
# Actually runs: tsx prisma/seed-production.ts
# What it does:
# - Runs seed-production.ts script
# - Imports CSV data (your real inventory)
# - Clears old data first
# - Creates containers and items
#
# When to use: Loading your actual inventory
```

```bash
npm run db:studio
# Actually runs: prisma studio
# What it does:
# - Starts Prisma Studio web UI
# - Opens http://localhost:5555
# - Visual database browser
# - Edit data directly
#
# When to use: Viewing/editing database
```

### Testing Commands

```bash
npm run test
# Actually runs: vitest
# What it does:
# - Runs unit tests
# - Tests individual functions
# - Fast and focused
#
# When to use: Testing business logic
```

```bash
npm run test:e2e
# Actually runs: playwright test
# What it does:
# - Runs end-to-end tests
# - Opens browser, clicks buttons
# - Tests full user flows
#
# When to use: Testing user interactions
```

---

## The Workflow

Here's a typical day of development:

```bash
# 1. Start your day
npm install              # Get latest dependencies (if package.json changed)

# 2. Start developing
npm run dev              # Start development server

# 3. Make changes to code
# ... edit files in VS Code ...

# 4. Check your work
npm run lint             # Check for errors
npm run type-check       # Check TypeScript
npm run format           # Make code pretty

# 5. Update database (if schema changed)
npm run db:push          # Sync schema to database
npm run db:studio        # View changes visually

# 6. Commit to Git
git add .
git commit -m "feat: add new feature"
git push
```

---

## Why "npm run" vs just "npm"?

Some commands don't need `run`:

```bash
npm install          # ✅ Built-in npm command
npm uninstall        # ✅ Built-in npm command
npm version          # ✅ Built-in npm command

npm dev              # ❌ WRONG - npm doesn't know "dev"
npm run dev          # ✅ CORRECT - reads from package.json scripts
```

**Rule of thumb**:
- ✅ `npm <built-in-command>` for npm's own commands
- ✅ `npm run <script-name>` for commands in package.json

---

## Package.json Scripts Breakdown

Let's look at YOUR package.json scripts:

```json
{
  "scripts": {
    // Development
    "dev": "next dev",                           // Start dev server
    "build": "next build",                       // Build for production
    "start": "next start",                       // Run production build
    
    // Code Quality
    "lint": "next lint",                         // Check code
    "format": "prettier --write .",              // Format code
    "format:check": "prettier --check .",        // Check formatting
    "type-check": "tsc --noEmit",               // Check types
    
    // Testing
    "test": "vitest",                            // Unit tests
    "test:ui": "vitest --ui",                    // Unit tests with UI
    "test:e2e": "playwright test",               // E2E tests
    "test:e2e:ui": "playwright test --ui",       // E2E with UI
    
    // Database
    "db:generate": "prisma generate",            // Generate Prisma Client
    "db:push": "prisma db push",                 // Sync schema to DB
    "db:migrate": "prisma migrate dev",          // Create migration
    "db:migrate:deploy": "prisma migrate deploy", // Apply migrations
    "db:seed": "tsx prisma/seed.ts",            // Seed test data
    "db:seed:prod": "tsx prisma/seed-production.ts", // Seed CSV data
    "db:studio": "prisma studio",                // Open DB UI
    
    // Automatic
    "postinstall": "prisma generate"             // Runs after npm install
  }
}
```

### Special Script Names

npm recognizes certain script names:

```json
{
  "scripts": {
    "predev": "echo 'Before dev'",      // Runs BEFORE "dev"
    "dev": "next dev",                  // Main command
    "postdev": "echo 'After dev'",      // Runs AFTER "dev"
    
    "postinstall": "prisma generate"    // Runs automatically after npm install
  }
}
```

---

## npm vs npx vs pnpm vs yarn

You might see these in tutorials:

### npm
```bash
npm install package-name
npm run dev
```
- Standard, comes with Node.js
- What we're using

### npx
```bash
npx prisma studio
```
- Runs commands without installing globally
- Good for one-off commands

### pnpm
```bash
pnpm install
pnpm run dev
```
- Faster than npm
- Saves disk space (shared packages)
- Alternative package manager

### yarn
```bash
yarn install
yarn dev
```
- Created by Facebook
- Alternative package manager
- Similar to npm

**For our project**: Stick with `npm` - it's the standard and what we've configured.

---

## Common Issues & Solutions

### Issue: "Command not found"

```bash
$ npm run dev
npm: command not found
```

**Solution**: Node.js isn't installed
```bash
# Check if Node.js is installed
node --version

# If not, download from nodejs.org
```

---

### Issue: "Cannot find module"

```bash
Error: Cannot find module 'next'
```

**Solution**: Dependencies not installed
```bash
npm install
```

---

### Issue: "node_modules is huge!"

```bash
node_modules/  # 500 MB!
```

**Solution**: This is normal!
- Can safely delete and regenerate
- Add to .gitignore (already done)
- Don't commit to Git

```bash
rm -rf node_modules
npm install  # Regenerates it
```

---

### Issue: "Package version conflicts"

```bash
npm ERR! Could not resolve dependency
```

**Solution**: Delete lock file and reinstall
```bash
rm package-lock.json
rm -rf node_modules
npm install
```

---

## Quick Reference Card

```bash
# Getting Started
npm install                    # Install all dependencies

# Development
npm run dev                    # Start dev server
npm run db:studio              # View database

# Code Quality (before committing)
npm run lint                   # Check for errors
npm run format                 # Fix formatting
npm run type-check             # Check types

# Database
npm run db:push                # Update database schema
npm run db:seed:prod           # Import CSV data

# Testing
npm run test                   # Run unit tests
npm run build                  # Test production build

# Production
npm run build                  # Build for production
npm run start                  # Run production server
```

---

## Mental Model

```
┌────────────────────────────────────────┐
│         YOUR PROJECT                   │
├────────────────────────────────────────┤
│                                        │
│  package.json ─┐                      │
│                │ Defines what you need │
│                ↓                       │
│  npm install   ─┐                     │
│                │ Downloads libraries  │
│                ↓                       │
│  node_modules/ ─┐                     │
│                │ Stores libraries     │
│                ↓                       │
│  Your Code     ─┐                     │
│                │ Uses libraries       │
│                ↓                       │
│  npm run dev   ─→ WORKING APP! 🎉    │
│                                        │
└────────────────────────────────────────┘
```

---

## Real-World Analogy

**Building a House**:

```
package.json      = Blueprint (lists what you need)
npm install       = Ordering materials (lumber, nails, etc.)
node_modules/     = Materials storage on-site
npm run build     = Constructing the house
npm run start     = Moving into the house
npm run dev       = Building with ability to make changes
npm run lint      = Building inspector checking work
```

---

## Next Steps

1. **Explore your package.json**
   - Open it in VS Code
   - Read each script
   - Try running them!

2. **Experiment safely**
   - Delete node_modules/ → run `npm install`
   - See it rebuild!

3. **Add a custom script**
   - Add `"hello": "echo 'Hello World!'"`
   - Run `npm run hello`
   - See your custom command work!

---

**Questions? Just ask!** 🚀
