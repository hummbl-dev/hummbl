#!/usr/bin/env node

/**
 * Migration CLI Tool
 * 
 * Run database migrations against D1
 * Usage: npx tsx scripts/migrate.ts [command]
 * 
 * Commands:
 *   up       - Run all pending migrations
 *   status   - Show migration status
 *   history  - Show migration history
 *   verify   - Verify database schema
 */

import { migrations } from '../workers/migrations/index';
// Migration functions available in workers/src/lib/migrations.ts

// Mock D1 for local testing (use wrangler dev for real D1)
async function main() {
  const command = process.argv[2] || 'status';

  console.log('HUMMBL Database Migration Tool');
  console.log('==============================\n');

  switch (command) {
    case 'up':
      console.log('This tool requires wrangler to run migrations.');
      console.log('Please use: wrangler d1 migrations apply hummbl-workflows\n');
      console.log('Or manually run migration files in workers/migrations/\n');
      listMigrations();
      break;

    case 'status':
      console.log('Migration Status:');
      console.log('-----------------');
      listMigrations();
      console.log('\nTo apply migrations, use:');
      console.log('  wrangler d1 execute hummbl-workflows --file=workers/migrations/001_initial_schema.sql');
      console.log('  wrangler d1 execute hummbl-workflows --file=workers/migrations/002_add_api_keys_table.sql');
      console.log('  wrangler d1 execute hummbl-workflows --file=workers/migrations/003_add_users_table.sql');
      break;

    case 'list':
    case 'history':
      console.log('Available Migrations:');
      console.log('---------------------');
      listMigrations();
      break;

    case 'verify':
      console.log('To verify schema, connect to your D1 database:');
      console.log('  wrangler d1 execute hummbl-workflows --command "SELECT * FROM schema_migrations"');
      break;

    case 'help':
    default:
      console.log('Usage: npm run migrate [command]\n');
      console.log('Commands:');
      console.log('  up       - Run all pending migrations');
      console.log('  status   - Show migration status');
      console.log('  history  - Show available migrations');
      console.log('  verify   - Verify database schema');
      console.log('  help     - Show this help message\n');
      break;
  }
}

function listMigrations() {
  migrations.forEach((migration) => {
    const lineCount = migration.sql.split('\n').length;
    console.log(`  v${migration.version} - ${migration.name} (${lineCount} lines)`);
  });
  console.log(`\nTotal migrations: ${migrations.length}`);
}

main().catch(console.error);
