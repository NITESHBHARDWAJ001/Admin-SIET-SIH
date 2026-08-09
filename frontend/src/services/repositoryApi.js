import apiClient from "./apiClient";

export async function fetchRepositories() {
  const { data } = await apiClient.get("/repositories");
  return data;
}

export async function fetchRepository(teamId) {
  const { data } = await apiClient.get(`/repositories/${teamId}`);
  return data.data;
}

export async function createAndInviteRepository(teamId) {
  const { data } = await apiClient.post(`/repositories/${teamId}/create-and-invite`);
  return data.data;
}

export async function syncRepository(teamId) {
  const { data } = await apiClient.post(`/repositories/${teamId}/sync`);
  return data.data;
}

export async function syncAllRepositories() {
  const { data } = await apiClient.post("/repositories/sync-all");
  return data;
}

export async function lockRepository(teamId) {
  const { data } = await apiClient.post(`/repositories/${teamId}/lock`);
  return data.data;
}

export async function unlockRepository(teamId) {
  const { data } = await apiClient.post(`/repositories/${teamId}/unlock`);
  return data.data;
}

export async function archiveRepository(teamId) {
  const { data } = await apiClient.post(`/repositories/${teamId}/archive`);
  return data.data;
}

export async function deleteRepository(teamId) {
  await apiClient.delete(`/repositories/${teamId}`);
}
