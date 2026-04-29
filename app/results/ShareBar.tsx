"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";

import { ShareCard } from "./ShareCard";
import { toast } from "@/components/Toaster";
import type { Vtuber } from "@/lib/vtubers";

type Props = {
  uuid: string;
  ranking: { vtuberId: number; rank: number }[];
  byId: Record<number, Vtuber>;
};

export function ShareBar({ uuid, ranking, byId }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/share/${uuid}`
      : "";

  async function handleDownload() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      // pixelRatio: 2 → retina-quality PNG. cacheBust avoids stale fonts.
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `relive-oddball-${new Date().toISOString().slice(0, 10)}.png`;
      a.click();
      toast.success("圖片已下載");
    } catch (e) {
      toast.error(`下載失敗：${e instanceof Error ? e.message : "未知錯誤"}`);
    } finally {
      setDownloading(false);
    }
  }

  async function handleShare() {
    const shareData = {
      title: "我的李賴虎怪咖排名",
      text: "誰最奇怪？這是我的排名 →",
      url: shareUrl,
    };
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share(shareData);
        toast.success("已分享");
        return;
      } catch {
        // user cancelled or browser blocked — fall through to copy
      }
    }
    await handleCopy();
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("連結已複製到剪貼簿");
    } catch {
      toast.error("複製失敗，瀏覽器可能不支援");
    }
  }

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    "誰最奇怪？這是我的 ReLive Oddball 排名 → ",
  )}&url=${encodeURIComponent(shareUrl)}&hashtags=ReLiveOddball`;
  const threadsUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(
    `誰最奇怪？這是我的 ReLive Oddball 排名 →\n${shareUrl}\n#ReLiveOddball`,
  )}`;

  return (
    <div className="flex flex-col items-stretch gap-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="rounded-full border-2 border-ink bg-rank-cold px-4 py-1.5 text-xs font-medium text-[#2D4A3A] hover:bg-rank-cool disabled:opacity-60"
        >
          {downloading ? "產生圖片中…" : "下載我的排名圖"}
        </button>
        <button
          onClick={handleShare}
          className="rounded-full border-2 border-ink bg-rank-warm px-4 py-1.5 text-xs font-medium text-[#5A3A1F] hover:bg-rank-mid"
        >
          分享
        </button>
        <button
          onClick={handleCopy}
          className="rounded-full border-2 border-ink bg-rank-mid px-4 py-1.5 text-xs font-medium text-[#5A4A1F] hover:bg-rank-warm"
        >
          複製專屬連結
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-ink-mute">
        <span>也可以發到</span>
        <a
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-edge underline-offset-2 hover:text-ink"
        >
          Twitter / X
        </a>
        <span>·</span>
        <a
          href={threadsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-edge underline-offset-2 hover:text-ink"
        >
          Threads
        </a>
      </div>

      {/* Hidden ShareCard rendered offscreen — we screenshot it on demand.
          Position absolute + left:-10000 keeps it out of layout but in the DOM
          so html-to-image can read its computed styles. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: -10000,
          top: 0,
          pointerEvents: "none",
        }}
      >
        <ShareCard ref={cardRef} ranking={ranking} byId={byId} />
      </div>
    </div>
  );
}
