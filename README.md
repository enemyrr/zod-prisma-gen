# zod-prisma-gen

A simple Prisma generator that creates Zod validation schemas. No bloat, no paid tiers.

## Installation

```bash
npm install zod-prisma-gen zod
```

## Usage

Add the generator to your `schema.prisma`:

```prisma
generator zod {
  provider = "zod-prisma-gen"
  output   = "./generated/zod"
}
```

Run Prisma generate:

```bash
npx prisma generate
```

Import and use your schemas:

```typescript
import { UserSchema, Role } from './generated/zod';

const user = UserSchema.parse({
  id: 1,
  email: 'user@example.com',
  name: 'John',
  role: 'USER',
});
```

## Configuration

| Option | Default | Description |
|--------|---------|-------------|
| `output` | `./generated/zod` | Output directory |
| `multipleFiles` | `false` | Generate one file per model |
| `coerceDate` | `true` | Use `z.coerce.date()` instead of `z.date()` |

```prisma
generator zod {
  provider      = "zod-prisma-gen"
  output        = "./generated/zod"
  multipleFiles = "true"
  coerceDate    = "false"
}
```

## Type Mapping

| Prisma | Zod |
|--------|-----|
| String | `z.string()` |
| Int | `z.number().int()` |
| Float | `z.number()` |
| Boolean | `z.boolean()` |
| DateTime | `z.coerce.date()` |
| BigInt | `z.bigint()` |
| Decimal | `z.string()` |
| Json | `z.unknown()` |
| Bytes | `z.instanceof(Uint8Array)` |
| Enum | `z.enum([...])` |

## Example

Given this Prisma schema:

```prisma
enum Role {
  USER
  ADMIN
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  posts     Post[]
}
```

Generates:

```typescript
import { z } from 'zod';

export const RoleSchema = z.enum(['USER', 'ADMIN']);
export type Role = z.infer<typeof RoleSchema>;

export const UserSchema = z.object({
  id: z.number().int(),
  email: z.string(),
  name: z.string().nullable(),
  role: RoleSchema.default('USER'),
  createdAt: z.coerce.date(),
});
export type User = z.infer<typeof UserSchema>;
```

## Notes

- Relations are omitted (not needed for input validation)
- Auto-generated defaults (`@default(autoincrement())`, `@default(now())`, `@default(uuid())`) are skipped
- Static defaults are included with `.default()`

## License

MIT
