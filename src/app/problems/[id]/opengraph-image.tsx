import { ImageResponse } from "next/og";
import { getProblem } from "@/lib/problems/data";
import { categoryColor, categoryLabel, frequencyLabel } from "@/lib/problems/labels";

export const alt = "Problem on ProblemForge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

export default async function Image({ params }: { params: { id: string } }) {
  const problem = await getProblem(params.id);

  const title = problem ? truncate(problem.title, 140) : "A problem worth solving";
  const eyebrow = problem
    ? `${frequencyLabel(problem.frequency)} · ${categoryLabel(problem.category)}`
    : "ProblemForge";
  const dotColor = problem ? categoryColor(problem.category) : "#D9462A";
  const peopleLine =
    problem && problem.me_too_count > 0
      ? `${problem.me_too_count.toLocaleString()} ${
          problem.me_too_count === 1 ? "person has" : "people have"
        } this too`
      : null;

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
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: "#D9462A",
            }}
          />
          <div
            style={{
              fontSize: 26,
              color: "#1C1917",
              fontWeight: 600,
              fontFamily: "Georgia, serif",
              letterSpacing: "-0.01em",
            }}
          >
            ProblemForge
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 24,
              fontFamily: "-apple-system, Helvetica, Arial, sans-serif",
              color: "#78716C",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 600,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: dotColor,
              }}
            />
            {eyebrow}
          </div>

          <div
            style={{
              fontSize: 56,
              lineHeight: 1.16,
              color: "#1C1917",
              fontWeight: 500,
              fontFamily: "Georgia, serif",
              letterSpacing: "-0.01em",
              maxWidth: 1000,
            }}
          >
            {title}
          </div>

          {peopleLine && (
            <div
              style={{
                fontSize: 26,
                color: "#57534E",
                fontFamily: "-apple-system, Helvetica, Arial, sans-serif",
              }}
            >
              {peopleLine}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
