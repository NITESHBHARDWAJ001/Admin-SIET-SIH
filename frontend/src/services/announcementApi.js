import apiClient from "./apiClient";

export async function fetchAnnouncements() {
  const { data } = await apiClient.get("/announcements");
  return data.data;
}

export async function createAnnouncement(payload) {
  const { data } = await apiClient.post("/announcements", payload);
  return data.data;
}

export async function updateAnnouncement(id, patch) {
  const { data } = await apiClient.patch(`/announcements/${id}`, patch);
  return data.data;
}

export async function deleteAnnouncement(id) {
  await apiClient.delete(`/announcements/${id}`);
}
