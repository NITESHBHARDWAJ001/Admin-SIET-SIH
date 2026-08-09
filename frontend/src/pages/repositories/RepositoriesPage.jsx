import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiGithub,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiMail,
  FiLock,
  FiArchive,
  FiGitCommit,
  FiActivity,
  FiRefreshCw,
  FiPlus,
} from "react-icons/fi";
import StatCard from "../../components/StatCard";
import { SkeletonCards, SkeletonTable } from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";
import {
  fetchRepositories,
  createAndInviteRepository,
  syncAllRepositories,
} from "../../services/repositoryApi";
import { formatDateTime } from "../../utils/formatters";

const STATUS_STYLES = {
  Pending: "bg-slate-100 text-slate-500",
  "Repository Created": "bg-amber-100 text-amber-700",
  "Invitations Pending": "bg-amber-100 text-amber-700",
  Active: "bg-success/10 text-success",
  Locked: "bg-red-100 text-red-700",
  Archived: "bg-slate-200 text-slate-600",
};

export default function RepositoriesPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creatingTeamId, setCreatingTeamId] = useState(null);
  const [syncingAll, setSyncingAll] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchRepositories();
      setRows(res.data);
      setStats(res.stats);
    } catch {
      toast.error("Failed to load repositories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateAndInvite = async (teamId) => {
    setCreatingTeamId(teamId);
    try {
      await createAndInviteRepository(teamId);
      toast.success("Repository created and collaborators invited");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create repository");
    } finally {
      setCreatingTeamId(null);
    }
  };

  const handleSyncAll = async () => {
    setSyncingAll(true);
    try {
      const res = await syncAllRepositories();
      toast.success(`Synced ${res.synced} repositories${res.failed ? `, ${res.failed} failed` : ""}`);
      load();
    } catch {
      toast.error("Bulk sync failed");
    } finally {
      setSyncingAll(false);
    }
  };

  const cards = stats && [
    { label: "Total Repositories", value: stats.totalRepositories, icon: FiGithub, tone: "primary" },
    { label: "Active Repositories", value: stats.activeRepositories, icon: FiCheckCircle, tone: "success" },
    { label: "Pending Repo Creation", value: stats.pendingRepositoryCreation, icon: FiClock, tone: "accent" },
    { label: "Invitation Pending", value: stats.invitationPending, icon: FiMail, tone: "accent" },
    { label: "Collaborators Joined", value: stats.collaboratorsJoined, icon: FiUsers, tone: "primary" },
    { label: "Locked Repositories", value: stats.lockedRepositories, icon: FiLock, tone: "danger" },
    { label: "Archived Repositories", value: stats.archivedRepositories, icon: FiArchive, tone: "primary" },
    { label: "Total Commits", value: stats.totalCommits, icon: FiGitCommit, tone: "primary" },
    { label: "Active Contributors", value: stats.activeContributors, icon: FiActivity, tone: "success" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="font-heading text-xl font-semibold text-ink flex items-center gap-2">
            <FiGithub size={20} /> Repository Management
          </h1>
          <p className="text-sm text-slate-500">
            Create GitHub repositories for approved teams and manage collaborator access
          </p>
        </div>
        <button className="btn-secondary" onClick={handleSyncAll} disabled={syncingAll}>
          <FiRefreshCw size={15} className={syncingAll ? "animate-spin" : ""} />
          {syncingAll ? "Syncing…" : "Sync GitHub Data"}
        </button>
      </div>

      {loading || !stats ? (
        <SkeletonCards count={9} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cards.map((c) => (
            <StatCard key={c.label} {...c} />
          ))}
        </div>
      )}

      {loading ? (
        <SkeletonTable rows={6} cols={7} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No approved teams yet"
          message="Repositories can only be created for teams with Approved registration status."
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="text-left px-4 py-3 font-medium text-slate-500">Repository</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Team</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Collaborators</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Last Commit</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Commits</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Lock</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.teamId}
                  className="border-b border-slate-50 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3">
                    {r.repoName ? (
                      <a
                        href={r.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {r.repoName}
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink dark:text-slate-100">{r.teamName}</p>
                    <p className="text-xs text-slate-400">{r.teamId}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_STYLES[r.status] || "bg-slate-100 text-slate-500"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.collaboratorsJoined} / {r.collaboratorsTotal}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDateTime(r.lastCommitTime)}</td>
                  <td className="px-4 py-3">{r.commitCount}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`badge ${
                        r.lockStatus === "Locked" ? "bg-red-100 text-red-700" : "bg-success/10 text-success"
                      }`}
                    >
                      {r.lockStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.repoName ? (
                      <button className="btn-secondary" onClick={() => navigate(`/repositories/${r.teamId}`)}>
                        View Details
                      </button>
                    ) : (
                      <button
                        className="btn-primary"
                        onClick={() => handleCreateAndInvite(r.teamId)}
                        disabled={creatingTeamId === r.teamId}
                      >
                        <FiPlus size={14} />
                        {creatingTeamId === r.teamId ? "Creating…" : "Create Repo & Invite"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
