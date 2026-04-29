import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

import { Toaster } from "@/components/Toaster";

const noto = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "李賴虎怪咖排名生成器 — 誰最奇怪？",
  description:
    "選出你心目中的 ReLive Project Vtuber 怪咖排行。奇怪沒有對錯，就是你的感覺。",
  openGraph: {
    title: "李賴虎怪咖排名生成器 — 誰最奇怪？",
    description:
      "選出你心目中的 ReLive Project Vtuber 怪咖排行。奇怪沒有對錯，就是你的感覺。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant" className={noto.variable}>
      <body className="font-sans">
        {children}
        <Toaster />
        {/* No-ops in dev; only emit data when deployed to Vercel. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
