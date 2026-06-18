import { createClient, Client } from '@libsql/client';

let client: Client | null = null;

/**
 * Safely masks a string for logging (shows first 4 and last 4 chars)
 */
function mask(str: string | undefined): string {
  if (!str) return 'undefined';
  if (str.length <= 8) return '****';
  return `${str.substring(0, 4)}...${str.substring(str.length - 4)}`;
}

/**
 * Initializes and returns the Turso client.
 */
export function getTursoClient(): Client {
  if (client) return client;

  // Try both prefixed and non-prefixed as Next.js can be picky
  let url = process.env.TURSO_CONNECTION_URL || process.env.NEXT_PUBLIC_TURSO_CONNECTION_URL;
  let authToken = process.env.TURSO_AUTH_TOKEN || process.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN;

  // Clean values (remove quotes if any, and trim)
  url = url?.replace(/^["']|["']$/g, '').trim();
  authToken = authToken?.replace(/^["']|["']$/g, '').trim();

  console.log('[Turso Debug] Initializing Client:');
  console.log(`  - URL: ${mask(url)} (Length: ${url?.length || 0})`);
  console.log(`  - Token: ${mask(authToken)} (Length: ${authToken?.length || 0})`);

  if (!url) {
    throw new Error('TURSO_CONNECTION_URL is not defined in .env.local');
  }

  // Remote Turso URLs (libsql:// or https://) MUST have a token
  if (url.startsWith('libsql') || url.startsWith('http')) {
    if (!authToken) {
      console.warn('[Turso Debug] WARNING: Remote connection detected but no Auth Token provided.');
    }
  }

  client = createClient({
    url: url,
    authToken: authToken,
  });

  return client;
}

/**
 * Executes a query and returns the raw result.
 */
export async function executeQuery(sql: string, args: unknown[] = []) {
  const db = getTursoClient();
  
  // Normalize args: replace undefined with null since libSQL doesn't support undefined
  const normalizedArgs = args.map(arg => arg === undefined ? null : arg);
  
  try {
    return await db.execute({ sql, args: normalizedArgs as any });
  } catch (error) {
    console.error(`Database Query Error: ${sql}`, error);
    throw error;
  }
}

/**
 * Retrieves a single row from the database.
 */
export async function getOne<T>(sql: string, args: unknown[] = []): Promise<T | null> {
  const result = await executeQuery(sql, args);
  if (result.rows.length === 0) return null;
  return result.rows[0] as unknown as T;
}

/**
 * Retrieves multiple rows from the database.
 */
export async function getMany<T>(sql: string, args: unknown[] = []): Promise<T[]> {
  const result = await executeQuery(sql, args);
  return result.rows as unknown as T[];
}

/**
 * Executes an INSERT, UPDATE, or DELETE action.
 */
export async function executeAction(sql: string, args: unknown[] = []) {
  return await executeQuery(sql, args);
}

/**
 * Executes multiple SQL statements in a batch.
 */
export async function executeBatch(statements: { sql: string; args: unknown[] }[]) {
  const db = getTursoClient();
  try {
    return await db.batch(statements as any, "write");
  } catch (error) {
    console.error('Database Batch Error', error);
    throw error;
  }
}

/**
 * Performs a simple health check to verify database connectivity.
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await executeQuery('SELECT 1 as health');
    return result.rows.length > 0;
  } catch (error) {
    console.error('Database Health Check Failed', error);
    return false;
  }
}
