/**
 * Prevention-based testing panels.
 *
 * Defines universal biomarker panels that everyone should track
 * regardless of current health status. Based on longevity medicine
 * frameworks (Attia's "4 Horsemen", Function Health, etc.)
 *
 * Used by the retest recommendation engine to suggest:
 * 1. Retests for flagged metrics (priority 1)
 * 2. Prevention panel gaps — never tested (priority 2)
 * 3. Routine rechecks (priority 3)
 */

export interface PreventionPanel {
  id: string;
  label: string;
  frequency: string;
  frequencyDays: number;
  metrics: string[];
  why: string;
}

export const PREVENTION_PANELS: PreventionPanel[] = [
  {
    id: "metabolic",
    label: "Metabolic Health",
    frequency: "every 6 months",
    frequencyDays: 180,
    metrics: ["glucose", "hba1c", "insulin"],
    why: "Insulin resistance is detectable 10+ years before diabetes diagnosis",
  },
  {
    id: "cardiovascular",
    label: "Cardiovascular Risk",
    frequency: "annually",
    frequencyDays: 365,
    metrics: [
      "ldl_cholesterol",
      "hdl_cholesterol",
      "triglycerides",
      "apolipoprotein_b",
    ],
    why: "Heart disease is the #1 killer — ApoB is the best early predictor",
  },
  {
    id: "inflammation",
    label: "Systemic Inflammation",
    frequency: "annually",
    frequencyDays: 365,
    metrics: ["crp", "homocysteine"],
    why: "Chronic inflammation drives all 4 major disease categories",
  },
  {
    id: "thyroid",
    label: "Thyroid Function",
    frequency: "annually",
    frequencyDays: 365,
    metrics: ["tsh", "free_t3", "free_t4"],
    why: "Thyroid dysfunction affects energy, metabolism, and mood",
  },
  {
    id: "nutrients",
    label: "Key Nutrients",
    frequency: "every 6 months",
    frequencyDays: 180,
    metrics: ["vitamin_d", "vitamin_b12", "ferritin", "magnesium"],
    why: "Deficiencies are common and easily correctable",
  },
];

/**
 * Get all unique metric codes across all prevention panels.
 */
export function getAllPreventionMetrics(): string[] {
  const codes = new Set<string>();
  for (const panel of PREVENTION_PANELS) {
    for (const code of panel.metrics) {
      codes.add(code);
    }
  }
  return [...codes];
}

/**
 * Get the recommended retest frequency for a metric from prevention panels.
 * Returns null if the metric isn't in any prevention panel.
 */
export function getPreventionFrequency(
  metricCode: string,
): { frequencyDays: number; panelLabel: string; why: string } | null {
  for (const panel of PREVENTION_PANELS) {
    if (panel.metrics.includes(metricCode)) {
      return {
        frequencyDays: panel.frequencyDays,
        panelLabel: panel.label,
        why: panel.why,
      };
    }
  }
  return null;
}
