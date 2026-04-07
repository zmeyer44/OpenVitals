// Schema
export * from "./schema/index";

// Client
export { getDb, type Database } from "./client";

// Queries
export {
  listObservations,
  listObservationsByImportJob,
  getObservationTrend,
  getObservationWithProvenance,
} from "./queries/observations";
export { checkCategoryAccess, getActiveGrants } from "./queries/sharing";
export { matchAlias, convertUnit } from "./queries/metrics";
export {
  listMedications,
  createMedication,
  updateMedication,
  logMedicationAdherence,
  getAdherenceLogs,
} from "./queries/medications";
export {
  createImportJob,
  getImportJobStatus,
  listImportJobs,
  deleteImportJob,
  getReviewQueue,
  resetImportJobsForReprocessing,
  findImportJobByContentHash,
  resetImportJob,
} from "./queries/importJobs";
export {
  listConnections,
  getConnectionByProvider,
  getConnectionByProviderUserId,
  upsertConnection,
  disconnectProvider,
  updateConnectionTokens,
  updateSyncStatus,
  ensureDataSource,
} from "./queries/integrations";
export {
  computeCalculatedMetrics,
  CALCULATED_METRICS,
  type CalculatedMetricDef,
} from "./queries/calculated-metrics";
