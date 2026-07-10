import { cn } from "../../lib/cn";

const STATUS_STYLES: Record<string, string> = {
  GOOD_LEAD_FOLLOW_UP: "bg-brand-50 text-brand-700 border-brand-300",
  SALE_DONE: "bg-emerald-50 text-emerald-700 border-emerald-300",
  DID_NOT_CONNECT: "bg-amber-50 text-amber-700 border-amber-300",
  BAD_LEAD: "bg-rose-50 text-rose-700 border-rose-300",
};

export function StatusBadge({ status }: { status: string | null }) {
  if (!status) {
    return <span className="text-xs text-ink-300">—</span>;
  }
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-tight",
        STATUS_STYLES[status] ?? "border-ink-300 bg-ink-100 text-ink-700"
      )}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
