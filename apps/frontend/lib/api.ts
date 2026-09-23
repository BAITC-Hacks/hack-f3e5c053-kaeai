const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

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
  status: "draft" | "ready" | "published";
  questions: ChallengeQuestion[];
  created_at: string;
  updated_at: string;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = typeof body?.detail === "string" ? body.detail : "Request failed";
    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

export function createChallenge(description: string) {
  return request<Challenge>("/api/challenges", { method: "POST", body: JSON.stringify({ description }) });
}

export function saveAnswers(challengeId: number, answers: Array<{ question_id: number; answer: string }>) {
  return request<Challenge>(`/api/challenges/${challengeId}/answers`, { method: "POST", body: JSON.stringify({ answers }) });
}

export function generateChallenge(challengeId: number) {
  return request<Challenge>(`/api/challenges/${challengeId}/generate`, { method: "POST" });
}

export function publishChallenge(challengeId: number) {
  return request<Challenge>(`/api/challenges/${challengeId}/publish`, { method: "POST" });
}
