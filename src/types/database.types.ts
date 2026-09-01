export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProblemCategory =
  | "education"
  | "work_productivity"
  | "money_finance"
  | "housing_roommates"
  | "food_dining"
  | "local_services"
  | "transport_travel"
  | "health_fitness"
  | "shopping_commerce"
  | "other";

export type ProblemFrequency =
  | "daily"
  | "several_times_a_week"
  | "weekly"
  | "monthly"
  | "rarely";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      problems: {
        Row: {
          id: string;
          author_id: string | null;
          title: string;
          description: string;
          category: ProblemCategory;
          frequency: ProblemFrequency;
          pain_level: number;
          current_workaround: string | null;
          me_too_count: number;
          comments_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id?: string | null;
          title: string;
          description: string;
          category: ProblemCategory;
          frequency: ProblemFrequency;
          pain_level: number;
          current_workaround?: string | null;
          me_too_count?: number;
          comments_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string | null;
          title?: string;
          description?: string;
          category?: ProblemCategory;
          frequency?: ProblemFrequency;
          pain_level?: number;
          current_workaround?: string | null;
          me_too_count?: number;
          comments_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      problem_validations: {
        Row: {
          id: string;
          problem_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          problem_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          problem_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      problem_comments: {
        Row: {
          id: string;
          problem_id: string;
          author_id: string;
          content: string;
          is_solution_proposal: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          problem_id: string;
          author_id: string;
          content: string;
          is_solution_proposal?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          problem_id?: string;
          author_id?: string;
          content?: string;
          is_solution_proposal?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      problem_solvers_notify: {
        Row: {
          id: string;
          problem_id: string;
          user_id: string;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          problem_id: string;
          user_id: string;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          problem_id?: string;
          user_id?: string;
          email?: string | null;
          created_at?: string;
        };
      };
      // Private. RLS-sealed; reachable only via the service role (server only).
      problem_notification_subscriptions: {
        Row: {
          id: string;
          problem_id: string;
          subscriber_id: string | null;
          email: string;
          unsubscribe_token: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          problem_id: string;
          subscriber_id?: string | null;
          email: string;
          unsubscribe_token?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          problem_id?: string;
          subscriber_id?: string | null;
          email?: string;
          unsubscribe_token?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Private. One row per reply; `comment_id` UNIQUE = idempotency key.
      reply_notifications: {
        Row: {
          id: string;
          comment_id: string;
          problem_id: string;
          status: "pending" | "sent" | "failed" | "skipped";
          attempts: number;
          error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          comment_id: string;
          problem_id: string;
          status?: "pending" | "sent" | "failed" | "skipped";
          attempts?: number;
          error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          comment_id?: string;
          problem_id?: string;
          status?: "pending" | "sent" | "failed" | "skipped";
          attempts?: number;
          error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      toggle_me_too: {
        Args: {
          target_problem_id: string;
        };
        Returns: {
          validated: boolean;
          me_too_count: number;
        };
      };
    };
    Enums: {
      problem_category: ProblemCategory;
      problem_frequency: ProblemFrequency;
    };
  };
}

