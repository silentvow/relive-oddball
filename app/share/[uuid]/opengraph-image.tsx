import { ImageResponse } from "next/og";

import { fetchMyRanking, fetchVtubers } from "@/lib/data";

// Standard OG dimensions. Both Twitter and Facebook honor 1200x630.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ReLive Oddball ranking card";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Pulls the woff2 URL from a Google Fonts CSS response and downloads it.
// Limiting to `text=` only requests the glyphs we actually use, so the image
// generation stays fast even for CJK fonts. We pass an actual browser UA
// because the Google Fonts CSS endpoint serves woff2 only to "modern" UAs.
async function loadFont(family: string, weight: number, text: string) {
  const cssUrl =
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}` +
    `:wght@${weight}&text=${encodeURIComponent(text)}&display=swap`;
  const css = await fetch(cssUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  }).then((r) => r.text());
  const fontUrl = css.match(/src:\s*url\(([^)]+)\)\s*format/)?.[1];
  if (!fontUrl) throw new Error("font url not found in google fonts css");
  return fetch(fontUrl).then((r) => r.arrayBuffer());
}

export default async function OpenGraphImage({
  params,
}: {
  params: { uuid: string };
}) {
  if (!UUID_RE.test(params.uuid)) {
    return new ImageResponse(<div>not found</div>, { ...size });
  }

  const [vtubers, ranking] = await Promise.all([
    fetchVtubers(),
    fetchMyRanking(params.uuid),
  ]);
  const byId = Object.fromEntries(vtubers.map((v) => [v.id, v]));

  const top3 = (ranking ?? []).slice(0, 3).map((r) => byId[r.vtuberId]).filter(Boolean);

  // Compose every Chinese glyph used in the image, plus latin used in branding.
  const glyphs = "誰最奇怪我的ReLive奇怪度排名沒有對錯就是你感覺Oddball#";
  const fontData = await loadFont("Noto Sans TC", 500, glyphs).catch(() => null);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#F5EBD8",
          color: "#3A3530",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 64,
          fontFamily: "Noto Sans TC, sans-serif",
        }}
      >
        <div style={{ fontSize: 28, color: "#8A7E6E", letterSpacing: "0.05em" }}>
          ReLive Oddball
        </div>
        <div style={{ fontSize: 64, fontWeight: 500, marginTop: 12 }}>
          我的奇怪度排名
        </div>
        <div style={{ fontSize: 24, color: "#6F665A", marginTop: 4 }}>
          奇怪沒有對錯，就是我的感覺
        </div>

        <div
          style={{
            display: "flex",
            gap: 28,
            marginTop: 56,
            alignItems: "flex-end",
          }}
        >
          {top3.map((v, i) => {
            const rank = i + 1;
            const ringColor = rank === 1 ? "#C49B8C" : rank === 2 ? "#D9BFA8" : "#DDC987";
            const size = rank === 1 ? 200 : 160;
            return (
              <div
                key={v.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 999,
                    background: ringColor,
                    color: "#3A3530",
                    fontSize: 22,
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {rank}
                </div>
                <div
                  style={{
                    width: size,
                    height: size,
                    borderRadius: 999,
                    background: v.bgColor,
                    color: v.fgColor,
                    border: "4px solid #3A3530",
                    fontSize: rank === 1 ? 36 : 30,
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {v.code}
                </div>
                <div style={{ fontSize: 22, color: "#3A3530" }}>{v.name}</div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            marginTop: "auto",
            paddingTop: 40,
            fontSize: 20,
            color: "#8A7E6E",
          }}
        >
          <span>#ReLiveOddball</span>
          <span>relive-oddball.vercel.app</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: "Noto Sans TC", data: fontData, style: "normal", weight: 500 }]
        : undefined,
    },
  );
}
