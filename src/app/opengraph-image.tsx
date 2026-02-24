import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "GoThere — Type a phrase, go to the page";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          padding: "80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Brand pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#18181b",
            color: "#ffffff",
            borderRadius: "9999px",
            padding: "10px 28px",
            fontSize: "22px",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: "48px",
          }}
        >
          GoThere
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              fontSize: "60px",
              fontWeight: 800,
              color: "#18181b",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              textAlign: "center",
            }}
          >
            When a link can&apos;t be clicked,
          </div>
          <div
            style={{
              fontSize: "60px",
              fontWeight: 800,
              color: "#18181b",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              textAlign: "center",
            }}
          >
            make a phrase.
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "28px",
            color: "#71717a",
            textAlign: "center",
            letterSpacing: "-0.02em",
            marginBottom: "56px",
          }}
        >
          Type the phrase. Go there.
        </div>

        {/* Domain */}
        <div
          style={{
            fontSize: "22px",
            color: "#a1a1aa",
            letterSpacing: "0.04em",
          }}
        >
          gothere.to
        </div>
      </div>
    ),
    { ...size }
  );
}
