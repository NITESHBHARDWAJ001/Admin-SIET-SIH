import apiClient from "./apiClient";

export async function fetchSubmissions(status) {
  const { data } = await apiClient.get("/submissions", { params: status ? { status } : {} });
  return data.data;
}

export async function createSubmission(payload) {
  const { data } = await apiClient.post("/submissions", payload);
  return data.data;
}

export async function updateSubmission(id, patch) {
  const { data } = await apiClient.patch(`/submissions/${id}`, patch);
  return data.data;
}

export async function addSubmissionRemark(id, text) {
  const { data } = await apiClient.post(`/submissions/${id}/remarks`, { text });
  return data.data;
}

export async function deleteSubmission(id) {
  await apiClient.delete(`/submissions/${id}`);
}
