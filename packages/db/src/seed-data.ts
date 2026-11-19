import { appMetadata } from './schema.js';
import type { ReturnTypeOfOpenDatabase } from './types.js';

/** Seed is repeatable. It is public, non-secret app metadata only. */
export async function seedDatabase({ db }: ReturnTypeOfOpenDatabase) {
  await db
    .insert(appMetadata)
    .values({ key: 'application', value: 'BlueDotAtlas' })
    .onConflictDoNothing({ target: appMetadata.key });
}
