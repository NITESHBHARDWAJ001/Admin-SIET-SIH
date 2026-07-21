import apiClient from "./apiClient";

export async function fetchEvaluations(params) {
  const { data } = await apiClient.get("/evaluations", { params });
  return data.data;
}

export async function saveEvaluation(payload) {
  const { data } = await apiClient.post("/evaluations", payload);
  return data.data;
}

export async function updateEvaluation(id, patch) {
  const { data } = await apiClient.patch(`/evaluations/${id}`, patch);
  return data.data;
}

export async function deleteEvaluation(id) {
  await apiClient.delete(`/evaluations/${id}`);
}
