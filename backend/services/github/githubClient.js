const config = require("../../config/env");

const API_BASE = "https://api.github.com";

let cachedOwner = null;

async function githubRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${config.github.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (res.status === 204) return { status: res.status, data: null, headers: res.headers };

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const error = new Error(data?.message || `GitHub API error (${res.status})`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return { status: res.status, data, headers: res.headers };
}

async function getOwnerLogin() {
  if (cachedOwner) return cachedOwner;
  const { data } = await githubRequest("/user");
  cachedOwner = data.login;
  return cachedOwner;
}

module.exports = { githubRequest, getOwnerLogin };
