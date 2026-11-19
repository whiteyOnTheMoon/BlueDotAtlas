import { pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

/** A minimal operational table for migration/ORM verification.
 * VideoProject, Job and editorial data models belong to Roadmap 024.
 */
export const appMetadata = pgTable(
  'app_metadata',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    key: text('key').notNull(),
    value: text('value').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [uniqueIndex('app_metadata_key_unique').on(table.key)],
);
