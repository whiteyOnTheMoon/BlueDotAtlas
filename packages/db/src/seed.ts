import { openDatabase } from './client.js';
import { seedDatabase } from './seed-data.js';

async function main() {
  const connection = openDatabase();
  try {
    await seedDatabase(connection);
    process.stdout.write('Idempotent app metadata seed completed.\n');
  } finally {
    await connection.pool.end();
  }
}

main().catch((error: unknown) => {
  process.stderr.write('Database seed failed. Check environment configuration.\n');
  if (process.env.NODE_ENV === 'development' && error instanceof Error) {
    process.stderr.write(error.message + '\n');
  }
  process.exitCode = 1;
});
