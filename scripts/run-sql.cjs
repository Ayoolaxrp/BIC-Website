// ============================================================================
// BIC — run SQL files against the Supabase Postgres database (dev tool)
// ============================================================================
// Usage:
//   PGHOST=db.<ref>.supabase.co PGPORT=5432 PGDATABASE=postgres PGUSER=postgres \
//   PGPASSWORD='...' node scripts/run-sql.cjs supabase/schema.review.sql
//
// Runs each file as a single multi-statement query (safe: these files are
// idempotent). Prints a table list afterward as a sanity check.
// ============================================================================
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
if (!PGHOST || !PGPASSWORD) {
  console.error('Missing PG env vars (PGHOST / PGPASSWORD).');
  process.exit(1);
}

const files = process.argv.slice(2);
if (!files.length) {
  console.error('Usage: node scripts/run-sql.cjs <sqlfile> [sqlfile ...]');
  process.exit(1);
}

const client = new Client({
  host: PGHOST,
  port: Number(PGPORT || 5432),
  database: PGDATABASE || 'postgres',
  user: PGUSER || 'postgres',
  password: PGPASSWORD,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();
  console.log(`connected to ${PGHOST}:${PGPORT}/${PGDATABASE} as ${PGUSER}`);

  for (const f of files) {
    const abs = path.resolve(__dirname, '..', f);
    const sql = fs.readFileSync(abs, 'utf8');
    console.log(`--- executing ${f} ---`);
    await client.query(sql);
    console.log(`OK: ${f}`);
  }

  const tables = await client.query(
    `select tablename from pg_tables where schemaname = 'public' order by 1`,
  );
  console.log('public tables:', tables.rows.map((r) => r.tablename).join(', '));

  await client.end();
  console.log('done');
})().catch((err) => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
