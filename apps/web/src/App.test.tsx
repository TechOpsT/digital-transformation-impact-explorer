import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, test, vi } from "vitest";
import { App } from "./App";

const ok = (value: unknown) => new Response(JSON.stringify(value), { status: 200, headers: { "Content-Type": "application/json" } });

beforeEach(() => vi.stubGlobal("fetch", vi.fn(async () => ok([]))));

test("renders the product purpose and loaded dimensions", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => ok([{ id: "software-delivery", title: "Software delivery", description: "Move ideas safely." }])));
  render(<MemoryRouter><App /></MemoryRouter>);
  expect(screen.getByRole("heading", { name: /digital transformation creates real impact/i })).toBeInTheDocument();
  expect(await screen.findByRole("heading", { name: "Software delivery" })).toBeInTheDocument();
});

test("assessment uses labelled native options and enables progress", async () => {
  const questionnaire = { id: "q", version: "questionnaire-1.0.0", scoringVersion: "scoring-1.0.0", questions: [{ id: "delivery-flow", dimensionId: "software-delivery", prompt: "How does delivery work?", options: [{ id: "low", label: "Mostly manual", value: 0 }, { id: "high", label: "Safely automated", value: 4 }] }] };
  vi.stubGlobal("fetch", vi.fn(async () => ok(questionnaire)));
  render(<MemoryRouter initialEntries={["/assessment"]}><App /></MemoryRouter>);
  const option = await screen.findByRole("radio", { name: "Safely automated" });
  const complete = screen.getByRole("button", { name: "View my results" });
  expect(complete).toBeDisabled();
  fireEvent.click(option);
  expect(complete).toBeEnabled();
});

test("stable result route renders scores and recommendation snapshots", async () => {
  const result = { assessmentId: "a", questionnaireVersion: "questionnaire-1.0.0", scoringVersion: "scoring-1.0.0", recommendationRuleSetVersion: "recommendations-1.0.0", overallScore: 50, maturityLevel: "Developing", dimensionScores: [{ dimensionId: "software-delivery", raw: 2, possible: 4, normalized: 50, weight: 1 / 6 }], recommendations: [{ ruleId: "delivery", dimensionId: "software-delivery", triggerScore: 50, priority: 1, rationale: "Flow is uneven.", action: "Map one value stream." }], completedAt: "2026-08-30T00:00:00Z" };
  vi.stubGlobal("fetch", vi.fn(async () => ok(result)));
  render(<MemoryRouter initialEntries={["/results/a"]}><App /></MemoryRouter>);
  expect(await screen.findByRole("heading", { name: "Developing" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Map one value stream." })).toBeInTheDocument();
});
