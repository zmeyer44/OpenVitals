-- Migration: Insert missing metric_definitions and optimal_ranges
-- These were previously only in seed data, which doesn't run on deploy.
-- All inserts are idempotent (ON CONFLICT DO NOTHING).

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. Deduplicate existing optimal_ranges (NULL-safe)
-- The unique constraint doesn't catch NULL age_min/age_max/sex duplicates.
-- Keep only the row with the lowest id for each logical group.
-- ══════════════════════════════════════════════════════════════════════════════

DELETE FROM optimal_ranges
WHERE id NOT IN (
  SELECT MIN(id)
  FROM optimal_ranges
  GROUP BY metric_code, COALESCE(sex, '__null__'), COALESCE(age_min, -1), COALESCE(age_max, -1)
);

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. Drop old unique constraint and replace with NULL-safe unique index
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE optimal_ranges DROP CONSTRAINT IF EXISTS optimal_ranges_metric_sex_age_uniq;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS optimal_ranges_metric_sex_age_uniq
  ON optimal_ranges (metric_code, COALESCE(sex, '__null__'), COALESCE(age_min, -1), COALESCE(age_max, -1));

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. Insert missing metric_definitions (alias codes for observation matching)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO metric_definitions (id, name, category, unit, loinc_code, snomed_code, aliases, reference_range_low, reference_range_high, reference_range_text, description, display_precision, sort_order)
VALUES
  ('homa_ir', 'HOMA-IR', 'metabolic', '', NULL, NULL, '["HOMA IR","HOMA-IR index","homeostatic model assessment"]', NULL, 2.5, '<2.5 (optimal <1.0)', 'Insulin resistance index calculated from fasting glucose and insulin', 2, 112),
  ('hba1c', 'Hemoglobin A1c', 'metabolic', '%', '4548-4', NULL, '["HbA1c","A1c","glycated hemoglobin","glycosylated hemoglobin"]', 4.0, 5.6, '4.0-5.6%', 'Hemoglobin A1c (alias for hemoglobin_a1c)', 1, 110),
  ('c_reactive_protein', 'C-Reactive Protein', 'inflammation', 'mg/L', '1988-5', NULL, '["CRP","c reactive protein"]', 0, 3.0, '<3.0 mg/L', 'C-Reactive Protein (alias for crp)', 1, 46),
  ('apolipoprotein_b', 'Apolipoprotein B', 'lipid', 'mg/dL', '1884-6', NULL, '["ApoB","Apo B","apolipoprotein B-100"]', 40, 120, '40-120 mg/dL', 'Apolipoprotein B (alias for apob)', 0, 35),
  ('total_cholesterol', 'Cholesterol, Total', 'lipid', 'mg/dL', '2093-3', NULL, '["total cholesterol","cholesterol total"]', 0, 200, '<200 mg/dL', 'Total Cholesterol (alias for cholesterol_total)', 0, 30),
  ('25_hydroxyvitamin_d', '25-Hydroxyvitamin D', 'vitamin', 'ng/mL', '1989-3', NULL, '["25-OH vitamin D","25-hydroxyvitamin D"]', 30, 100, '30-100 ng/mL', '25-Hydroxyvitamin D (alias for vitamin_d)', 1, 60),
  ('vitamin_d_25_hydroxyvitamin_d', '25-Hydroxyvitamin D', 'vitamin', 'ng/mL', '1989-3', NULL, '["vitamin D 25-hydroxy"]', 30, 100, '30-100 ng/mL', '25-Hydroxyvitamin D (alias for vitamin_d)', 1, 60),
  -- Calculated/derived metric definitions
  ('cholesterol_hdl_ratio', 'Cholesterol/HDL Ratio', 'lipid', '', NULL, NULL, '["total cholesterol to HDL ratio","TC/HDL"]', NULL, 5.0, '<5.0 (optimal <3.5)', 'Ratio of total cholesterol to HDL cholesterol', 1, 36),
  ('triglyceride_hdl_ratio', 'Triglyceride/HDL Ratio', 'lipid', '', NULL, NULL, '["TG/HDL ratio","triglyceride HDL ratio"]', NULL, 2.0, '<2.0 (optimal <1.0)', 'Ratio of triglycerides to HDL cholesterol — insulin resistance marker', 1, 37),
  ('non_hdl_cholesterol', 'Non-HDL Cholesterol', 'lipid', 'mg/dL', NULL, NULL, '["non HDL","non-HDL"]', NULL, 130, '<130 mg/dL', 'Total cholesterol minus HDL cholesterol', 0, 38)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. Insert missing optimal_ranges
-- ══════════════════════════════════════════════════════════════════════════════

-- Metabolic
INSERT INTO optimal_ranges (metric_code, sex, age_min, age_max, range_low, range_high, range_text, source, source_url)
VALUES
  ('glucose', NULL, 18, NULL, 72, 85, '72–85 mg/dL', 'Attia/Outlive', NULL),
  ('hemoglobin_a1c', NULL, 18, NULL, 4.0, 5.2, '4.0–5.2%', 'Attia/Function Health', NULL),
  ('insulin', NULL, 18, NULL, 2.0, 5.0, '2.0–5.0 µIU/mL', 'Attia/Outlive', NULL),
  ('homa_ir', NULL, 18, NULL, 0, 1.0, '<1.0', 'Attia/Outlive', NULL),
  ('hba1c', NULL, 18, NULL, 4.0, 5.2, '4.0–5.2%', 'Attia/Function Health', NULL),

  -- Inflammation
  ('hs_crp', NULL, 18, NULL, 0, 1.0, '<1.0 mg/L', 'AHA/Attia', NULL),
  ('crp', NULL, 18, NULL, 0, 1.0, '<1.0 mg/L', 'AHA/Attia', NULL),
  ('c_reactive_protein', NULL, 18, NULL, 0, 1.0, '<1.0 mg/L', 'AHA/Attia', NULL),
  ('homocysteine', NULL, 18, NULL, 5, 10, '5–10 µmol/L', 'Attia/Function Health', NULL),

  -- Lipids
  ('ldl_cholesterol', NULL, 18, NULL, 0, 70, '<70 mg/dL', 'AHA/Attia', NULL),
  ('hdl_cholesterol', 'male', 18, NULL, 50, 90, '50–90 mg/dL', 'Function Health', NULL),
  ('hdl_cholesterol', 'female', 18, NULL, 60, 90, '60–90 mg/dL', 'Function Health', NULL),
  ('triglycerides', NULL, 18, NULL, 0, 100, '<100 mg/dL', 'Attia/Outlive', NULL),
  ('cholesterol_total', NULL, 18, NULL, 0, 180, '<180 mg/dL', 'AHA', NULL),
  ('apolipoprotein_b', NULL, 18, NULL, 0, 80, '<80 mg/dL', 'Attia/AHA', NULL),
  ('total_cholesterol', NULL, 18, NULL, 0, 180, '<180 mg/dL', 'AHA', NULL),

  -- Vitamins & Minerals
  ('vitamin_d', NULL, 18, NULL, 40, 60, '40–60 ng/mL', 'Huberman/Function Health', NULL),
  ('25_hydroxyvitamin_d', NULL, 18, NULL, 40, 60, '40–60 ng/mL', 'Huberman/Function Health', NULL),
  ('vitamin_d_25_hydroxyvitamin_d', NULL, 18, NULL, 40, 60, '40–60 ng/mL', 'Huberman/Function Health', NULL),
  ('vitamin_b12', NULL, 18, NULL, 500, 900, '500–900 pg/mL', 'Function Health', NULL),
  ('folate', NULL, 18, NULL, 10, 17, '10–17 ng/mL', 'Function Health', NULL),
  ('iron', 'male', 18, NULL, 60, 170, '60–170 µg/dL', 'Function Health', NULL),
  ('iron', 'female', 18, NULL, 50, 150, '50–150 µg/dL', 'Function Health', NULL),
  ('magnesium', NULL, 18, NULL, 2.0, 2.5, '2.0–2.5 mg/dL', 'Function Health', NULL),
  ('zinc', NULL, 18, NULL, 0.7, 1.2, '0.7–1.2 mg/L', 'Function Health', NULL),
  ('ferritin', 'male', 18, NULL, 40, 150, '40–150 ng/mL', 'Attia', NULL),
  ('ferritin', 'female', 18, NULL, 40, 100, '40–100 ng/mL', 'Attia', NULL),

  -- Thyroid
  ('tsh', NULL, 18, NULL, 0.5, 2.5, '0.5–2.5 mIU/L', 'Functional medicine consensus', NULL),
  ('free_t4', NULL, 18, NULL, 1.0, 1.5, '1.0–1.5 ng/dL', 'Functional medicine', NULL),
  ('free_t3', NULL, 18, NULL, 3.0, 4.0, '3.0–4.0 pg/mL', 'Functional medicine', NULL),
  ('tpo_antibodies', NULL, 18, NULL, 0, 9, '<9 IU/mL', 'Functional medicine', NULL),

  -- Hematology
  ('hemoglobin', 'male', 18, NULL, 14.0, 16.5, '14.0–16.5 g/dL', 'Function Health', NULL),
  ('hemoglobin', 'female', 18, NULL, 12.5, 15.0, '12.5–15.0 g/dL', 'Function Health', NULL),

  -- Hormones
  ('testosterone_total', 'male', 18, NULL, 500, 900, '500–900 ng/dL', 'Attia/Huberman', NULL),
  ('testosterone_total', 'female', 18, NULL, 30, 60, '30–60 ng/dL', 'Function Health', NULL),
  ('dhea_s', 'male', 18, 39, 350, 500, '350–500 µg/dL', 'Functional medicine', NULL),
  ('dhea_s', 'male', 40, NULL, 200, 400, '200–400 µg/dL', 'Functional medicine', NULL),
  ('dhea_s', 'female', 18, 39, 150, 300, '150–300 µg/dL', 'Functional medicine', NULL),
  ('dhea_s', 'female', 40, NULL, 80, 200, '80–200 µg/dL', 'Functional medicine', NULL),

  -- Liver
  ('alt', NULL, 18, NULL, 7, 25, '7–25 U/L', 'Attia/Function Health', NULL),
  ('ast', NULL, 18, NULL, 10, 25, '10–25 U/L', 'Attia/Function Health', NULL),
  ('ggt', NULL, 18, NULL, 9, 25, '9–25 U/L', 'Attia', NULL),
  ('albumin', NULL, 18, NULL, 4.2, 5.0, '4.2–5.0 g/dL', 'Function Health', NULL),

  -- Kidney
  ('creatinine', 'male', 18, NULL, 0.8, 1.1, '0.8–1.1 mg/dL', 'Function Health', NULL),
  ('creatinine', 'female', 18, NULL, 0.6, 0.9, '0.6–0.9 mg/dL', 'Function Health', NULL),
  ('egfr', NULL, 18, NULL, 90, NULL, '>90 mL/min', 'Longevity consensus', NULL),

  -- Vitals
  ('heart_rate', NULL, 18, NULL, 50, 65, '50–65 bpm', 'Attia/Huberman', NULL),
  ('bp_systolic', NULL, 18, NULL, 100, 115, '100–115 mmHg', 'Attia', NULL),
  ('bp_diastolic', NULL, 18, NULL, 65, 75, '65–75 mmHg', 'Attia', NULL),

  -- Other
  ('uric_acid', 'male', 18, NULL, 3.5, 5.5, '3.5–5.5 mg/dL', 'Attia', NULL),
  ('uric_acid', 'female', 18, NULL, 2.5, 4.5, '2.5–4.5 mg/dL', 'Attia', NULL),
  ('bmi', NULL, 18, NULL, 18.5, 23.0, '18.5–23.0', 'Attia', NULL),

  -- Calculated/derived metrics
  ('cholesterol_hdl_ratio', NULL, 18, NULL, 0, 3.5, '<3.5', 'AHA/Attia', NULL),
  ('triglyceride_hdl_ratio', NULL, 18, NULL, 0, 1.0, '<1.0', 'Attia/Outlive', NULL),
  ('non_hdl_cholesterol', NULL, 18, NULL, 0, 130, '<130 mg/dL', 'AHA', NULL)
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- 5. Backfill calculated/derived biomarkers from existing observations
-- Pairs inputs by SAME observation date (same lab draw).
-- For each date where a user has ALL required inputs, compute the derived metric.
-- Only inserts if no calculated observation already exists for that user+metric+date.
-- ══════════════════════════════════════════════════════════════════════════════

-- HOMA-IR = (glucose × insulin) / 405
-- Computed for each date where both glucose AND insulin were tested.
INSERT INTO observations (
  user_id, metric_code, category, value_numeric, value_text, unit,
  status, confidence_score, observed_at, metadata_json
)
SELECT
  g.user_id,
  'homa_ir',
  'metabolic',
  ROUND(CAST((g.value_numeric * i.value_numeric) / 405.0 AS numeric), 2)::real,
  ROUND(CAST((g.value_numeric * i.value_numeric) / 405.0 AS numeric), 2)::text,
  '',
  'confirmed',
  1.0,
  g.observed_at,
  jsonb_build_object(
    'source', 'calculated',
    'formula', 'homa_ir',
    'formulaText', '(glucose × insulin) / 405',
    'inputs', jsonb_build_object('glucose', g.value_numeric, 'insulin', i.value_numeric)
  )
FROM observations g
JOIN observations i
  ON g.user_id = i.user_id
  AND g.observed_at = i.observed_at
  AND i.metric_code = 'insulin'
  AND i.value_numeric IS NOT NULL
  AND i.value_numeric > 0
WHERE g.metric_code = 'glucose'
  AND g.value_numeric IS NOT NULL
  AND g.value_numeric > 0
  AND NOT EXISTS (
    SELECT 1 FROM observations ex
    WHERE ex.user_id = g.user_id
      AND ex.metric_code = 'homa_ir'
      AND ex.observed_at = g.observed_at
  );

-- Triglyceride/HDL Ratio = triglycerides / HDL cholesterol
-- Computed for each date where both were tested.
INSERT INTO observations (
  user_id, metric_code, category, value_numeric, value_text, unit,
  status, confidence_score, observed_at, metadata_json
)
SELECT
  t.user_id,
  'triglyceride_hdl_ratio',
  'lipid',
  ROUND(CAST(t.value_numeric / h.value_numeric AS numeric), 1)::real,
  ROUND(CAST(t.value_numeric / h.value_numeric AS numeric), 1)::text,
  '',
  'confirmed',
  1.0,
  t.observed_at,
  jsonb_build_object(
    'source', 'calculated',
    'formula', 'triglyceride_hdl_ratio',
    'formulaText', 'triglycerides / HDL cholesterol',
    'inputs', jsonb_build_object('triglycerides', t.value_numeric, 'hdl_cholesterol', h.value_numeric)
  )
FROM observations t
JOIN observations h
  ON t.user_id = h.user_id
  AND t.observed_at = h.observed_at
  AND h.metric_code = 'hdl_cholesterol'
  AND h.value_numeric IS NOT NULL
  AND h.value_numeric > 0
WHERE t.metric_code = 'triglycerides'
  AND t.value_numeric IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM observations ex
    WHERE ex.user_id = t.user_id
      AND ex.metric_code = 'triglyceride_hdl_ratio'
      AND ex.observed_at = t.observed_at
  );

-- Cholesterol/HDL Ratio = total_cholesterol / HDL cholesterol
INSERT INTO observations (
  user_id, metric_code, category, value_numeric, value_text, unit,
  status, confidence_score, observed_at, metadata_json
)
SELECT
  c.user_id,
  'cholesterol_hdl_ratio',
  'lipid',
  ROUND(CAST(c.value_numeric / h.value_numeric AS numeric), 1)::real,
  ROUND(CAST(c.value_numeric / h.value_numeric AS numeric), 1)::text,
  '',
  'confirmed',
  1.0,
  c.observed_at,
  jsonb_build_object(
    'source', 'calculated',
    'formula', 'cholesterol_hdl_ratio',
    'formulaText', 'total cholesterol / HDL cholesterol',
    'inputs', jsonb_build_object('cholesterol_total', c.value_numeric, 'hdl_cholesterol', h.value_numeric)
  )
FROM observations c
JOIN observations h
  ON c.user_id = h.user_id
  AND c.observed_at = h.observed_at
  AND h.metric_code = 'hdl_cholesterol'
  AND h.value_numeric IS NOT NULL
  AND h.value_numeric > 0
WHERE c.metric_code IN ('cholesterol_total', 'total_cholesterol')
  AND c.value_numeric IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM observations ex
    WHERE ex.user_id = c.user_id
      AND ex.metric_code = 'cholesterol_hdl_ratio'
      AND ex.observed_at = c.observed_at
  );

-- Non-HDL Cholesterol = total_cholesterol - HDL cholesterol
INSERT INTO observations (
  user_id, metric_code, category, value_numeric, value_text, unit,
  status, confidence_score, observed_at, metadata_json
)
SELECT
  c.user_id,
  'non_hdl_cholesterol',
  'lipid',
  ROUND(CAST(c.value_numeric - h.value_numeric AS numeric), 0)::real,
  ROUND(CAST(c.value_numeric - h.value_numeric AS numeric), 0)::text,
  'mg/dL',
  'confirmed',
  1.0,
  c.observed_at,
  jsonb_build_object(
    'source', 'calculated',
    'formula', 'non_hdl_cholesterol',
    'formulaText', 'total cholesterol − HDL cholesterol',
    'inputs', jsonb_build_object('cholesterol_total', c.value_numeric, 'hdl_cholesterol', h.value_numeric)
  )
FROM observations c
JOIN observations h
  ON c.user_id = h.user_id
  AND c.observed_at = h.observed_at
  AND h.metric_code = 'hdl_cholesterol'
  AND h.value_numeric IS NOT NULL
  AND h.value_numeric > 0
WHERE c.metric_code IN ('cholesterol_total', 'total_cholesterol')
  AND c.value_numeric IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM observations ex
    WHERE ex.user_id = c.user_id
      AND ex.metric_code = 'non_hdl_cholesterol'
      AND ex.observed_at = c.observed_at
  );
