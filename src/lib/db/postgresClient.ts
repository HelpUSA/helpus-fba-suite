import { Pool, PoolClient } from 'pg';

let globalPool: Pool | null = null;

export function isPostgresConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}

export function getPostgresPool(): Pool {
  if (globalPool) {
    return globalPool;
  }

  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error('[PostgresClient] Nenhuma variável de conexão (DATABASE_URL ou POSTGRES_URL) configurada.');
  }

  const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
  
  globalPool = new Pool({
    connectionString,
    ssl: connectionString.includes('localhost') || connectionString.includes('127.0.0.1')
      ? false
      : { rejectUnauthorized: false },
    max: isProduction ? 10 : 3,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  globalPool.on('error', (err) => {
    console.error('[PostgresClient] Erro inesperado no pool de conexões:', err);
  });

  return globalPool;
}

/**
 * Executes a callback within a managed PostgreSQL transaction with ACID guarantees.
 * If any query fails, ROLLBACK is issued automatically and the error is re-thrown.
 */
export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const pool = getPostgresPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Health check for PostgreSQL connection.
 */
export async function checkPostgresHealth(): Promise<{ ok: boolean; timestamp?: string; error?: string }> {
  if (!isPostgresConfigured()) {
    return { ok: false, error: 'DATABASE_URL_NOT_CONFIGURED' };
  }

  try {
    const pool = getPostgresPool();
    const res = await pool.query('SELECT NOW() as db_time');
    return { ok: true, timestamp: res.rows[0]?.db_time };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Falha ao conectar no PostgreSQL' };
  }
}
