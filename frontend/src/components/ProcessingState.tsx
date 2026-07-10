import { Loader2, Sparkles } from "lucide-react";

export function ProcessingState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl2 border border-ink-100 bg-white px-6 py-20 text-center shadow-card">
      <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Loader2 size={26} className="animate-spin" />
        <Sparkles size={14} className="absolute -right-1 -top-1 text-signal-amber" />
      </div>
      <p className="font-display text-lg font-semibold text-ink-900">Mapping your leads with AI</p>
      <p className="mt-1.5 text-sm text-ink-500">{label}…</p>
      <div className="mt-6 h-1.5 w-56 overflow-hidden rounded-full bg-ink-100">
        <div className="h-full w-1/3 animate-[loading_1.4s_ease-in-out_infinite] rounded-full bg-brand-500" />
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(120%); }
          100% { transform: translateX(280%); }
        }
      `}</style>
    </div>
  );
}
