export interface MetricDef {
  code: string;
  aliases?: string[];
  reason: string;
}

export interface PanelDef {
  id: string;
  label: string;
  metrics: MetricDef[];
}

export const PANELS: PanelDef[] = [
  {
    id: "metabolic",
    label: "Metabolic",
    metrics: [
      {
        code: "glucose",
        reason: "Fasting blood sugar — key marker for diabetes risk",
      },
      {
        code: "hba1c",
        reason:
          "3-month blood sugar average — gold standard for metabolic health",
      },
      {
        code: "insulin",
        reason: "Fasting insulin — early warning for insulin resistance",
      },
      {
        code: "homa_ir",
        reason: "Insulin resistance index — calculated from glucose + insulin",
      },
    ],
  },
  {
    id: "lipid",
    label: "Lipid Panel",
    metrics: [
      {
        code: "ldl_cholesterol",
        reason: "LDL cholesterol — primary target for cardiovascular risk",
      },
      {
        code: "total_cholesterol",
        reason: "Total cholesterol — overview of lipid levels",
      },
      {
        code: "hdl_cholesterol",
        reason: "HDL (good) cholesterol — higher is protective",
      },
      {
        code: "triglycerides",
        reason:
          "Triglycerides — marker for metabolic and cardiovascular health",
      },
      {
        code: "apolipoprotein_b",
        reason: "ApoB — most accurate predictor of cardiovascular risk",
      },
    ],
  },
  {
    id: "inflammation",
    label: "Inflammation",
    metrics: [
      {
        code: "crp",
        reason: "C-reactive protein — systemic inflammation marker",
      },
      {
        code: "homocysteine",
        reason:
          "Homocysteine — linked to cardiovascular and neurodegenerative risk",
      },
    ],
  },
  {
    id: "thyroid",
    label: "Thyroid",
    metrics: [
      { code: "tsh", reason: "TSH — primary thyroid function screening" },
      { code: "free_t3", reason: "Free T3 — active thyroid hormone" },
      { code: "free_t4", reason: "Free T4 — thyroid hormone production" },
      {
        code: "tpo_antibodies",
        reason: "TPO antibodies — autoimmune thyroid marker",
      },
    ],
  },
  {
    id: "vitamins",
    label: "Vitamins & Minerals",
    metrics: [
      {
        code: "vitamin_d",
        reason: "Vitamin D — immune function, bone health, mood",
      },
      { code: "vitamin_b12", reason: "B12 — energy, neurological function" },
      { code: "ferritin", reason: "Ferritin — iron stores, fatigue marker" },
      { code: "iron", reason: "Serum iron — oxygen transport, energy" },
      {
        code: "magnesium",
        reason: "Magnesium — involved in 300+ enzymatic reactions",
      },
      { code: "zinc", reason: "Zinc — immune function, wound healing" },
    ],
  },
];
