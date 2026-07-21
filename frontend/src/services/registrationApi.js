import apiClient from "./apiClient";

export async function fetchRegistrations(params) {
  const { data } = await apiClient.get("/registrations", { params });
  return data;
}

export async function fetchRegistration(id) {
  const { data } = await apiClient.get(`/registrations/${id}`);
  return data.data;
}

export async function updateRegistration(id, patch) {
  const { data } = await apiClient.patch(`/registrations/${id}`, patch);
  return data.data;
}

export async function addRemark(id, text) {
  const { data } = await apiClient.post(`/registrations/${id}/remarks`, { text });
  return data.data;
}

export async function deleteRegistration(id) {
  await apiClient.delete(`/registrations/${id}`);
}

export async function downloadExport(format, params = {}) {
  const response = await apiClient.get("/registrations/export", {
    params: { ...params, format },
    responseType: "blob",
  });
  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `registrations.${format}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
