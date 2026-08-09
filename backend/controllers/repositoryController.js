const sheetsService = require("../services/googleSheets/sheetsService");
const { logAction } = require("../utils/auditLog");
const repoService = require("../services/github/repoService");

const MEMBER_NUMBERS = [2, 3, 4, 5, 6];

function teamMembers(team) {
  const members = [
    {
      role: "Leader",
      fullName: team.teamLeaderFullName,
      githubUsername: team.teamLeaderGithubUsername || "",
    },
  ];
  MEMBER_NUMBERS.forEach((n) => {
    if (team[`member${n}FullName`]) {
      members.push({
        role: `Member ${n}`,
        fullName: team[`member${n}FullName`],
        githubUsername: team[`member${n}GithubUsername`] || "",
      });
    }
  });
  return members;
}

async function getRepoRowByTeamId(teamId) {
  const rows = await sheetsService.getRows("Repositories");
  return rows.find((r) => r.teamId === teamId) || null;
}

async function listRepositories(req, res) {
  const [teams, repoRows] = await Promise.all([
    sheetsService.getRows("Registration"),
    sheetsService.getRows("Repositories"),
  ]);

  const approvedTeams = teams.filter((t) => t.status === "Approved");
  const repoByTeamId = new Map(repoRows.map((r) => [r.teamId, r]));

  const rows = approvedTeams.map((team) => {
    const repo = repoByTeamId.get(team.teamId);
    const collaborators = repo?.collaborators || [];
    const joined = collaborators.filter((c) => c.inviteStatus === "Accepted").length;
    return {
      teamId: team.teamId,
      teamName: team.teamName,
      repoName: repo?.repoName || null,
      repoUrl: repo?.repoUrl || null,
      status: repo?.status || "Pending",
      lockStatus: repo?.lockStatus || "Unlocked",
      collaboratorsJoined: joined,
      collaboratorsTotal: collaborators.length,
      commitCount: Number(repo?.commitCount) || 0,
      lastCommitTime: repo?.lastCommitTime || null,
      lastSync: repo?.lastSync || null,
    };
  });

  const stats = {
    totalRepositories: repoRows.length,
    activeRepositories: rows.filter((r) => r.status === "Active").length,
    pendingRepositoryCreation: rows.filter((r) => r.status === "Pending").length,
    invitationPending: rows.filter((r) => r.status === "Invitations Pending").length,
    collaboratorsJoined: rows.reduce((sum, r) => sum + r.collaboratorsJoined, 0),
    lockedRepositories: repoRows.filter((r) => r.lockStatus === "Locked").length,
    archivedRepositories: rows.filter((r) => r.status === "Archived").length,
    totalCommits: repoRows.reduce((sum, r) => sum + (Number(r.commitCount) || 0), 0),
    activeContributors: rows.reduce((sum, r) => sum + r.collaboratorsJoined, 0),
  };

  res.json({ data: rows, stats });
}

async function getRepository(req, res) {
  const { teamId } = req.params;
  const teams = await sheetsService.getRows("Registration");
  const team = teams.find((t) => t.teamId === teamId);
  if (!team) return res.status(404).json({ message: "Team not found" });

  const repo = await getRepoRowByTeamId(teamId);
  res.json({ data: { team: { teamId: team.teamId, teamName: team.teamName, status: team.status }, repo } });
}

async function createAndInviteRepository(req, res) {
  const { teamId } = req.params;
  const teams = await sheetsService.getRows("Registration");
  const team = teams.find((t) => t.teamId === teamId);
  if (!team) return res.status(404).json({ message: "Team not found" });
  if (team.status !== "Approved") {
    return res.status(403).json({ message: "Only approved teams can have a repository created" });
  }

  const members = teamMembers(team);
  const usernamesToInvite = members.filter((m) => m.githubUsername);

  try {
    const owner = await repoService.getOwnerLogin();
    const repoName = repoService.slugifyRepoName(team.teamName);

    let repoMeta = await repoService.repoExists(owner, repoName);
    let created = false;
    if (!repoMeta) {
      repoMeta = await repoService.createRepo(repoName, `SIH SIET 2026 - ${team.teamName} submission repository`);
      created = true;
    }

    for (const member of usernamesToInvite) {
      try {
        await repoService.inviteCollaborator(owner, repoName, member.githubUsername, "push");
      } catch (err) {
        // A single bad/invalid username shouldn't block the rest of the team
        member.inviteError = err.message;
      }
    }

    const statuses = await repoService.getCollaboratorStatuses(
      owner,
      repoName,
      usernamesToInvite.map((m) => m.githubUsername)
    );

    const collaborators = members.map((m) => ({
      role: m.role,
      fullName: m.fullName,
      githubUsername: m.githubUsername,
      inviteStatus: m.githubUsername ? statuses[m.githubUsername] || "Pending" : "NotLinked",
    }));

    const allInvitedAccepted =
      usernamesToInvite.length > 0 &&
      collaborators.filter((c) => c.githubUsername).every((c) => c.inviteStatus === "Accepted");
    const anyPending = collaborators.some((c) => c.inviteStatus === "Pending");

    let status = "Repository Created";
    if (usernamesToInvite.length === 0) status = "Repository Created";
    else if (allInvitedAccepted) status = "Active";
    else if (anyPending) status = "Invitations Pending";

    const existingRepoRow = await getRepoRowByTeamId(teamId);
    const payload = {
      teamId: team.teamId,
      teamName: team.teamName,
      repoName: repoMeta.name,
      repoUrl: repoMeta.html_url,
      repoId: repoMeta.id,
      owner,
      status,
      lockStatus: existingRepoRow?.lockStatus || "Unlocked",
      collaborators,
      createdDate: existingRepoRow?.createdDate || repoMeta.created_at,
      lastSync: new Date().toISOString(),
    };

    let saved;
    if (existingRepoRow) {
      saved = await sheetsService.updateRow("Repositories", existingRepoRow.id, payload);
    } else {
      saved = await sheetsService.appendRow("Repositories", payload);
    }

    await logAction(
      req,
      created ? "Repository Created" : "Repository Synced & Collaborators Invited",
      `${team.teamName} (${team.teamId}) -> ${repoMeta.html_url}`
    );

    res.json({ data: saved });
  } catch (err) {
    res.status(502).json({ message: `GitHub error: ${err.message}` });
  }
}

async function syncRepository(req, res) {
  const { teamId } = req.params;
  const repo = await getRepoRowByTeamId(teamId);
  if (!repo) return res.status(404).json({ message: "No repository found for this team" });

  try {
    const [commitCount, lastCommit, statuses] = await Promise.all([
      repoService.getCommitCount(repo.owner, repo.repoName),
      repoService.getLastCommit(repo.owner, repo.repoName),
      repoService.getCollaboratorStatuses(
        repo.owner,
        repo.repoName,
        (repo.collaborators || []).map((c) => c.githubUsername).filter(Boolean)
      ),
    ]);

    const collaborators = (repo.collaborators || []).map((c) => ({
      ...c,
      inviteStatus: c.githubUsername ? statuses[c.githubUsername] || c.inviteStatus : c.inviteStatus,
    }));

    const allAccepted =
      collaborators.filter((c) => c.githubUsername).length > 0 &&
      collaborators.filter((c) => c.githubUsername).every((c) => c.inviteStatus === "Accepted");

    const updated = await sheetsService.updateRow("Repositories", repo.id, {
      commitCount,
      lastCommitTime: lastCommit?.date || "",
      lastCommitBy: lastCommit?.author || "",
      collaborators,
      status: repo.status === "Locked" || repo.status === "Archived" ? repo.status : allAccepted ? "Active" : repo.status,
      lastSync: new Date().toISOString(),
    });

    await logAction(req, "Repository Synced", `${repo.teamName} (${teamId})`);
    res.json({ data: updated });
  } catch (err) {
    res.status(502).json({ message: `GitHub sync failed: ${err.message}` });
  }
}

async function syncAllRepositories(req, res) {
  const repoRows = await sheetsService.getRows("Repositories");
  let synced = 0;
  let failed = 0;

  for (const repo of repoRows) {
    try {
      const [commitCount, lastCommit] = await Promise.all([
        repoService.getCommitCount(repo.owner, repo.repoName),
        repoService.getLastCommit(repo.owner, repo.repoName),
      ]);
      await sheetsService.updateRow("Repositories", repo.id, {
        commitCount,
        lastCommitTime: lastCommit?.date || "",
        lastCommitBy: lastCommit?.author || "",
        lastSync: new Date().toISOString(),
      });
      synced += 1;
    } catch {
      failed += 1;
    }
  }

  await logAction(req, "Bulk Repository Sync", `${synced} synced, ${failed} failed`);
  res.json({ synced, failed });
}

async function lockRepository(req, res) {
  const { teamId } = req.params;
  const repo = await getRepoRowByTeamId(teamId);
  if (!repo) return res.status(404).json({ message: "No repository found for this team" });

  // GitHub silently no-ops a permission-downgrade PUT against an already
  // -accepted collaborator on a personal (non-org) repo — confirmed by
  // testing directly against the API, the call returns 204 but the
  // collaborator's actual push access never changes. The only mechanism
  // that reliably revokes push access is removing the collaborator outright.
  const usernames = (repo.collaborators || []).map((c) => c.githubUsername).filter(Boolean);
  try {
    await Promise.all(
      usernames.map((username) => repoService.removeCollaborator(repo.owner, repo.repoName, username))
    );
    const collaborators = (repo.collaborators || []).map((c) => ({
      ...c,
      inviteStatus: c.githubUsername ? "Removed" : c.inviteStatus,
    }));
    const updated = await sheetsService.updateRow("Repositories", repo.id, {
      lockStatus: "Locked",
      status: "Locked",
      collaborators,
    });
    await logAction(req, "Repository Locked", `${repo.teamName} (${teamId}) — collaborators removed`);
    res.json({ data: updated });
  } catch (err) {
    res.status(502).json({ message: `GitHub error: ${err.message}` });
  }
}

async function unlockRepository(req, res) {
  const { teamId } = req.params;
  const repo = await getRepoRowByTeamId(teamId);
  if (!repo) return res.status(404).json({ message: "No repository found for this team" });

  // Re-invites everyone removed at lock time. They'll need to accept again,
  // same as any fresh collaborator invite.
  const usernames = (repo.collaborators || []).map((c) => c.githubUsername).filter(Boolean);
  try {
    await Promise.all(
      usernames.map((username) => repoService.inviteCollaborator(repo.owner, repo.repoName, username, "push"))
    );
    const statuses = await repoService.getCollaboratorStatuses(repo.owner, repo.repoName, usernames);
    const collaborators = (repo.collaborators || []).map((c) => ({
      ...c,
      inviteStatus: c.githubUsername ? statuses[c.githubUsername] || "Pending" : c.inviteStatus,
    }));
    const updated = await sheetsService.updateRow("Repositories", repo.id, {
      lockStatus: "Unlocked",
      status: "Active",
      collaborators,
    });
    await logAction(req, "Repository Unlocked", `${repo.teamName} (${teamId}) — collaborators re-invited`);
    res.json({ data: updated });
  } catch (err) {
    res.status(502).json({ message: `GitHub error: ${err.message}` });
  }
}

async function archiveRepository(req, res) {
  const { teamId } = req.params;
  const repo = await getRepoRowByTeamId(teamId);
  if (!repo) return res.status(404).json({ message: "No repository found for this team" });

  try {
    await repoService.archiveRepo(repo.owner, repo.repoName, true);
    const updated = await sheetsService.updateRow("Repositories", repo.id, { status: "Archived" });
    await logAction(req, "Repository Archived", `${repo.teamName} (${teamId})`);
    res.json({ data: updated });
  } catch (err) {
    res.status(502).json({ message: `GitHub error: ${err.message}` });
  }
}

async function deleteRepository(req, res) {
  const { teamId } = req.params;
  const repo = await getRepoRowByTeamId(teamId);
  if (!repo) return res.status(404).json({ message: "No repository found for this team" });

  try {
    await repoService.deleteRepo(repo.owner, repo.repoName);
    await sheetsService.deleteRow("Repositories", repo.id);
    await logAction(req, "Repository Deleted", `${repo.teamName} (${teamId})`);
    res.json({ message: "Repository deleted" });
  } catch (err) {
    res.status(502).json({ message: `GitHub error: ${err.message}` });
  }
}

module.exports = {
  listRepositories,
  getRepository,
  createAndInviteRepository,
  syncRepository,
  syncAllRepositories,
  lockRepository,
  unlockRepository,
  archiveRepository,
  deleteRepository,
};
