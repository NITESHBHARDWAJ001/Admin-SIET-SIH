import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FiPlus, FiTrash2, FiUsers } from "react-icons/fi";
import { fetchUsers, createUser, deleteUser } from "../../services/userApi";
import { fetchRegistrations } from "../../services/registrationApi";
import ConfirmDialog from "../../components/ConfirmDialog";
import EmptyState from "../../components/EmptyState";
import { SkeletonTable } from "../../components/Skeleton";

export default function JudgesPage() {
  const navigate = useNavigate();
  const [judges, setJudges] = useState([]);
  const [assignedCounts, setAssignedCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const load = async () => {
    setLoading(true);
    try {
      const [judgeList, teams] = await Promise.all([
        fetchUsers("Judge"),
        fetchRegistrations({ pageSize: 500 }),
      ]);
      setJudges(judgeList);
      const counts = {};
      teams.data.forEach((t) => {
        if (t.judgeAssigned) counts[t.judgeAssigned] = (counts[t.judgeAssigned] || 0) + 1;
      });
      setAssignedCounts(counts);
    } catch {
      toast.error("Failed to load judges");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (values) => {
    try {
      await createUser({ ...values, role: "Judge" });
      toast.success("Judge added");
      reset();
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add judge");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(deleteTarget.id);
      toast.success("Judge removed");
      setJudges((prev) => prev.filter((j) => j.id !== deleteTarget.id));
    } catch {
      toast.error("Failed to remove judge");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold text-ink">Judges</h1>
          <p className="text-sm text-slate-500">{judges.length} judges</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          <FiPlus size={15} /> Add Judge
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onCreate)} className="card p-5 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-xs text-slate-400">Full Name</label>
            <input className="input mt-1" {...register("name", { required: true })} />
          </div>
          <div>
            <label className="text-xs text-slate-400">Email</label>
            <input className="input mt-1" type="email" {...register("email", { required: true })} />
          </div>
          <div>
            <label className="text-xs text-slate-400">Temporary Password</label>
            <input className="input mt-1" type="text" {...register("password", { required: true })} />
          </div>
          <button className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Adding…" : "Add Judge"}
          </button>
        </form>
      )}

      {loading ? (
        <SkeletonTable rows={5} cols={4} />
      ) : judges.length === 0 ? (
        <EmptyState title="No judges yet" message="Add a judge to start assigning teams for evaluation." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="text-left px-4 py-3 font-medium text-slate-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Email</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Assigned Teams</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {judges.map((j) => (
                <tr key={j.id} className="border-b border-slate-50 dark:border-slate-800/60">
                  <td className="px-4 py-3">{j.name}</td>
                  <td className="px-4 py-3 text-slate-500">{j.email}</td>
                  <td className="px-4 py-3">{assignedCounts[j.id] || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="btn-secondary" onClick={() => navigate(`/judges/${j.id}`)}>
                        <FiUsers size={14} /> View Teams
                      </button>
                      <button className="btn-danger" onClick={() => setDeleteTarget(j)}>
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
        title="Remove judge?"
        message={`${deleteTarget?.name} will lose access to the portal.`}
        confirmLabel="Remove"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
