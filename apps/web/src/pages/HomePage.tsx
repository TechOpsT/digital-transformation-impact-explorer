import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import type { Dimension } from "../types";
import { StatusPanel } from "../components/StatusPanel";

export function HomePage() {
  const [dimensions, setDimensions] = useState<Dimension[] | null>(null);
  const [error, setError] = useState("");
  const load = () => { setError(""); setDimensions(null); api.dimensions().then(setDimensions).catch((reason: Error) => setError(reason.message)); };
  useEffect(load, []);

  return <>
    <section className="hero">
      <div><p className="eyebrow">From tools to outcomes</p><h1>See where digital transformation creates real impact.</h1><p className="lede">Explore six dimensions of change, then turn an honest assessment into clear, prioritized next actions.</p><div className="hero-actions"><Link className="button" to="/assessment">Start the assessment</Link><a className="text-link" href="#dimensions">Explore the dimensions</a></div></div>
      <aside className="hero-card" aria-label="Assessment preview"><span className="score-preview">6</span><strong>connected dimensions</strong><p>One explainable view of delivery, reliability, security, data, developer experience, and culture.</p></aside>
    </section>
    <section id="dimensions" className="section-block"><div className="section-heading"><p className="eyebrow">A connected system</p><h2>Transformation is broader than technology.</h2></div>
      {error ? <StatusPanel title="Content is temporarily unavailable" message={error} tone="error" onRetry={load} /> : !dimensions ? <StatusPanel title="Loading dimensions" message="Retrieving the current transformation model…" /> :
        <div className="dimension-grid">{dimensions.map((dimension, index) => <article className="dimension-card" key={dimension.id}><span className="dimension-number">0{index + 1}</span><h3>{dimension.title}</h3><p>{dimension.description}</p></article>)}</div>}
    </section>
    <section className="cta-band"><div><p className="eyebrow">Make it actionable</p><h2>Find the next improvement worth making.</h2></div><Link className="button light" to="/assessment">Assess your organization</Link></section>
  </>;
}
