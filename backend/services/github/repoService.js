const { githubRequest, getOwnerLogin } = require("./githubClient");

function slugifyRepoName(teamName) {
  const slug = teamName
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `SIH-2026-${slug}`;
}

async function repoExists(owner, repoName) {
  try {
    const { data } = await githubRequest(`/repos/${owner}/${repoName}`);
    return data;
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

async function createRepo(repoName, description) {
  const { data } = await githubRequest("/user/repos", {
    method: "POST",
    body: JSON.stringify({
      name: repoName,
      description,
      private: true,
      auto_init: true,
    }),
  });
  return data;
}

async function inviteCollaborator(owner, repoName, username, permission = "push") {
  const { data } = await githubRequest(
    `/repos/${owner}/${repoName}/collaborators/${encodeURIComponent(username)}`,
    { method: "PUT", body: JSON.stringify({ permission }) }
  );
  return data;
}

async function removeCollaborator(owner, repoName, username) {
  await githubRequest(`/repos/${owner}/${repoName}/collaborators/${encodeURIComponent(username)}`, {
    method: "DELETE",
  });
}

async function getAcceptedCollaborators(owner, repoName) {
  const { data } = await githubRequest(`/repos/${owner}/${repoName}/collaborators?affiliation=direct`);
  return data.map((c) => c.login);
}

async function getPendingInvitations(owner, repoName) {
  const { data } = await githubRequest(`/repos/${owner}/${repoName}/invitations`);
  return data.map((inv) => inv.invitee?.login).filter(Boolean);
}

// Returns collaborator status per invited username: "Accepted" | "Pending" | "NotInvited"
async function getCollaboratorStatuses(owner, repoName, usernames) {
  const [accepted, pending] = await Promise.all([
    getAcceptedCollaborators(owner, repoName),
    getPendingInvitations(owner, repoName),
  ]);
  const acceptedSet = new Set(accepted.map((u) => u.toLowerCase()));
  const pendingSet = new Set(pending.map((u) => u.toLowerCase()));

  const statuses = {};
  usernames.forEach((username) => {
    if (!username) return;
    const key = username.toLowerCase();
    if (acceptedSet.has(key)) statuses[username] = "Accepted";
    else if (pendingSet.has(key)) statuses[username] = "Pending";
    else statuses[username] = "NotInvited";
  });
  return statuses;
}

async function getCommitCount(owner, repoName) {
  const { data, headers } = await githubRequest(`/repos/${owner}/${repoName}/commits?per_page=1`);
  const link = headers.get("link");
  if (link) {
    const match = link.match(/[?&]page=(\d+)>;\s*rel="last"/);
    if (match) return Number(match[1]);
  }
  return Array.isArray(data) ? data.length : 0;
}

async function getLastCommit(owner, repoName) {
  const { data } = await githubRequest(`/repos/${owner}/${repoName}/commits?per_page=1`);
  const commit = data?.[0];
  if (!commit) return null;
  return {
    sha: commit.sha,
    message: commit.commit.message,
    author: commit.author?.login || commit.commit.author?.name || "Unknown",
    date: commit.commit.author?.date,
  };
}

async function getContributorStats(owner, repoName) {
  try {
    const { status, data } = await githubRequest(`/repos/${owner}/${repoName}/stats/contributors`);
    if (status === 202 || !Array.isArray(data)) return []; // GitHub still computing, retry next sync
    return data.map((c) => ({
      username: c.author?.login || "Unknown",
      commits: c.total,
      firstCommit: c.weeks.find((w) => w.c > 0)
        ? new Date(c.weeks.find((w) => w.c > 0).w * 1000).toISOString()
        : null,
      lastCommit: [...c.weeks].reverse().find((w) => w.c > 0)
        ? new Date([...c.weeks].reverse().find((w) => w.c > 0).w * 1000).toISOString()
        : null,
    }));
  } catch {
    return [];
  }
}

async function getIssuesAndPRs(owner, repoName) {
  const [openIssues, closedIssues, openPRs, closedPRs] = await Promise.all([
    githubRequest(`/repos/${owner}/${repoName}/issues?state=open&per_page=1`),
    githubRequest(`/repos/${owner}/${repoName}/issues?state=closed&per_page=1`),
    githubRequest(`/repos/${owner}/${repoName}/pulls?state=open&per_page=1`),
    githubRequest(`/repos/${owner}/${repoName}/pulls?state=closed&per_page=1`),
  ]);

  function countFromLink(res) {
    const link = res.headers.get("link");
    if (link) {
      const match = link.match(/[?&]page=(\d+)>;\s*rel="last"/);
      if (match) return Number(match[1]);
    }
    return Array.isArray(res.data) ? res.data.length : 0;
  }

  return {
    openIssues: countFromLink(openIssues),
    closedIssues: countFromLink(closedIssues),
    openPullRequests: countFromLink(openPRs),
    closedPullRequests: countFromLink(closedPRs),
  };
}

async function archiveRepo(owner, repoName, archived) {
  const { data } = await githubRequest(`/repos/${owner}/${repoName}`, {
    method: "PATCH",
    body: JSON.stringify({ archived }),
  });
  return data;
}

async function deleteRepo(owner, repoName) {
  await githubRequest(`/repos/${owner}/${repoName}`, { method: "DELETE" });
}

module.exports = {
  slugifyRepoName,
  repoExists,
  createRepo,
  inviteCollaborator,
  removeCollaborator,
  getCollaboratorStatuses,
  getCommitCount,
  getLastCommit,
  getContributorStats,
  getIssuesAndPRs,
  archiveRepo,
  deleteRepo,
  getOwnerLogin,
};
