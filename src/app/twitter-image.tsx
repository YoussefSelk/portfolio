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
        justifyContent: "space-between",
        padding: "42px 52px",
        background: "#131110",
        color: "#f1eee6",
        fontFamily: "Space Grotesk, Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 20,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "#b9b3a7",
        }}
      >
        <span>ISSUE 2026 · PORTFOLIO OF YOUSSEF SELK</span>
        <span style={{ color: "#c6f24e" }}>AVAILABLE · LILLE</span>
      </div>

      <div
        style={{
          width: "100%",
          height: 12,
          background:
            "repeating-linear-gradient(-45deg, #ffd128, #ffd128 12px, #000 12px, #000 24px)",
          border: "1px solid rgba(241, 238, 230, 0.18)",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div
          style={{
            fontSize: 108,
            fontWeight: 800,
            lineHeight: 0.86,
            letterSpacing: -4,
            textTransform: "uppercase",
          }}
        >
          Youssef Selk
        </div>
        <div
          style={{
            maxWidth: 960,
            fontSize: 36,
            fontFamily: "Georgia, Times New Roman, serif",
            fontStyle: "italic",
            lineHeight: 1.35,
          }}
        >
          Builds Laravel and Spring backends that survive Monday morning
          deploys.
        </div>
        <div
          style={{
            display: "flex",
            gap: 40,
            marginTop: 6,
          }}
        >
          {[
            { value: "+20%", label: "Team Velocity" },
            { value: "-30%", label: "Regressions" },
            { value: "+40%", label: "Productivity" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                borderLeft: "1px solid rgba(241, 238, 230, 0.22)",
                paddingLeft: 20,
              }}
            >
              <span
                style={{
                  fontSize: 58,
                  lineHeight: 0.95,
                  color: "#c6f24e",
                  fontWeight: 800,
                  letterSpacing: -1,
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  fontSize: 15,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: "#b9b3a7",
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 24,
          letterSpacing: 1,
        }}
      >
        <span style={{ color: "#7a3aff" }}>
          DISPATCH · WORK · BUILD · TIMELINE
        </span>
        <span style={{ color: "#f1eee6" }}>youssefselk.site</span>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
