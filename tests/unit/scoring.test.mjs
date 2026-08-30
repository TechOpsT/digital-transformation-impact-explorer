import test from "node:test";
import assert from "node:assert/strict";
import { dimensionScore, maturityLevel, overallScore, roundHalfUp } from "../../src/scoring-reference.mjs";

test("worked dimension example is explainable", () => {
  assert.deepEqual(dimensionScore([0, 2, 4]), { raw: 6, possible: 12, normalized: 50 });
});

test("six equally weighted dimensions produce the documented overall score", () => {
  assert.equal(overallScore([0, 20, 40, 60, 80, 100]), 50);
});

test("rounding is half-up at one decimal place", () => {
  assert.equal(roundHalfUp(66.65), 66.7);
});

test("maturity boundaries are inclusive at their lower edge", () => {
  assert.equal(maturityLevel(0), "Initial");
  assert.equal(maturityLevel(19.9), "Initial");
  assert.equal(maturityLevel(20), "Emerging");
  assert.equal(maturityLevel(39.9), "Emerging");
  assert.equal(maturityLevel(40), "Developing");
  assert.equal(maturityLevel(59.9), "Developing");
  assert.equal(maturityLevel(60), "Established");
  assert.equal(maturityLevel(79.9), "Established");
  assert.equal(maturityLevel(80), "Optimizing");
  assert.equal(maturityLevel(100), "Optimizing");
});

test("invalid and incomplete scoring inputs are rejected", () => {
  assert.throws(() => dimensionScore([]), TypeError);
  assert.throws(() => dimensionScore([5]), RangeError);
  assert.throws(() => overallScore([50]), RangeError);
  assert.throws(() => maturityLevel(100.1), RangeError);
});

