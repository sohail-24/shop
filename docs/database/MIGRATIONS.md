# Database Migrations

**Version:** 2.0

**Status:** Active

**Last Updated:** 2026-09-20

---

## 1. Production Boot Migrations

When running in production mode (`env.isProduction`), the application executes Drizzle migrations programmatically during container startup in `api/boot.ts` before binding the HTTP server on port 3000:

- **Migrator:** Utilizes `drizzle-orm/node-postgres/migrator` (`migrate` function).
- **Migrations Folder:** Targets the generated SQL migration files in `db/migrations/`.
- **Database Target:** Obtained via `getDb()` from `api/queries/connection.ts`.
- **Resilience Fallback:** If `DATABASE_URL` is missing or the PostgreSQL server is unreachable, the startup block catches the error and issues a warning (`Database migrations skipped or failed — running with in-memory database:`), allowing the application to boot safely using the mock database proxy (`mockDbInstance`).

---

## 2. CLI Migration Workflows

The following npm scripts defined in `package.json` manage schema synchronization:

```bash
# Generate SQL migration files in db/migrations from db/schema.ts
npm run db:generate

# Execute pending migrations against the configured DATABASE_URL
npm run db:migrate

# Push schema changes directly to the database without generating SQL migration files
npm run db:push

# Baseline existing database tables transitioned to Drizzle migrations
npm run db:baseline
```

---

## 3. Consistency & Baselining

- **`db/baseline.ts`:** Used to establish initial migration records for pre-existing databases that were set up without historical migration files.
- **Migration History:** Tracked in the `__drizzle_migrations` table inside PostgreSQL. Historical migration files must remain immutable; schema adjustments require generating a new sequential migration step.
