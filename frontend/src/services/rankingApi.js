import apiClient from "./apiClient";

export async function fetchRanking() {
  const { data } = await apiClient.get("/ranking");
  return data.data;
}

export async function setRankingStatus(registrationId, rankingStatus) {
  const { data } = await apiClient.patch(`/ranking/${registrationId}/status`, { rankingStatus });
  return data.data;
}
