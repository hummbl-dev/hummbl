/**
 * Cloudflare D1 client wrapper for MCP server persistent storage
 * Ported from Python Phase 1C d1_client.py
 */

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<D1Result<T>>;
  run(): Promise<D1Response>;
}

interface D1Result<T> {
  results: T[];
  success: boolean;
  error?: string;
  meta: {
    changed_db: boolean;
    changes: number;
    duration: number;
    last_row_id: number;
    rows_read: number;
    rows_written: number;
  };
}

interface D1Response {
  success: boolean;
  error?: string;
  meta: {
    changed_db: boolean;
    changes: number;
    duration: number;
    last_row_id: number;
    rows_read: number;
    rows_written: number;
  };
}

export class D1Client {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Execute a query and return number of affected rows
   */
  async execute(sql: string, ...params: unknown[]): Promise<number> {
    try {
      const result = await this.db
        .prepare(sql)
        .bind(...params)
        .run();
      if (!result.success) {
        throw new Error(result.error || "D1 execution failed");
      }
      return result.meta.changes;
    } catch (error) {
      console.error("D1 EXECUTE failed", { sql, params, error });
      throw error;
    }
  }

  /**
   * Execute a query and return all results
   */
  async query<T>(sql: string, ...params: unknown[]): Promise<T[]> {
    try {
      const result = await this.db
        .prepare(sql)
        .bind(...params)
        .all<T>();
      if (!result.success) {
        throw new Error(result.error || "D1 query failed");
      }
      return result.results as T[];
    } catch (error) {
      console.error("D1 QUERY failed", { sql, params, error });
      throw error;
    }
  }

  /**
   * Execute a query and return first result
   */
  async queryOne<T>(sql: string, ...params: unknown[]): Promise<T | null> {
    try {
      const result = await this.db
        .prepare(sql)
        .bind(...params)
        .first<T>();
      return result as T | null;
    } catch (error) {
      console.error("D1 QUERY_ONE failed", { sql, params, error });
      throw error;
    }
  }

  /**
   * Execute multiple queries in a transaction
   */
  async transaction(queries: Array<{ sql: string; params: unknown[] }>): Promise<boolean> {
    try {
      const statements = queries.map((q) => this.db.prepare(q.sql).bind(...q.params));

      const results = await this.db.batch(statements);
      // batch returns an array of results, check all succeeded
      const allSuccess = results.every((r) => r.success);
      if (!allSuccess) {
        const failed = results.find((r) => !r.success);
        throw new Error(failed?.error || "D1 transaction failed");
      }
      return true;
    } catch (error) {
      console.error("D1 TRANSACTION failed", { queries, error });
      return false;
    }
  }

  /**
   * Run database migrations
   */
  async runMigrations(): Promise<void> {
    // In a real implementation, this would read SQL files from migrationDir
    // and execute them in order. For now, we'll implement basic schema setup.

    const migrations = [
      // Sessions table
      `CREATE TABLE IF NOT EXISTS sessions (
        session_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        adapter_type TEXT NOT NULL,
        created_at TEXT NOT NULL,
        last_active TEXT NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        domain_state TEXT, -- JSON
        total_messages INTEGER NOT NULL DEFAULT 0,
        total_cost_usd REAL NOT NULL DEFAULT 0,
        metadata TEXT -- JSON
      )`,

      // Messages table
      `CREATE TABLE IF NOT EXISTS messages (
        message_id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        tool_calls TEXT, -- JSON array
        tool_call_id TEXT,
        timestamp TEXT NOT NULL,
        metadata TEXT, -- JSON
        FOREIGN KEY (session_id) REFERENCES sessions(session_id)
      )`,

      // Mental models table
      `CREATE TABLE IF NOT EXISTS mental_models (
        code TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        transformation TEXT NOT NULL,
        definition TEXT NOT NULL,
        example TEXT NOT NULL,
        when_to_use TEXT NOT NULL,
        how_to_apply TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        version INTEGER NOT NULL DEFAULT 1
      )`,

      // Indexes for performance
      `CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(last_active)`,
      `CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id)`,
      `CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp)`,
    ];

    for (const migration of migrations) {
      try {
        await this.execute(migration);
        // eslint-disable-next-line no-console
        console.log("Migration executed:", migration.split("\n")[0]);
      } catch (error) {
        console.error("Migration failed:", migration, error);
        throw error;
      }
    }
  }

  /**
   * Get enriched mental model data from database
   */
  async getMentalModel(code: string) {
    const sql = `
      SELECT code, name, transformation, definition, example, when_to_use, how_to_apply
      FROM mental_models
      WHERE code = ?
    `;

    const result = await this.queryOne<{
      code: string;
      name: string;
      transformation: string;
      definition: string;
      example: string;
      when_to_use: string;
      how_to_apply: string;
    }>(sql, code);

    if (!result) {
      return { ok: false, error: { type: "NOT_FOUND", message: `Model ${code} not found in database` } } as const;
    }

    return { ok: true, value: result } as const;
  }
}

/**
 * Create a D1Client instance from a D1Database
 */
export function createD1Client(db: D1Database): D1Client {
  return new D1Client(db);
}
