export type CrmStatus =
  | "GOOD_LEAD_FOLLOW_UP"
  | "DID_NOT_CONNECT"
  | "BAD_LEAD"
  | "SALE_DONE";

export type DataSource =
  | "leads_on_demand"
  | "meridian_tower"
  | "eden_park"
  | "varah_swamy"
  | "sarjapur_plots";

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

export type RawCsvRow = Record<string, string>;

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

export type ImportStage = "idle" | "preview" | "processing" | "done" | "error";
