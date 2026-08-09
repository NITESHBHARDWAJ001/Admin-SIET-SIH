import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiExternalLink,
  FiCopy,
  FiRefreshCw,
  FiLock,
  FiUnlock,
  FiArchive,
  FiTrash2,
  FiGithub,
} from "react-icons/fi";
import EmptyState from "../../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";
import { SkeletonBlock } from "../../components/Skeleton";
import {
  fetchRepository,
  syncRepository,
  lockRepository,
  unlockRepository,
  archiveRepository,
  deleteRepository,
} from "../../services/repositoryApi";
import { formatDateTime } from "../../utils/formatters";

const COLLAB_STYLES = {
  Accepted: "bg-success/10 text-success",
  Pending: "bg-amber-100 text-amber-700",
  NotInvited: "bg-slate-100 text-slate-500",
  NotLinked: "bg-slate-100 text-slate-500",
  Removed: "bg-red-100 text-red-700",
};

export default function RepositoryDetailPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchRepository(teamId);
      setData(res);
    } catch {
      toast.error("Failed to load repository");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncRepository(teamId);
      toast.success("Repository synced");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(data.repo.repoUrl);
    toast.success("Repository URL copied");
  };

  const runAction = async (action) => {
    try {
      if (action === "lock") await lockRepository(teamId);
      if (action === "unlock") await unlockRepository(teamId);
      if (action === "archive") await archiveRepository(teamId);
      if (action === "delete") {
        await deleteRepository(teamId);
        toast.success("Repository deleted");
        navigate("/repositories", { replace: true });
        return;
      }
      toast.success(`Repository ${action}ed`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} repository`);
    } finally {
      setConfirmAction(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonBlock className="h-8 w-48" />
        <SkeletonBlock className="h-64" />
      </div>
    );
  }

  if (!data?.repo) {
    return <EmptyState title="No repository found" message="This team doesn't have a repository yet." />;
  }

  const { team, repo } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button className="btn-secondary" onClick={() => navigate("/repositories")}>
          <FiArrowLeft size={15} /> Back
        </button>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="btn-secondary" onClick={handleSync} disabled={syncing}>
            <FiRefreshCw size={14} className={syncing ? "animate-spin" : ""} /> Sync
          </button>
          <a href={repo.repoUrl} target="_blank" rel="noreferrer" className="btn-secondary">
            <FiExternalLink size={14} /> Open in GitHub
          </a>
          <button className="btn-secondary" onClick={handleCopyUrl}>
            <FiCopy size={14} /> Copy URL
          </button>
          {repo.lockStatus === "Locked" ? (
            <button className="btn-secondary" onClick={() => setConfirmAction("unlock")}>
              <FiUnlock size={14} /> Unlock
            </button>
          ) : (
            <button className="btn-secondary" onClick={() => setConfirmAction("lock")}>
              <FiLock size={14} /> Lock
            </button>
          )}
          <button className="btn-secondary" onClick={() => setConfirmAction("archive")}>
            <FiArchive size={14} /> Archive
          </button>
          <button className="btn-danger" onClick={() => setConfirmAction("delete")}>
            <FiTrash2 size={14} /> Delete
          </button>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="font-heading text-xl font-semibold text-ink flex items-center gap-2">
              <FiGithub size={18} /> {repo.repoName}
            </h1>
            <p className="text-sm text-slate-500">
              {team.teamName} ({team.teamId})
            </p>
          </div>
          <span className="badge bg-primary/10 text-primary">{repo.status}</span>
        </div>
      </div>

      <section className="card p-5">
        <h2 className="font-heading font-semibold text-ink mb-4">Repository Details</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Field label="Repository URL" value={<a href={repo.repoUrl} className="text-primary hover:underline" target="_blank" rel="noreferrer">{repo.repoUrl}</a>} />
          <Field label="GitHub Owner" value={repo.owner} />
          <Field label="Lock Status" value={repo.lockStatus} />
          <Field label="Created Date" value={formatDateTime(repo.createdDate)} />
          <Field label="Last Sync" value={formatDateTime(repo.lastSync)} />
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-heading font-semibold text-ink mb-4">GitHub Analytics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Field label="Total Commits" value={repo.commitCount ?? 0} />
          <Field label="Last Commit" value={formatDateTime(repo.lastCommitTime)} />
          <Field label="Last Commit By" value={repo.lastCommitBy || "—"} />
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-heading font-semibold text-ink mb-4">Collaborators</h2>
        <div className="space-y-2">
          {(repo.collaborators || []).map((c) => (
            <div
              key={c.role}
              className="flex items-center justify-between border border-slate-100 dark:border-slate-800 rounded-lg px-4 py-2.5"
            >
              <div>
                <p className="text-sm font-medium text-ink dark:text-slate-100">
                  {c.role} — {c.fullName}
                </p>
                <p className="text-xs text-slate-400">{c.githubUsername || "No GitHub username linked"}</p>
              </div>
              <span className={`badge ${COLLAB_STYLES[c.inviteStatus] || "bg-slate-100 text-slate-500"}`}>
                {c.inviteStatus}
              </span>
            </div>
          ))}
        </div>
      </section>

      <ConfirmDialog
        open={Boolean(confirmAction)}
        title={
          confirmAction === "lock"
            ? "Lock repository?"
            : confirmAction === "unlock"
            ? "Unlock repository?"
            : confirmAction === "archive"
            ? "Archive repository?"
            : "Delete repository?"
        }
        message={
          confirmAction === "lock"
            ? "All collaborators will be removed from the repository, blocking any further pushes. They'll need a fresh invite (via Unlock) to regain access."
            : confirmAction === "unlock"
            ? "All collaborators will be re-invited with push access. Each of them will need to accept the invitation again."
            : confirmAction === "archive"
            ? "The repository will become fully read-only on GitHub. This can be reversed from GitHub directly."
            : "This permanently deletes the repository on GitHub. This cannot be undone."
        }
        confirmLabel={confirmAction === "delete" ? "Delete" : "Confirm"}
        danger={confirmAction === "delete"}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => runAction(confirmAction)}
      />
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm text-ink dark:text-slate-100 mt-0.5 break-all">{value || "—"}</p>
    </div>
  );
}
