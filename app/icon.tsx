import { ImageResponse } from "next/og";

// Browser tab + bookmark + iOS home-screen icon. Next.js auto-injects the
// link tag based on this file. 32x32 keeps the SVG crisp at favicon scale.

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#D49A8C",
          color: "#4A1B0C",
          fontSize: 14,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          letterSpacing: "-0.05em",
        }}
      >
        RL
      </div>
    ),
    { ...size },
  );
}
