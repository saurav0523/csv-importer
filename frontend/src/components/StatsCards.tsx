import { CheckCircle2, XCircle, ListChecks, Timer } from "lucide-react";
import { cn } from "../lib/cn";

interface StatsCardsProps {
  totalRows: number;
  totalImported: number;
  totalSkipped: number;
  durationMs: number;
}

export function StatsCards({ totalRows, totalImported, totalSkipped, durationMs }: StatsCardsProps) {
  const cards = [
    {
      label: "Total rows",
      value: totalRows.toLocaleString(),
      icon: ListChecks,
      tone: "text-ink-700 bg-ink-100",
    },
    {
      label: "Imported",
      value: totalImported.toLocaleString(),
      icon: CheckCircle2,
      tone: "text-brand-700 bg-brand-50",
    },
    {
      label: "Skipped",
      value: totalSkipped.toLocaleString(),
      icon: XCircle,
      tone: "text-rose-700 bg-rose-50",
    },
    {
      label: "Processing time",
      value: `${(durationMs / 1000).toFixed(1)}s`,
      icon: Timer,
      tone: "text-signal-amberDark bg-amber-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, tone }) => (
        <div
          key={label}
          className="animate-fade-up rounded-xl2 border border-ink-100 bg-white p-4 shadow-card"
        >
          <div className={cn("mb-3 flex h-9 w-9 items-center justify-center rounded-full", tone)}>
            <Icon size={17} />
          </div>
          <p className="font-display text-2xl font-semibold text-ink-900">{value}</p>
          <p className="text-xs text-ink-500">{label}</p>
        </div>
      ))}
    </div>
  );
}
