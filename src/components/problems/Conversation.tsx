"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addComment } from "@/app/problems/actions";
import { timeAgo } from "@/lib/problems/labels";
import type { Comment } from "@/lib/problems/types";
import { cn } from "@/lib/utils";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function Conversation({
  problemId,
  initialComments,
  defaultName,
}: {
  problemId: string;
  initialComments: Comment[];
  defaultName: string;
}) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [name, setName] = useState(defaultName);
  const [newId, setNewId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const [pending, startTransition] = useTransition();

  const contentRef = useRef<HTMLTextAreaElement>(null);
  const newRef = useRef<HTMLLIElement>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const trimmedName = name.trim();
    const content = (contentRef.current?.value ?? "").trim();

    const nextErrors: Record<string, string> = {};
    if (!trimmedName) nextErrors.name = "Add your name.";
    if (content.length < 5) nextErrors.content = "Write a little more.";
    else if (content.length > 6000)
      nextErrors.content = "Keep it under 6000 characters.";
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setJustAdded(false);

    const formData = new FormData();
    formData.set("problem_id", problemId);
    formData.set("name", trimmedName);
    formData.set("content", content);

    const tempId = `temp-${Date.now()}`;
    const optimistic: Comment = {
      id: tempId,
      problem_id: problemId,
      author_name: trimmedName,
      content,
      created_at: new Date().toISOString(),
    };

    setComments((prev) => [...prev, optimistic]);
    setNewId(tempId);
    if (contentRef.current) contentRef.current.value = "";

    requestAnimationFrame(() => {
      const el = newRef.current;
      if (el && el.getBoundingClientRect().bottom > window.innerHeight) {
        el.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
          block: "center",
        });
      }
    });

    startTransition(async () => {
      const result = await addComment({ ok: false }, formData);
      if (!result.ok) {
        // Roll back the optimistic comment and give the user their text back
        // so a rejected reply is never lost.
        setComments((prev) => prev.filter((c) => c.id !== tempId));
        setNewId(null);
        if (contentRef.current) {
          contentRef.current.value = content;
          contentRef.current.focus();
        }
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        setFormError(
          result.error ?? (result.fieldErrors ? null : "That didn't save. Try again."),
        );
        return;
      }
      setJustAdded(true);
      router.refresh();
      window.setTimeout(() => setNewId(null), 2600);
    });
  }

  const heading =
    comments.length === 0
      ? "No replies yet"
      : `${comments.length} ${comments.length === 1 ? "reply" : "replies"}`;

  return (
    <section id="replies" className="mt-12 scroll-mt-24 border-t border-line pt-8">
      <h2 className="font-display text-2xl text-ink">{heading}</h2>
      <p className="mt-1 text-sm text-ink-muted">
        {comments.length === 0
          ? "No replies yet. If you have this problem too, say what you've tried or what you've figured out."
          : "Have this problem too? Add what you've tried, or what you know."}
      </p>

      {comments.length > 0 && (
        <ul className="mt-8 space-y-8">
          {comments.map((comment) => {
            const isNew = comment.id === newId;
            const isTemp = comment.id.startsWith("temp-");
            return (
              <li
                key={comment.id}
                ref={isNew ? newRef : undefined}
                className={cn(
                  "-mx-3 rounded-md border-b border-line-soft px-3 pb-8 last:border-0 last:pb-0",
                  isNew && "pf-rise pf-new-hint",
                )}
              >
                <p className="text-sm text-ink-faint">
                  <span className="font-medium text-ink">
                    {comment.author_name}
                  </span>
                  <span className="mx-2">·</span>
                  {isTemp ? "just now" : timeAgo(comment.created_at)}
                </p>
                <p className="mt-2 whitespace-pre-line leading-relaxed text-ink-soft">
                  {comment.content}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-10 flex flex-col gap-4 border-t border-line pt-8"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="comment-name" className="text-sm font-medium text-ink">
            Your name
          </label>
          <input
            id="comment-name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            aria-invalid={Boolean(fieldErrors.name)}
            className="w-full max-w-xs rounded-md border border-line-strong bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-150 focus:border-ink focus:ring-4 focus:ring-vermillion/10"
          />
          {fieldErrors.name && (
            <p className="pf-rise text-sm text-vermillion-dark">{fieldErrors.name}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="comment-content"
            className="text-sm font-medium text-ink"
          >
            What have you tried, or what do you know?
          </label>
          <textarea
            ref={contentRef}
            id="comment-content"
            name="content"
            rows={4}
            aria-invalid={Boolean(fieldErrors.content)}
            className="w-full resize-y rounded-md border border-line-strong bg-paper px-3.5 py-2.5 text-sm leading-relaxed text-ink outline-none transition-[border-color,box-shadow] duration-150 focus:border-ink focus:ring-4 focus:ring-vermillion/10"
          />
          {fieldErrors.content && (
            <p className="pf-rise text-sm text-vermillion-dark">
              {fieldErrors.content}
            </p>
          )}
        </div>

        {formError && (
          <p className="pf-rise text-sm text-vermillion-dark">{formError}</p>
        )}

        <div aria-live="polite" className="min-h-[1.25rem]">
          {justAdded && !pending && (
            <p className="pf-rise text-sm text-moss">
              Added to the conversation. Thanks for sharing.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="inline-flex items-center gap-2 self-start rounded-md bg-ink px-5 py-3 text-sm font-medium text-canvas transition-[transform,background-color] duration-200 hover:bg-vermillion active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending && (
            <span
              aria-hidden="true"
              className="pf-spin h-3.5 w-3.5 rounded-full border-2 border-canvas/40 border-t-canvas"
            />
          )}
          {pending ? "Adding…" : "Add your reply"}
        </button>
      </form>
    </section>
  );
}
