# Database Schema Reference 🗄️

> **What This Is**: Complete documentation of the database structure and relationships.  
> **Purpose**: Understand how data is organized and connected in the database.  
> **For**: When building features, writing queries, or designing new functionality.  
> **Source**: Based on `prisma/schema.prisma` - the single source of truth.

---

## 📊 Schema Overview

The database has **4 main models** that represent the physical storage system:

```
Rack (Physical shelf unit)
  ↓ has many
RackSlot (Individual positions on rack)
  ↓ can contain one
Container (Tote, suitcase, box)
  ↓ contains many
Item (Individual things being stored)
  ↓ can have many
Photo (Visual documentation)
```

---

## 🏷️ Model: Container

**What it represents**: Physical storage containers (totes, suitcases, boxes)

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String (cuid) | ✅ | Unique identifier |
| `name` | String | ✅ | Display name (e.g., "Tote #1") |
| `type` | String | ❌ | Container type (Tote, Suitcase, Box) |
| `size` | String | ❌ | Physical size (Small, Medium, Large) |
| `color` | String | ❌ | Container color |
| `qrCode` | String | ❌ | QR code for scanning |
| `description` | String | ❌ | Additional notes |
| `createdAt` | DateTime | ✅ | When created (auto) |
| `updatedAt` | DateTime | ✅ | Last modified (auto) |

### Relationships

```typescript
items      Item[]        // All items in this container
photos     Photo[]       // Photos of this container
location   RackSlot?     // Where container is placed (optional)
locationId String?       // Foreign key to RackSlot
```

### Business Rules

- Container can have 0 to many items
- Container can have 0 to many photos
- Container can be in 0 or 1 rack slot (may be unplaced)
- QR codes should be unique but not enforced at DB level

### Example Query

```typescript
// Get container with all items and location
const container = await prisma.container.findUnique({
  where: { id: containerId },
  include: {
    items: true,
    location: {
      include: { rack: true }
    },
    photos: true,
  },
});
```

---

## 📦 Model: Item

**What it represents**: Individual things being stored in containers

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String (cuid) | ✅ | Unique identifier |
| `name` | String | ✅ | Item name |
| `description` | String | ❌ | Detailed description |
| `category` | String | ❌ | Item category/type |
| `quantity` | Int | ✅ | How many (default: 1) |
| `createdAt` | DateTime | ✅ | When created (auto) |
| `updatedAt` | DateTime | ✅ | Last modified (auto) |
| `containerId` | String | ✅ | Which container holds this item |

### Relationships

```typescript
container   Container   // Parent container (required)
photos      Photo[]     // Photos of this item
```

### Business Rules

- Item MUST belong to a container
- Quantity must be at least 1
- Can have multiple photos
- Deleting container deletes its items (cascade)

### Example Query

```typescript
// Search items across all containers
const items = await prisma.item.findMany({
  where: {
    name: { contains: 'charger', mode: 'insensitive' },
  },
  include: {
    container: {
      include: { location: { include: { rack: true } } }
    },
  },
});
```

---

## 🗂️ Model: RackSlot

**What it represents**: Individual positions/slots on a storage rack

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String (cuid) | ✅ | Unique identifier |
| `row` | Int | ✅ | Vertical position (0-based) |
| `column` | Int | ✅ | Horizontal position (0-based) |
| `label` | String | ❌ | Human-readable label (e.g., "A1") |
| `createdAt` | DateTime | ✅ | When created (auto) |
| `updatedAt` | DateTime | ✅ | Last modified (auto) |
| `rackId` | String | ✅ | Which rack this slot belongs to |

### Relationships

```typescript
rack       Rack         // Parent rack (required)
container  Container?   // Container in this slot (optional)
```

### Business Rules

- Slot MUST belong to a rack
- Slot can hold 0 or 1 container
- Row/column must be unique within a rack
- Deleting rack deletes its slots (cascade)

### Example Query

```typescript
// Get all occupied slots in a rack
const occupiedSlots = await prisma.rackSlot.findMany({
  where: {
    rackId: rackId,
    container: { isNot: null },
  },
  include: {
    container: {
      include: { items: true }
    },
  },
});
```

---

## 🏗️ Model: Rack

**What it represents**: Physical storage racks/shelving units

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String (cuid) | ✅ | Unique identifier |
| `name` | String | ✅ | Rack name (e.g., "Rack A") |
| `rows` | Int | ✅ | Number of vertical positions |
| `columns` | Int | ✅ | Number of horizontal positions |
| `location` | String | ❌ | Physical location description |
| `createdAt` | DateTime | ✅ | When created (auto) |
| `updatedAt` | DateTime | ✅ | Last modified (auto) |

### Relationships

```typescript
slots   RackSlot[]   // All slots in this rack
```

### Business Rules

- Rack must have at least 1 row and 1 column
- Total slots = rows × columns
- Deleting rack deletes all slots (cascade)

### Example Query

```typescript
// Get full rack with all slots and containers
const rack = await prisma.rack.findUnique({
  where: { id: rackId },
  include: {
    slots: {
      include: {
        container: {
          include: { items: true }
        },
      },
      orderBy: [{ row: 'asc' }, { column: 'asc' }],
    },
  },
});
```

---

## 📸 Model: Photo

**What it represents**: Visual documentation of containers and items

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String (cuid) | ✅ | Unique identifier |
| `url` | String | ✅ | Path or URL to image |
| `description` | String | ❌ | Photo caption/notes |
| `createdAt` | DateTime | ✅ | When uploaded (auto) |
| `updatedAt` | DateTime | ✅ | Last modified (auto) |
| `containerId` | String | ❌ | Container in photo |
| `itemId` | String | ❌ | Item in photo |

### Relationships

```typescript
container   Container?   // Container this photo shows
item        Item?        // Item this photo shows
```

### Business Rules

- Photo can show a container OR an item OR both
- At least one of containerId/itemId should be set
- Multiple photos can show the same container/item

### Example Query

```typescript
// Get all photos for a container and its items
const photos = await prisma.photo.findMany({
  where: {
    OR: [
      { containerId: containerId },
      { item: { containerId: containerId } },
    ],
  },
});
```

---

## 🔗 Relationship Diagram

```
┌──────────────┐
│     Rack     │
│ - name       │
│ - rows       │
│ - columns    │
└───────┬──────┘
        │ has many
        ↓
┌──────────────┐
│  RackSlot    │
│ - row        │
│ - column     │
│ - label      │
└───────┬──────┘
        │ contains (0 or 1)
        ↓
┌──────────────┐       ┌──────────────┐
│  Container   │←──────│    Photo     │
│ - name       │       │ - url        │
│ - type       │       │ - description│
│ - qrCode     │       └──────┬───────┘
└───────┬──────┘              │
        │ contains many       │ shows
        ↓                     ↓
┌──────────────┐              │
│     Item     │──────────────┘
│ - name       │
│ - quantity   │
│ - category   │
└──────────────┘
```

---

## 🎯 Common Queries

### Find where an item is located

```typescript
const item = await prisma.item.findUnique({
  where: { id: itemId },
  include: {
    container: {
      include: {
        location: {
          include: { rack: true }
        }
      }
    }
  }
});

// Access: item.container.location.rack.name
//         item.container.location.row
//         item.container.location.column
```

### Get all items in a rack

```typescript
const itemsInRack = await prisma.item.findMany({
  where: {
    container: {
      location: {
        rackId: rackId
      }
    }
  },
  include: {
    container: {
      include: { location: true }
    }
  }
});
```

### Find unplaced containers

```typescript
const unplacedContainers = await prisma.container.findMany({
  where: {
    locationId: null
  },
  include: {
    items: true
  }
});
```

### Search across everything

```typescript
const searchTerm = "christmas";

const results = await prisma.$transaction([
  // Search containers
  prisma.container.findMany({
    where: {
      OR: [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } }
      ]
    }
  }),
  // Search items
  prisma.item.findMany({
    where: {
      OR: [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { category: { contains: searchTerm, mode: 'insensitive' } }
      ]
    },
    include: { container: true }
  })
]);
```

---

## 💡 Schema Best Practices

### When creating records

```typescript
// ✅ Good: Include related data in one transaction
await prisma.container.create({
  data: {
    name: "Tote #1",
    items: {
      create: [
        { name: "Item 1", quantity: 1 },
        { name: "Item 2", quantity: 2 }
      ]
    }
  },
  include: { items: true }
});

// ❌ Bad: Multiple separate queries (slow, not atomic)
const container = await prisma.container.create({...});
await prisma.item.create({ containerId: container.id, ... });
await prisma.item.create({ containerId: container.id, ... });
```

### When deleting

```typescript
// ✅ Safe: Cascade delete is configured
await prisma.container.delete({ where: { id } });
// Items automatically deleted

// ❌ Unnecessary: Manual cleanup
await prisma.item.deleteMany({ where: { containerId: id } });
await prisma.container.delete({ where: { id } });
```

---

## 📚 Related Documentation

- **Prisma Schema File**: `prisma/schema.prisma`
- **[Database Commands](01-Command-Reference.md#-database-commands)** - How to interact with database
- **[Development Workflow](../03-Development/01-Development-Workflow.md#-database-workflow)** - Daily database tasks

---

**Your database blueprint!** 🏗️
