export const CRITERIA = [
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

export function computeTotal(scores) {
  return CRITERIA.reduce((sum, c) => sum + (Number(scores[c.key]) || 0), 0);
}
