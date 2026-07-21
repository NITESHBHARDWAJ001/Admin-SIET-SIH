import apiClient from "./apiClient";

export async function previewReport(type) {
  const { data } = await apiClient.get(`/reports/${type}/preview`);
  return data.data;
}

export async function downloadReport(type, format) {
  const response = await apiClient.get(`/reports/${type}`, {
    params: { format },
    responseType: "blob",
  });
  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${type}-report.${format}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
