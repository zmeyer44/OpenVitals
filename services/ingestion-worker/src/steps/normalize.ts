import { getDb } from '@openvitals/database/client';
import { importJobs, metricDefinitions, unitConversions, referenceRanges, users } from '@openvitals/database';
import { eq } from 'drizzle-orm';
import type { WorkflowContext } from '../workflow';
import type { RawExtraction, NormalizationResult } from '@openvitals/ingestion';
import { normalizeExtractions } from '@openvitals/ingestion';
import type { UserDemographics, DemographicRange } from '@openvitals/ingestion';

export interface NormalizeOutput {
  result: NormalizationResult;
  metricDefs: any[];
  unitConversions: any[];
  demographics: any;
}

export async function normalize(
  ctx: WorkflowContext,
  extractions: RawExtraction[]
): Promise<NormalizeOutput> {
  const db = getDb();

  await db.update(importJobs)
    .set({ status: 'normalizing' })
    .where(eq(importJobs.id, ctx.importJobId));

  console.log(`[normalize] Normalizing ${extractions.length} extractions for job=${ctx.importJobId}`);

  // Fetch metric definitions from database
  const metrics = await db.select().from(metricDefinitions);
  const conversions = await db.select().from(unitConversions);

  // Fetch reference ranges and group by metric code
  const ranges = await db.select().from(referenceRanges);
  const rangesByMetric = new Map<string, DemographicRange[]>();
  for (const r of ranges) {
    const existing = rangesByMetric.get(r.metricCode) ?? [];
    existing.push({
      sex: r.sex,
      ageMin: r.ageMin,
      ageMax: r.ageMax,
      rangeLow: r.rangeLow,
      rangeHigh: r.rangeHigh,
    });
    rangesByMetric.set(r.metricCode, existing);
  }

  // Fetch user demographics
  let demographics: UserDemographics | null = null;
  const [user] = await db
    .select({ dateOfBirth: users.dateOfBirth, biologicalSex: users.biologicalSex })
    .from(users)
    .where(eq(users.id, ctx.userId))
    .limit(1);

  if (user) {
    let ageInYears: number | null = null;
    if (user.dateOfBirth) {
      const dob = new Date(user.dateOfBirth);
      const now = new Date();
      ageInYears = now.getFullYear() - dob.getFullYear();
      const monthDiff = now.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
        ageInYears--;
      }
    }
    demographics = {
      sex: user.biologicalSex ?? null,
      ageInYears,
    };
  }

  const metricDefs = metrics.map((m) => ({
    id: m.id,
    name: m.name,
    category: m.category,
    unit: m.unit,
    aliases: (m.aliases as string[]) ?? [],
    referenceRangeLow: m.referenceRangeLow,
    referenceRangeHigh: m.referenceRangeHigh,
    demographicRanges: rangesByMetric.get(m.id),
  }));

  const unitConvs = conversions.map((c) => ({
    fromUnit: c.fromUnit,
    toUnit: c.toUnit,
    metricCode: c.metricCode,
    multiplier: c.multiplier,
    offset: c.offset,
  }));

  await db.update(importJobs)
    .set({ normalizeCompletedAt: new Date() })
    .where(eq(importJobs.id, ctx.importJobId));

  const result = normalizeExtractions(extractions, metricDefs, unitConvs, 0.85, demographics);

  // Log flagged extractions for debugging
  if (result.flagged.length > 0) {
    console.log(`[normalize] Flagged ${result.flagged.length} extractions:`);
    for (const f of result.flagged) {
      console.log(`  - "${f.extraction.analyte}" (${f.reason}): ${f.details}`);
    }
  }

  return { result, metricDefs, unitConversions: unitConvs, demographics };
}
