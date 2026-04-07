import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  date,
  real,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { dataSources, sourceArtifacts, importJobs } from './sources';
import { metricDefinitions } from './metrics';

// ── Observations ───────────────────────────────────────────────────────────────

export const observations = pgTable(
  'observations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    metricCode: varchar('metric_code', { length: 50 }).notNull(),
    category: varchar('category', { length: 50 }).notNull(),
    valueNumeric: real('value_numeric'),
    valueText: text('value_text'),
    unit: varchar('unit', { length: 50 }),
    referenceRangeLow: real('reference_range_low'),
    referenceRangeHigh: real('reference_range_high'),
    referenceRangeText: text('reference_range_text'),
    isAbnormal: boolean('is_abnormal'),
    status: varchar('status', { length: 20 }).notNull().default('extracted'),
    confidenceScore: real('confidence_score'),
    observedAt: timestamp('observed_at').notNull(),
    reportedAt: timestamp('reported_at'),
    dataSourceId: uuid('data_source_id').references(() => dataSources.id),
    sourceArtifactId: uuid('source_artifact_id').references(
      () => sourceArtifacts.id,
    ),
    importJobId: uuid('import_job_id').references(() => importJobs.id),
    originalValueNumeric: real('original_value_numeric'),
    originalValueText: text('original_value_text'),
    originalUnit: varchar('original_unit', { length: 50 }),
    correctionNote: text('correction_note'),
    metadataJson: jsonb('metadata_json'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    index('observations_user_category_idx').on(table.userId, table.category),
    index('observations_user_metric_observed_idx').on(
      table.userId,
      table.metricCode,
      table.observedAt,
    ),
    index('observations_user_observed_idx').on(table.userId, table.observedAt),
  ],
);

// ── Relations ──────────────────────────────────────────────────────────────────

export const observationsRelations = relations(observations, ({ one }) => ({
  user: one(users, {
    fields: [observations.userId],
    references: [users.id],
  }),
  dataSource: one(dataSources, {
    fields: [observations.dataSourceId],
    references: [dataSources.id],
  }),
  sourceArtifact: one(sourceArtifacts, {
    fields: [observations.sourceArtifactId],
    references: [sourceArtifacts.id],
  }),
  importJob: one(importJobs, {
    fields: [observations.importJobId],
    references: [importJobs.id],
  }),
}));

// ── Flagged Extractions ───────────────────────────────────────────────────────

export const flaggedExtractions = pgTable(
  'flagged_extractions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    importJobId: uuid('import_job_id')
      .notNull()
      .references(() => importJobs.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    analyte: text('analyte').notNull(),
    valueNumeric: real('value_numeric'),
    valueText: text('value_text'),
    unit: varchar('unit', { length: 50 }),
    referenceRangeLow: real('reference_range_low'),
    referenceRangeHigh: real('reference_range_high'),
    referenceRangeText: text('reference_range_text'),
    isAbnormal: boolean('is_abnormal'),
    observedAt: date('observed_at'),
    flagReason: text('flag_reason').notNull(),
    flagDetails: text('flag_details'),
    resolved: boolean('resolved').notNull().default(false),
    resolvedMetricCode: varchar('resolved_metric_code', { length: 50 }).references(
      () => metricDefinitions.id,
    ),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    importJobIdx: index('idx_flagged_import_job').on(table.importJobId),
  }),
);
