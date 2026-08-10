import apiClient from "./apiClient";

export async function fetchProblemStatements() {
  const { data } = await apiClient.get("/problem-statements");
  return data.data;
}

export async function fetchSelectionOverview() {
  const { data } = await apiClient.get("/problem-statements/selection-overview");
  return data.data;
}

export async function createProblemStatement(payload) {
  const { data } = await apiClient.post("/problem-statements", payload);
  return data.data;
}

export async function updateProblemStatement(id, patch) {
  const { data } = await apiClient.patch(`/problem-statements/${id}`, patch);
  return data.data;
}

export async function deleteProblemStatement(id) {
  await apiClient.delete(`/problem-statements/${id}`);
}
