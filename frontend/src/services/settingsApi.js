import apiClient from "./apiClient";

export async function fetchSettings() {
  const { data } = await apiClient.get("/settings");
  return data.data;
}

export async function updateSettings(patch) {
  const { data } = await apiClient.patch("/settings", patch);
  return data.data;
}
