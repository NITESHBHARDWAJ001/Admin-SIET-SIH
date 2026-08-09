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

export async function lookupPublicTeam(query) {
  const { data } = await publicClient.get("/teams/lookup", { params: { query } });
  return data.data;
}

export async function submitPublicSubmission(payload) {
  const { data } = await publicClient.post("/submissions", payload);
  return data.data;
}

export async function fetchPublicResources() {
  const { data } = await publicClient.get("/resources");
  return data.data;
}

export async function fetchPublicProblemStatements() {
  const { data } = await publicClient.get("/problem-statements");
  return data.data;
}

export async function authenticateTeamForSelection(teamId, password) {
  const { data } = await publicClient.post("/problem-statements/auth", { teamId, password });
  return data.data;
}

export async function selectProblemStatement(teamId, password, problemId) {
  const { data } = await publicClient.post("/problem-statements/select", { teamId, password, problemId });
  return data.data;
}
