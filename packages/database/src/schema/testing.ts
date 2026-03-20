import {
  pgTable,
  varchar,
  text,
  boolean,
  integer,
  serial,
  unique,
  index,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { metricDefinitions } from "./metrics";

// ── Lab Providers ────────────────────────────────────────────────────────────

export const labProviders = pgTable("lab_providers", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  website: text("website"),
  locationFinderUrl: text("location_finder_url"),
  supportsWalkIn: boolean("supports_walk_in").default(true),
  supportsInsurance: boolean("supports_insurance").default(true),
  supportsDirectAccess: boolean("supports_direct_access").default(true),
  priceRange: varchar("price_range", { length: 20 }),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Panel Templates ──────────────────────────────────────────────────────────

export const panelTemplates = pgTable(
  "panel_templates",
  {
    id: varchar("id", { length: 50 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 50 }).notNull(),
    estimatedCostLow: integer("estimated_cost_low"),
    estimatedCostHigh: integer("estimated_cost_high"),
    targetSex: varchar("target_sex", { length: 10 }),
    sortOrder: integer("sort_order").default(0),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [index("panel_templates_category_idx").on(table.category)],
);

// ── Panel Template Metrics ───────────────────────────────────────────────────

export const panelTemplateMetrics = pgTable(
  "panel_template_metrics",
  {
    id: serial("id").primaryKey(),
    panelId: varchar("panel_id", { length: 50 })
      .notNull()
      .references(() => panelTemplates.id),
    metricCode: varchar("metric_code", { length: 50 })
      .notNull()
      .references(() => metricDefinitions.id),
    isCore: boolean("is_core").default(true),
    sortOrder: integer("sort_order").default(0),
  },
  (table) => [
    unique("panel_template_metrics_panel_metric_uniq").on(
      table.panelId,
      table.metricCode,
    ),
  ],
);

// ── User Retest Settings ─────────────────────────────────────────────────────

export const userRetestSettings = pgTable(
  "user_retest_settings",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    metricCode: varchar("metric_code", { length: 50 })
      .notNull()
      .references(() => metricDefinitions.id),
    retestIntervalDays: integer("retest_interval_days").notNull(),
    isPaused: boolean("is_paused").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    unique("user_retest_settings_user_metric_uniq").on(
      table.userId,
      table.metricCode,
    ),
  ],
);
