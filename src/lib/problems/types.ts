import type {
  ProblemCategory,
  ProblemFrequency,
} from "@/types/database.types";

export type { ProblemCategory, ProblemFrequency };

export interface Problem {
  id: string;
  author_name: string;
  title: string;
  description: string;
  category: ProblemCategory;
  frequency: ProblemFrequency;
  pain_level: number;
  current_workaround: string | null;
  me_too_count: number;
  comments_count: number;
  created_at: string;
}

export interface Comment {
  id: string;
  problem_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface NewProblemInput {
  name: string;
  problem: string;
  frequency: ProblemFrequency;
  pain_level: number;
  workaround?: string;
}

export interface NewCommentInput {
  name: string;
  content: string;
}
