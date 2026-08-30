import { Link, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { AssessmentPage } from "./pages/AssessmentPage";
import { ResultPage } from "./pages/ResultPage";

export function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/" aria-label="Transformation Impact Explorer home">
          <span className="brand-mark" aria-hidden="true">T</span>
          <span>Transformation Impact Explorer</span>
        </Link>
        <nav aria-label="Primary navigation"><Link to="/">Explore</Link><Link to="/assessment">Assessment</Link></nav>
      </header>
      <main id="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/results/:assessmentId" element={<ResultPage />} />
          <Route path="*" element={<section className="centered"><p className="eyebrow">404</p><h1>That page is not here.</h1><Link className="button" to="/">Return home</Link></section>} />
        </Routes>
      </main>
      <footer><p>Built to make transformation decisions explainable.</p></footer>
    </div>
  );
}
