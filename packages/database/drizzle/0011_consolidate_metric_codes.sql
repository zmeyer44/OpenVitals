-- Migration: Consolidate duplicate metric codes to canonical forms
-- Problem: The normalizer sometimes creates observations with different codes
-- for the same biomarker (e.g., 'hemoglobin_a1c' vs 'hba1c'). This causes
-- the labs detail page to show empty when navigating from panel cards.
--
-- Canonical codes chosen for readability and consistency with panel-config:
--   hemoglobin_a1c → hba1c
--   cholesterol_total → total_cholesterol
--   apob → apolipoprotein_b
--   hs_crp, c_reactive_protein → crp
--   25_hydroxyvitamin_d, vitamin_d_25_hydroxyvitamin_d → vitamin_d
--
-- All UPDATEs are safe — they only rename the metric_code, no data loss.

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. Consolidate observation metric codes
-- ══════════════════════════════════════════════════════════════════════════════

UPDATE observations SET metric_code = 'hba1c'
  WHERE metric_code = 'hemoglobin_a1c';
--> statement-breakpoint
UPDATE observations SET metric_code = 'total_cholesterol'
  WHERE metric_code = 'cholesterol_total';
--> statement-breakpoint
UPDATE observations SET metric_code = 'apolipoprotein_b'
  WHERE metric_code = 'apob';
--> statement-breakpoint
UPDATE observations SET metric_code = 'crp'
  WHERE metric_code IN ('hs_crp', 'c_reactive_protein');
--> statement-breakpoint
UPDATE observations SET metric_code = 'vitamin_d'
  WHERE metric_code IN ('25_hydroxyvitamin_d', 'vitamin_d_25_hydroxyvitamin_d');

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. Consolidate calculated observations (from migration 0010)
-- ══════════════════════════════════════════════════════════════════════════════

-- The cholesterol_hdl_ratio uses total_cholesterol as input — re-point any
-- that were computed from cholesterol_total observations.
-- (No metric_code rename needed for calculated metrics — they already use
-- canonical codes like 'cholesterol_hdl_ratio', 'triglyceride_hdl_ratio', etc.)

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. Update optimal_ranges to ensure canonical codes have entries
-- The old aliases still have optimal_range rows (from migration 0010).
-- Copy ranges to canonical codes if they don't already exist.
-- ══════════════════════════════════════════════════════════════════════════════

-- hba1c should have an optimal range (may already exist from migration 0010)
INSERT INTO optimal_ranges (metric_code, sex, age_min, age_max, range_low, range_high, range_text, source, source_url)
SELECT 'hba1c', sex, age_min, age_max, range_low, range_high, range_text, source, source_url
FROM optimal_ranges WHERE metric_code = 'hemoglobin_a1c'
ON CONFLICT DO NOTHING;

-- vitamin_d should have an optimal range
INSERT INTO optimal_ranges (metric_code, sex, age_min, age_max, range_low, range_high, range_text, source, source_url)
SELECT 'vitamin_d', sex, age_min, age_max, range_low, range_high, range_text, source, source_url
FROM optimal_ranges WHERE metric_code = '25_hydroxyvitamin_d'
ON CONFLICT DO NOTHING;

-- apolipoprotein_b should have an optimal range
INSERT INTO optimal_ranges (metric_code, sex, age_min, age_max, range_low, range_high, range_text, source, source_url)
SELECT 'apolipoprotein_b', sex, age_min, age_max, range_low, range_high, range_text, source, source_url
FROM optimal_ranges WHERE metric_code = 'apob'
ON CONFLICT DO NOTHING;

-- total_cholesterol should have an optimal range (from cholesterol_total)
INSERT INTO optimal_ranges (metric_code, sex, age_min, age_max, range_low, range_high, range_text, source, source_url)
SELECT 'total_cholesterol', sex, age_min, age_max, range_low, range_high, range_text, source, source_url
FROM optimal_ranges WHERE metric_code = 'cholesterol_total'
ON CONFLICT DO NOTHING;

-- crp should have an optimal range (from hs_crp)
INSERT INTO optimal_ranges (metric_code, sex, age_min, age_max, range_low, range_high, range_text, source, source_url)
SELECT 'crp', sex, age_min, age_max, range_low, range_high, range_text, source, source_url
FROM optimal_ranges WHERE metric_code = 'hs_crp'
ON CONFLICT DO NOTHING;
