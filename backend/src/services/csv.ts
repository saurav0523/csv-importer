import { parse } from "csv-parse/sync";
import { env } from "../config/env";
import { RawCsvRow } from "../types/crm";

export class CsvParseError extends Error {}

export function parseCsv(csvText: string): RawCsvRow[] {
  let rows: RawCsvRow[];

  try {
    rows = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
      bom: true,
    }) as RawCsvRow[];
  } catch (err) {
    throw new CsvParseError(`Failed to parse CSV: ${(err as Error).message}`);
  }

  if (rows.length === 0) {
    throw new CsvParseError("The uploaded CSV has no data rows.");
  }

  if (rows.length > env.MAX_ROWS_PER_IMPORT) {
    throw new CsvParseError(
      `CSV has ${rows.length} rows which exceeds the maximum of ${env.MAX_ROWS_PER_IMPORT} rows per import.`
    );
  }

  return rows;
}
