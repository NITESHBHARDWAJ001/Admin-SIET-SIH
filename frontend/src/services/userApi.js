import apiClient from "./apiClient";

export async function fetchUsers(role) {
  const { data } = await apiClient.get("/users", { params: role ? { role } : {} });
  return data.data;
}

export async function createUser(payload) {
  const { data } = await apiClient.post("/users", payload);
  return data.data;
}

export async function updateUser(id, patch) {
  const { data } = await apiClient.patch(`/users/${id}`, patch);
  return data.data;
}

export async function deleteUser(id) {
  await apiClient.delete(`/users/${id}`);
}
