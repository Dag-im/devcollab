import { execSync } from 'child_process';
import { readdirSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';

async function migrate() {
  const client = new Client({
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT ?? 5432),
    user: process.env.DATABASE_USER ?? 'postgres',
    password: process.env.DATABASE_PASSWORD ?? 'password',
    database: process.env.DATABASE_NAME ?? 'devcollab',
  });

  await client.connect();

  // create tracking table if it doesn't exist
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  // get already-applied migrations
  const applied = await client.query<{ version: string }>(
    'SELECT version FROM schema_migrations ORDER BY version',
  );
  const appliedVersions = new Set(applied.rows.map((r) => r.version));

  // get all migration files sorted
  const migrationsDir = join(__dirname, '../migrations');
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  let ran = 0;
  for (const file of files) {
    if (appliedVersions.has(file)) {
      console.log(`  skip  ${file}`);
      continue;
    }

    console.log(`  apply ${file}`);
    const filePath = join(migrationsDir, file);

    try {
      // use psql for execution — handles CONCURRENTLY and multi-statement files
      execSync(
        `psql -U ${process.env.DATABASE_USER ?? 'postgres'} \
              -h ${process.env.DATABASE_HOST ?? 'localhost'} \
              -d ${process.env.DATABASE_NAME ?? 'devcollab'} \
              -f ${filePath}`,
        {
          env: {
            ...process.env,
            PGPASSWORD: process.env.DATABASE_PASSWORD ?? 'password',
          },
        },
      );

      await client.query(
        'INSERT INTO schema_migrations (version) VALUES ($1)',
        [file],
      );
      ran++;
    } catch (err) {
      console.error(`  FAILED ${file}`);
      console.error(err);
      process.exit(1);
    }
  }

  console.log(`\nDone. ${ran} migration(s) applied.`);
  await client.end();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
