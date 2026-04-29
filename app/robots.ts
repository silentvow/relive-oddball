import type { MetadataRoute } from "next";

// Standard search-engine indexing config. Public pages welcome; the share
// pages /share/<uuid> are intentionally allowed too — they're meant to be
// shared, and uuids are hard to enumerate by guessing.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    // Replace once a custom domain is set up.
    sitemap: "https://relive-oddball.vercel.app/sitemap.xml",
  };
}
