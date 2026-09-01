/**
 * Pure rendering for the "someone replied" email. No I/O, no secrets.
 * Every piece of user-generated text is HTML-escaped before it touches the
 * template, and the plain-text part is used as the real body too.
 */

const EXCERPT_MAX = 300;

export function escapeHtml(input: string): string {
  return String(input).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c] as string,
  );
}

/** Collapse whitespace and cut to a readable preview length. */
export function excerpt(input: string, max = EXCERPT_MAX): string {
  const clean = String(input).replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).replace(/\s+\S*$/, "").trimEnd() + "…";
}

export interface ReplyEmailInput {
  problemTitle: string;
  replyAuthor: string;
  replyBody: string;
  viewUrl: string;
  unsubscribeUrl: string;
}

export function renderReplyNotificationEmail(input: ReplyEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = "Someone replied to your ProblemForge problem";

  const titlePlain = excerpt(input.problemTitle, 200);
  const authorPlain = excerpt(input.replyAuthor || "Someone", 80);
  const bodyPlain = excerpt(input.replyBody);

  const text = [
    "ProblemForge",
    "",
    "Someone replied to your problem:",
    `"${titlePlain}"`,
    "",
    `${authorPlain} replied:`,
    `"${bodyPlain}"`,
    "",
    `View reply: ${input.viewUrl}`,
    "",
    "—",
    "Problems and replies on ProblemForge are user-generated. Use your own judgement before acting on suggestions.",
    `Unsubscribe from replies to this problem: ${input.unsubscribeUrl}`,
  ].join("\n");

  const title = escapeHtml(titlePlain);
  const author = escapeHtml(authorPlain);
  const body = escapeHtml(bodyPlain);
  const view = escapeHtml(input.viewUrl);
  const unsub = escapeHtml(input.unsubscribeUrl);

  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#FAF8F4;padding:24px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1C1917;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;margin:0 auto;">
    <tr><td style="background:#ffffff;border:1px solid #E7E2D8;border-radius:8px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr><td style="padding:28px 28px 4px;">
          <p style="margin:0 0 20px;font-size:15px;font-weight:600;letter-spacing:.01em;">ProblemForge</p>
          <p style="margin:0 0 6px;color:#57534E;font-size:14px;">Someone replied to your problem:</p>
          <p style="margin:0 0 22px;font-size:17px;line-height:1.4;font-weight:500;">${title}</p>
          <p style="margin:0 0 6px;color:#57534E;font-size:14px;">${author} replied:</p>
          <p style="margin:0 0 26px;font-size:15px;line-height:1.6;color:#292524;white-space:pre-wrap;">${body}</p>
          <p style="margin:0 0 30px;">
            <a href="${view}" style="display:inline-block;background:#1C1917;color:#FAF8F4;text-decoration:none;font-size:14px;font-weight:500;padding:11px 22px;border-radius:6px;">View reply</a>
          </p>
        </td></tr>
        <tr><td style="padding:16px 28px 24px;border-top:1px solid #EFEAE1;">
          <p style="margin:0;color:#8A8378;font-size:12px;line-height:1.7;">
            Problems and replies on ProblemForge are user-generated. Use your own judgement before acting on suggestions.<br>
            <a href="${unsub}" style="color:#8A8378;text-decoration:underline;">Unsubscribe from replies to this problem</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
}
