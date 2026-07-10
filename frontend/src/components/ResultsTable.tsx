"use client";

import { useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { CrmRecord, SkippedRecord } from "../lib/types";
import { StatusBadge } from "./ui/Badge";
import { cn } from "../lib/cn";

const CRM_COLUMNS: { key: keyof CrmRecord; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "mobile_without_country_code", label: "Mobile" },
  { key: "company", label: "Company" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "crm_status", label: "Status" },
  { key: "data_source", label: "Source" },
  { key: "crm_note", label: "Notes" },
  { key: "created_at", label: "Created at" },
];

interface ResultsTableProps {
  imported: CrmRecord[];
  skipped: SkippedRecord[];
}

export function ResultsTable({ imported, skipped }: ResultsTableProps) {
  const [tab, setTab] = useState<"imported" | "skipped">("imported");
  const parentRef = useRef<HTMLDivElement>(null);

  const rowCount = tab === "imported" ? imported.length : skipped.length;

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 12,
  });

  const skippedHeaders = useMemo(() => {
    const set = new Set<string>();
    skipped.forEach((s) => Object.keys(s.row).forEach((k) => set.add(k)));
    return Array.from(set).slice(0, 6);
  }, [skipped]);

  return (
    <div className="overflow-hidden rounded-xl2 border border-ink-100 bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3">
        <div className="flex gap-1 rounded-full bg-ink-100 p-1">
          <button
            onClick={() => setTab("imported")}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-bold transition-colors",
              tab === "imported" ? "bg-emerald-500 text-white shadow-md" : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
            )}
          >
            Imported ({imported.length})
          </button>
          <button
            onClick={() => setTab("skipped")}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-bold transition-colors",
              tab === "skipped" ? "bg-rose-500 text-white shadow-md" : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
            )}
          >
            Skipped ({skipped.length})
          </button>
        </div>
      </div>

      {rowCount === 0 ? (
        <div className="px-6 py-14 text-center text-sm text-ink-400">
          {tab === "imported" ? "No records were imported." : "Nothing was skipped. Every row mapped cleanly."}
        </div>
      ) : tab === "imported" ? (
        <div ref={parentRef} className="scrollbar-thin max-h-[520px] overflow-auto">
          <table className="w-full min-w-max border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-ink-900 text-white block">
              <tr className="flex">
                <th className="sticky left-0 z-20 flex w-12 shrink-0 items-center border-r border-slate-700 bg-slate-900 px-3 py-2.5 text-left text-xs font-medium text-slate-300">
                  #
                </th>
                {CRM_COLUMNS.map((col) => (
                  <th key={col.key} className="flex w-44 shrink-0 items-center whitespace-nowrap px-4 py-2.5 text-left text-xs font-medium text-slate-200">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody style={{ height: virtualizer.getTotalSize(), position: "relative", display: "block" }}>
              {virtualizer.getVirtualItems().map((vRow) => {
                const record = imported[vRow.index];
                return (
                  <tr
                    key={vRow.key}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${vRow.start}px)`,
                    }}
                    className="flex border-b border-slate-100 odd:bg-white even:bg-slate-50 hover:bg-slate-100"
                  >
                    <td className="sticky left-0 z-10 flex w-12 shrink-0 items-center border-r border-slate-100 bg-inherit px-3 text-xs text-slate-500">
                      {vRow.index + 1}
                    </td>
                    {CRM_COLUMNS.map((col) => (
                      <td
                        key={col.key}
                        className="flex w-44 shrink-0 items-center truncate whitespace-nowrap px-4 text-slate-800 font-medium"
                      >
                        {col.key === "crm_status" ? (
                          <StatusBadge status={record.crm_status} />
                        ) : (
                          record[col.key] || <span className="text-slate-300">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div ref={parentRef} className="scrollbar-thin max-h-[520px] overflow-auto">
          <table className="w-full min-w-max border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-ink-900 text-white block">
              <tr className="flex">
                <th className="sticky left-0 z-20 flex w-12 shrink-0 items-center border-r border-slate-700 bg-slate-900 px-3 py-2.5 text-left text-xs font-medium text-slate-300">
                  #
                </th>
                {skippedHeaders.map((h) => (
                  <th key={h} className="flex w-40 shrink-0 items-center whitespace-nowrap px-4 py-2.5 text-left text-xs font-medium text-slate-200">
                    {h}
                  </th>
                ))}
                <th className="flex w-64 shrink-0 items-center whitespace-nowrap px-4 py-2.5 text-left text-xs font-medium text-rose-400">
                  Skip reason
                </th>
              </tr>
            </thead>
            <tbody style={{ height: virtualizer.getTotalSize(), position: "relative", display: "block" }}>
              {virtualizer.getVirtualItems().map((vRow) => {
                const item = skipped[vRow.index];
                return (
                  <tr
                    key={vRow.key}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${vRow.start}px)`,
                    }}
                    className="flex border-b border-slate-100 odd:bg-white even:bg-rose-50/40 hover:bg-slate-50"
                  >
                    <td className="sticky left-0 z-10 flex w-12 shrink-0 items-center border-r border-slate-100 bg-inherit px-3 text-xs text-slate-500">
                      {item.rowIndex + 1}
                    </td>
                    {skippedHeaders.map((h) => (
                      <td key={h} className="flex w-40 shrink-0 items-center truncate whitespace-nowrap px-4 text-slate-800 font-medium">
                        {item.row[h] || <span className="text-slate-300">—</span>}
                      </td>
                    ))}
                    <td className="flex w-64 shrink-0 items-center truncate whitespace-nowrap px-4 text-rose-600 font-medium">
                      {item.reason}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
