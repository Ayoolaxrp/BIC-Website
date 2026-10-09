// ============================================================================
// BIC — run SQL files against the Supabase Postgres database (dev tool)
// ============================================================================
// Usage:
//   npm run db:apply                       (all of supabase/migrations, in order)
//   node scripts/run-sql.cjs <file|folder> [...]
//
// Connection: SUPABASE_DB_URL (a postgresql:// URI) from the environment or,
// if unset, from the local .env file. The legacy PGHOST/PGPASSWORD/... vars
// also work. The password is never printed.
//
// Each file runs as one multi-statement query (the migrations are idempotent).
// ============================================================================
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

function fromDotEnv(key) {
  const file = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(file)) return '';
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && m[1] === key) return m[2].replace(/^['"]|['"]$/g, '');
  }
  return '';
}

const url = process.env.SUPABASE_DB_URL || fromDotEnv('SUPABASE_DB_URL');
const { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

// Supabase's server certificate chains to Supabase's own CA, which is not in
// Node's default store; without the CA file, verification would always fail.
// To verify, download the CA from Project Settings > Database and set
// SUPABASE_DB_CA=/path/to/prod-ca-2021.crt.
const caFile = process.env.SUPABASE_DB_CA || fromDotEnv('SUPABASE_DB_CA');
const ssl = caFile ? { ca: fs.readFileSync(caFile, 'utf8'), rejectUnauthorized: true } : { rejectUnauthorized: false };

let config;
if (url) {
  config = { connectionString: url, ssl };
} else if (PGHOST && PGPASSWORD) {
  config = { host: PGHOST, port: Number(PGPORT || 5432), database: PGDATABASE || 'postgres', user: PGUSER || 'postgres', password: PGPASSWORD, ssl };
} else {
  console.error('No database connection: set SUPABASE_DB_URL in .env (see supabase/SETUP.md).');
  process.exit(1);
}
const host = url ? new URL(url).hostname : PGHOST;

const files = process.argv.slice(2).flatMap((arg) =>
  fs.existsSync(arg) && fs.statSync(arg).isDirectory()
    ? fs.readdirSync(arg).filter((f) => f.endsWith('.sql')).sort().map((f) => path.join(arg, f))
    : [arg],
);
if (!files.length) {
  console.error('Usage: node scripts/run-sql.cjs <sqlfile|folder> [...]');
  process.exit(1);
}

const client = new Client(config);

(async () => {
  await client.connect();
  console.log(`connected to ${host}${caFile ? ' (TLS verified)' : ''}`);

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
  // Never echo the connection string; pg error messages do not include it.
  console.error('FAILED:', err.message);
  process.exit(1);
});
