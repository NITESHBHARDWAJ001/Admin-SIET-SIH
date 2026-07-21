import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FiPlus, FiExternalLink, FiCheck, FiX, FiTrash2 } from "react-icons/fi";
import { fetchRegistrations } from "../../services/registrationApi";
import {
  fetchSubmissions,
  createSubmission,
  updateSubmission,
  deleteSubmission,
} from "../../services/submissionApi";
import StatusBadge from "../../components/StatusBadge";
import ConfirmDialog from "../../components/ConfirmDialog";
import EmptyState from "../../components/EmptyState";
import { SkeletonTable } from "../../components/Skeleton";

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const load = async () => {
    setLoading(true);
    try {
      const [subs, teamsRes] = await Promise.all([
        fetchSubmissions(),
        fetchRegistrations({ pageSize: 500 }),
      ]);
      setSubmissions(subs);
      setTeams(teamsRes.data);
    } catch {
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (values) => {
    const team = teams.find((t) => t.id === values.teamId);
    try {
      await createSubmission({ ...values, teamId: team?.teamId || "", teamName: team?.teamName || "" });
      toast.success("Submission added");
      reset();
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add submission");
    }
  };

  const handleStatus = async (id, status) => {
    try {
      const updated = await updateSubmission(id, { status });
      setSubmissions((prev) => prev.map((s) => (s.id === id ? updated : s)));
      toast.success(`Submission ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSubmission(deleteTarget.id);
      setSubmissions((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      toast.success("Submission deleted");
    } catch {
      toast.error("Failed to delete submission");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold text-ink">Submissions</h1>
          <p className="text-sm text-slate-500">{submissions.length} prototypes submitted</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          <FiPlus size={15} /> Add Submission
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onCreate)} className="card p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400">Team</label>
              <select className="input mt-1" {...register("teamId", { required: true })}>
                <option value="">Select team…</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.teamId} — {t.teamName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400">GitHub Repository</label>
              <input className="input mt-1" {...register("githubRepository")} />
            </div>
            <div>
              <label className="text-xs text-slate-400">PPT Link</label>
              <input className="input mt-1" {...register("ppt")} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Demo Video Link</label>
              <input className="input mt-1" {...register("demoVideo")} />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400">Description</label>
            <textarea className="input mt-1" rows={2} {...register("description")} />
          </div>
          <button className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save Submission"}
          </button>
        </form>
      )}

      {loading ? (
        <SkeletonTable rows={5} cols={6} />
      ) : submissions.length === 0 ? (
        <EmptyState title="No submissions yet" message="Prototype submissions will appear here." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="text-left px-4 py-3 font-medium text-slate-500">Team</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Links</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 dark:border-slate-800/60">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink dark:text-slate-100">{s.teamName}</p>
                    <p className="text-xs text-slate-400">{s.teamId}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 text-primary">
                      {s.githubRepository && (
                        <a href={s.githubRepository} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs">
                          Repo <FiExternalLink size={11} />
                        </a>
                      )}
                      {s.ppt && (
                        <a href={s.ppt} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs">
                          PPT <FiExternalLink size={11} />
                        </a>
                      )}
                      {s.demoVideo && (
                        <a href={s.demoVideo} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs">
                          Demo <FiExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="btn-secondary px-2 py-1" onClick={() => handleStatus(s.id, "Approved")}>
                        <FiCheck size={14} />
                      </button>
                      <button className="btn-secondary px-2 py-1" onClick={() => handleStatus(s.id, "Rejected")}>
                        <FiX size={14} />
                      </button>
                      <button className="btn-danger px-2 py-1" onClick={() => setDeleteTarget(s)}>
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete submission?"
        message={`${deleteTarget?.teamName}'s submission will be permanently removed.`}
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
