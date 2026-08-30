import { z } from "zod";

export const problemFrequencyEnum = z.enum([
  "daily",
  "several_times_a_week",
  "weekly",
  "monthly",
  "rarely",
]);

export const problemCategoryEnum = z.enum([
  "education",
  "work_productivity",
  "money_finance",
  "housing_roommates",
  "food_dining",
  "local_services",
  "transport_travel",
  "health_fitness",
  "shopping_commerce",
  "other",
]);

export const newProblemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Add your name so people know who posted this.")
    .max(60, "That name is a little long. Keep it under 60 characters."),
  problem: z
    .string()
    .trim()
    .min(20, "Tell us a bit more so others can recognise it. At least a sentence or two.")
    .max(6000, "Keep it under 6000 characters."),
  category: problemCategoryEnum.optional(),
  frequency: z.enum(["daily", "several_times_a_week", "weekly", "rarely"], {
    errorMap: () => ({ message: "Pick how often this happens." }),
  }),
  pain_level: z.coerce
    .number()
    .int()
    .min(1, "Pick how frustrating it is.")
    .max(5, "Pick how frustrating it is."),
  workaround: z
    .string()
    .trim()
    .max(3000, "Keep it under 3000 characters.")
    .optional()
    .or(z.literal("")),
});

export type NewProblemValues = z.infer<typeof newProblemSchema>;

export const newCommentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Add your name.")
    .max(60, "Keep your name under 60 characters."),
  content: z
    .string()
    .trim()
    .min(5, "Write a little more.")
    .max(6000, "Keep it under 6000 characters."),
});

export type NewCommentValues = z.infer<typeof newCommentSchema>;
