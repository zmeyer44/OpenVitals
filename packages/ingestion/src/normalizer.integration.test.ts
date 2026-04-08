import { describe, it, expect } from 'vitest';
import { matchMetric, normalizeExtractions } from './normalizer';
import type { MetricDefinition, UnitConversion, RawExtraction } from './types';

/**
 * Integration tests using realistic data from Romanian lab PDFs.
 * These simulate what the AI parser outputs and verify the normalizer
 * handles Romanian lab formats correctly.
 */

// Subset of real metric definitions matching our seed data
const metrics: MetricDefinition[] = [
  { id: 'glucose', name: 'Glucose', category: 'metabolic', unit: 'mg/dL', aliases: ['blood sugar', 'FBG', 'fasting glucose', 'GLU'], referenceRangeLow: 74, referenceRangeHigh: 106 },
  { id: 'hemoglobin_a1c', name: 'Hemoglobin A1c', category: 'metabolic', unit: '%', aliases: ['HbA1c', 'A1c', 'glycated hemoglobin'], referenceRangeLow: 4.0, referenceRangeHigh: 6.0 },
  { id: 'insulin', name: 'Insulin', category: 'metabolic', unit: 'uIU/mL', aliases: ['fasting insulin'], referenceRangeLow: 3.0, referenceRangeHigh: 25.0 },
  { id: 'cholesterol_total', name: 'Total Cholesterol', category: 'lipid', unit: 'mg/dL', aliases: [], referenceRangeLow: null, referenceRangeHigh: 200 },
  { id: 'hdl_cholesterol', name: 'HDL Cholesterol', category: 'lipid', unit: 'mg/dL', aliases: ['HDL'], referenceRangeLow: 60, referenceRangeHigh: null },
  { id: 'ldl_cholesterol', name: 'LDL Cholesterol', category: 'lipid', unit: 'mg/dL', aliases: ['LDL'], referenceRangeLow: null, referenceRangeHigh: 100 },
  { id: 'triglycerides', name: 'Triglycerides', category: 'lipid', unit: 'mg/dL', aliases: ['TG'], referenceRangeLow: null, referenceRangeHigh: 150 },
  { id: 'crp', name: 'CRP', category: 'inflammation', unit: 'mg/L', aliases: ['C-reactive protein'], referenceRangeLow: null, referenceRangeHigh: 5.0 },
  { id: 'ast', name: 'AST', category: 'liver', unit: 'U/L', aliases: ['SGOT', 'ASAT', 'TGO', 'TGO (ASAT)'], referenceRangeLow: 15, referenceRangeHigh: 40 },
  { id: 'alt', name: 'ALT', category: 'liver', unit: 'U/L', aliases: ['SGPT', 'ALAT', 'TGP', 'TGP (ALAT)'], referenceRangeLow: 10, referenceRangeHigh: 40 },
  { id: 'tsh', name: 'TSH', category: 'thyroid', unit: 'mIU/L', aliases: ['thyroid stimulating hormone'], referenceRangeLow: 0.55, referenceRangeHigh: 4.78 },
  { id: 'vitamin_d', name: 'Vitamin D', category: 'vitamin', unit: 'ng/mL', aliases: ['25-OH vitamin D', 'calcidiol', '25-Hydroxyvitamin D'], referenceRangeLow: 30, referenceRangeHigh: 100 },
  { id: 'wbc', name: 'White Blood Cell Count', category: 'hematology', unit: 'K/uL', aliases: ['WBC', 'leukocytes'], referenceRangeLow: 3.9, referenceRangeHigh: 10.2 },
  { id: 'rbc', name: 'Red Blood Cell Count', category: 'hematology', unit: 'M/uL', aliases: ['RBC', 'erythrocytes'], referenceRangeLow: 4.3, referenceRangeHigh: 5.75 },
  { id: 'platelets', name: 'Platelet Count', category: 'hematology', unit: 'K/uL', aliases: ['PLT', 'thrombocytes', 'Platelets'], referenceRangeLow: 150, referenceRangeHigh: 370 },
  { id: 'neutrophils_pct', name: 'Neutrophils %', category: 'hematology', unit: '%', aliases: ['Neutrophils (%)', 'Neut %', 'Neutrophils%'], referenceRangeLow: 42, referenceRangeHigh: 77 },
  { id: 'neutrophils_abs', name: 'Neutrophils (Absolute)', category: 'hematology', unit: 'K/uL', aliases: ['Neutrophils absolute', 'Neutrophils abs'], referenceRangeLow: 1.5, referenceRangeHigh: 7.7 },
];

const conversions: UnitConversion[] = [
  { fromUnit: 'mg/dL', toUnit: 'mg/L', metricCode: 'crp', multiplier: 10, offset: 0 },
  { fromUnit: '/mm³', toUnit: 'K/uL', metricCode: 'wbc', multiplier: 0.001, offset: 0 },
  { fromUnit: '/mm³', toUnit: 'M/uL', metricCode: 'rbc', multiplier: 0.000001, offset: 0 },
  { fromUnit: '/mm³', toUnit: 'K/uL', metricCode: 'platelets', multiplier: 0.001, offset: 0 },
  { fromUnit: '/mm³', toUnit: 'K/uL', metricCode: 'neutrophils_abs', multiplier: 0.001, offset: 0 },
  { fromUnit: 'mU/L', toUnit: 'uIU/mL', metricCode: 'insulin', multiplier: 1, offset: 0 },
  { fromUnit: 'μUI/mL', toUnit: 'mIU/L', metricCode: null, multiplier: 1, offset: 0 },
  { fromUnit: 'μg/dL', toUnit: 'mcg/dL', metricCode: null, multiplier: 1, offset: 0 },
  { fromUnit: 'mg/dl', toUnit: 'mg/dL', metricCode: null, multiplier: 1, offset: 0 },
  { fromUnit: '10^3/ul', toUnit: 'K/uL', metricCode: null, multiplier: 1, offset: 0 },
  { fromUnit: '10^6/uL', toUnit: 'M/uL', metricCode: null, multiplier: 1, offset: 0 },
];

describe('Bioclinica PDF (Dec 2025) - realistic AI output', () => {
  // Simulates what Gemini Flash extracts from a Bioclinica Romanian PDF
  const bioclinicaExtractions: RawExtraction[] = [
    { analyte: 'CRP', value: 0.05, valueText: '< 0.050', unit: 'mg/dL', referenceRangeLow: null, referenceRangeHigh: 0.33, referenceRangeText: '≤ 0.330 mg/dL', isAbnormal: false, observedAt: '2025-12-09' },
    { analyte: 'Hemoglobin', value: 16.2, valueText: '16.2', unit: 'g/dL', referenceRangeLow: 13.5, referenceRangeHigh: 17.2, referenceRangeText: null, isAbnormal: false, observedAt: '2025-12-09' },
    { analyte: 'HbA1c', value: 5.2, valueText: '5.2', unit: '%', referenceRangeLow: 4.0, referenceRangeHigh: 6.0, referenceRangeText: null, isAbnormal: false, observedAt: '2025-12-09' },
    { analyte: 'Glucose', value: 81, valueText: '81', unit: 'mg/dL', referenceRangeLow: 74, referenceRangeHigh: 106, referenceRangeText: null, isAbnormal: false, observedAt: '2025-12-09' },
    { analyte: 'Insulin', value: 4.2, valueText: '4.2', unit: 'mU/L', referenceRangeLow: 3.0, referenceRangeHigh: 25.0, referenceRangeText: null, isAbnormal: false, observedAt: '2025-12-09' },
    { analyte: 'Total Cholesterol', value: 200, valueText: '200', unit: 'mg/dL', referenceRangeLow: null, referenceRangeHigh: 200, referenceRangeText: null, isAbnormal: false, observedAt: '2025-12-09' },
    { analyte: 'HDL Cholesterol', value: 44, valueText: '44', unit: 'mg/dL', referenceRangeLow: 60, referenceRangeHigh: null, referenceRangeText: null, isAbnormal: true, observedAt: '2025-12-09' },
    { analyte: 'TSH', value: 1.824, valueText: '1.824', unit: 'μUI/mL', referenceRangeLow: 0.55, referenceRangeHigh: 4.78, referenceRangeText: null, isAbnormal: false, observedAt: '2025-12-09' },
    { analyte: 'WBC', value: 5830, valueText: '5830', unit: '/mm³', referenceRangeLow: 3900, referenceRangeHigh: 10200, referenceRangeText: null, isAbnormal: false, observedAt: '2025-12-09' },
    { analyte: 'RBC', value: 5600000, valueText: '5600000', unit: '/mm³', referenceRangeLow: 4300000, referenceRangeHigh: 5750000, referenceRangeText: null, isAbnormal: false, observedAt: '2025-12-09' },
    { analyte: 'Platelets', value: 235000, valueText: '235000', unit: '/mm³', referenceRangeLow: 150000, referenceRangeHigh: 370000, referenceRangeText: null, isAbnormal: false, observedAt: '2025-12-09' },
    { analyte: 'Neutrophils', value: 55.23, valueText: '55.23', unit: '%', referenceRangeLow: 42, referenceRangeHigh: 77, referenceRangeText: null, isAbnormal: false, observedAt: '2025-12-09' },
    { analyte: 'Neutrophils', value: 3220, valueText: '3220', unit: '/mm³', referenceRangeLow: 1500, referenceRangeHigh: 7700, referenceRangeText: null, isAbnormal: false, observedAt: '2025-12-09' },
  ];

  it('normalizes all Bioclinica extractions', () => {
    const result = normalizeExtractions(bioclinicaExtractions, metrics, conversions);
    expect(result.normalized.length).toBeGreaterThanOrEqual(11);
    expect(result.flagged.length).toBeLessThanOrEqual(2);
  });

  it('converts CRP from mg/dL to mg/L', () => {
    const result = normalizeExtractions(bioclinicaExtractions, metrics, conversions);
    const crp = result.normalized.find(o => o.metricCode === 'crp');
    expect(crp).toBeDefined();
    expect(crp!.valueNumeric).toBeCloseTo(0.5);
    expect(crp!.unit).toBe('mg/L');
  });

  it('converts WBC from /mm³ to K/uL', () => {
    const result = normalizeExtractions(bioclinicaExtractions, metrics, conversions);
    const wbc = result.normalized.find(o => o.metricCode === 'wbc');
    expect(wbc).toBeDefined();
    expect(wbc!.valueNumeric).toBeCloseTo(5.83);
    expect(wbc!.unit).toBe('K/uL');
  });

  it('converts RBC from /mm³ to M/uL', () => {
    const result = normalizeExtractions(bioclinicaExtractions, metrics, conversions);
    const rbc = result.normalized.find(o => o.metricCode === 'rbc');
    expect(rbc).toBeDefined();
    expect(rbc!.valueNumeric).toBeCloseTo(5.6);
  });

  it('converts TSH from μUI/mL to mIU/L', () => {
    const result = normalizeExtractions(bioclinicaExtractions, metrics, conversions);
    const tsh = result.normalized.find(o => o.metricCode === 'tsh');
    expect(tsh).toBeDefined();
    expect(tsh!.valueNumeric).toBeCloseTo(1.824);
  });

  it('converts Insulin from mU/L to uIU/mL', () => {
    const result = normalizeExtractions(bioclinicaExtractions, metrics, conversions);
    const ins = result.normalized.find(o => o.metricCode === 'insulin');
    expect(ins).toBeDefined();
    expect(ins!.valueNumeric).toBeCloseTo(4.2);
  });

  it('disambiguates Neutrophils % vs absolute by unit', () => {
    const result = normalizeExtractions(bioclinicaExtractions, metrics, conversions);
    const neutPct = result.normalized.find(o => o.metricCode === 'neutrophils_pct');
    const neutAbs = result.normalized.find(o => o.metricCode === 'neutrophils_abs');
    expect(neutPct).toBeDefined();
    expect(neutPct!.valueNumeric).toBeCloseTo(55.23);
    expect(neutAbs).toBeDefined();
    expect(neutAbs!.valueNumeric).toBeCloseTo(3.22);
  });

  it('flags HDL as abnormal (44 < 60)', () => {
    const result = normalizeExtractions(bioclinicaExtractions, metrics, conversions);
    const hdl = result.normalized.find(o => o.metricCode === 'hdl_cholesterol');
    expect(hdl).toBeDefined();
    expect(hdl!.isAbnormal).toBe(true);
  });
});

describe('Medisim PDF format - case-insensitive units', () => {
  const medisimExtractions: RawExtraction[] = [
    { analyte: 'Glucose', value: 95.4, valueText: '95.40', unit: 'mg/dl', referenceRangeLow: 70, referenceRangeHigh: 115, referenceRangeText: null, isAbnormal: false, observedAt: '2024-05-13' },
    { analyte: 'Total Cholesterol', value: 201.97, valueText: '201.97', unit: 'mg/dl', referenceRangeLow: null, referenceRangeHigh: 201.1, referenceRangeText: null, isAbnormal: true, observedAt: '2024-05-13' },
  ];

  it('handles mg/dl → mg/dL case conversion', () => {
    const result = normalizeExtractions(medisimExtractions, metrics, conversions);
    expect(result.normalized).toHaveLength(2);
    const glucose = result.normalized.find(o => o.metricCode === 'glucose');
    expect(glucose!.valueNumeric).toBeCloseTo(95.4);
  });
});
