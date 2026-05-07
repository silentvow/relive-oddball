// Top-of-page reminder explaining what the rank scale means.
// "1 = 最奇怪 ────→ N = 最正常". `count` defaults to 15 so existing call sites
// stay unchanged; the wang-low version passes count={7}.

type Props = {
  count?: number;
};

export function AxisBar({ count = 15 }: Props) {
  return (
    <div className="flex items-center justify-between rounded-slot border border-edge bg-cream-card px-4 py-2 text-xs text-ink-soft">
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-full bg-rank-hot" />
        <span className="font-medium">1 = 最奇怪</span>
      </span>
      <span className="hidden text-ink-ghost sm:inline">────────────────→</span>
      <span className="text-ink-ghost sm:hidden">→</span>
      <span className="flex items-center gap-1.5">
        <span className="font-medium">{count} = 最正常</span>
        <span className="inline-block h-3 w-3 rounded-full bg-rank-cold" />
      </span>
    </div>
  );
}
