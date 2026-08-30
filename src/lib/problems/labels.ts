import type { ProblemCategory, ProblemFrequency } from "@/types/database.types";

/**
 * The form only offers four options. They map onto the existing
 * `problem_frequency` enum in the database so nothing else has to change.
 */
export const FREQUENCY_OPTIONS: { value: ProblemFrequency; label: string }[] = [
  { value: "daily", label: "Every day" },
  { value: "several_times_a_week", label: "A few times a week" },
  { value: "weekly", label: "Sometimes" },
  { value: "rarely", label: "Rarely" },
];

const FREQUENCY_LABELS: Record<ProblemFrequency, string> = {
  daily: "Every day",
  several_times_a_week: "A few times a week",
  weekly: "Sometimes",
  monthly: "Once in a while",
  rarely: "Rarely",
};

export function frequencyLabel(value: ProblemFrequency): string {
  return FREQUENCY_LABELS[value] ?? "Sometimes";
}

const PAIN_LABELS: Record<number, string> = {
  1: "A small annoyance",
  2: "Mildly irritating",
  3: "Genuinely frustrating",
  4: "A real drain on my time",
  5: "I need this fixed",
};

export function painLabel(level: number): string {
  return PAIN_LABELS[level] ?? PAIN_LABELS[3];
}

/** A restrained warm ramp for the small frustration indicator: calm -> hot. */
export function painColor(level: number): string {
  if (level >= 4) return "#D9462A"; // vermillion
  if (level === 3) return "#B4772E"; // ochre
  return "#7C7469"; // ink-faint
}

/**
 * Each category gets a small, desaturated colour. It is used only for tiny
 * markers and tinted labels, never for backgrounds or full cards.
 */
export const CATEGORY_META: Record<
  ProblemCategory,
  { label: string; color: string }
> = {
  food_dining: { label: "Food", color: "#C2571E" },
  housing_roommates: { label: "Home", color: "#4F7A3F" },
  education: { label: "Study", color: "#3F6CA6" },
  work_productivity: { label: "Work", color: "#7A6A57" },
  money_finance: { label: "Money", color: "#3E7C6A" },
  transport_travel: { label: "Getting around", color: "#5566A0" },
  local_services: { label: "Local services", color: "#A15C3A" },
  health_fitness: { label: "Health", color: "#B0555C" },
  shopping_commerce: { label: "Shopping", color: "#9A7326" },
  other: { label: "Everyday life", color: "#7A6BA0" },
};

export function categoryLabel(value: ProblemCategory): string {
  return CATEGORY_META[value]?.label ?? "Everyday life";
}

export function categoryColor(value: ProblemCategory): string {
  return CATEGORY_META[value]?.color ?? CATEGORY_META.other.color;
}

/** A readable, ink-leaning version of the category colour for label text. */
export function categoryTextColor(value: ProblemCategory): string {
  return `color-mix(in srgb, ${categoryColor(value)} 58%, #1C1917)`;
}

export const CATEGORY_FILTERS: { value: ProblemCategory; label: string }[] =
  Object.entries(CATEGORY_META).map(([value, meta]) => ({
    value: value as ProblemCategory,
    label: meta.label,
  }));

/**
 * Options for the "pick a category" control on the post form. Same list as the
 * filters, but "Everyday life" (the catch-all) sits last where it reads as a
 * fallback rather than a real choice.
 */
export const CATEGORY_OPTIONS: { value: ProblemCategory; label: string }[] = [
  ...CATEGORY_FILTERS.filter((c) => c.value !== "other"),
  { value: "other", label: CATEGORY_META.other.label },
];

export function isProblemCategory(value: unknown): value is ProblemCategory {
  return typeof value === "string" && value in CATEGORY_META;
}

/**
 * Light keyword guess so the board stays useful without asking people
 * to pick a category. Falls back to "other" whenever nothing matches.
 */
const CATEGORY_KEYWORDS: [ProblemCategory, string[]][] = [
  ["housing_roommates", ["rent", "landlord", "pg ", "flat", "apartment", "roommate", "flatmate", "hostel", "lease", "deposit", "tenant"]],
  ["food_dining", ["cook", "cooking", "recipe", "meal", "grocery", "groceries", "dinner", "lunch", "breakfast", "fridge", "leftover", "restaurant"]],
  ["transport_travel", ["parking", "commute", "traffic", "bus", "train", "metro", "flight", "cab", "drive", "driving", "car ", "bike", "scooter"]],
  ["local_services", ["plumber", "electrician", "repair", "handyman", "mechanic", "cleaner", "maid", "technician", "carpenter"]],
  ["education", ["textbook", "book", "college", "class", "exam", "study", "course", "school", "notes", "tuition", "homework"]],
  ["work_productivity", ["email", "meeting", "spreadsheet", "deadline", "invoice", "client", "work", "office", "task", "report"]],
  ["money_finance", ["bill", "split", "expense", "subscription", "budget", "payment", "money", "refund", "salary", "tax"]],
  ["shopping_commerce", ["return", "delivery", "order", "shopping", "package", "warranty", "resale", "secondhand", "second-hand", "marketplace"]],
  ["health_fitness", ["gym", "workout", "medicine", "prescription", "doctor", "appointment", "sleep", "diet", "pharmacy"]],
];

export function classifyCategory(text: string): ProblemCategory {
  const haystack = text.toLowerCase();
  for (const [category, words] of CATEGORY_KEYWORDS) {
    if (words.some((word) => haystack.includes(word))) return category;
  }
  return "other";
}

/** Turn a longer description into a short headline for lists and detail pages. */
const TITLE_MAX = 120;
const TRAILING_WORDS = new Set([
  "and", "or", "but", "so", "the", "a", "an", "to", "of", "in", "on", "for",
  "with", "that", "this", "i", "my", "it", "is", "as", "at", "by",
]);

export function deriveTitle(problem: string): string {
  const cleaned = problem
    .trim()
    .replace(/\s+/g, " ")
    // "WWWWWWWW..." / "!!!!!!" -> at most three, so a title is never one token.
    .replace(/(.)\1{3,}/g, "$1$1$1")
    // Any remaining unbroken run that would still blow out a card gets cut.
    .replace(/\S{40,}/g, (token) => `${token.slice(0, 39)}…`);

  const firstSentence = cleaned.split(/(?<=[.!?])\s/)[0] ?? cleaned;
  let base = firstSentence.length <= TITLE_MAX ? firstSentence : cleaned;

  if (base.length > TITLE_MAX) {
    let trimmed = base.slice(0, TITLE_MAX);
    const lastSpace = trimmed.lastIndexOf(" ");
    if (lastSpace > 48) trimmed = trimmed.slice(0, lastSpace);

    let words = trimmed.split(" ");
    while (
      words.length > 4 &&
      TRAILING_WORDS.has(words[words.length - 1].toLowerCase())
    ) {
      words = words.slice(0, -1);
    }
    base = `${words.join(" ")}…`;
  }

  base = base.replace(/[,;:\s]+$/, "").replace(/\.+$/, "").trim();

  // Nothing usable (symbols only, or a couple of characters): don't ship a
  // broken-looking headline.
  if (base.replace(/[^A-Za-z0-9]/g, "").length < 3) {
    return "A problem worth solving";
  }
  return base;
}

export function timeAgo(dateString: string): string {
  const then = new Date(dateString).getTime();
  const seconds = Math.floor((Date.now() - then) / 1000);

  if (seconds < 45) return "just now";
  if (seconds < 90) return "a minute ago";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? "an hour ago" : `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return days === 1 ? "yesterday" : `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return weeks === 1 ? "a week ago" : `${weeks} weeks ago`;

  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
