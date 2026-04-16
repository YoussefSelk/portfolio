import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";
export const size = {
  width: 180,
  height: 180,
};

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#131110",
      }}
    >
      <div
        style={{
          width: 152,
          height: 152,
          borderRadius: 32,
          background: "#131110",
          border: "2px solid rgba(242, 237, 226, 0.25)",
          display: "flex",
          flexDirection: "column",
          padding: 16,
        }}
      >
        <div
          style={{
            width: "100%",
            height: 10,
            background:
              "repeating-linear-gradient(-45deg, #ffd128, #ffd128 10px, #000 10px, #000 20px)",
          }}
        />
        <div
          style={{
            marginTop: 12,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            color: "#c6f24e",
            fontWeight: 800,
            lineHeight: 0.84,
            letterSpacing: -2,
            fontSize: 58,
            textTransform: "uppercase",
            fontFamily: "Space Grotesk, Arial, sans-serif",
          }}
        >
          <span>Y</span>
          <span style={{ color: "#f2ede2" }}>S</span>
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
