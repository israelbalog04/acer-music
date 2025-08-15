export function getDatabaseUrlWithPgBouncer(): string {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  // Only apply for PostgreSQL URLs
  const isPostgres = rawUrl.startsWith('postgres://') || rawUrl.startsWith('postgresql://');
  if (!isPostgres) {
    return rawUrl;
  }

  if (rawUrl.includes('pgbouncer=true')) {
    return rawUrl;
  }

  const separator = rawUrl.includes('?') ? '&' : '?';
  return `${rawUrl}${separator}pgbouncer=true`;
}


