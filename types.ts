export type AuthResponse = {
  token: {
    access: string;
    refresh: string;
  };
  user: {
    id: number;
    username: string;
    is_staff: boolean;
  };
};

export type Feedback = {
  subject: string;
  message: string;
  updated_at: string;
  created_at: string;
  status: "pending" | "reviewed" | "resolved";
  category: "academics" | "infrastructure" | "activities" | "other";
  rating: number;
  id: number;
};

export type CreateFeedbackPayload = Pick<
  Feedback,
  "subject" | "message" | "category" | "rating"
>;
