/**
 * Thin wrapper over the Resend HTTP API. The only place RESEND_API_KEY /
 * EMAIL_FROM are read. No SDK dependency; Resend takes JSON, so classic SMTP
 * header injection is not reachable, but we still reject CR/LF in the address.
 */

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

const ADDR_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function sendEmail(msg: {
  to: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return { ok: false, error: "not_configured" };

  const to = msg.to.trim();
  if (!ADDR_RE.test(to) || /[\r\n]/.test(to)) {
    return { ok: false, error: "invalid_recipient" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
        ...(process.env.EMAIL_REPLY_TO
          ? { reply_to: process.env.EMAIL_REPLY_TO }
          : {}),
        ...(msg.headers ? { headers: msg.headers } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { ok: false, error: `resend_${res.status}:${detail.slice(0, 200)}` };
    }
    const json = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: json.id ?? "unknown" };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "send_exception",
    };
  }
}
