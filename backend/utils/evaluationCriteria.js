const CRITERIA = [
  { key: "problemUnderstanding", label: "Problem Understanding", max: 10 },
  { key: "innovationCreativity", label: "Innovation & Creativity", max: 20 },
  { key: "technicalFeasibility", label: "Technical Feasibility", max: 15 },
  { key: "prototypeQuality", label: "Prototype Quality", max: 15 },
  { key: "technicalImplementation", label: "Technical Implementation", max: 10 },
  { key: "impactScalability", label: "Impact & Scalability", max: 10 },
  { key: "uiUx", label: "UI/UX", max: 5 },
  { key: "presentationCommunication", label: "Presentation & Communication", max: 10 },
  { key: "technicalQnA", label: "Technical Q&A", max: 5 },
];

function computeTotal(scores) {
  return CRITERIA.reduce((sum, c) => {
    const raw = Number(scores[c.key]) || 0;
    const clamped = Math.max(0, Math.min(c.max, raw));
    return sum + clamped;
  }, 0);
}

function clampScores(scores) {
  const clamped = {};
  CRITERIA.forEach((c) => {
    const raw = Number(scores[c.key]) || 0;
    clamped[c.key] = Math.max(0, Math.min(c.max, raw));
  });
  return clamped;
}

module.exports = { CRITERIA, computeTotal, clampScores };
