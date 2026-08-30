import type { MetadataRoute } from "next";
import { listProblems } from "@/lib/problems/data";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://problemforge-gamma.vercel.app";

// Reads live problem rows (via the cookie-aware Supabase client), so render it
// per-request rather than trying to freeze it at build time.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/problems`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/problems/new`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/how-it-works`, changeFrequency: "monthly", priority: 0.4 },
  ];

  let problemRoutes: MetadataRoute.Sitemap = [];
  try {
    const problems = await listProblems();
    problemRoutes = problems.map((p) => ({
      url: `${SITE_URL}/problems/${p.id}`,
      lastModified: p.created_at,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch {
    // A sitemap without every detail page still beats a 404.
  }

  return [...staticRoutes, ...problemRoutes];
}
