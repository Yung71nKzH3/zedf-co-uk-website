// Safe Cloudflare D1 Database Accessor
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1ExecResult>;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run(): Promise<D1Result<unknown>>;
  all<T = unknown>(): Promise<D1Result<T>>;
}

export interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  meta?: any;
  error?: string;
}

export interface D1ExecResult {
  count: number;
  duration: number;
}

/**
 * Safely resolves the D1 database binding across Cloudflare Workers runtime,
 * workerd global scope, and development environments.
 */
export async function getD1(): Promise<D1Database | null> {
  // 1. Global worker environment (injected by worker/index.ts in Cloudflare Workers)
  if (typeof globalThis !== 'undefined') {
    const g = globalThis as any;
    if (g.env?.DB) return g.env.DB as D1Database;
    if (g.DB) return g.DB as D1Database;
    if (g.__env__?.DB) return g.__env__.DB as D1Database;
  }

  // 3. Process environment fallback
  if (typeof process !== 'undefined') {
    const p = process as any;
    if (p.env?.DB) return p.env.DB as D1Database;
  }

  return null;
}
