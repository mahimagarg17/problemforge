import { ImageResponse } from "next/og";

// No per-request data here, so leave the default (node) runtime: Next can
// then prerender this once as a static asset instead of on every request.
export const alt = "ProblemForge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#FAF8F4",
          padding: "72px 80px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: "#D9462A",
            }}
          />
          <div
            style={{
              fontSize: 30,
              color: "#1C1917",
              fontWeight: 600,
              letterSpacing: "-0.01em",
            }}
          >
            ProblemForge
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 64,
              lineHeight: 1.12,
              color: "#1C1917",
              fontWeight: 500,
              letterSpacing: "-0.01em",
              maxWidth: 940,
            }}
          >
            Have a problem nobody has solved well yet?
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.5,
              color: "#57534E",
              fontFamily:
                "-apple-system, Helvetica, Arial, sans-serif",
              maxWidth: 820,
            }}
          >
            Post it. See who else has it, and what they&apos;ve tried.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
