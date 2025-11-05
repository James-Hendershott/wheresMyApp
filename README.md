# WheresMy App 📦

> Track every storage tote, its location on real racks, and the items inside. Scan QR codes, check items in/out with photos, and never lose track of your stuff again.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🎯 What It Does

WheresMy App is a full-stack inventory management system designed for home organization. Features include:

- 📱 **QR Code Scanning**: Instantly access tote information via phone camera
- 🗺️ **Visual Rack Maps**: Interactive SVG grids showing container locations
- 📦 **Item Tracking**: Check items in/out with photo uploads, quick-move dropdown for instant relocations
- 🏷️ **Category System**: 35+ item categories with 30+ subcategories for precise organization
- 📊 **Movement History**: Complete audit trail of all movements with user attribution
- 🔐 **Secure Auth**: Email magic links or Google OAuth with user role management
- 📴 **Offline Ready**: PWA with offline capabilities
- 📥 **CSV Import**: Import existing inventory from Google Forms/spreadsheets with automatic category mapping
- 🎨 **Modern UI**: Icon-only buttons with tooltips, visual rack grid selector, compact card layouts

### UI Highlights

- **Icon-Only Buttons with Tooltips**: Reduced UI crowding on container cards with hover-to-reveal button labels
- **Visual Rack Grid Selector**: Click-to-assign interface for intuitive container slot assignment (replaces dropdown)
- **Color-Coded Slots**: White=available, Gray=occupied, Blue=current location for instant visual feedback
- **Separated Concerns**: Edit dialog handles name/description only; Assign to Rack button handles location
- **Size-Specific Container Codes**: TOTE27 for 27-gallon totes, CASE for suitcases (based on HDX standards)
- **Responsive Layouts**: 1-4 column grids adapt to screen size for optimal viewing on any device

### Network Access

Test on phones, tablets, and other computers on your network:
```bash
npm run dev:network
```
Access from other devices at `http://YOUR-IP:3000` (e.g., http://192.168.1.59:3000)

## 🛠️ Tech Stack

This project showcases a modern, production-ready stack:

| Category    | Technology                              |
| ----------- | --------------------------------------- |
| **App**     | Next.js 14 (App Router) + TypeScript    |
| **UI**      | Tailwind CSS + shadcn/ui + Lucide Icons |
| **Data**    | PostgreSQL + Prisma ORM                 |
| **Auth**    | Auth.js (NextAuth v5)                   |
| **Forms**   | React Hook Form + Zod validation        |
| **QR**      | ZXing (scan) + qrcode (generate)        |
| **Storage** | S3-compatible (MinIO/R2)                |
| **PWA**     | next-pwa (installable app)              |
| **Tests**   | Vitest (unit) + Playwright (e2e)        |
| **CI/CD**   | GitHub Actions                          |
| **Deploy**  | Render/Vercel + Neon/Railway            |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL 15+
- (Optional) MinIO for local S3 storage

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/James-Hendershott/wheresMyApp.git
   cd wheresMyApp
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env`:
   - macOS/Linux:
     ```bash
     cp .env.example .env
     ```
   - Windows PowerShell:
     ```powershell
     Copy-Item .env.example .env
     ```

   Edit `.env` with your values:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `AUTH_SECRET`: Generate with `openssl rand -base64 32`
   - S3 credentials if using MinIO/R2

4. **Initialize the database**

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open** [http://localhost:3000](http://localhost:3000)

### Seeding from the CSV (what it imports)

The production seed script reads the real intake CSV at `Obsidian_Notes/files/Tote Inventory Intake Form (Responses) - Form Responses 1 (1).csv` and imports:

- **Locations** from "Tote Location" column (creates unique locations)
- **Containers** from "Tote Number" + "Tote Description" (stable QR code generated)
- **Items** from "Item Name", quantity from "QTY", notes from "Notes"
- **Categories**: Automatically maps old categories (e.g., "Books", "Camping & Outdoors") to new ItemCategory + ItemSubcategory enums
- **Item Photos** from "Item Photo" URLs (if provided)
- **Metadata**: Condition/Status, ISBN numbers, expiration dates

The script is **idempotent**: you can re-run `npm run db:seed:prod` without duplicating data.

**Category Mapping**: The seed script includes intelligent mapping from the original CSV categories to the expanded 35+ category system. See `scripts/migrate-categories.ts` for the full mapping table.

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
npm run test

# Run unit tests with UI
npm run test:ui

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
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

See `Obsidian_Notes/docs/wheresMyApp.md` for current self-hosting notes. A dedicated Unraid Docker Compose guide will be added in the repo soon.

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

Additional notes and deeper dives live in the Obsidian vault:

- `Obsidian_Notes/02-Learning/01-Complete-Learning-Guide.md`
- `Obsidian_Notes/02-Learning/02-NPM-Explained.md`

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit changes (`git commit -m 'feat(scope): add amazing feature'`)
4. Push to branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT © James Hendershott

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com) for beautiful components
- [Prisma](https://prisma.io) for the excellent ORM
- [Vercel](https://vercel.com) for Next.js and hosting
- The open-source community

---

**Built with ❤️ as a portfolio project showcasing modern full-stack development**
