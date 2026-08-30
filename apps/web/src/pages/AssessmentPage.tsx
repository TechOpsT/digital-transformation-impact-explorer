import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import type { Questionnaire } from "../types";
import { StatusPanel } from "../components/StatusPanel";

export function AssessmentPage() {
  const navigate = useNavigate();
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const load = () => { setError(""); api.questionnaire().then(setQuestionnaire).catch((reason: Error) => setError(reason.message)); };
  useEffect(load, []);
  const progress = useMemo(() => questionnaire ? Math.round((Object.keys(answers).length / questionnaire.questions.length) * 100) : 0, [answers, questionnaire]);

  if (error) return <div className="page-wrap"><StatusPanel title="Assessment unavailable" message={error} tone="error" onRetry={load} /></div>;
  if (!questionnaire) return <div className="page-wrap"><StatusPanel title="Preparing your assessment" message="Loading the current questionnaire…" /></div>;
  const question = questionnaire.questions[index];

  async function complete() {
    if (Object.keys(answers).length !== questionnaire!.questions.length) { setError("Please answer every question before completing the assessment."); return; }
    setSubmitting(true); setError("");
    try {
      const assessment = await api.startAssessment(questionnaire!.version);
      await api.submitResponses(assessment.id, Object.entries(answers).map(([questionId, optionId]) => ({ questionId, optionId })));
      await api.completeAssessment(assessment.id);
      navigate(`/results/${assessment.id}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "The assessment could not be completed."); setSubmitting(false); }
  }

  return <section className="assessment-layout">
    <aside className="assessment-intro"><p className="eyebrow">Maturity assessment</p><h1>A clear view of where you are now.</h1><p>Choose the statement that best reflects your organization today. Honest answers create more useful recommendations.</p><div className="progress-meta"><span>{progress}% complete</span><span>{index + 1} of {questionnaire.questions.length}</span></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div></aside>
    <div className="question-panel"><p className="question-dimension">{question.dimensionId.replaceAll("-", " ")}</p><fieldset><legend>{question.prompt}</legend><div className="option-list">{question.options.map(option => <label className={answers[question.id] === option.id ? "option selected" : "option"} key={option.id}><input type="radio" name={question.id} value={option.id} checked={answers[question.id] === option.id} onChange={() => setAnswers(current => ({ ...current, [question.id]: option.id }))} /><span>{option.label}</span></label>)}</div></fieldset>
      {error && <p className="inline-error" role="alert">{error}</p>}
      <div className="question-actions"><button className="button secondary" disabled={index === 0 || submitting} onClick={() => setIndex(value => value - 1)}>Back</button>{index < questionnaire.questions.length - 1 ? <button className="button" disabled={!answers[question.id]} onClick={() => setIndex(value => value + 1)}>Continue</button> : <button className="button" disabled={!answers[question.id] || submitting} onClick={complete}>{submitting ? "Calculating…" : "View my results"}</button>}</div>
    </div>
  </section>;
}
