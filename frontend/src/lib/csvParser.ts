import Papa from "papaparse";
import { RawCsvRow } from "./types";

export interface CsvPreview {
  headers: string[];
  rows: RawCsvRow[];
  totalRows: number;
}

const PREVIEW_ROW_LIMIT = 200;

export function parseCsvForPreview(file: File): Promise<CsvPreview> {
  return new Promise((resolve, reject) => {
    Papa.parse<RawCsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      preview: PREVIEW_ROW_LIMIT,
      complete: (results) => {
        const headers = results.meta.fields ?? [];
        if (headers.length === 0 || results.data.length === 0) {
          reject(new Error("This CSV appears to be empty or has no header row."));
          return;
        }
        resolve({
          headers,
          rows: results.data,
          totalRows: results.data.length,
        });
      },
      error: (err) => reject(err),
    });
  });
}
