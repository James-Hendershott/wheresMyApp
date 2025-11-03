# Learning Guide: Building WheresMy App 🎓

> A comprehensive guide to understanding the modern full-stack technologies used in WheresMy App

## Table of Contents

1. [**Beginner Essentials**](#beginner-essentials) ⭐ NEW!
   - [What is Prisma?](#what-is-prisma)
   - [What is PostgreSQL?](#what-is-postgresql)
   - [How to View Your Database](#how-to-view-your-database)
   - [What is Linting?](#what-is-linting)
   - [Understanding npm Commands](#understanding-npm-commands)
2. [Next.js App Router](#nextjs-app-router)
3. [TypeScript Fundamentals](#typescript-fundamentals)
4. [Tailwind CSS & shadcn/ui](#tailwind-css--shadcnui)
5. [Prisma ORM (Advanced)](#prisma-orm-advanced)
6. [Auth.js (NextAuth v5)](#authjs-nextauth-v5)
7. [Server Actions & Zod](#server-actions--zod)
8. [React Hook Form](#react-hook-form)
9. [S3 & File Uploads](#s3--file-uploads)
10. [QR Code Generation & Scanning](#qr-code-generation--scanning)
11. [Progressive Web Apps (PWA)](#progressive-web-apps-pwa)
12. [Testing Strategies](#testing-strategies)

---

## Beginner Essentials

### What is Prisma?

**Prisma** is like a **translator** between your JavaScript/TypeScript code and your database.

#### The Problem It Solves

Without Prisma, talking to a database looks like this:

```javascript
// Raw SQL - error-prone, no autocomplete, hard to maintain
const result = await db.query('SELECT * FROM containers WHERE id = $1', [id]);
// What fields does result have? Who knows! 🤷
```

With Prisma:

```typescript
// Type-safe, autocomplete works, catches errors at compile time
const container = await prisma.container.findUnique({
  where: { id: id },
  include: { items: true }
});
// container. ← Your editor shows all available fields! ✨
```

#### Key Benefits

1. **Type Safety**: Knows what your database looks like
2. **Autocomplete**: Your editor suggests fields, catches typos
3. **Relationships**: Easily load related data (containers + items)
4. **Migrations**: Tracks database changes over time

#### The Three Parts of Prisma

```
┌─────────────────────────────────────────────┐
│ 1. SCHEMA (prisma/schema.prisma)            │
│    - Defines your database structure        │
│    - Written in Prisma's DSL               │
├─────────────────────────────────────────────┤
│ 2. PRISMA CLIENT (@prisma/client)          │
│    - Auto-generated TypeScript code        │
│    - Your app uses this to query DB        │
├─────────────────────────────────────────────┤
│ 3. PRISMA CLI (prisma)                     │
│    - Commands to migrate, seed, etc.       │
│    - npm run db:push, db:studio            │
└─────────────────────────────────────────────┘
```

#### Example: The Container Model

In `prisma/schema.prisma`:

```prisma
model Container {
  id          String   @id @default(cuid())  // Unique ID
  code        String   @unique               // Like "BIN-01"
  label       String                         // Like "Holiday Decor"
  description String?                        // Optional field
  items       Item[]                         // Has many items
  createdAt   DateTime @default(now())
}
```

This generates TypeScript code you can use:

```typescript
// Create
const box = await prisma.container.create({
  data: {
    code: 'BIN-01',
    label: 'Holiday Decor'
  }
});

// Read
const boxes = await prisma.container.findMany({
  where: { code: { startsWith: 'BIN' } },
  include: { items: true } // Include related items
});

// Update
await prisma.container.update({
  where: { id: box.id },
  data: { label: 'Updated Label' }
});

// Delete
await prisma.container.delete({
  where: { id: box.id }
});
```

---

### What is PostgreSQL?

**PostgreSQL** (often called "Postgres") is a **database** - a program that stores your data in organized tables.

#### Think of it Like Excel, But Way More Powerful

```
Excel Spreadsheet          PostgreSQL Database
─────────────────         ───────────────────
📊 Workbook               🗄️  Database (wheresMyApp)
   ├─ Sheet 1                ├─ Table: containers
   ├─ Sheet 2                ├─ Table: items
   └─ Sheet 3                └─ Table: item_photos
```

#### Why PostgreSQL Instead of MongoDB or MariaDB?

You asked about this early on! Here's why we chose Postgres:

| Feature | PostgreSQL | MongoDB | MariaDB |
|---------|-----------|---------|---------|
| **Data Structure** | Tables with relationships | JSON documents | Tables |
| **Best For** | Complex relationships (containers → items → photos) | Flexible schemas | MySQL compatibility |
| **Type Safety** | Strong types | Flexible types | Strong types |
| **Prisma Support** | Excellent | Good | Good |
| **Learning Curve** | Medium | Easy | Medium |

**For this app**, PostgreSQL wins because:
- ✅ Containers have items (relationships)
- ✅ Items have photos (more relationships)
- ✅ We need transactions (move item + update slot atomically)
- ✅ Prisma works best with SQL databases

#### Your Postgres Setup

You're running Postgres on your **Unraid server** at:
```
Host: 192.168.1.153
Port: 5433
Database: wheresMyApp
Username: postgres
Password: postgres
```

This is great for learning! In production, you'd use a service like:
- [Neon](https://neon.tech) - Serverless Postgres
- [Railway](https://railway.app) - Postgres hosting
- [Supabase](https://supabase.com) - Postgres + APIs

---

### How to View Your Database

You have **three ways** to look at your database tables:

#### Option 1: Prisma Studio (Easiest!) ⭐

```bash
npm run db:studio
```

This opens a **web UI** at `http://localhost:5555` where you can:
- ✅ Browse all tables visually
- ✅ Edit data directly (like Excel)
- ✅ See relationships (click to jump to related items)
- ✅ Filter and search

**Best for**: Quickly viewing/editing data during development

#### Option 2: Command Line (SQL Queries)

Connect directly to Postgres:

```bash
# Install psql (PostgreSQL client)
# On Windows with Chocolatey:
choco install postgresql

# Connect to your database
psql -h 192.168.1.153 -p 5433 -U postgres -d wheresMyApp

# Then run SQL commands:
\dt              # List all tables
\d containers    # Describe containers table
SELECT * FROM containers LIMIT 5;  # View first 5 rows
```

**Best for**: Advanced users, scripting, debugging

#### Option 3: Database GUI Tools

Install a visual database client:

- **[DBeaver](https://dbeaver.io/)** (Free, powerful, multi-database)
- **[TablePlus](https://tableplus.com/)** (Beautiful UI, paid)
- **[pgAdmin](https://www.pgadmin.org/)** (Official Postgres tool)

Setup example for DBeaver:
1. Download and install
2. New Connection → PostgreSQL
3. Enter: `192.168.1.153:5433`, database `wheresMyApp`, user `postgres`
4. Test connection
5. Browse tables visually!

**Best for**: Deep dives, complex queries, production databases

#### Understanding Database Tables

When you open Prisma Studio, you'll see tables like:

```
containers
├─ id: "clxy12345..."        (unique identifier)
├─ type: "Bin"               (type of container)
├─ code: "BIN-01"            (for QR codes)
├─ label: "Bin #01"          (human name)
├─ description: "Utensil Bin"
├─ locationName: "Kitchen"
└─ createdAt: 2025-11-03...

items
├─ id: "clxy67890..."
├─ name: "Utensil Box"
├─ category: "CAMPING_OUTDOORS"
├─ condition: "UNOPENED"
├─ quantity: 6
├─ containerId: "clxy12345..." ← Links to container!
└─ createdAt: 2025-08-23...
```

**The magic**: When you query a container, Prisma can automatically fetch its items because of the relationship!

---

### What is Linting?

**Linting** is like having a **grammar checker** for your code.

#### What `npm run lint` Does

When you run this command, it:

1. **Checks for mistakes**:
   ```typescript
   // ❌ Lint error: Variable 'x' is never used
   const x = 5;
   
   // ❌ Lint error: Using 'any' defeats type safety
   function process(data: any) { ... }
   ```

2. **Enforces style rules**:
   ```typescript
   // ❌ Lint error: Prefer const over let
   let name = "James";
   
   // ✅ Lint passes
   const name = "James";
   ```

3. **Catches React mistakes**:
   ```typescript
   // ❌ Lint error: useEffect missing dependency
   useEffect(() => {
     console.log(count);
   }, []); // Should include [count]
   ```

4. **Next.js specific issues**:
   ```typescript
   // ⚠️ Warning: Use next/image instead of img
   <img src="/photo.jpg" alt="Item" />
   
   // ✅ Better performance
   <Image src="/photo.jpg" alt="Item" width={500} height={500} />
   ```

#### Why Linting Matters

Think of it like this:

```
Code Without Linting        Code With Linting
────────────────────       ─────────────────
❌ Runtime errors           ✅ Catches errors early
❌ Inconsistent style       ✅ Consistent codebase
❌ Typos slip through       ✅ Autocomplete helps
❌ Hard to collaborate      ✅ Team follows same rules
```

#### Our Linting Setup

We use **ESLint** with these configurations:

```json
// .eslintrc.json
{
  "extends": "next/core-web-vitals",  // Next.js best practices
  "plugins": ["@typescript-eslint"],   // TypeScript rules
  "rules": {
    "@typescript-eslint/no-unused-vars": "warn",  // Warn about unused variables
    "@typescript-eslint/no-explicit-any": "warn", // Warn about 'any' types
    "react/no-unescaped-entities": "off"         // Allow quotes in JSX
  }
}
```

#### Linting vs Formatting

People often confuse these:

| Tool | Purpose | Example |
|------|---------|---------|
| **ESLint** (Linting) | Finds bugs, enforces patterns | "This variable is never used" |
| **Prettier** (Formatting) | Makes code pretty | "Add space after comma" |

```bash
npm run lint     # Check for bugs/mistakes (ESLint)
npm run format   # Auto-fix spacing/formatting (Prettier)
```

#### Common Lint Warnings You'll See

1. **Unused Variables**
   ```typescript
   // ⚠️ Warning
   const result = await fetch('/api/data');
   // Fix: Remove it or use it
   ```

2. **Missing Dependencies in useEffect**
   ```typescript
   // ⚠️ Warning
   useEffect(() => {
     fetchData(id);  // 'id' should be in dependency array
   }, []);
   
   // ✅ Fixed
   useEffect(() => {
     fetchData(id);
   }, [id]);
   ```

3. **Using <img> Instead of <Image>**
   ```typescript
   // ⚠️ Warning (acceptable for QR codes though!)
   <img src={qrCode} alt="QR" />
   
   // ✅ For regular images
   <Image src="/photo.jpg" alt="Item" width={400} height={300} />
   ```

---

### Understanding npm Commands

You've been running commands like `npm run lint` - let's demystify these!

#### What is npm?

**npm** = **N**ode **P**ackage **M**anager

It's a tool that:
1. Installs libraries (like `prisma`, `react`, etc.)
2. Runs scripts defined in `package.json`
3. Manages dependencies

#### package.json: Your Command Center

Open `package.json` and look at the `"scripts"` section:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "next lint",
    "db:push": "prisma db push",
    "db:seed:prod": "tsx prisma/seed-production.ts"
  }
}
```

When you run `npm run lint`, it executes `next lint`.

#### Common Commands Explained

| Command | What It Does | When to Use It |
|---------|-------------|----------------|
| `npm run dev` | Starts development server | While coding (auto-reloads on changes) |
| `npm run build` | Creates production build | Before deploying to production |
| `npm run start` | Runs production build | After building, to test production version |
| `npm run lint` | Checks code for errors | Before committing code |
| `npm run format` | Auto-fixes formatting | To make code pretty |
| `npm run type-check` | Checks TypeScript types | To catch type errors |
| `npm run db:push` | Updates database schema | After changing `schema.prisma` |
| `npm run db:seed` | Fills database with test data | To get sample data |
| `npm run db:seed:prod` | Imports your CSV data | To load real inventory |
| `npm run db:studio` | Opens database UI | To view/edit database |

#### The Workflow

```
1. Edit code → 2. npm run lint → 3. npm run type-check → 4. Commit ✅
```

#### npm vs pnpm vs yarn

You might see these in tutorials:

```bash
npm install package-name    # Standard npm
pnpm install package-name   # Faster, saves disk space
yarn add package-name       # Alternative by Facebook
```

They all do the same thing! We use **npm** because it comes with Node.js.

---

---

## Next.js App Router

### What is it?

Next.js 14's App Router is a new paradigm for building React applications with:
- File-system based routing
- Server Components by default
- Streaming and Suspense
- Built-in layouts and templates

### Key Concepts

#### 1. File-Based Routing

```
src/app/
├── page.tsx              → /
├── about/page.tsx        → /about
├── dashboard/
│   ├── layout.tsx        → Layout for /dashboard/*
│   └── page.tsx          → /dashboard
└── containers/[id]/
    └── page.tsx          → /containers/:id (dynamic)
```

#### 2. Server vs Client Components

**Server Components** (default):
```tsx
// src/app/page.tsx
// WHY: Runs on server, reduces bundle size, can access DB directly
export default async function HomePage() {
  const items = await prisma.item.findMany();
  return <div>{items.map(...)}</div>;
}
```

**Client Components** (when needed):
```tsx
'use client'
// WHY: Needs interactivity, browser APIs, or React hooks
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

#### 3. Layouts

Layouts wrap multiple pages and persist across navigation:

```tsx
// src/app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav>...</nav>
        {children}
        <footer>...</footer>
      </body>
    </html>
  );
}
```

#### 4. Loading & Error States

```tsx
// src/app/loading.tsx - Automatic loading UI
export default function Loading() {
  return <div>Loading...</div>;
}

// src/app/error.tsx - Error boundaries
'use client'
export default function Error({ error, reset }: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Best Practices

1. ✅ Use Server Components by default
2. ✅ Only mark components `'use client'` when needed
3. ✅ Fetch data at the component level (no prop drilling)
4. ✅ Use `loading.tsx` for Suspense boundaries
5. ✅ Leverage parallel routes for complex UIs

---

## TypeScript Fundamentals

### Why TypeScript?

- **Catch errors early**: Type errors at compile time, not runtime
- **Better DX**: Autocomplete, refactoring, documentation
- **Safer refactoring**: Rename variables/functions with confidence

### Key Patterns in This Project

#### 1. Prisma Types

```tsx
import { Container, Item } from "@prisma/client";

// WHY: Type-safe database queries
function displayContainer(container: Container) {
  console.log(container.label); // ✅ Autocomplete works!
}

// WHAT: Include relations
type ContainerWithItems = Container & {
  items: Item[];
};
```

#### 2. Zod Schemas → TypeScript Types

```tsx
import { z } from "zod";

// WHY: Single source of truth for validation and types
const CreateItemSchema = z.object({
  name: z.string().min(1),
  containerId: z.string().optional(),
});

// WHAT: Infer TypeScript type from Zod schema
type CreateItemInput = z.infer<typeof CreateItemSchema>;
```

#### 3. React Props

```tsx
// WHY: Explicit prop types prevent mistakes
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export function Button({ label, onClick, variant = "primary" }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}
```

#### 4. Async Functions

```tsx
// WHY: Type the return value of async functions
async function getContainer(id: string): Promise<Container | null> {
  return await prisma.container.findUnique({ where: { id } });
}
```

### Common Pitfalls

❌ **Don't use `any`**:
```tsx
function processData(data: any) { ... } // Bad!
```

✅ **Use proper types**:
```tsx
function processData(data: CreateItemInput) { ... } // Good!
```

---

## Tailwind CSS & shadcn/ui

### What is Tailwind CSS?

Utility-first CSS framework. Instead of writing custom CSS:

```css
/* Traditional CSS */
.button {
  padding: 0.5rem 1rem;
  background-color: blue;
  border-radius: 0.25rem;
}
```

Use utility classes:

```tsx
<button className="px-4 py-2 bg-blue-500 rounded">
  Click me
</button>
```

### Key Benefits

1. **No naming conflicts**: No need to name classes
2. **Responsive design**: Built-in breakpoints
3. **Consistency**: Design system tokens
4. **Small bundle**: Purges unused CSS

### Responsive Design

```tsx
<div className="
  w-full          // Mobile: 100% width
  md:w-1/2        // Tablet: 50% width
  lg:w-1/3        // Desktop: 33% width
">
  Content
</div>
```

### shadcn/ui

Pre-built, accessible components you **own**. Not an npm package!

#### How it works:

```bash
# Add a component
npx shadcn-ui@latest add button
```

This copies the component to `src/components/ui/button.tsx`. You can customize it!

#### Example: Button Component

```tsx
import { Button } from "@/components/ui/button";

<Button variant="destructive" size="lg">
  Delete
</Button>
```

### Custom Utilities

Use `cn()` helper to merge classes:

```tsx
import { cn } from "@/lib/utils";

<div className={cn(
  "base-class",
  isActive && "active-class",
  className // Allow external overrides
)} />
```

---

## Prisma ORM (Advanced)

### What is Prisma?

Type-safe database ORM that generates a client from your schema.

*Note: For beginner explanation, see [Beginner Essentials → What is Prisma?](#what-is-prisma)*

### The Schema

```prisma
// prisma/schema.prisma
model Container {
  id      String @id @default(cuid())
  code    String @unique
  label   String
  items   Item[]
  
  @@map("containers")
}

model Item {
  id          String     @id @default(cuid())
  name        String
  containerId String?
  container   Container? @relation(fields: [containerId], references: [id])
  
  @@map("items")
}
```

### CRUD Operations

#### Create

```tsx
const container = await prisma.container.create({
  data: {
    code: "BOX-001",
    label: "Holiday Decor",
    items: {
      create: [
        { name: "Wreath" },
        { name: "Lights" },
      ],
    },
  },
});
```

#### Read

```tsx
// Find one
const container = await prisma.container.findUnique({
  where: { id: "..." },
  include: { items: true }, // Include relations
});

// Find many with filters
const activeContainers = await prisma.container.findMany({
  where: {
    status: "ACTIVE",
    items: { some: {} }, // Has at least one item
  },
  orderBy: { createdAt: "desc" },
  take: 10, // Limit
});
```

#### Update

```tsx
await prisma.container.update({
  where: { id: "..." },
  data: {
    label: "New Label",
    items: {
      connect: { id: "item-id" }, // Add existing item
    },
  },
});
```

#### Delete

```tsx
await prisma.container.delete({
  where: { id: "..." },
});
```

### Migrations

```bash
# Create migration
pnpm db:migrate

# Apply migrations (production)
pnpm db:migrate:deploy

# View data
pnpm db:studio
```

### Best Practices

1. ✅ Use `include` for relations instead of multiple queries
2. ✅ Create indexes for frequently queried fields
3. ✅ Use transactions for multi-step operations
4. ✅ Handle `null` cases (use `findUniqueOrThrow` when appropriate)

---

## Auth.js (NextAuth v5)

### What is Auth.js?

Authentication library for Next.js with support for:
- Email magic links
- OAuth (Google, GitHub, etc.)
- Credentials
- JWT or database sessions

### Setup

```tsx
// src/server/auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
});
```

### Protecting Routes

#### Server Component

```tsx
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/");
  }
  
  return <div>Hello {session.user.name}!</div>;
}
```

#### Server Action

```tsx
'use server'
import { auth } from "@/server/auth";

export async function deleteItem(id: string) {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  
  await prisma.item.delete({ where: { id } });
}
```

### Sign In/Out Buttons

```tsx
'use client'
import { signIn, signOut } from "next-auth/react";

<button onClick={() => signIn("google")}>
  Sign in with Google
</button>

<button onClick={() => signOut()}>
  Sign out
</button>
```

---

## Server Actions & Zod

### What are Server Actions?

Functions that run on the server, callable from Client Components. No API routes needed!

### Basic Pattern

```tsx
'use server'
import { z } from "zod";

// WHY: Define schema for validation
const CreateItemSchema = z.object({
  name: z.string().min(1, "Name required"),
  containerId: z.string().optional(),
});

// WHAT: Server Action with validation
export async function createItem(formData: FormData) {
  // HOW: Validate input
  const data = CreateItemSchema.parse({
    name: formData.get("name"),
    containerId: formData.get("containerId"),
  });
  
  // GOTCHA: Always validate! Never trust client input
  const item = await prisma.item.create({ data });
  
  return { success: true, item };
}
```

### Using in Forms

```tsx
'use client'
import { createItem } from "@/server/actions/items";

export function AddItemForm() {
  async function handleSubmit(formData: FormData) {
    const result = await createItem(formData);
    if (result.success) {
      alert("Item added!");
    }
  }
  
  return (
    <form action={handleSubmit}>
      <input name="name" required />
      <button type="submit">Add</button>
    </form>
  );
}
```

### Error Handling

```tsx
'use server'
export async function updateContainer(id: string, data: unknown) {
  try {
    const validated = UpdateContainerSchema.parse(data);
    await prisma.container.update({ where: { id }, data: validated });
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors };
    }
    return { success: false, error: "Something went wrong" };
  }
}
```

---

## React Hook Form

### Why Use It?

- **Performance**: Only re-renders changed fields
- **Validation**: Integrates with Zod
- **DevX**: Less boilerplate than controlled forms

### Basic Example

```tsx
'use client'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function ItemForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  
  const onSubmit = async (data: FormData) => {
    await createItem(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} />
      {errors.name && <span>{errors.name.message}</span>}
      
      <textarea {...register("description")} />
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

### With shadcn/ui

```tsx
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

---

## S3 & File Uploads

### Presigned URLs (Secure Upload)

Never upload directly from client with credentials!

#### Server Action

```tsx
'use server'
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

export async function getUploadUrl(filename: string) {
  const key = `items/${Date.now()}-${filename}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: "image/jpeg",
  });
  
  // WHY: Presigned URL lets client upload directly to S3
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  const publicUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${key}`;
  
  return { uploadUrl, publicUrl };
}
```

#### Client Component

```tsx
'use client'
import { getUploadUrl } from "@/server/actions/upload";

async function uploadImage(file: File) {
  // 1. Get presigned URL
  const { uploadUrl, publicUrl } = await getUploadUrl(file.name);
  
  // 2. Upload directly to S3
  await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });
  
  // 3. Save publicUrl to database
  await createItemPhoto(publicUrl);
}
```

---

## QR Code Generation & Scanning

### Generation (Server-Side)

```tsx
import QRCode from "qrcode";

export async function generateQR(code: string) {
  // WHY: Generate QR as data URL for display/print
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/c/${code}`;
  const qrDataUrl = await QRCode.toDataURL(url);
  return qrDataUrl;
}
```

### Scanning (Client-Side)

```tsx
'use client'
import { BrowserMultiFormatReader } from "@zxing/browser";
import { useRef, useEffect } from "react";

export function QRScanner({ onScan }: { onScan: (code: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    
    reader.decodeFromVideoDevice(null, videoRef.current!, (result) => {
      if (result) {
        onScan(result.getText());
      }
    });
    
    return () => reader.reset();
  }, [onScan]);
  
  return <video ref={videoRef} />;
}
```

---

## Progressive Web Apps (PWA)

### What is a PWA?

Web apps that feel like native apps:
- Installable to home screen
- Offline functionality
- Background sync
- Push notifications

### Setup with next-pwa

Already configured in `next.config.js`:

```js
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});
```

### Manifest

`public/manifest.json` defines app metadata:

```json
{
  "name": "WheresMy App",
  "short_name": "WheresMy",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#2563eb"
}
```

### Testing

1. Build for production: `pnpm build && pnpm start`
2. Open in Chrome
3. DevTools → Application → Manifest
4. Click "Install" prompt

---

## Testing Strategies

### Unit Tests (Vitest)

```tsx
// src/lib/utils.test.ts
import { describe, it, expect } from "vitest";
import { generateContainerCode } from "./utils";

describe("generateContainerCode", () => {
  it("generates unique codes", () => {
    const code1 = generateContainerCode();
    const code2 = generateContainerCode();
    expect(code1).not.toBe(code2);
  });
  
  it("follows format BOX-XXXX", () => {
    const code = generateContainerCode();
    expect(code).toMatch(/^BOX-[A-Z0-9]{4}$/);
  });
});
```

### E2E Tests (Playwright)

```tsx
// src/test/e2e/containers.spec.ts
import { test, expect } from "@playwright/test";

test("can create a container", async ({ page }) => {
  await page.goto("/dashboard");
  
  await page.click("text=Add Container");
  await page.fill("input[name=label]", "Test Box");
  await page.click("button[type=submit]");
  
  await expect(page.locator("text=Test Box")).toBeVisible();
});
```

### Best Practices

1. ✅ Unit test utilities and business logic
2. ✅ E2E test critical user flows
3. ✅ Don't test implementation details
4. ✅ Mock external services (S3, email)
5. ✅ Use `data-testid` for stable selectors

---

## Next Steps

1. **Explore the codebase**: Start with `src/app/page.tsx`
2. **Make a change**: Edit text, add a button
3. **Add a feature**: Follow the patterns you see
4. **Read the docs**: Each technology has excellent documentation
5. **Ask questions**: Check GitHub Issues or Stack Overflow

## Additional Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Auth.js Docs](https://authjs.dev)
- [Zod Docs](https://zod.dev)
- [shadcn/ui](https://ui.shadcn.com)

---

**Happy Learning! 🚀**
