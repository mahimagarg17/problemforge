import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const TOKEN_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function page(inner: string): Response {
  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Unsubscribe · ProblemForge</title>
</head>
<body style="margin:0;background:#FAF8F4;color:#1C1917;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:460px;margin:14vh auto 0;padding:0 24px;">
    <p style="font-size:15px;font-weight:600;letter-spacing:.01em;margin:0 0 18px;">ProblemForge</p>
    ${inner}
  </div>
</body></html>`;
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

const INVALID = page(
  `<p style="color:#57534E;line-height:1.6;">This unsubscribe link is not valid or has already been used.</p>`,
);
const DONE = page(
  `<p style="color:#57534E;line-height:1.6;">Done. You won't get any more emails about replies to that problem.</p>`,
);

export async function GET(request: Request): Promise<Response> {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!TOKEN_RE.test(token)) return INVALID;
  return page(`
    <p style="color:#57534E;line-height:1.6;margin:0 0 16px;">Stop getting an email when someone replies to your problem?</p>
    <form method="post" action="/unsubscribe?token=${encodeURIComponent(token)}">
      <button type="submit" style="background:#1C1917;color:#FAF8F4;border:0;border-radius:6px;padding:11px 22px;font-size:14px;font-weight:500;cursor:pointer;">Unsubscribe</button>
    </form>`);
}

export async function POST(request: Request): Promise<Response> {
  // Also handles Gmail / Apple Mail one-click (List-Unsubscribe-Post).
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!TOKEN_RE.test(token)) return INVALID;

  const admin = createAdminClient();
  if (admin) {
    const { error } = await admin
      .from("problem_notification_subscriptions")
      .delete()
      .eq("unsubscribe_token", token);
    if (error) {
      console.error("[pf:notify] unsubscribe failed:", error.message);
    } else {
      console.log(
        "[pf:analytics] notification_unsubscribed",
        JSON.stringify({ via: "link" }),
      );
    }
  }
  return DONE;
}
