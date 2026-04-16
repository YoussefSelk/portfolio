import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

export default function TwitterImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "64px",
        background: "linear-gradient(135deg, #0b1220 0%, #121a2c 100%)",
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 76,
          fontWeight: 800,
          lineHeight: 1.04,
          letterSpacing: -1,
          marginBottom: 20,
        }}
      >
        Youssef Selk
      </div>
      <div
        style={{
          fontSize: 44,
          fontWeight: 700,
          color: "#34f5cd",
          marginBottom: 24,
        }}
      >
        Official Portfolio
      </div>
      <div
        style={{
          fontSize: 30,
          color: "#d2d9e8",
          maxWidth: 980,
        }}
      >
        I build secure, scalable full-stack systems with measurable impact.
      </div>
      <div
        style={{
          marginTop: 48,
          fontSize: 28,
          color: "#9eb0cd",
        }}
      >
        youssefselk.site
      </div>
    </div>,
    {
      ...size,
    },
  );
}
