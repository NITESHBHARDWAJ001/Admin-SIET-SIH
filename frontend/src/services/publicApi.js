import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const publicClient = axios.create({ baseURL: `${API_BASE_URL}/public` });

export async function fetchPublicSettings() {
  const { data } = await publicClient.get("/settings");
  return data.data;
}

export async function fetchPublicAnnouncements() {
  const { data } = await publicClient.get("/announcements");
  return data.data;
}

export async function submitPublicRegistration(payload) {
  const { data } = await publicClient.post("/registrations", payload);
  return data.data;
}
