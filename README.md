# WheresMy App 📦

> Track every storage tote, its location on real racks, and the items inside. Scan QR codes, check items in/out with photos, and never lose track of your stuff again.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🎯 What It Does

WheresMy App is a full-stack inventory management system designed for home organization. Features include:

- 📱 **QR Code Scanning**: Instantly access tote information via phone camera
- 🗺️ **Visual Rack Maps**: Interactive SVG grids showing container locations
- 📦 **Item Tracking**: Check items in/out with photo uploads
- 📊 **Movement History**: Complete audit trail of all movements
- 🔐 **Secure Auth**: Email magic links or Google OAuth
- 📴 **Offline Ready**: PWA with offline capabilities

## 🛠️ Tech Stack

This project showcases a modern, production-ready stack:

| Category | Technology |
|----------|-----------|
| **App** | Next.js 14 (App Router) + TypeScript |
| **UI** | Tailwind CSS + shadcn/ui + Lucide Icons |
| **Data** | PostgreSQL + Prisma ORM |
| **Auth** | Auth.js (NextAuth v5) |
| **Forms** | React Hook Form + Zod validation |
| **QR** | ZXing (scan) + qrcode (generate) |
| **Storage** | S3-compatible (MinIO/R2) |
| **PWA** | next-pwa (installable app) |
| **Tests** | Vitest (unit) + Playwright (e2e) |
| **CI/CD** | GitHub Actions |
| **Deploy** | Render/Vercel + Neon/Railway |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm 8+
- PostgreSQL 15+
- (Optional) MinIO for local S3 storage

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/wheresmy-app.git
   cd wheresmy-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your values:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `AUTH_SECRET`: Generate with `openssl rand -base64 32`
   - S3 credentials if using MinIO/R2

4. **Initialize the database**
   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open** [http://localhost:3000](http://localhost:3000)

### Seeding from the CSV (what it imports)

The seed script reads the real intake CSV at `Obsidian_Notes/files/Tote Inventory Intake Form (Responses) - Form Responses 1.csv` and imports:

- Locations from “Tote Location”
- Containers from “Tote Number” + “Tote Description” (stable code generated for QR)
- Items from “Item Name”, quantity from “QTY”, tags from Category/Condition/ISBN
- Item photos from “Item Photo” URLs

It’s idempotent: you can re-run `pnpm db:seed` without duplicating data.

Example `.env` for Postgres on a LAN host:

```
DATABASE_URL="postgresql://postgres:postgres@192.168.1.153:5433/wheresMyApp?schema=public"
```

## 📂 Project Structure

```
wheresmy-app/
├── .github/workflows/    # CI/CD pipelines
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── migrations/       # Database migrations
│   └── seed.ts          # Seed data
├── public/              # Static assets
├── src/
│   ├── app/            # Next.js App Router pages
│   ├── components/     # React components
│   │   └── ui/        # shadcn/ui components
│   ├── lib/           # Utilities and helpers
│   ├── server/        # Server-side code (actions, auth)
│   └── test/          # Tests (unit + e2e)
├── .env.example       # Environment template
├── next.config.js     # Next.js configuration
└── package.json       # Dependencies
```

## 🧪 Testing

```bash
# Run unit tests
pnpm test

# Run unit tests with UI
pnpm test:ui

# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Type checking
pnpm type-check

# Linting
pnpm lint

# Format code
pnpm format
```

## 📖 Key Features

### 1. Rack Grid Management

Visual SVG-based grid system for physical storage locations:
- Click empty cells to place containers
- Click occupied cells to view/move containers
- Drag-and-drop support (coming soon)

### 2. QR Code System

Every container gets a unique QR code:
- Scan with `/scan` route using device camera
- Deep links to `/c/[code]` for instant access
- Print labels in Avery 5160 or 2×2 formats

### 3. Item Management

Track individual items within containers:
- Photo uploads to S3-compatible storage
- Check-in/check-out workflows
- Tag-based categorization
- Full history of movements

### 4. Progressive Web App

Installable on mobile devices:
- Add to home screen
- Offline caching of critical pages
- Camera access for QR scanning
- Native-like experience

## 🔧 Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch
- `feat/*` - New features
- `fix/*` - Bug fixes
- `chore/*` - Maintenance tasks

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(rack): add SVG grid visualization
fix(container): prevent double-occupancy on move
chore(ci): add Playwright e2e to workflow
docs(readme): add printing instructions
```

### Pull Request Checklist

- [ ] Tests pass (`pnpm test` + `pnpm test:e2e`)
- [ ] Types check (`pnpm type-check`)
- [ ] Code linted (`pnpm lint`)
- [ ] Code formatted (`pnpm format`)
- [ ] README updated if needed
- [ ] Screenshots/GIF attached for UI changes

## 🚢 Deployment

### Option 1: Vercel + Neon (Easiest)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set up [Neon](https://neon.tech) PostgreSQL
4. Add environment variables
5. Deploy!

### Option 2: Render + Railway

1. Create app on [Render](https://render.com)
2. Set up [Railway](https://railway.app) PostgreSQL
3. Configure environment variables
4. Deploy from GitHub

### Option 3: Unraid (Self-Hosted)

See `docs/unraid-deployment.md` for Docker Compose setup with MinIO.

## 📊 Database Schema

Core models:

- **User**: Authentication and authorization
- **Location**: Physical spaces (Garage, Basement, etc.)
- **Rack**: Storage structures with row/col grids
- **Slot**: Individual positions on a rack
- **Container**: Totes/boxes with QR codes
- **Item**: Individual items within containers
- **ItemPhoto**: S3 URLs for item images
- **Movement**: Audit trail of all changes

See `prisma/schema.prisma` for complete schema.

## 🎓 Learning Resources

Check out `learn.md` for detailed tutorials on:
- Next.js App Router patterns
- Server Actions with Zod
- Prisma ORM best practices
- Auth.js (NextAuth v5) setup
- S3 presigned uploads
- PWA configuration
- Testing strategies

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit changes (`git commit -m 'feat(scope): add amazing feature'`)
4. Push to branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT © [Your Name]

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com) for beautiful components
- [Prisma](https://prisma.io) for the excellent ORM
- [Vercel](https://vercel.com) for Next.js and hosting
- The open-source community

---

**Built with ❤️ as a portfolio project showcasing modern full-stack development**
