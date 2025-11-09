/**
 * Database Migration Runner
 * 
 * Manages D1 schema migrations with version tracking
 * 
 * @module workers/lib/migrations
 * @version 1.0.0
 */

import { createLogger } from './logger';

const logger = createLogger('Migrations');

export interface Migration {
  version: number;
  name: string;
  sql: string;
}

export interface MigrationResult {
  version: number;
  name: string;
  success: boolean;
  error?: string;
}

/**
 * Get current schema version from database
 */
export async function getCurrentVersion(db: D1Database): Promise<number> {
  try {
    // Check if migrations table exists
    const tableCheck = await db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations'"
      )
      .first();

    if (!tableCheck) {
      // No migrations table, version 0
      return 0;
    }

    // Get latest version
    const result = await db
      .prepare('SELECT MAX(version) as version FROM schema_migrations')
      .first<{ version: number }>();

    return result?.version || 0;
  } catch (error) {
    logger.error('Failed to get current schema version', error);
    return 0;
  }
}

/**
 * Run pending migrations
 */
export async function runMigrations(
  db: D1Database,
  migrations: Migration[]
): Promise<MigrationResult[]> {
  const currentVersion = await getCurrentVersion(db);
  logger.info(`Current schema version: ${currentVersion}`);

  const pendingMigrations = migrations.filter((m) => m.version > currentVersion);

  if (pendingMigrations.length === 0) {
    logger.info('No pending migrations');
    return [];
  }

  logger.info(`Running ${pendingMigrations.length} pending migrations`);

  const results: MigrationResult[] = [];

  for (const migration of pendingMigrations.sort((a, b) => a.version - b.version)) {
    try {
      logger.info(`Applying migration ${migration.version}: ${migration.name}`);

      // Execute migration SQL
      await db.exec(migration.sql);

      results.push({
        version: migration.version,
        name: migration.name,
        success: true,
      });

      logger.info(`✓ Migration ${migration.version} applied successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      logger.error(`✗ Migration ${migration.version} failed`, error);

      results.push({
        version: migration.version,
        name: migration.name,
        success: false,
        error: errorMessage,
      });

      // Stop on first failure
      break;
    }
  }

  return results;
}

/**
 * Rollback to specific version (if supported)
 * Note: D1 doesn't support transactions, so rollbacks are manual
 */
export async function rollbackToVersion(
  db: D1Database,
  targetVersion: number
): Promise<void> {
  logger.warn(`Rollback requested to version ${targetVersion}`);
  logger.warn('Note: D1 does not support automatic rollbacks. Manual intervention required.');
  
  // Log current state
  const currentVersion = await getCurrentVersion(db);
  logger.info(`Current version: ${currentVersion}, Target version: ${targetVersion}`);
  
  throw new Error(
    'Automatic rollback not supported. Please restore from backup or apply reverse migration.'
  );
}

/**
 * Get migration history
 */
export async function getMigrationHistory(
  db: D1Database
): Promise<Array<{ version: number; name: string; applied_at: number }>> {
  try {
    const result = await db
      .prepare('SELECT version, name, applied_at FROM schema_migrations ORDER BY version')
      .all<{ version: number; name: string; applied_at: number }>();

    return result.results || [];
  } catch (error) {
    logger.error('Failed to get migration history', error);
    return [];
  }
}

/**
 * Verify database schema integrity
 */
export async function verifySchema(db: D1Database): Promise<{
  valid: boolean;
  tables: string[];
  errors: string[];
}> {
  const errors: string[] = [];
  const tables: string[] = [];

  try {
    // Get all tables
    const result = await db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all<{ name: string }>();

    tables.push(...(result.results?.map((r) => r.name) || []));

    // Check required tables
    const requiredTables = [
      'schema_migrations',
      'workflows',
      'executions',
      'task_results',
    ];

    for (const table of requiredTables) {
      if (!tables.includes(table)) {
        errors.push(`Missing required table: ${table}`);
      }
    }

    return {
      valid: errors.length === 0,
      tables,
      errors,
    };
  } catch (error) {
    logger.error('Schema verification failed', error);
    return {
      valid: false,
      tables,
      errors: ['Schema verification failed'],
    };
  }
}
