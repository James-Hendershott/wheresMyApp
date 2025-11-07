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
13. [SVG Diagrams & 3D Visualization](#svg-diagrams--3d-visualization) ⭐ NEW!

---

## Beginner Essentials

### What is Prisma?

**Prisma** is like a **translator** between your JavaScript/TypeScript code and your database.

#### The Problem It Solves

Without Prisma, talking to a database looks like this:

```javascript
// Raw SQL - error-prone, no autocomplete, hard to maintain
const result = await db.query("SELECT * FROM containers WHERE id = $1", [id]);
// What fields does result have? Who knows! 🤷
```

With Prisma:

```typescript
// Type-safe, autocomplete works, catches errors at compile time
const container = await prisma.container.findUnique({
  where: { id: id },
  include: { items: true },
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
    code: "BIN-01",
    label: "Holiday Decor",
  },
});

// Read
const boxes = await prisma.container.findMany({
  where: { code: { startsWith: "BIN" } },
  include: { items: true }, // Include related items
});

// Update
await prisma.container.update({
  where: { id: box.id },
  data: { label: "Updated Label" },
});

// Delete
await prisma.container.delete({
  where: { id: box.id },
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

| Feature            | PostgreSQL                                          | MongoDB          | MariaDB             |
| ------------------ | --------------------------------------------------- | ---------------- | ------------------- |
| **Data Structure** | Tables with relationships                           | JSON documents   | Tables              |
| **Best For**       | Complex relationships (containers → items → photos) | Flexible schemas | MySQL compatibility |
| **Type Safety**    | Strong types                                        | Flexible types   | Strong types        |
| **Prisma Support** | Excellent                                           | Good             | Good                |
| **Learning Curve** | Medium                                              | Easy             | Medium              |

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
  "extends": "next/core-web-vitals", // Next.js best practices
  "plugins": ["@typescript-eslint"], // TypeScript rules
  "rules": {
    "@typescript-eslint/no-unused-vars": "warn", // Warn about unused variables
    "@typescript-eslint/no-explicit-any": "warn", // Warn about 'any' types
    "react/no-unescaped-entities": "off" // Allow quotes in JSX
  }
}
```

#### Linting vs Formatting

People often confuse these:

| Tool                      | Purpose                       | Example                       |
| ------------------------- | ----------------------------- | ----------------------------- |
| **ESLint** (Linting)      | Finds bugs, enforces patterns | "This variable is never used" |
| **Prettier** (Formatting) | Makes code pretty             | "Add space after comma"       |

```bash
npm run lint     # Check for bugs/mistakes (ESLint)
npm run format   # Auto-fix spacing/formatting (Prettier)
```

#### Common Lint Warnings You'll See

1. **Unused Variables**

   ```typescript
   // ⚠️ Warning
   const result = await fetch("/api/data");
   // Fix: Remove it or use it
   ```

2. **Missing Dependencies in useEffect**

   ```typescript
   // ⚠️ Warning
   useEffect(() => {
     fetchData(id); // 'id' should be in dependency array
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

| Command                | What It Does                  | When to Use It                             |
| ---------------------- | ----------------------------- | ------------------------------------------ |
| `npm run dev`          | Starts development server     | While coding (auto-reloads on changes)     |
| `npm run build`        | Creates production build      | Before deploying to production             |
| `npm run start`        | Runs production build         | After building, to test production version |
| `npm run lint`         | Checks code for errors        | Before committing code                     |
| `npm run format`       | Auto-fixes formatting         | To make code pretty                        |
| `npm run type-check`   | Checks TypeScript types       | To catch type errors                       |
| `npm run db:push`      | Updates database schema       | After changing `schema.prisma`             |
| `npm run db:seed`      | Fills database with test data | To get sample data                         |
| `npm run db:seed:prod` | Imports your CSV data         | To load real inventory                     |
| `npm run db:studio`    | Opens database UI             | To view/edit database                      |

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
"use client";
// WHY: Needs interactivity, browser APIs, or React hooks
import { useState } from "react";

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
("use client");
export default function Error({
  error,
  reset,
}: {
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
<button className="rounded bg-blue-500 px-4 py-2">Click me</button>
```

### Key Benefits

1. **No naming conflicts**: No need to name classes
2. **Responsive design**: Built-in breakpoints
3. **Consistency**: Design system tokens
4. **Small bundle**: Purges unused CSS

### Responsive Design

```tsx
<div className="// Mobile: 100% width // Tablet: 50% width // Desktop: 33% width w-full md:w-1/2 lg:w-1/3">
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
</Button>;
```

### Custom Utilities

Use `cn()` helper to merge classes:

```tsx
import { cn } from "@/lib/utils";

<div
  className={cn(
    "base-class",
    isActive && "active-class",
    className // Allow external overrides
  )}
/>;
```

---

## Prisma ORM (Advanced)

### What is Prisma?

Type-safe database ORM that generates a client from your schema.

_Note: For beginner explanation, see [Beginner Essentials → What is Prisma?](#what-is-prisma)_

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
      create: [{ name: "Wreath" }, { name: "Lights" }],
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
npm run db:migrate

# Apply migrations (production)
npm run db:migrate:deploy

# View data
npm run db:studio
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
"use server";
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
"use server";
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
"use client";
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
"use server";
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
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function ItemForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
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
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
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
</Form>;
```

---

## S3 & File Uploads

### Presigned URLs (Secure Upload)

Never upload directly from client with credentials!

#### Server Action

```tsx
"use server";
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
"use client";
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
"use client";
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
- Push notifications (Android only - iOS Safari does not support Web Push API)

### Setup with next-pwa

Already configured in `next.config.js`:

```js
const withPWA = require("next-pwa")({
  dest: "public",
  disable: false, // Changed from development-only to always enabled for mobile testing
  runtimeCaching: [
    // Custom caching strategies for offline support
  ],
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
  "theme_color": "#2563eb",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "shortcuts": [
    {
      "name": "Scan QR Code",
      "url": "/scan",
      "description": "Scan a container QR code"
    }
  ],
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url",
      "files": [
        {
          "name": "media",
          "accept": ["image/*", "video/*"]
        }
      ]
    }
  }
}
```

### Testing PWA Installation

#### On Android (Full Support ✅)

1. Build for production: `npm run build && npm run start`
2. Open in Chrome on your Android device
3. Look for "Install app" prompt
4. Tap to add to home screen
5. App opens in standalone mode (no browser chrome)

#### On iOS (Limited Support ⚠️)

1. Open in Safari (not Chrome!)
2. Tap Share button
3. Scroll down and tap "Add to Home Screen"
4. Name the app and tap "Add"
5. **GOTCHA**: iOS does not support:
   - Web Push Notifications (use email notifications instead)
   - Background Sync API
   - Full service worker capabilities

#### Desktop (Chrome/Edge)

1. Look for install icon in address bar
2. Click to install as desktop app
3. Opens in app window without browser UI

### Platform Compatibility Matrix

| Feature                | Android Chrome/Edge | iOS Safari | Desktop Chrome/Edge |
| ---------------------- | ------------------- | ---------- | ------------------- |
| Install to Home Screen | ✅                  | ✅         | ✅                  |
| Offline Storage        | ✅                  | ✅         | ✅                  |
| IndexedDB              | ✅                  | ✅         | ✅                  |
| Camera Access          | ✅                  | ✅         | ✅                  |
| Web Share Target       | ✅                  | ✅         | ⚠️ Partial          |
| Push Notifications     | ✅                  | ❌         | ✅                  |
| Background Sync        | ✅                  | ❌         | ✅                  |

**Why doesn't iOS support push?** Apple intentionally limits Web Push API to protect App Store revenue. They want you to build native iOS apps instead of PWAs.

---

## IndexedDB Offline Storage

### What is IndexedDB?

**IndexedDB** is a browser-native database that lets you store large amounts of structured data locally. Unlike localStorage (which only stores strings up to ~5MB), IndexedDB can:

- Store complex objects (arrays, nested objects)
- Handle large datasets (50MB+ typically)
- Query with indexes (fast lookups)
- Work offline (no server needed)

### Our IndexedDB Architecture

We use IndexedDB to cache server data for offline viewing:

```typescript
// src/lib/indexedDB.ts
const DB_NAME = "wheresmyapp";
const DB_VERSION = 1;

// Define stores (like SQL tables)
const STORES = {
  items: "items",
  containers: "containers",
  locations: "locations",
  racks: "racks",
  syncQueue: "syncQueue", // For offline mutations
  metadata: "metadata", // Track last sync times
};
```

#### Key Functions

```typescript
// Open database connection
const db = await openDB();

// Store data
await putInStore(db, "items", item);

// Retrieve data
const items = await getAllFromStore<Item>(db, "items");

// Query with index
const itemsInContainer = await getByIndex<Item>(
  db,
  "items",
  "containerId",
  "container-123"
);

// Track offline changes
await addToSyncQueue(db, {
  action: "UPDATE_ITEM",
  data: { id: "item-1", name: "Updated name" },
  timestamp: new Date(),
});
```

### React Hooks for Offline Caching

Instead of calling IndexedDB directly, use our custom hooks:

#### 1. useOnlineStatus()

Monitors network connection:

```tsx
"use client";
import { useOnlineStatus } from "@/hooks/useOfflineCache";

export function MyComponent() {
  const isOnline = useOnlineStatus();

  return (
    <div>
      {isOnline ? (
        <span className="text-green-600">Connected</span>
      ) : (
        <span className="text-orange-600">Offline</span>
      )}
    </div>
  );
}
```

#### 2. useOfflineCache()

Automatically syncs server data to IndexedDB and serves cached data when offline:

```tsx
"use client";
import { useOfflineCache } from "@/hooks/useOfflineCache";

export function ItemsList() {
  const {
    data: items, // Cached data (null if not cached)
    isOnline, // Connection status
    isCached, // Whether data is in IndexedDB
    error, // Any errors during caching
    clearCache, // Function to clear cache
  } = useOfflineCache<Item[]>(
    "items", // Cache key
    "/api/items" // API endpoint to fetch from
  );

  if (!items) return <div>Loading...</div>;

  return (
    <div>
      {!isOnline && <div>Viewing cached data</div>}
      {items.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

**How it works:**

1. First load: Fetches from `/api/items`, stores in IndexedDB
2. Subsequent loads: Serves from IndexedDB immediately (instant load!)
3. If online: Re-fetches in background and updates cache
4. If offline: Uses cached data only

#### 3. useLastSync()

Shows when data was last synced:

```tsx
const lastSync = useLastSync("items");

if (lastSync) {
  return <div>Last updated: {formatDistanceToNow(lastSync)} ago</div>;
}
```

#### 4. useOfflineReady()

Check if app has cached data for offline use:

```tsx
const isReady = useOfflineReady("items");

if (!isReady) {
  return <div>Please connect to internet to download inventory...</div>;
}
```

### Offline Status Banner

We have a global banner that shows connection status:

```tsx
// src/components/OfflineStatusBanner.tsx
export function OfflineStatusBanner() {
  const isOnline = useOnlineStatus();
  const lastSync = useLastSync("items");
  const { clearCache } = useOfflineCache("items", "/api/items");

  // Only show when offline or has cached data
  if (isOnline && !lastSync) return null;

  return (
    <div className={`${isOnline ? "bg-green-600" : "bg-orange-600"}`}>
      <span>{isOnline ? "Online" : "Offline Mode"}</span>
      {lastSync && <span>Last sync: {formatDistanceToNow(lastSync)} ago</span>}
      {isOnline && (
        <button onClick={clearCache}>
          <RefreshCw />
          Refresh
        </button>
      )}
    </div>
  );
}
```

**Integrated in layout.tsx** so it appears on every page.

### Best Practices for Offline Support

1. **Cache read-heavy data**: Items, containers, locations (things users view)
2. **Don't cache mutations**: Use syncQueue for offline updates
3. **Show visual feedback**: Always indicate when viewing cached data
4. **Provide manual refresh**: Let users force sync when needed
5. **Handle sync conflicts**: If offline edits conflict with server, prompt user

### Sync Queue for Offline Mutations

When offline, users can still make changes. We queue them:

```typescript
// User edits item while offline
await addToSyncQueue(db, {
  action: "UPDATE_ITEM",
  data: { id: "item-1", name: "New name" },
  timestamp: new Date(),
  status: "PENDING",
});

// When back online, process queue
const queue = await getSyncQueue(db);
for (const mutation of queue) {
  try {
    await fetch("/api/items", {
      method: "PATCH",
      body: JSON.stringify(mutation.data),
    });
    await removeFromSyncQueue(db, mutation.id); // Remove on success
  } catch (error) {
    // Keep in queue, mark as failed
    await updateSyncQueueStatus(db, mutation.id, "FAILED");
  }
}
```

**Future enhancement**: Automatic background sync when connection restored.

---

## Push Notifications (Android Only)

### What is Web Push?

**Web Push API** lets you send notifications to users even when they're not actively using your app. Think: "Item checked out by User X" or "7-day checkout reminder".

### Critical Platform Limitation

❌ **iOS Safari does NOT support Web Push API**  
✅ **Android Chrome/Edge fully support it**  
✅ **Desktop Chrome/Edge/Firefox support it**

**Why?** Apple policy to protect App Store revenue. They want you to build native iOS apps.

**Solution for iOS users**: Email notifications via server-side job + Prisma User.email

### Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Client    │ ────▶│ Your Server  │ ────▶│   Browser   │
│ (subscribe) │      │ (web-push)   │      │ (show notif)│
└─────────────┘      └──────────────┘      └─────────────┘
      ▲                                            │
      └────────────────────────────────────────────┘
           Service Worker receives push event
```

### Setup Steps

#### 1. Generate VAPID Keys

VAPID keys authenticate your server:

```bash
npx web-push generate-vapid-keys

# Output:
# Public Key: BPxXz4...
# Private Key: 8vXoF...
```

Add to `.env`:

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BPxXz4...
VAPID_PRIVATE_KEY=8vXoF...
```

#### 2. Client-Side Subscription

```tsx
"use client";
import { subscribeUserToPush } from "@/lib/pushNotifications";

async function handleEnableNotifications() {
  try {
    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error("Permission denied");
    }

    // Subscribe to push
    await subscribeUserToPush();

    toast.success("Notifications enabled!");
  } catch (error) {
    if (error.message.includes("not supported")) {
      // iOS or other unsupported browser
      toast.error("Push notifications not supported on this device");
    } else {
      toast.error("Failed to enable notifications");
    }
  }
}
```

#### 3. Server-Side Sending

```typescript
// src/app/api/push/send/route.ts
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:your-email@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: Request) {
  const { userId, title, body } = await request.json();

  // Get user's push subscription from database
  const subscription = await prisma.pushSubscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    return Response.json({ error: "Not subscribed" }, { status: 404 });
  }

  // Send push notification
  await webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: {
        auth: subscription.auth,
        p256dh: subscription.p256dh,
      },
    },
    JSON.stringify({ title, body })
  );

  return Response.json({ success: true });
}
```

#### 4. Service Worker Handler

```javascript
// public/service-worker.js
self.addEventListener("push", (event) => {
  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-72.png",
      vibrate: [200, 100, 200],
      data: {
        url: "/inventory", // Click to open this page
      },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
```

### Permission States

Users can grant, deny, or block notifications:

```tsx
function NotificationSettings() {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    setPermission(Notification.permission);
  }, []);

  if (permission === "denied") {
    return (
      <div className="text-red-600">
        Notifications blocked. To enable:
        <ol>
          <li>Go to browser Settings</li>
          <li>Find Site Settings → Notifications</li>
          <li>Allow for this site</li>
        </ol>
      </div>
    );
  }

  if (permission === "granted") {
    return <button onClick={unsubscribe}>Disable Notifications</button>;
  }

  return <button onClick={subscribe}>Enable Notifications</button>;
}
```

### Testing Push Notifications

1. **Check browser support**:

   ```javascript
   if ("serviceWorker" in navigator && "PushManager" in window) {
     console.log("Push supported!");
   } else {
     console.log("Push NOT supported");
   }
   ```

2. **Test on Android Chrome**:

   - Open DevTools → Application → Service Workers
   - Check "Push" to send test notification
   - Verify notification appears

3. **Test on iOS Safari**:
   - Will fail! iOS doesn't support it
   - Show alternative message: "Use email notifications"

### iOS Alternative: Email Notifications

Since iOS doesn't support push, implement email fallback:

```typescript
// When sending notification, check platform
if (user.platformIsIOS) {
  // Send email instead
  await sendEmail({
    to: user.email,
    subject: title,
    body: body,
  });
} else {
  // Send push notification
  await webpush.sendNotification(subscription, payload);
}
```

**Detect iOS**:

```typescript
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}
```

### Resources

- [Web Push API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [web-push library](https://github.com/web-push-libs/web-push)
- [VAPID specification](https://tools.ietf.org/html/rfc8292)
- **Full guide**: `docs/PUSH_NOTIFICATIONS.md` in this project

---

## Web Share Target API

### What is Web Share Target?

Lets your PWA **receive** content shared from other apps. Examples:

- Share photo from Photos app → Opens your app with photo
- Share link from Safari → Opens your app to add item
- Share text from Notes → Pre-fills description field

### Supported Platforms

✅ **Android** - Full support  
✅ **iOS** - Full support (unlike push notifications!)  
⚠️ **Desktop** - Partial support (Chrome/Edge only)

### Setup

#### 1. Configure Manifest

```json
// public/manifest.json
{
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url",
      "files": [
        {
          "name": "media",
          "accept": ["image/*", "video/*"]
        }
      ]
    }
  }
}
```

#### 2. Create API Route Handler

```typescript
// src/app/share/route.ts
export async function POST(request: Request) {
  const formData = await request.formData();

  // Extract shared data
  const title = formData.get("title") as string;
  const text = formData.get("text") as string;
  const url = formData.get("url") as string;
  const media = formData.getAll("media") as File[];

  // Authenticate user
  const session = await auth();
  if (!session) {
    return Response.redirect("/login?callbackUrl=/share/process");
  }

  // Redirect to processing page with data
  const params = new URLSearchParams({
    title: title || "",
    text: text || "",
    url: url || "",
  });

  return Response.redirect(`/share/process?${params}`);
}
```

#### 3. Create Processing Page

```tsx
// src/app/share/process/page.tsx
"use client";

export default function ShareProcessPage({
  searchParams,
}: {
  searchParams: { title?: string; text?: string; url?: string };
}) {
  const [itemName, setItemName] = useState(searchParams.title || "");
  const [description, setDescription] = useState(searchParams.text || "");

  async function handleCreateItem() {
    await createItem({
      name: itemName,
      description,
      // Pre-fill from shared data
    });
  }

  return (
    <div>
      <h1>Add Shared Item</h1>
      <form onSubmit={handleCreateItem}>
        <input
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="Item name"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
        <button type="submit">Add to Inventory</button>
      </form>
    </div>
  );
}
```

### User Experience Flow

1. User takes photo in Camera app
2. Taps Share button → Sees "WheresMy App" in share sheet
3. Taps WheresMy → App opens to `/share/process`
4. Photo preview shown, item name/description pre-filled
5. User confirms → Item created with photo

### Testing Web Share Target

#### On Android:

1. Install PWA to home screen
2. Open Photos app
3. Select a photo → Share
4. WheresMy App appears in share sheet
5. Tap to share to app

#### On iOS:

1. Add PWA to home screen (Safari → Share → Add to Home Screen)
2. Open Photos app
3. Tap Share button
4. Scroll down to "WheresMy" in app list
5. Tap to share

#### Desktop (limited):

- Only works if PWA is **installed** (not in browser tab)
- Right-click image → Share → WheresMy App

### Gotchas

1. **Must be installed**: Share target only appears for installed PWAs
2. **HTTPS required**: Localhost works for dev, production needs HTTPS
3. **Form data parsing**: Use `multipart/form-data`, not JSON
4. **Authentication**: Check user is logged in, redirect if not
5. **File size limits**: Handle large photos gracefully

### Debugging

Check if share target is registered:

```javascript
// In browser console (after PWA installed)
navigator.share({
  title: "Test",
  text: "Test share",
  url: "https://example.com",
});
```

If your app doesn't appear, check:

- ✅ Manifest has correct `share_target` syntax
- ✅ PWA is installed (not just opened in browser)
- ✅ HTTPS enabled (or localhost for dev)
- ✅ Service worker registered

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

## SVG Diagrams & 3D Visualization

### Why SVG for Diagrams?

SVG (Scalable Vector Graphics) is perfect for creating interactive diagrams in web apps because:

- **Scalable**: Looks crisp at any size
- **Lightweight**: Smaller file size than images
- **Interactive**: Can respond to clicks, hovers
- **Styleable**: Use CSS and inline styles
- **Accessible**: Can be read by screen readers

### Container Type Diagrams

In the Add Container Type form, we use SVG to show 3D wireframe diagrams:

#### Wireframe Box Diagram

```tsx
function Dimensions3DBox() {
  return (
    <svg viewBox="0 0 240 240" className="h-full w-full">
      {/* Back face - wireframe */}
      <path
        d="M 60 60 L 160 60 L 160 160 L 60 160 Z"
        fill="none"
        stroke="#374151"
        strokeWidth="2.5"
      />
      {/* Dimension lines with color coding */}
      <line
        x1="60"
        y1="175"
        x2="160"
        y2="175"
        stroke="#2563eb"
        strokeWidth="2"
      />
      <text x="110" y="195" fontSize="18" fill="#2563eb" fontWeight="bold">
        L
      </text>
    </svg>
  );
}
```

**Key Techniques:**

1. **Wireframe Style**: Use `fill="none"` for hollow shapes
2. **Color-Coded Dimensions**: Blue for Length, Green for Width, Orange for Height
3. **Clear Labels**: Large, bold text with matching colors
4. **Measurement Lines**: Show exactly what each dimension measures

#### Tapered Container (Flipped Orientation)

For tapered containers (totes, bins), we show the **bottom opening larger** (realistic orientation):

```tsx
// Bottom is wider than top (like a real tote)
<path d="M 80 40 L 140 40 L 160 150 L 60 150 Z" fill="none" stroke="#374151" />
```

**Why flip it?** Real storage totes have:

- Small top opening (easier to stack)
- Large bottom base (more storage)

This matches how users think about their containers!

### State Management for UI Toggles

The unit toggle (inches/mm) uses React state:

```tsx
const [unit, setUnit] = useState<"inches" | "mm">("inches");

// Toggle buttons
<button
  onClick={() => setUnit("inches")}
  className={unit === "inches" ? "bg-blue-600 text-white" : "text-gray-600"}
>
  Inches
</button>;
```

**Pattern**: Conditional styling based on state for active/inactive states.

### SVG Path Commands

Understanding the `d` attribute in `<path>`:

| Command | Meaning    | Example                             |
| ------- | ---------- | ----------------------------------- |
| `M x y` | Move to    | `M 60 60` - Start at (60, 60)       |
| `L x y` | Line to    | `L 160 60` - Draw line to (160, 60) |
| `Z`     | Close path | `Z` - Draw line back to start       |

Example rectangle:

```
M 60 60    → Start at top-left
L 160 60   → Line to top-right
L 160 160  → Line to bottom-right
L 60 160   → Line to bottom-left
Z          → Close back to top-left
```

### Design Principles for Technical Diagrams

1. **Clarity over Style**: Wireframes are clearer than filled shapes
2. **Color-Code Information**: Different colors for different dimensions
3. **Consistent Sizing**: All labels and lines use consistent stroke widths
4. **Real-World Orientation**: Show objects as users expect to see them
5. **Adequate Spacing**: Don't cram labels together

### Testing SVG Diagrams

Check these in different scenarios:

```bash
# Mobile responsiveness
- Does it scale properly on small screens?
- Are labels still readable?

# Browser compatibility
- Test in Chrome, Firefox, Safari
- SVG support is universal, but rendering may vary

# Accessibility
- Can screen readers parse the diagram?
- Add aria-labels for important elements
```

### Resources

- [SVG Path Tutorial](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths)
- [SVG Coordinate System](https://www.sarasoueidan.com/blog/svg-coordinate-systems/)
- [React SVG Best Practices](https://react-svgr.com/docs/what-is-svgr/)

---

## Advanced Features & Patterns (Nov 5, 2025)

### Items as Containers: Polymorphic Relationships

**The Problem**: Some items ARE containers (suitcases, backpacks, toolboxes). How do we model this?

**The Solution**: Self-referential flexibility with type flags.

```prisma
model Item {
  id            String    @id
  name          String
  isContainer   Boolean   @default(false)  // 🔑 The magic flag
  volume        Float?                      // For capacity calculations
  currentSlotId String?   @unique           // Items can occupy slots
  currentSlot   Slot?     @relation(...)    
  containerId   String?                     // Items can be IN containers
  container     Container? @relation(...)
}
```

**Key Insights**:
1. An item with `isContainer=true` acts like a Container
2. It can occupy a rack slot (via `currentSlotId`)
3. Regular items go IN containers (via `containerId`)
4. These are **mutually exclusive** (validated in Zod schema)

```typescript
// Validation: Container items can't be inside other containers
const itemSchema = z.object({
  // ... fields
}).refine(
  (data) => {
    if (data.isContainer && data.containerId) {
      return false; // Can't be both!
    }
    return true;
  },
  { message: "Items acting as containers cannot be placed inside other containers" }
);
```

### Volume-Based Capacity Tracking

**The Problem**: Containers have physical limits. How do we prevent overfilling?

**The Solution**: Calculate volumes, track usage, warn users.

#### Step 1: Volume Calculations

Different container shapes require different formulas:

```typescript
// Tapered containers (totes, bins)
export function calculateTaperedVolume(
  topLength: number,
  topWidth: number,
  bottomLength: number,
  bottomWidth: number,
  height: number
): number {
  const topArea = topLength * topWidth;
  const bottomArea = bottomLength * bottomWidth;
  // Trapezoidal prism formula
  return ((topArea + bottomArea) / 2) * height;
}

// Rectangular containers (boxes, crates)
export function calculateRectangularVolume(
  length: number,
  width: number,
  height: number
): number {
  return length * width * height;
}
```

#### Step 2: Aggregate Item Volumes

```typescript
export function calculateContainerCapacity(
  containerCapacity: number | null | undefined,
  items: Array<{ volume: number | null }>
) {
  if (!containerCapacity) return null;
  
  const totalVolume = items.reduce(
    (sum, item) => sum + (item.volume || 0),
    0
  );
  
  const fillPercentage = (totalVolume / containerCapacity) * 100;
  
  return {
    capacity: containerCapacity,
    usedVolume: totalVolume,
    fillPercentage: Math.min(fillPercentage, 100),
  };
}
```

#### Step 3: Visual Feedback

Color-coded progress bars provide instant feedback:

```typescript
export function getCapacityColorClass(fillPercentage: number): string {
  if (fillPercentage >= 90) return "bg-red-500";      // 🔴 Danger zone
  if (fillPercentage >= 75) return "bg-yellow-500";   // 🟡 Warning
  return "bg-green-500";                              // 🟢 Healthy
}
```

```tsx
// On container cards
<div className="h-2 w-full rounded-full bg-gray-200">
  <div
    className={`h-full rounded-full transition-all ${getCapacityColorClass(fillPercentage)}`}
    style={{ width: `${fillPercentage}%` }}
  />
</div>
```

#### Step 4: Capacity Warnings

Before adding items, check if container is nearly full:

```typescript
// In createItem server action
if (parsed.data.containerId && parsed.data.volume) {
  const container = await prisma.container.findUnique({
    where: { id: parsed.data.containerId },
    include: { items: true, containerType: true },
  });

  if (container && container.containerType?.capacity) {
    const capacity = calculateContainerCapacity(
      container.containerType.capacity,
      container.items
    );

    if (capacity && capacity.fillPercentage >= 90) {
      // Return warning that can be overridden
      return {
        error: getCapacityWarning(capacity.fillPercentage, capacity.capacity),
        requiresOverride: true,
      };
    }
  }
}
```

```tsx
// In form component
const result = await createItem(formData);

if ("requiresOverride" in result) {
  // Show confirmation dialog
  const confirmed = await showWarningDialog(result.error);
  if (confirmed) {
    // Retry with override flag
    formData.append("overrideCapacity", "true");
    await createItem(formData);
  }
}
```

**Key Lessons**:
- Physics matters! Volume calculations must be accurate
- User experience: Warn, don't block (allow override)
- Visual feedback: Color-coded progress bars are intuitive
- Server-side validation: Never trust client calculations

### Global Search with Debouncing

**The Problem**: Searching on every keystroke creates too many server requests.

**The Solution**: Debounce inputs to wait for user to finish typing.

#### Custom Debounce Hook

```typescript
// src/hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set timeout to update after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: cancel timeout if value changes before delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

**How It Works**:
1. User types "book" (4 keystrokes)
2. Each keystroke sets a 300ms timer
3. Previous timers are cancelled
4. Only the final "book" triggers search (300ms after last keystroke)

#### Multi-Model Search

```typescript
// searchActions.ts
export async function globalSearch(query: string): Promise<SearchResults> {
  const [containers, items, locations] = await Promise.all([
    // Search containers by label, code, description
    prisma.container.findMany({
      where: {
        OR: [
          { label: { contains: query, mode: "insensitive" } },
          { code: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 10,
    }),
    
    // Search items by name, description, notes
    prisma.item.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { notes: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 20,
    }),
    
    // Search locations by name, notes
    prisma.location.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { notes: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 5,
    }),
  ]);

  return { containers, items, locations };
}
```

**Key Insights**:
- `Promise.all()` runs queries in parallel (faster!)
- `mode: "insensitive"` makes search case-insensitive
- `take` limits results to prevent overwhelming UI
- `OR` clauses search multiple fields

#### Search Page Implementation

```tsx
"use client";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300); // ✨ Magic!
  const [results, setResults] = useState<SearchResults | null>(null);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      // Only search when 2+ characters
      globalSearch(debouncedQuery).then(setResults);
    } else {
      setResults(null);
    }
  }, [debouncedQuery]); // Re-run when debounced value changes

  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search containers, items, locations..."
    />
  );
}
```

**Performance Benefits**:
- Without debounce: "book" = 4 API calls
- With debounce: "book" = 1 API call (75% reduction!)

### Enhanced Drag-and-Drop UX

**The Problem**: Basic HTML5 drag-and-drop lacks visual feedback.

**The Solution**: Custom drag states, animations, and visual cues.

#### Drag State Management

```typescript
const [draggedEntity, setDraggedEntity] = useState<DraggableEntity | null>(null);
const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
const [isDragging, setIsDragging] = useState(false);

type DraggableEntity = {
  id: string;
  displayName: string;
  type: "container" | "item";  // 🔑 Discriminator for polymorphic handling
};
```

#### Custom Drag Preview

```tsx
// Hidden element used as drag image
<div ref={dragImageRef} className="fixed -left-[9999px]">
  <GripVertical className="h-4 w-4" />
  <Package className="h-5 w-5" />
  <span>{draggedEntity?.displayName}</span>
</div>

// In drag handler
const handleDragStart = (e: React.DragEvent, entity: DraggableEntity) => {
  setDraggedEntity(entity);
  setIsDragging(true);
  
  // Use custom preview instead of default ghost image
  if (dragImageRef.current) {
    e.dataTransfer.setDragImage(dragImageRef.current, 50, 25);
  }
};
```

#### Visual Feedback Hierarchy

```tsx
<div
  className={`${
    isOccupied
      ? entityType === "item"
        ? "border-purple-500 bg-purple-50"  // 🟣 Item-containers
        : "border-blue-500 bg-blue-50"       // 🔵 Regular containers
      : isDragTarget
        ? "animate-pulse border-green-500 bg-green-100"  // 🟢 Valid drop target
        : isDragging
          ? "border-dashed border-gray-300 hover:border-green-400"  // Hoverable
          : "border-gray-200 bg-gray-50"     // ⚪ Empty
  }`}
>
```

**Color Psychology**:
- **Blue**: Standard, trustworthy (containers)
- **Purple**: Special, different (item-containers)
- **Green**: Success, valid action (drop targets)
- **Yellow/Red**: Warning, danger (capacity alerts)

#### Polymorphic Drop Handling

```typescript
const handleDrop = async (e: React.DragEvent, slot: Slot) => {
  if (!draggedEntity) return;

  const formData = new FormData();
  formData.append("currentSlotId", slot.id);

  let result;
  if (draggedEntity.type === "container") {
    result = await updateContainer(draggedEntity.id, formData);
  } else {
    result = await updateItemSlot(draggedEntity.id, formData);  // Different action!
  }

  if ("error" in result) {
    toast.error(result.error);
  } else {
    toast.success(`${draggedEntity.displayName} moved to ${slotLabel}!`);
    router.refresh();
  }
};
```

**Key Insights**:
- State management is crucial for smooth UX
- Visual feedback at every step (drag start, drag over, drop)
- Type discrimination enables polymorphic behavior
- Animation classes provide immediate feedback
- Custom drag images improve polish

### Lessons Learned: Full-Stack Feature Development

#### 1. Start with Data Model

Always begin with schema changes:
```prisma
// Define the "what" before the "how"
model Item {
  isContainer   Boolean
  currentSlotId String?
  // ...
}
```

#### 2. Build Bottom-Up

1. **Utilities first** (`volumeCalculations.ts`, `capacityHelpers.ts`)
2. **Server actions** (`updateItemSlot`, capacity checks)
3. **UI components** (forms, grids, search pages)
4. **Integration** (wire everything together)

#### 3. Validation at Every Layer

```
┌─────────────────────────────────┐
│ CLIENT: React Hook Form + Zod  │  ← User feedback
├─────────────────────────────────┤
│ SERVER: Zod schema validation   │  ← Security boundary
├─────────────────────────────────┤
│ DATABASE: Prisma constraints    │  ← Data integrity
└─────────────────────────────────┘
```

#### 4. User Experience is King

- **Don't block users**: Warn about capacity, allow override
- **Provide context**: "Drop on empty slot to place X"
- **Visual hierarchy**: Color, animation, spacing
- **Performance**: Debounce, limits, parallel queries

#### 5. Documentation Matters

Today's updates:
- **CHANGELOG.md**: What changed (for users)
- **ROADMAP.md**: What's completed (for planning)
- **learn.md**: How it works (for developers)

**All three must stay in sync!**

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
