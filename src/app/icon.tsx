import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#18181b",
          borderRadius: "6px",
        }}
      >
        <div
          style={{
            display: "flex",
            color: "#ffffff",
            fontSize: "16px",
            fontWeight: 800,
            fontFamily: "system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          G→
        </div>
      </div>
    ),
    { ...size }
  );
}
