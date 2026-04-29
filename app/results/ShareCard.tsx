"use client";

import { forwardRef } from "react";

import { Avatar } from "@/components/Avatar";
import type { Vtuber } from "@/lib/vtubers";

type Props = {
  ranking: { vtuberId: number; rank: number }[];
  byId: Record<number, Vtuber>;
};

// The DOM node we feed to html-to-image.
// Fixed 640px wide so the rendered PNG is consistent regardless of viewport.
// Renders off-screen until the user triggers Download — we keep it mounted
// (just visually hidden) so the screenshot is instant.
export const ShareCard = forwardRef<HTMLDivElement, Props>(function ShareCard(
  { ranking, byId },
  ref,
) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  return (
    <div
      ref={ref}
      style={{
        width: 640,
        background: "#F5EBD8",
        color: "#3A3530",
        padding: 32,
        fontFamily: "var(--font-noto), system-ui, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "#8A7E6E",
            letterSpacing: "0.05em",
          }}
        >
          ReLive Oddball · 我的 ReLive 奇怪度排名
        </div>
        <div style={{ fontSize: 12, color: "#B5A990", marginTop: 4 }}>
          奇怪沒有對錯，就是我的感覺 · {today}
        </div>
      </div>

      {/* 2-column grid: 1-8 left, 9-15 right. CSS columns balance heights. */}
      <div
        style={{
          background: "#FAF4E5",
          border: "1.5px solid #DECEB0",
          borderRadius: 16,
          padding: 18,
        }}
      >
        <ol
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            columnCount: 2,
            columnGap: 24,
          }}
        >
          {ranking.map(({ vtuberId, rank }) => {
            const v = byId[vtuberId];
            if (!v) return null;
            return (
              <li
                key={rank}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "3px 0",
                  fontSize: 14,
                  breakInside: "avoid",
                }}
              >
                <span
                  style={{
                    width: 22,
                    textAlign: "right",
                    color: "#A89880",
                    fontSize: 12,
                  }}
                >
                  {rank}
                </span>
                <Avatar vtuber={v} size={26} />
                <span style={{ color: "#3A3530" }}>{v.name}</span>
              </li>
            );
          })}
        </ol>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 16,
          fontSize: 11,
          color: "#B5A990",
        }}
      >
        <span style={{ fontWeight: 500, color: "#8A7E6E" }}>#ReLiveOddball</span>
        <span>relive-oddball.vercel.app</span>
      </div>
    </div>
  );
});
