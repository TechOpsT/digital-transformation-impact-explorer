export type Dimension = { id: string; title: string; description: string };
export type ResponseOption = { id: string; label: string; value: number };
export type Question = { id: string; dimensionId: string; prompt: string; options: ResponseOption[] };
export type Questionnaire = { id: string; version: string; scoringVersion: string; questions: Question[] };
export type Recommendation = { ruleId: string; dimensionId: string; triggerScore: number; priority: number; rationale: string; action: string };
export type DimensionScore = { dimensionId: string; raw: number; possible: number; normalized: number; weight: number };
export type AssessmentResult = {
  assessmentId: string;
  questionnaireVersion: string;
  scoringVersion: string;
  recommendationRuleSetVersion: string;
  overallScore: number;
  maturityLevel: string;
  dimensionScores: DimensionScore[];
  recommendations: Recommendation[];
  completedAt: string;
};
