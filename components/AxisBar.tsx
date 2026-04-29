// Top-of-page reminder explaining what the rank scale means.
// "1 = 最奇怪 ────→ 15 = 最不奇怪"
export function AxisBar() {
  return (
    <div className="flex items-center justify-between rounded-slot border border-edge bg-cream-card px-4 py-2 text-xs text-ink-soft">
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-full bg-rank-hot" />
        <span className="font-medium">1 = 最奇怪</span>
      </span>
      <span className="hidden text-ink-ghost sm:inline">────────────────→</span>
      <span className="text-ink-ghost sm:hidden">→</span>
      <span className="flex items-center gap-1.5">
        <span className="font-medium">15 = 最不奇怪</span>
        <span className="inline-block h-3 w-3 rounded-full bg-rank-cold" />
      </span>
    </div>
  );
}
