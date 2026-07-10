import { CrmRecord } from "./types";

const CRM_HEADERS: (keyof CrmRecord)[] = [
  "created_at",
  "name",
  "email",
  "country_code",
  "mobile_without_country_code",
  "company",
  "city",
  "state",
  "country",
  "lead_owner",
  "crm_status",
  "crm_note",
  "data_source",
  "possession_time",
  "description",
];

function escapeCsvCell(value: string | null): string {
  if (value === null || value === undefined) return "";
  const needsQuoting = /[",\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuoting ? `"${escaped}"` : escaped;
}

export function exportImportedAsCsv(records: CrmRecord[]) {
  if (records.length === 0) return;

  const lines = [
    CRM_HEADERS.join(","),
    ...records.map((record) => CRM_HEADERS.map((key) => escapeCsvCell(record[key])).join(",")),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `groweasy-crm-import-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
