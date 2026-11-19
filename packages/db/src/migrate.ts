import { openDatabase } from './client.js';
import { migrateDatabase } from './migrations.js';

async function main() {
  const connection = openDatabase();
  try {
    await migrateDatabase(connection);
    process.stdout.write('Migrations applied; Drizzle journal updated.\n');
  } finally {
    await connection.pool.end();
  }
}

main().catch((error: unknown) => {
  process.stderr.write('Database migration failed. Check local configuration and migration logs.\n');
  if (process.env.NODE_ENV === 'development' && error instanceof Error) {
    process.stderr.write(error.message + '\n');
  }
  process.exitCode = 1;
});
