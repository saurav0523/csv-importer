import { CRM_STATUS_VALUES, DATA_SOURCE_VALUES } from "../constants/crm";

export type CrmStatus = (typeof CRM_STATUS_VALUES)[number];
export type DataSource = (typeof DATA_SOURCE_VALUES)[number];

export type RawCsvRow = Record<string, string>;


export interface CrmRecord {
  created_at: string | null;
  name: string | null;
  email: string | null;
  country_code: string | null;
  mobile_without_country_code: string | null;
  company: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  lead_owner: string | null;
  crm_status: CrmStatus | null;
  crm_note: string | null;
  data_source: DataSource | null;
  possession_time: string | null;
  description: string | null;
}

export interface SkippedRecord {
  row: RawCsvRow;
  rowIndex: number;
  reason: string;
}

export interface ImportResult {
  importedRecords: CrmRecord[];
  skippedRecords: SkippedRecord[];
  totalRows: number;
  totalImported: number;
  totalSkipped: number;
  failedBatches: number;
  durationMs: number;
}

export interface AiBatchResponse {
  records: (CrmRecord & { _rowIndex?: number })[];
}
