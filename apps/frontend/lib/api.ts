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
};

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `Request failed: ${response.status}`);
  }

  return response.json();
}