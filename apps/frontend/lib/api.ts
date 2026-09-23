const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type ChallengeQuestion = {
  id: number;
  question: string;
  answer: string | null;
  is_required: boolean;
};

export type Challenge = {
  id: number;
  raw_description: string;
  title: string | null;
  problem: string | null;
  goal: string | null;
  target_users: string | null;
  expected_result: string | null;
  success_metrics: string[];
  constraints: string[];
  recommended_skills: string[];
  readiness_score: number;
  status: string;
  questions: ChallengeQuestion[];
};

export type Application = {
  id: number;
  challenge_id: number;
  team_name: string;
  team_description: string;
  contact: string;
  message: string;
  created_at: string;
  status: "pending" | "selected" | "rejected";
};

export type AuthUser = {
  id: number;
  full_name: string;
  email: string;
  role: "business" | "student";
  created_at: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  user: AuthUser;
};

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(`Cannot connect to the backend at ${API_URL}. Start the backend and try again.`);
  }

  const text = await response.text();

  if (!response.ok) {
    let detail = `Request failed: ${response.status}`;
    try {
      const body = JSON.parse(text);
      if (typeof body.detail === "string") detail = body.detail;
      else if (Array.isArray(body.detail)) detail = body.detail.map((item: { msg?: string }) => item.msg || "Invalid input").join("; ");
    } catch {
      if (text) detail = text;
    }
    if (response.status === 401) detail = "Sign in to continue.";
    throw new Error(detail);
  }

  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}
