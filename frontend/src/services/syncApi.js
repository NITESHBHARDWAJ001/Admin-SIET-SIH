import apiClient from "./apiClient";

export async function syncRegistrationForm() {
  const { data } = await apiClient.post("/sync/registration-form");
  return data;
}
