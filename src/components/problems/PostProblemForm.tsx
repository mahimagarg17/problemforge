"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { postProblem, type FormState } from "@/app/problems/actions";
import { FREQUENCY_OPTIONS, painColor, painLabel } from "@/lib/problems/labels";
import { cn } from "@/lib/utils";

const INITIAL: FormState = { ok: false };

const FIELD_CLASS =
  "mt-4 w-full rounded-md border border-line-strong bg-paper px-4 py-3 text-base text-ink outline-none transition-[border-color,box-shadow] duration-150 focus:border-ink focus:ring-4 focus:ring-vermillion/10";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3.5 text-sm font-medium text-canvas transition-[transform,background-color] duration-200 hover:bg-vermillion active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending && (
        <span
          aria-hidden="true"
          className="pf-spin h-3.5 w-3.5 rounded-full border-2 border-canvas/40 border-t-canvas"
        />
      )}
      {pending ? "Posting…" : "Post the problem"}
      {!pending && <span aria-hidden="true">→</span>}
    </button>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="pf-rise mt-1.5 text-sm text-vermillion-dark">
      {message}
    </p>
  );
}

export function PostProblemForm({ defaultName }: { defaultName: string }) {
  const [state, formAction] = useFormState(postProblem, INITIAL);
  const [pain, setPain] = useState<number | null>(null);
  const err = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-12">
      {state.error && (
        <p className="pf-rise rounded-md border border-vermillion-line bg-vermillion-wash px-4 py-3 text-sm text-vermillion-dark">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="name" className="font-display text-xl text-ink">
          Your name
        </label>
        <p className="mt-1 text-sm text-ink-muted">
          Just so people know who posted it. A first name is fine.
        </p>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={defaultName}
          autoComplete="name"
          aria-invalid={Boolean(err.name)}
          aria-describedby={err.name ? "name-error" : undefined}
          className={cn(FIELD_CLASS, "max-w-sm")}
        />
        <FieldError id="name-error" message={err.name} />
      </div>

      <div>
        <label htmlFor="problem" className="font-display text-xl text-ink">
          What&apos;s the problem?
        </label>
        <p className="mt-1 text-sm text-ink-muted">
          Tell us what happens, why it bothers you, and what you&apos;ve already
          tried.
        </p>
        <textarea
          id="problem"
          name="problem"
          rows={6}
          aria-invalid={Boolean(err.problem)}
          aria-describedby={err.problem ? "problem-error" : undefined}
          className={cn(FIELD_CLASS, "resize-y leading-relaxed")}
        />
        <FieldError id="problem-error" message={err.problem} />
      </div>

      <fieldset>
        <legend className="font-display text-xl text-ink">
          How often does this happen?
        </legend>
        <div className="mt-4 flex flex-wrap gap-3">
          {FREQUENCY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="cursor-pointer transition-transform duration-150 active:scale-[0.97]"
            >
              <input
                type="radio"
                name="frequency"
                value={option.value}
                className="peer sr-only"
              />
              <span className="inline-block rounded-md border border-line-strong bg-paper px-4 py-2.5 text-sm text-ink-muted transition-[background-color,border-color,color] duration-150 hover:border-ink peer-checked:border-vermillion peer-checked:bg-vermillion peer-checked:text-canvas peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-vermillion">
                {option.label}
              </span>
            </label>
          ))}
        </div>
        <FieldError id="frequency-error" message={err.frequency} />
      </fieldset>

      <fieldset>
        <legend className="font-display text-xl text-ink">
          How frustrating is it?
        </legend>
        <p className="mt-1 text-sm text-ink-muted">
          1 is a small annoyance. 5 means you really want it fixed.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          {[1, 2, 3, 4, 5].map((level) => {
            const selected = pain === level;
            return (
              <label
                key={level}
                className="cursor-pointer transition-transform duration-150 active:scale-[0.94]"
              >
                <input
                  type="radio"
                  name="pain_level"
                  value={level}
                  onChange={() => setPain(level)}
                  className="peer sr-only"
                />
                <span
                  style={
                    selected
                      ? {
                          backgroundColor: painColor(level),
                          borderColor: painColor(level),
                          color: "#FAF8F4",
                        }
                      : undefined
                  }
                  className="flex h-12 w-12 items-center justify-center rounded-md border border-line-strong bg-paper text-base font-medium text-ink-muted transition-[background-color,border-color,color,transform] duration-150 hover:border-ink peer-checked:border-ink peer-checked:text-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-vermillion"
                >
                  {level}
                </span>
              </label>
            );
          })}
          <span
            className="ml-1 min-h-[1.25rem] text-sm text-ink-muted"
            aria-live="polite"
          >
            {pain !== null && (
              <span className="pf-rise inline-block">{painLabel(pain)}</span>
            )}
          </span>
        </div>
        <FieldError id="pain-error" message={err.pain_level} />
      </fieldset>

      <div>
        <label htmlFor="workaround" className="font-display text-xl text-ink">
          How do you deal with it right now?{" "}
          <span className="font-sans text-sm font-normal text-ink-faint">
            optional
          </span>
        </label>
        <p className="mt-1 text-sm text-ink-muted">
          Tell us what you do today, even if it isn&apos;t a great solution.
        </p>
        <textarea
          id="workaround"
          name="workaround"
          rows={4}
          aria-invalid={Boolean(err.workaround)}
          aria-describedby={err.workaround ? "workaround-error" : undefined}
          className={cn(FIELD_CLASS, "resize-y leading-relaxed")}
        />
        <FieldError id="workaround-error" message={err.workaround} />
      </div>

      <div className="border-t border-line pt-8">
        <SubmitButton />
        <p className="mt-4 text-sm text-ink-faint">
          No account needed. Your problem shows up right after you post it.
        </p>
      </div>
    </form>
  );
}
