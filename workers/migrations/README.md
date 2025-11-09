# Database Migrations

This directory contains SQL migration files for the HUMMBL D1 database.

## Migration Files

Each migration is a timestamped SQL file that can be applied to the database:

1. **001_initial_schema.sql** - Initial database schema
   - workflows table
   - executions table
   - task_results table
   - schema_migrations tracking table

2. **002_add_api_keys_table.sql** - API key management
   - api_keys table for encrypted API keys

3. **003_add_users_table.sql** - User authentication
   - users table
   - sessions table

## Running Migrations

### Using Wrangler (Recommended)

```bash
# Run all migrations in order
wrangler d1 execute hummbl-workflows --file=workers/migrations/001_initial_schema.sql
wrangler d1 execute hummbl-workflows --file=workers/migrations/002_add_api_keys_table.sql
wrangler d1 execute hummbl-workflows --file=workers/migrations/003_add_users_table.sql
```

### Using Migration CLI

```bash
# Check migration status
npm run migrate:status

# List available migrations
npm run migrate history
```

### Programmatically (in Workers)

```typescript
import { runMigrations, getCurrentVersion } from './lib/migrations';
import migrations from '../migrations/index';

// Run pending migrations
const results = await runMigrations(env.DB, migrations);

// Check current version
const version = await getCurrentVersion(env.DB);
```

## Creating New Migrations

1. Create a new SQL file: `00X_description.sql`
2. Add migration to `migrations/index.ts`
3. Include rollback instructions in comments
4. Test locally with `wrangler dev`

### Migration Template

```sql
-- Migration: 00X_your_migration_name
-- Description: What this migration does
-- Created: YYYY-MM-DD

-- Your SQL here
CREATE TABLE IF NOT EXISTS your_table (
  id TEXT PRIMARY KEY,
  -- columns...
);

-- Record migration
INSERT INTO schema_migrations (version, name, applied_at)
VALUES (X, '00X_your_migration_name', strftime('%s', 'now'))
ON CONFLICT(version) DO NOTHING;
```

## Migration Best Practices

1. **Always use `IF NOT EXISTS`** for idempotency
2. **Include indexes** for query performance
3. **Use constraints** for data integrity
4. **Document rollback** steps in comments
5. **Test locally** before deploying
6. **Version sequentially** to avoid conflicts

## Checking Schema

```bash
# List all tables
wrangler d1 execute hummbl-workflows --command "SELECT name FROM sqlite_master WHERE type='table'"

# Check migration history
wrangler d1 execute hummbl-workflows --command "SELECT * FROM schema_migrations ORDER BY version"

# Verify table structure
wrangler d1 execute hummbl-workflows --command "PRAGMA table_info(workflows)"
```

## Rollback Strategy

D1 doesn't support transactions across multiple statements, so:

1. **Always backup** before migrations
2. **Test thoroughly** in development
3. **Create reverse migrations** if needed
4. **Document rollback** SQL in migration comments

## Environment-Specific Migrations

- **Local**: Use `wrangler dev` with local D1
- **Staging**: Test migrations in staging first
- **Production**: Apply during maintenance window
