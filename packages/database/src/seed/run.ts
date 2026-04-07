import { getDb } from "../client";
import {
  metricDefinitions,
  unitConversions,
  referenceRanges,
  optimalRanges,
} from "../schema/metrics";
import { shareTemplates } from "../schema/sharing";
import {
  labProviders,
  panelTemplates,
  panelTemplateMetrics,
} from "../schema/testing";
import { metricDefinitionSeeds } from "./data/metric-definitions";
import { referenceRangeSeeds } from "./data/reference-ranges";
import { optimalRangeSeeds } from "./data/optimal-ranges";
import { labProviderSeeds } from "./data/lab-providers";
import {
  panelTemplateSeeds,
  panelTemplateMetricSeeds,
} from "./data/panel-templates";
import {
  additionalMetricSeeds,
  aliasUpdates,
  displayPrecisionOverrides,
} from "./data/romanian-lab-supplements";
import { eq, sql } from "drizzle-orm";

async function main() {
  const db = getDb();

  console.log("Seeding metric definitions...");
  await db
    .insert(metricDefinitions)
    .values(metricDefinitionSeeds)
    .onConflictDoNothing();

  console.log("Seeding reference ranges...");
  await db
    .insert(referenceRanges)
    .values(referenceRangeSeeds)
    .onConflictDoNothing();

  console.log("Seeding optimal ranges...");
  await db
    .insert(optimalRanges)
    .values(optimalRangeSeeds)
    .onConflictDoNothing();

  console.log("Seeding unit conversions...");
  await db
    .insert(unitConversions)
    .values([
      // Imperial/metric basics
      { fromUnit: "lb", toUnit: "kg", metricCode: null, multiplier: 0.4536, offset: 0 },
      { fromUnit: "in", toUnit: "cm", metricCode: null, multiplier: 2.54, offset: 0 },
      { fromUnit: "F", toUnit: "C", metricCode: null, multiplier: 0.5556, offset: -17.7778 },
      // Chemistry conversions
      { fromUnit: "mg/dL", toUnit: "mmol/L", metricCode: "glucose", multiplier: 0.0555, offset: 0 },
      { fromUnit: "mg/dL", toUnit: "mmol/L", metricCode: "cholesterol_total", multiplier: 0.0259, offset: 0 },
      { fromUnit: "mg/dL", toUnit: "mg/L", metricCode: "crp", multiplier: 10, offset: 0 },
      { fromUnit: "mg/dL", toUnit: "mg/L", metricCode: "hs_crp", multiplier: 10, offset: 0 },
      { fromUnit: "mg/L", toUnit: "mcg/dL", metricCode: "zinc", multiplier: 100, offset: 0 },
      { fromUnit: "ng/mL", toUnit: "ng/dL", metricCode: "total_t3", multiplier: 100, offset: 0 },
      // Hematology: /mm³ to K/uL or M/uL
      { fromUnit: "/mm³", toUnit: "K/uL", metricCode: "wbc", multiplier: 0.001, offset: 0 },
      { fromUnit: "/mm³", toUnit: "K/uL", metricCode: "platelets", multiplier: 0.001, offset: 0 },
      { fromUnit: "/mm³", toUnit: "M/uL", metricCode: "rbc", multiplier: 0.000001, offset: 0 },
      { fromUnit: "/mm³", toUnit: "K/uL", metricCode: "neutrophils_abs", multiplier: 0.001, offset: 0 },
      { fromUnit: "/mm³", toUnit: "K/uL", metricCode: "lymphocytes_abs", multiplier: 0.001, offset: 0 },
      { fromUnit: "/mm³", toUnit: "K/uL", metricCode: "monocytes_abs", multiplier: 0.001, offset: 0 },
      { fromUnit: "/mm³", toUnit: "K/uL", metricCode: "eosinophils_abs", multiplier: 0.001, offset: 0 },
      { fromUnit: "/mm³", toUnit: "K/uL", metricCode: "basophils_abs", multiplier: 0.001, offset: 0 },
      // Medisim/Synlab format: 10^3/ul = K/uL, 10^6/uL = M/uL
      { fromUnit: "10^3/ul", toUnit: "K/uL", metricCode: null, multiplier: 1, offset: 0 },
      { fromUnit: "10^3/uL", toUnit: "K/uL", metricCode: null, multiplier: 1, offset: 0 },
      { fromUnit: "10^6/ul", toUnit: "M/uL", metricCode: null, multiplier: 1, offset: 0 },
      { fromUnit: "10^6/uL", toUnit: "M/uL", metricCode: null, multiplier: 1, offset: 0 },
      // Insulin unit variants
      { fromUnit: "mU/L", toUnit: "uIU/mL", metricCode: "insulin", multiplier: 1, offset: 0 },
      { fromUnit: "\u03BCU/mL", toUnit: "uIU/mL", metricCode: "insulin", multiplier: 1, offset: 0 },
      { fromUnit: "\u00B5U/mL", toUnit: "uIU/mL", metricCode: "insulin", multiplier: 1, offset: 0 },
      // TSH unit variants
      { fromUnit: "uUI/mL", toUnit: "mIU/L", metricCode: "tsh", multiplier: 1, offset: 0 },
      // Unicode micro sign (μ/µ) → ASCII equivalents
      { fromUnit: "\u03BCg/dL", toUnit: "mcg/dL", metricCode: null, multiplier: 1, offset: 0 },
      { fromUnit: "\u00B5g/dL", toUnit: "mcg/dL", metricCode: null, multiplier: 1, offset: 0 },
      { fromUnit: "\u03BCUI/mL", toUnit: "mIU/L", metricCode: null, multiplier: 1, offset: 0 },
      { fromUnit: "\u00B5UI/mL", toUnit: "mIU/L", metricCode: null, multiplier: 1, offset: 0 },
      { fromUnit: "\u03BCmol/L", toUnit: "umol/L", metricCode: null, multiplier: 1, offset: 0 },
      { fromUnit: "\u00B5mol/L", toUnit: "umol/L", metricCode: null, multiplier: 1, offset: 0 },
      // Case-insensitive unit aliases
      { fromUnit: "UI/mL", toUnit: "IU/mL", metricCode: null, multiplier: 1, offset: 0 },
      { fromUnit: "mg/dl", toUnit: "mg/dL", metricCode: null, multiplier: 1, offset: 0 },
      { fromUnit: "ug/dl", toUnit: "mcg/dL", metricCode: null, multiplier: 1, offset: 0 },
      { fromUnit: "ug/dL", toUnit: "mcg/dL", metricCode: null, multiplier: 1, offset: 0 },
      { fromUnit: "ng/ml", toUnit: "ng/mL", metricCode: null, multiplier: 1, offset: 0 },
      { fromUnit: "pg/ml", toUnit: "pg/mL", metricCode: null, multiplier: 1, offset: 0 },
      { fromUnit: "g/dl", toUnit: "g/dL", metricCode: null, multiplier: 1, offset: 0 },
      { fromUnit: "fl", toUnit: "fL", metricCode: null, multiplier: 1, offset: 0 },
      // Vitamin D: µg/L = ng/mL
      { fromUnit: "\u00B5g/L", toUnit: "ng/mL", metricCode: "vitamin_d", multiplier: 1, offset: 0 },
      { fromUnit: "\u03BCg/L", toUnit: "ng/mL", metricCode: "vitamin_d", multiplier: 1, offset: 0 },
      // Albumin: g/L → g/dL
      { fromUnit: "g/L", toUnit: "g/dL", metricCode: "albumin", multiplier: 0.1, offset: 0 },
      // MCV/MPV: µm3 = fL
      { fromUnit: "\u00B5m3", toUnit: "fL", metricCode: null, multiplier: 1, offset: 0 },
      { fromUnit: "\u03BCm3", toUnit: "fL", metricCode: null, multiplier: 1, offset: 0 },
      { fromUnit: "um3", toUnit: "fL", metricCode: null, multiplier: 1, offset: 0 },
      // ApoA1: g/L → mg/dL
      { fromUnit: "g/L", toUnit: "mg/dL", metricCode: "apoa1", multiplier: 100, offset: 0 },
      // LH: mUI/mL = mIU/mL
      { fromUnit: "mUI/mL", toUnit: "mIU/mL", metricCode: null, multiplier: 1, offset: 0 },
      // x10^3/µL = K/uL, x10^6/µL = M/uL (Medisim format with superscript)
      { fromUnit: "x10^3/\u00B5L", toUnit: "K/uL", metricCode: null, multiplier: 1, offset: 0 },
      { fromUnit: "x10^3/uL", toUnit: "K/uL", metricCode: null, multiplier: 1, offset: 0 },
      { fromUnit: "x10^6/\u00B5L", toUnit: "M/uL", metricCode: null, multiplier: 1, offset: 0 },
      { fromUnit: "x10^6/uL", toUnit: "M/uL", metricCode: null, multiplier: 1, offset: 0 },
    ])
    .onConflictDoNothing();

  console.log("Seeding share templates...");
  await db
    .insert(shareTemplates)
    .values([
      {
        id: "clinician",
        name: "Clinician",
        description: "Full clinical data sharing for your doctor or specialist",
        categories: [
          "lab_result",
          "vital_sign",
          "medication",
          "condition",
          "encounter",
          "imaging",
          "dental",
          "wearable",
        ],
        defaultAccessLevel: "view_download",
        sortOrder: 1,
      },
      {
        id: "nutritionist",
        name: "Nutritionist",
        description:
          "Lab results, vitals, and medications for dietary guidance",
        categories: ["lab_result", "vital_sign", "medication"],
        defaultAccessLevel: "view",
        sortOrder: 2,
      },
      {
        id: "fitness_coach",
        name: "Fitness Coach",
        description: "Vital signs and wearable data for training optimization",
        categories: ["vital_sign", "wearable"],
        defaultAccessLevel: "view",
        sortOrder: 3,
      },
      {
        id: "family",
        name: "Family Member",
        description: "Key health information for a trusted family member",
        categories: ["lab_result", "vital_sign", "medication", "condition"],
        defaultAccessLevel: "view",
        sortOrder: 4,
      },
      {
        id: "dental",
        name: "Dental Provider",
        description: "Dental and encounter records for your dentist",
        categories: ["dental", "encounter"],
        defaultAccessLevel: "view",
        sortOrder: 5,
      },
    ])
    .onConflictDoNothing();

  console.log("Seeding lab providers...");
  await db.insert(labProviders).values(labProviderSeeds).onConflictDoNothing();

  console.log("Seeding panel templates...");
  await db
    .insert(panelTemplates)
    .values(panelTemplateSeeds)
    .onConflictDoNothing();

  console.log("Seeding panel template metrics...");
  await db
    .insert(panelTemplateMetrics)
    .values(panelTemplateMetricSeeds)
    .onConflictDoNothing();

  // ── Romanian/EU lab supplements ────────────────────────────────────────
  console.log("Seeding additional metric definitions (Romanian/EU labs)...");
  await db
    .insert(metricDefinitions)
    .values(additionalMetricSeeds)
    .onConflictDoNothing();

  console.log("Applying alias updates...");
  for (const [metricId, newAliases] of Object.entries(aliasUpdates)) {
    await db
      .update(metricDefinitions)
      .set({
        aliases: sql`${metricDefinitions.aliases}::jsonb || ${JSON.stringify(newAliases)}::jsonb`,
      })
      .where(eq(metricDefinitions.id, metricId));
  }

  console.log("Applying display precision overrides...");
  for (const [metricId, precision] of Object.entries(displayPrecisionOverrides)) {
    await db
      .update(metricDefinitions)
      .set({ displayPrecision: precision })
      .where(eq(metricDefinitions.id, metricId));
  }

  console.log("Seed completed successfully.");
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
