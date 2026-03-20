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
      {
        fromUnit: "mg/dL",
        toUnit: "mmol/L",
        metricCode: "glucose",
        multiplier: 0.0555,
        offset: 0,
      },
      {
        fromUnit: "mg/dL",
        toUnit: "mmol/L",
        metricCode: "cholesterol_total",
        multiplier: 0.0259,
        offset: 0,
      },
      {
        fromUnit: "lb",
        toUnit: "kg",
        metricCode: null,
        multiplier: 0.4536,
        offset: 0,
      },
      {
        fromUnit: "in",
        toUnit: "cm",
        metricCode: null,
        multiplier: 2.54,
        offset: 0,
      },
      {
        fromUnit: "F",
        toUnit: "C",
        metricCode: null,
        multiplier: 0.5556,
        offset: -17.7778,
      },
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
