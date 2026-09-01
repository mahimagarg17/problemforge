import { createAdminClient } from "@/lib/supabase/admin";
import { renderReplyNotificationEmail } from "./email";
import { emailConfigured, sendEmail } from "./send";

function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL || "https://problemforge-gamma.vercel.app"
  ).replace(/\/+$/, "");
}

function log(event: string, data: Record<string, unknown>) {
  console.log(`[pf:notify] ${event}`, JSON.stringify(data));
}
function analytics(event: string, data: Record<string, unknown>) {
  console.log(`[pf:analytics] ${event}`, JSON.stringify(data));
}

/**
 * Best-effort reply notification. Call it right after a reply row is saved.
 *
 * Guarantees:
 *  - Never throws. A provider outage cannot fail the user's reply.
 *  - At most one email per reply, ever: `reply_notifications.comment_id` is
 *    UNIQUE and we claim it with an atomic upsert before doing any work.
 *  - Self-replies (same `author_id` as the problem) send nothing.
 *  - Sends nothing when the problem has no notify email, or when the email
 *    provider / sender domain is not configured yet (records 'skipped').
 */
export async function maybeSendReplyNotification(params: {
  commentId: string;
  problemId: string;
  replierId: string;
}): Promise<void> {
  const { commentId, problemId } = params;
  try {
    const admin = createAdminClient();
    if (!admin) {
      log("skipped_no_service_role", { commentId });
      return;
    }

    // 1. Claim this comment. Empty result => another attempt already owns it.
    const { data: claim, error: claimErr } = await admin
      .from("reply_notifications")
      .upsert(
        { comment_id: commentId, problem_id: problemId, status: "pending" },
        { onConflict: "comment_id", ignoreDuplicates: true },
      )
      .select("id");
    if (claimErr) {
      log("claim_error", { commentId, error: claimErr.message });
      return;
    }
    if (!claim || claim.length === 0) {
      log("already_claimed", { commentId });
      return;
    }

    const finish = async (
      status: "sent" | "failed" | "skipped",
      error: string | null = null,
    ) => {
      await admin
        .from("reply_notifications")
        .update({
          status,
          error,
          attempts: 1,
          updated_at: new Date().toISOString(),
        })
        .eq("comment_id", commentId);
    };

    // 2. Load the reply, its problem, and the (private) subscription.
    const [{ data: comment }, { data: problem }] = await Promise.all([
      admin
        .from("problem_comments")
        .select("id, author_id, author_name, content")
        .eq("id", commentId)
        .maybeSingle(),
      admin
        .from("problems")
        .select("id, title, author_id")
        .eq("id", problemId)
        .maybeSingle(),
    ]);
    if (!comment || !problem) {
      await finish("skipped", "missing_rows");
      return;
    }

    // 3. Self-reply? Identity is the auth user id, never a typed display name.
    if (
      comment.author_id &&
      problem.author_id &&
      comment.author_id === problem.author_id
    ) {
      log("skipped_self_reply", { commentId });
      await finish("skipped", "self_reply");
      return;
    }

    const { data: sub } = await admin
      .from("problem_notification_subscriptions")
      .select("email, unsubscribe_token")
      .eq("problem_id", problemId)
      .maybeSingle();
    if (!sub?.email) {
      log("skipped_no_subscription", { commentId });
      await finish("skipped", "no_email");
      return;
    }

    // 4. Provider / sender domain not wired up yet: record and stop.
    if (!emailConfigured()) {
      log("recorded_not_configured", { commentId });
      await finish("skipped", "not_configured");
      return;
    }

    // 5. Render and send.
    const viewUrl = `${siteUrl()}/problems/${problemId}#replies`;
    const unsubscribeUrl = `${siteUrl()}/unsubscribe?token=${sub.unsubscribe_token}`;
    const { subject, html, text } = renderReplyNotificationEmail({
      problemTitle: problem.title,
      replyAuthor: comment.author_name || "Someone",
      replyBody: comment.content,
      viewUrl,
      unsubscribeUrl,
    });

    analytics("reply_notification_attempted", { problemId });
    const result = await sendEmail({
      to: sub.email,
      subject,
      html,
      text,
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    if (result.ok) {
      log("sent", { commentId, id: result.id });
      analytics("reply_notification_sent", { problemId });
      await finish("sent");
    } else {
      log("failed", { commentId, error: result.error });
      analytics("reply_notification_failed", { problemId, error: result.error });
      await finish("failed", result.error);
    }
  } catch (err) {
    // Swallow: the reply itself already succeeded.
    log("exception", {
      commentId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
