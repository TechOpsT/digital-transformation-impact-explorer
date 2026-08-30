export const MATURITY_LEVELS = [
  [20, "Initial"],
  [40, "Emerging"],
  [60, "Developing"],
  [80, "Established"],
  [100.1, "Optimizing"]
];

export function roundHalfUp(value, places = 1) {
  const scale = 10 ** places;
  return Math.floor(value * scale + Number.EPSILON + 0.5) / scale;
}

export function dimensionScore(values, maximum = 4) {
  if (!Array.isArray(values) || values.length === 0) throw new TypeError("At least one response is required");
  if (!values.every((value) => Number.isInteger(value) && value >= 0 && value <= maximum)) throw new RangeError("Response value is outside the declared range");
  const raw = values.reduce((total, value) => total + value, 0);
  const possible = values.length * maximum;
  return { raw, possible, normalized: roundHalfUp((raw / possible) * 100) };
}

export function overallScore(scores) {
  if (!Array.isArray(scores) || scores.length !== 6) throw new RangeError("Exactly six dimension scores are required");
  if (!scores.every((score) => Number.isFinite(score) && score >= 0 && score <= 100)) throw new RangeError("Dimension score must be between 0 and 100");
  return roundHalfUp(scores.reduce((total, score) => total + score, 0) / 6);
}

export function maturityLevel(score) {
  if (!Number.isFinite(score) || score < 0 || score > 100) throw new RangeError("Overall score must be between 0 and 100");
  return MATURITY_LEVELS.find(([upperExclusive]) => score < upperExclusive)[1];
}

