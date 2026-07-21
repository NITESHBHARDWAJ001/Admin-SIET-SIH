import apiClient from "./apiClient";

export async function fetchResources() {
  const { data } = await apiClient.get("/resources");
  return data.data;
}

export async function createResource(payload) {
  const { data } = await apiClient.post("/resources", payload);
  return data.data;
}

export async function updateResource(id, patch) {
  const { data } = await apiClient.patch(`/resources/${id}`, patch);
  return data.data;
}

export async function deleteResource(id) {
  await apiClient.delete(`/resources/${id}`);
}
