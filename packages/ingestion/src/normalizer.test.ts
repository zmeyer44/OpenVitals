import { describe, it, expect } from 'vitest';
import { matchMetric, convertUnit, normalizeExtractions } from './normalizer';
import type { MetricDefinition, UnitConversion, RawExtraction } from './types';

const testMetrics: MetricDefinition[] = [
  { id: 'glucose', name: 'Glucose', category: 'metabolic', unit: 'mg/dL', aliases: ['blood sugar', 'FBG', 'fasting glucose'], referenceRangeLow: 74, referenceRangeHigh: 106 },
  { id: 'hemoglobin', name: 'Hemoglobin', category: 'hematology', unit: 'g/dL', aliases: ['Hgb', 'Hb'], referenceRangeLow: 13.5, referenceRangeHigh: 17.2 },
  { id: 'ast', name: 'AST', category: 'liver', unit: 'U/L', aliases: ['SGOT', 'ASAT', 'TGO', 'TGO (ASAT)'], referenceRangeLow: 15, referenceRangeHigh: 40 },
  { id: 'alt', name: 'ALT', category: 'liver', unit: 'U/L', aliases: ['SGPT', 'ALAT', 'TGP', 'TGP (ALAT)'], referenceRangeLow: 10, referenceRangeHigh: 40 },
  { id: 'neutrophils_pct', name: 'Neutrophils %', category: 'hematology', unit: '%', aliases: ['Neutrophils (%)', 'Neut %'], referenceRangeLow: 42, referenceRangeHigh: 77 },
  { id: 'neutrophils_abs', name: 'Neutrophils (Absolute)', category: 'hematology', unit: 'K/uL', aliases: ['Neutrophils absolute'], referenceRangeLow: 1.5, referenceRangeHigh: 7.7 },
  { id: 'basophils_pct', name: 'Basophils %', category: 'hematology', unit: '%', aliases: ['Basophils (%)', 'Baso %'], referenceRangeLow: null, referenceRangeHigh: 1.75 },
  { id: 'basophils_abs', name: 'Basophils (Absolute)', category: 'hematology', unit: 'K/uL', aliases: ['Basophils absolute'], referenceRangeLow: null, referenceRangeHigh: 0.2 },
  { id: 'crp', name: 'CRP', category: 'inflammation', unit: 'mg/L', aliases: ['C-reactive protein'], referenceRangeLow: null, referenceRangeHigh: 5.0 },
  { id: 'total_protein', name: 'Total Protein', category: 'metabolic', unit: 'g/dL', aliases: ['TP', 'Total Serum Proteins', 'Proteine totale'], referenceRangeLow: 5.7, referenceRangeHigh: 8.2 },
  { id: 'insulin', name: 'Insulin', category: 'metabolic', unit: 'uIU/mL', aliases: ['fasting insulin'], referenceRangeLow: 3.0, referenceRangeHigh: 25.0 },
  { id: 'wbc', name: 'White Blood Cell Count', category: 'hematology', unit: 'K/uL', aliases: ['WBC', 'leukocytes'], referenceRangeLow: 3.9, referenceRangeHigh: 10.2 },
];

const testConversions: UnitConversion[] = [
  { fromUnit: 'mg/dL', toUnit: 'mg/L', metricCode: 'crp', multiplier: 10, offset: 0 },
  { fromUnit: '/mm³', toUnit: 'K/uL', metricCode: 'wbc', multiplier: 0.001, offset: 0 },
  { fromUnit: 'mU/L', toUnit: 'uIU/mL', metricCode: 'insulin', multiplier: 1, offset: 0 },
  { fromUnit: 'mg/dl', toUnit: 'mg/dL', metricCode: null, multiplier: 1, offset: 0 },
];

describe('matchMetric', () => {
  it('matches by exact id', () => {
    expect(matchMetric('glucose', testMetrics)?.id).toBe('glucose');
  });

  it('matches by exact name', () => {
    expect(matchMetric('Glucose', testMetrics)?.id).toBe('glucose');
  });

  it('matches by alias', () => {
    expect(matchMetric('TGO', testMetrics)?.id).toBe('ast');
    expect(matchMetric('TGP (ALAT)', testMetrics)?.id).toBe('alt');
    expect(matchMetric('ASAT', testMetrics)?.id).toBe('ast');
  });

  it('matches by partial name', () => {
    expect(matchMetric('Total Serum Proteins', testMetrics)?.id).toBe('total_protein');
  });

  it('matches case-insensitively', () => {
    expect(matchMetric('GLUCOSE', testMetrics)?.id).toBe('glucose');
    expect(matchMetric('hemoglobin', testMetrics)?.id).toBe('hemoglobin');
  });

  it('returns null for unknown analytes', () => {
    expect(matchMetric('Unobtanium', testMetrics)).toBeNull();
  });

  it('disambiguates differentials by unit (% → _pct)', () => {
    const result = matchMetric('Neutrophils', testMetrics, '%');
    expect(result?.id).toBe('neutrophils_pct');
  });

  it('disambiguates differentials by unit (absolute → _abs)', () => {
    const result = matchMetric('Neutrophils', testMetrics, '/mm³');
    expect(result?.id).toBe('neutrophils_abs');
  });

  it('disambiguates Basophils by unit', () => {
    expect(matchMetric('Basophils', testMetrics, '%')?.id).toBe('basophils_pct');
    expect(matchMetric('Basophils', testMetrics, 'K/uL')?.id).toBe('basophils_abs');
  });
});

describe('convertUnit', () => {
  it('returns value as-is when units match', () => {
    expect(convertUnit(100, 'mg/dL', 'mg/dL', testConversions)).toBe(100);
  });

  it('returns value for case-insensitive unit match', () => {
    expect(convertUnit(100, 'mg/dl', 'mg/dL', testConversions)).toBe(100);
  });

  it('converts with multiplier', () => {
    expect(convertUnit(0.05, 'mg/dL', 'mg/L', testConversions, 'crp')).toBeCloseTo(0.5);
  });

  it('converts hematology units', () => {
    expect(convertUnit(5830, '/mm³', 'K/uL', testConversions, 'wbc')).toBeCloseTo(5.83);
  });

  it('converts insulin units (1:1)', () => {
    expect(convertUnit(4.2, 'mU/L', 'uIU/mL', testConversions, 'insulin')).toBeCloseTo(4.2);
  });

  it('returns null for unknown conversion', () => {
    expect(convertUnit(100, 'foo/bar', 'baz/qux', testConversions)).toBeNull();
  });
});

describe('normalizeExtractions', () => {
  it('normalizes a simple extraction', () => {
    const extractions: RawExtraction[] = [{
      analyte: 'Glucose',
      value: 81,
      valueText: '81',
      unit: 'mg/dL',
      referenceRangeLow: 74,
      referenceRangeHigh: 106,
      referenceRangeText: '74 - 106 mg/dL',
      isAbnormal: false,
      observedAt: '2025-12-09',
    }];

    const result = normalizeExtractions(extractions, testMetrics, testConversions);
    expect(result.normalized).toHaveLength(1);
    expect(result.flagged).toHaveLength(0);
    expect(result.normalized[0]!.metricCode).toBe('glucose');
    expect(result.normalized[0]!.valueNumeric).toBe(81);
  });

  it('flags unmatched analytes', () => {
    const extractions: RawExtraction[] = [{
      analyte: 'Unobtanium',
      value: 42,
      valueText: '42',
      unit: 'mg/dL',
      referenceRangeLow: null,
      referenceRangeHigh: null,
      referenceRangeText: null,
      isAbnormal: null,
      observedAt: '2025-12-09',
    }];

    const result = normalizeExtractions(extractions, testMetrics, testConversions);
    expect(result.normalized).toHaveLength(0);
    expect(result.flagged).toHaveLength(1);
    expect(result.flagged[0]!.reason).toBe('unmatched_metric');
  });

  it('converts units during normalization', () => {
    const extractions: RawExtraction[] = [{
      analyte: 'CRP',
      value: 0.05,
      valueText: '0.05',
      unit: 'mg/dL',
      referenceRangeLow: null,
      referenceRangeHigh: 0.33,
      referenceRangeText: '< 0.33 mg/dL',
      isAbnormal: false,
      observedAt: '2025-12-09',
    }];

    const result = normalizeExtractions(extractions, testMetrics, testConversions);
    expect(result.normalized).toHaveLength(1);
    expect(result.normalized[0]!.metricCode).toBe('crp');
    expect(result.normalized[0]!.valueNumeric).toBeCloseTo(0.5); // 0.05 * 10
    expect(result.normalized[0]!.unit).toBe('mg/L');
  });

  it('flags when unit conversion not found', () => {
    const extractions: RawExtraction[] = [{
      analyte: 'Insulin',
      value: 4.2,
      valueText: '4.2',
      unit: 'unknown_unit',
      referenceRangeLow: 3.0,
      referenceRangeHigh: 25.0,
      referenceRangeText: null,
      isAbnormal: false,
      observedAt: '2025-12-09',
    }];

    const result = normalizeExtractions(extractions, testMetrics, testConversions);
    expect(result.normalized).toHaveLength(0);
    expect(result.flagged).toHaveLength(1);
    expect(result.flagged[0]!.reason).toBe('ambiguous_unit');
  });

  it('matches Romanian aliases (TGO → AST)', () => {
    const extractions: RawExtraction[] = [{
      analyte: 'TGO',
      value: 20,
      valueText: '20',
      unit: 'U/L',
      referenceRangeLow: 15,
      referenceRangeHigh: 40,
      referenceRangeText: '15 - 40 U/L',
      isAbnormal: false,
      observedAt: '2025-12-09',
    }];

    const result = normalizeExtractions(extractions, testMetrics, testConversions);
    expect(result.normalized).toHaveLength(1);
    expect(result.normalized[0]!.metricCode).toBe('ast');
  });

  it('detects abnormal values', () => {
    const extractions: RawExtraction[] = [{
      analyte: 'Glucose',
      value: 130,
      valueText: '130',
      unit: 'mg/dL',
      referenceRangeLow: 74,
      referenceRangeHigh: 106,
      referenceRangeText: null,
      isAbnormal: null,
      observedAt: '2025-12-09',
    }];

    const result = normalizeExtractions(extractions, testMetrics, testConversions);
    expect(result.normalized[0]!.isAbnormal).toBe(true);
  });
});
