"use client";

import { CsvPreview } from "../lib/csvParser";

interface PreviewTableProps {
  preview: CsvPreview;
}

export function PreviewTable({ preview }: PreviewTableProps) {
  const { headers, rows, totalRows } = preview;
  const shownCount = rows.length;

  return (
    <div className="overflow-hidden rounded-xl2 border border-ink-100 bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3.5">
        <div>
          <h3 className="font-display text-sm font-semibold text-ink-900">Raw file preview</h3>
          <p className="text-xs text-ink-500">
            Showing {shownCount.toLocaleString()} of {totalRows.toLocaleString()} rows · {headers.length}{" "}
            columns detected · no AI processing yet
          </p>
        </div>
      </div>

      <div className="scrollbar-thin max-h-[420px] overflow-auto">
        <table className="w-full min-w-max border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-ink-900 text-white">
            <tr>
              <th className="sticky left-0 z-20 border-r border-ink-700 bg-ink-900 px-3 py-2.5 text-left text-xs font-medium text-ink-300">
                #
              </th>
              {headers.map((header) => (
                <th
                  key={header}
                  className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-medium tracking-wide text-ink-100"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-ink-50 odd:bg-white even:bg-ink-50/60 hover:bg-brand-50/60"
              >
                <td className="sticky left-0 z-10 border-r border-ink-100 bg-inherit px-3 py-2 text-xs text-ink-300">
                  {idx + 1}
                </td>
                {headers.map((header) => (
                  <td key={header} className="max-w-[220px] truncate whitespace-nowrap px-4 py-2 text-ink-700">
                    {row[header] || <span className="text-ink-300">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
