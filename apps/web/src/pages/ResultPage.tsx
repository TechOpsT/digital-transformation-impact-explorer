import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import type { AssessmentResult } from "../types";
import { StatusPanel } from "../components/StatusPanel";

const title = (value: string) => value.split("-").map(word => word[0].toUpperCase() + word.slice(1)).join(" ");

export function ResultPage() {
  const { assessmentId = "" } = useParams();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState("");
  const load = () => { setError(""); setResult(null); api.result(assessmentId).then(setResult).catch((reason: Error) => setError(reason.message)); };
  useEffect(load, [assessmentId]);
  if (error) return <div className="page-wrap"><StatusPanel title="Result unavailable" message={error} tone="error" onRetry={load} /></div>;
  if (!result) return <div className="page-wrap"><StatusPanel title="Loading your result" message="Retrieving the original assessment snapshot…" /></div>;
  return <section className="results-page">
    <header className="result-hero"><div><p className="eyebrow">Your transformation profile</p><h1>{result.maturityLevel}</h1><p>Your overall maturity score is calculated equally across all six dimensions.</p></div><div className="score-ring" style={{ background: `conic-gradient(var(--blue) 0 ${result.overallScore}%, #cbd5e1 ${result.overallScore}% 100%)` }} aria-label={`Overall score ${result.overallScore} out of 100`}><strong>{result.overallScore}</strong><span>out of 100</span></div></header>
    <div className="results-grid"><section className="result-section"><h2>Dimension breakdown</h2><div className="score-list">{result.dimensionScores.map(score => <div className="score-row" key={score.dimensionId}><div><strong>{title(score.dimensionId)}</strong><span>{score.normalized}</span></div><div className="score-track" aria-hidden="true"><span style={{ width: `${score.normalized}%` }} /></div></div>)}</div><p className="method-note">Scoring policy {result.scoringVersion} · Questionnaire {result.questionnaireVersion}</p></section>
      <section className="result-section"><h2>Prioritized next actions</h2><ol className="recommendation-list">{result.recommendations.map(item => <li key={item.ruleId}><span>{item.priority}</span><div><h3>{item.action}</h3><p>{item.rationale}</p><small>{title(item.dimensionId)} · score {item.triggerScore}</small></div></li>)}</ol></section></div>
    <div className="result-footer"><p>This result is an immutable snapshot produced with rule set {result.recommendationRuleSetVersion}.</p><Link className="button secondary" to="/assessment">Take another assessment</Link></div>
  </section>;
}
