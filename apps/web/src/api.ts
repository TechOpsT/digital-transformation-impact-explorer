import type { AssessmentResult, Dimension, Questionnaire } from "./types";

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers }
  });
  if (!response.ok) {
    const problem = await response.json().catch(() => null) as { detail?: string; title?: string } | null;
    throw new ApiError(problem?.detail ?? problem?.title ?? "The service could not complete the request.", response.status);
  }
  return response.json() as Promise<T>;
}

export const api = {
  dimensions: () => request<Dimension[]>("/api/content/dimensions"),
  questionnaire: () => request<Questionnaire>("/api/content/questionnaires/current"),
  startAssessment: (questionnaireVersion: string) => request<{ id: string }>("/api/assessments", { method: "POST", body: JSON.stringify({ questionnaireVersion }) }),
  submitResponses: (assessmentId: string, responses: Array<{ questionId: string; optionId: string }>) => request(`/api/assessments/${assessmentId}/responses`, { method: "POST", body: JSON.stringify({ responses }) }),
  completeAssessment: (assessmentId: string) => request<AssessmentResult>(`/api/assessments/${assessmentId}/complete`, { method: "POST" }),
  result: (assessmentId: string) => request<AssessmentResult>(`/api/assessments/${assessmentId}/results`)
};
