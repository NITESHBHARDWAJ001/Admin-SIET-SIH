import apiClient from "./apiClient";

export async function fetchSchedule() {
  const { data } = await apiClient.get("/schedule");
  return data.data;
}

export async function createSlot(payload) {
  const { data } = await apiClient.post("/schedule", payload);
  return data.data;
}

export async function updateSlot(id, patch) {
  const { data } = await apiClient.patch(`/schedule/${id}`, patch);
  return data.data;
}

export async function deleteSlot(id) {
  await apiClient.delete(`/schedule/${id}`);
}
