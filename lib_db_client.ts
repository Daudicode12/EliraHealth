// src/lib/db/client.ts
// Turso Database Client Initialization

import { createClient, Client } from "@libsql/client";

let tursoClient: Client | null = null;

/**
 * Initialize and get Turso database client
 * Validates environment variables on first call
 */
export function getTursoClient(): Client {
  if (!tursoClient) {
    const url = process.env.TURSO_CONNECTION_URL;
    const token = process.env.TURSO_AUTH_TOKEN;

    if (!url || !token) {
      throw new Error(
        "Missing Turso credentials. Set TURSO_CONNECTION_URL and TURSO_AUTH_TOKEN in .env.local"
      );
    }

    tursoClient = createClient({
      url,
      authToken: token,
    });
  }

  return tursoClient;
}

/**
 * Execute a Turso query and return results
 * @param sql - SQL query string with ? placeholders
 * @param params - Query parameters
 * @returns Array of result rows
 */
export async function executeQuery<T>(
  sql: string,
  params: (string | number | boolean | null)[] = []
): Promise<T[]> {
  try {
    const client = getTursoClient();
    const result = await client.execute({
      sql,
      args: params,
    });

    return (result.rows as T[]) || [];
  } catch (error) {
    console.error("[Turso Query Error]", {
      sql,
      params,
      error: (error as Error).message,
    });
    throw new Error(
      `Database query failed: ${(error as Error).message}`
    );
  }
}

/**
 * Get single row from database
 * @param sql - SQL query string
 * @param params - Query parameters
 * @returns Single row or null
 */
export async function getOne<T>(
  sql: string,
  params: (string | number | boolean | null)[] = []
): Promise<T | null> {
  const results = await executeQuery<T>(sql, params);
  return results[0] || null;
}

/**
 * Get multiple rows from database
 * @param sql - SQL query string
 * @param params - Query parameters
 * @returns Array of rows
 */
export async function getMany<T>(
  sql: string,
  params: (string | number | boolean | null)[] = []
): Promise<T[]> {
  return executeQuery<T>(sql, params);
}

/**
 * Execute INSERT/UPDATE/DELETE statements
 * @param sql - SQL statement
 * @param params - Query parameters
 * @returns Success status and number of changes
 */
export async function executeAction(
  sql: string,
  params: (string | number | boolean | null)[] = []
): Promise<{ success: boolean; changes: number }> {
  try {
    const client = getTursoClient();
    const result = await client.execute({
      sql,
      args: params,
    });

    return {
      success: true,
      changes: result.changes,
    };
  } catch (error) {
    console.error("[Turso Action Error]", {
      sql,
      params,
      error: (error as Error).message,
    });
    throw new Error(
      `Database action failed: ${(error as Error).message}`
    );
  }
}

/**
 * Transaction-like batch execution (execute multiple statements)
 * Note: SQLite/Turso doesn't have true transactions via the REST API,
 * but we can execute statements sequentially
 */
export async function executeBatch(
  statements: Array<{
    sql: string;
    params?: (string | number | boolean | null)[];
  }>
): Promise<{ success: boolean; results: any[] }> {
  const results = [];

  try {
    for (const stmt of statements) {
      const result = await executeAction(stmt.sql, stmt.params);
      results.push(result);
    }

    return {
      success: true,
      results,
    };
  } catch (error) {
    console.error("[Turso Batch Error]", error);
    throw new Error(
      `Batch execution failed: ${(error as Error).message}`
    );
  }
}

/**
 * Health check - verify Turso connection
 */
export async function healthCheck(): Promise<boolean> {
  try {
    await executeQuery("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
