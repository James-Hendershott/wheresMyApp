# Contributing Guide 🤝

> **What This Is**: Guidelines for contributing code, documentation, and improvements to the project.  
> **Purpose**: Establish standards for code quality, commit messages, and pull requests.  
> **For**: Anyone wanting to contribute - including you, working solo!  
> **Why Have This**: Keeps the codebase consistent and professional, even for solo projects.

---

# Contributing to WheresMy App 🤝

Thank you for your interest in contributing! This document outlines our development workflow and best practices.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Branch Strategy](#branch-strategy)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)

## 🚀 Getting Started

1. **Fork the repository** (for external contributors)
2. **Clone your fork**:

   ```bash
   git clone https://github.com/your-username/wheresmy-app.git
   cd wheresmy-app
   ```

3. **Install dependencies**:

   ```bash
   pnpm install
   ```

4. **Set up environment**:

   ```bash
   cp .env.example .env
   # Edit .env with your local values
   ```

5. **Set up database**:

   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

6. **Start development server**:
   ```bash
   pnpm dev
   ```

## 🌿 Branch Strategy

We use **Git Flow** with the following branches:

### Main Branches

- **`main`** - Production-ready code. Only merge via PR after thorough testing.
- **`develop`** - Integration branch. All features merge here first.

### Supporting Branches

Create feature branches from `develop`:

```bash
git checkout develop
git pull origin develop
git checkout -b feat/your-feature-name
```

#### Branch Naming Convention

| Type     | Pattern                | Example                     |
| -------- | ---------------------- | --------------------------- |
| Feature  | `feat/description`     | `feat/qr-scanner`           |
| Bug Fix  | `fix/description`      | `fix/container-duplication` |
| Chore    | `chore/description`    | `chore/update-deps`         |
| Docs     | `docs/description`     | `docs/api-guide`            |
| Refactor | `refactor/description` | `refactor/prisma-queries`   |

### Workflow Example

```bash
# 1. Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feat/rack-grid

# 2. Make changes and commit
git add .
git commit -m "feat(rack): add SVG grid visualization"

# 3. Push to remote
git push origin feat/rack-grid

# 4. Open Pull Request to develop branch

# 5. After PR approval and merge, delete feature branch
git branch -d feat/rack-grid
git push origin --delete feat/rack-grid
```

## 📝 Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/) for automated changelogs and versioning.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring (no feature change)
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (deps, config, etc.)
- **ci**: CI/CD changes

### Scopes

Use the area of the codebase affected:

- `rack` - Rack grid system
- `container` - Container management
- `item` - Item tracking
- `qr` - QR code functionality
- `auth` - Authentication
- `db` - Database/Prisma
- `ui` - UI components
- `api` - API routes/actions
- `test` - Testing

### Examples

```bash
# Feature
feat(rack): add SVG grid with drag-and-drop

# Bug fix
fix(container): prevent duplicate slot assignment

# Documentation
docs(readme): add deployment instructions

# Chore
chore(deps): update Next.js to 14.2.0

# Multiple scopes
feat(container,qr): integrate QR scanning with container lookup

# Breaking change
feat(auth)!: migrate to Auth.js v5

BREAKING CHANGE: Auth.js v5 requires new environment variables
```

### Writing Good Commits

✅ **Do**:

- Use imperative mood ("add" not "added")
- Start with lowercase
- No period at the end
- Be specific and concise
- Reference issue numbers: `fix(item): resolve photo upload bug (#42)`

❌ **Don't**:

- "Fixed stuff"
- "WIP"
- "asdfasdf"
- Commit commented-out code

## 🔄 Pull Request Process

### Before Opening a PR

1. **Update from develop**:

   ```bash
   git checkout develop
   git pull origin develop
   git checkout your-feature-branch
   git merge develop
   ```

2. **Run all checks**:

   ```bash
   pnpm lint           # ESLint
   pnpm format:check   # Prettier
   pnpm type-check     # TypeScript
   pnpm test           # Unit tests
   pnpm build          # Production build
   ```

3. **Test manually**: Click through affected features

### PR Template

Use this template when creating a PR:

```markdown
## 🎯 Context

Brief explanation of what and why.

## 📦 Changes

- Added X feature
- Fixed Y bug
- Refactored Z component

## 🧪 Test Plan

- [ ] Unit tests pass (`pnpm test`)
- [ ] E2E tests pass (`pnpm test:e2e`)
- [ ] Manual testing completed
- [ ] Screenshots/GIF attached (for UI changes)

## 📝 Notes

- Any follow-up work needed?
- Known issues?
- Breaking changes?

Closes #42
```

### Review Process

1. **Automated checks must pass** (CI/CD pipeline)
2. **At least one approval** required
3. **Address feedback** promptly
4. **Squash and merge** to keep history clean

## 💻 Coding Standards

### TypeScript

- ✅ Use explicit types for function parameters and returns
- ✅ Avoid `any` - use `unknown` if truly unknown
- ✅ Use Zod for runtime validation
- ❌ No `@ts-ignore` without explanation

### React Components

- ✅ Use Server Components by default
- ✅ Only use `'use client'` when needed (interactivity, hooks, browser APIs)
- ✅ Extract reusable logic into hooks
- ✅ Keep components small and focused

### Commenting

Use our teaching comment style:

```tsx
// WHY: Explain the business/user reason
// WHAT: Summarize what this does
// HOW: Key implementation detail
// GOTCHA: Caveats or pitfalls
```

Example:

```tsx
// WHY: Users need to scan QR codes with their phone camera
// WHAT: Opens device camera and decodes QR codes in real-time
// HOW: Uses ZXing library for cross-browser compatibility
// GOTCHA: Requires HTTPS for camera access (except localhost)
export function QRScanner() { ... }
```

### File Organization

```
src/
├── app/              # Next.js routes
│   ├── (auth)/      # Route groups
│   └── api/         # API routes (if needed)
├── components/
│   ├── ui/          # shadcn/ui components
│   └── features/    # Feature-specific components
├── lib/             # Utilities
├── server/
│   ├── actions/     # Server Actions
│   └── auth.ts      # Auth configuration
└── test/
    ├── e2e/         # Playwright tests
    └── unit/        # Vitest tests
```

## 🧪 Testing Requirements

### Unit Tests

Write unit tests for:

- Utility functions
- Business logic
- Data transformations
- Validation schemas

```tsx
// src/lib/utils.test.ts
import { describe, it, expect } from "vitest";
import { generateCode } from "./utils";

describe("generateCode", () => {
  it("generates unique codes", () => {
    const codes = new Set([generateCode(), generateCode(), generateCode()]);
    expect(codes.size).toBe(3);
  });
});
```

### E2E Tests

Write E2E tests for:

- Critical user flows
- Multi-step processes
- Form submissions
- Navigation paths

```tsx
// src/test/e2e/container-flow.spec.ts
import { test, expect } from "@playwright/test";

test("complete container workflow", async ({ page }) => {
  await page.goto("/dashboard");

  // Create container
  await page.click("text=Add Container");
  await page.fill("[name=label]", "Test Box");
  await page.click("button[type=submit]");

  // Verify creation
  await expect(page.locator("text=Test Box")).toBeVisible();
});
```

### Test Coverage Goals

- **Critical paths**: 100%
- **Overall**: 80%+
- **New features**: 90%+

Run coverage report:

```bash
pnpm test -- --coverage
```

## 📚 Additional Resources

- [Next.js Best Practices](https://nextjs.org/docs/app/building-your-application)
- [React Best Practices](https://react.dev/learn)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

## ❓ Questions?

- **Bugs**: Open an issue with the `bug` label
- **Features**: Open an issue with the `enhancement` label
- **Questions**: Open a discussion or ask in issues

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🙏
