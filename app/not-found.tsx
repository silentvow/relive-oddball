import Link from "next/link";

// Catches anything not matched by a route — most commonly a /share/[uuid]
// where the uuid doesn't exist or is malformed.
export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center md:py-24">
      <p className="text-xs uppercase tracking-wider text-ink-ghost">
        ReLive Oddball
      </p>
      <h1 className="mt-2 text-3xl font-medium md:text-4xl">這頁好像不見了</h1>
      <p className="mt-3 text-sm text-ink-mute">
        可能是連結打錯，或這個 uuid 還沒投過票。
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <Link
          href="/"
          className="rounded-full border-2 border-ink bg-rank-cold px-4 py-1.5 text-xs font-medium text-[#2D4A3A] hover:bg-rank-cool"
        >
          回首頁排我的 →
        </Link>
        <Link
          href="/results"
          className="rounded-full border border-edge-soft bg-cream-card px-3 py-1.5 text-xs text-ink-mute hover:bg-cream-deep"
        >
          看全站排行榜
        </Link>
      </div>
    </main>
  );
}
