import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FiPlus, FiTrash2, FiEdit2, FiUsers } from "react-icons/fi";
import {
  fetchProblemStatements,
  createProblemStatement,
  updateProblemStatement,
  deleteProblemStatement,
} from "../../services/problemStatementApi";
import ConfirmDialog from "../../components/ConfirmDialog";
import EmptyState from "../../components/EmptyState";
import { SkeletonBlock } from "../../components/Skeleton";

export default function ProblemStatementsPage() {
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const load = async () => {
    setLoading(true);
    try {
      setStatements(await fetchProblemStatements());
    } catch {
      toast.error("Failed to load problem statements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    reset({ title: "", theme: "", description: "", capacity: "" });
    setShowForm(true);
  };

  const openEdit = (statement) => {
    setEditing(statement);
    reset(statement);
    setShowForm(true);
  };

  const onSave = async (values) => {
    try {
      if (editing) {
        await updateProblemStatement(editing.id, values);
        toast.success("Problem statement updated");
      } else {
        await createProblemStatement(values);
        toast.success("Problem statement created");
      }
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save problem statement");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProblemStatement(deleteTarget.id);
      setStatements((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success("Problem statement deleted");
    } catch {
      toast.error("Failed to delete problem statement");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold text-ink">Problem Statements</h1>
          <p className="text-sm text-slate-500">{statements.length} problem statements</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/problem-statements/selections" className="btn-secondary">
            <FiUsers size={15} /> Team Selections
          </Link>
          <button className="btn-primary" onClick={openCreate}>
            <FiPlus size={15} /> Add Problem Statement
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSave)} className="card p-5 space-y-3">
          <h2 className="font-heading font-semibold text-ink">
            {editing ? `Edit ${editing.problemId}` : "New Problem Statement"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400">Title</label>
              <input className="input mt-1" {...register("title", { required: true })} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Theme</label>
              <input className="input mt-1" {...register("theme", { required: true })} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Capacity (max teams)</label>
              <input className="input mt-1" type="number" min="1" {...register("capacity", { required: true })} />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400">Description</label>
            <textarea className="input mt-1" rows={3} {...register("description")} />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
            >
              Cancel
            </button>
            <button className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : editing ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <SkeletonBlock className="h-40" />
      ) : statements.length === 0 ? (
        <EmptyState title="No problem statements yet" message="Add problem statements for teams to select." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="text-left px-4 py-3 font-medium text-slate-500">ID</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Title</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Theme</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Capacity</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {statements.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 dark:border-slate-800/60">
                  <td className="px-4 py-3 font-medium">{p.problemId}</td>
                  <td className="px-4 py-3">
                    <p className="text-ink dark:text-slate-100">{p.title}</p>
                    <p className="text-xs text-slate-400 max-w-xs truncate">{p.description}</p>
                  </td>
                  <td className="px-4 py-3">{p.theme}</td>
                  <td className="px-4 py-3">
                    {p.taken} / {p.capacity}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.full ? "bg-red-100 text-red-700" : "bg-success/10 text-success"}`}>
                      {p.full ? "Full" : `${p.remaining} left`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="btn-secondary px-2 py-1" onClick={() => openEdit(p)}>
                        <FiEdit2 size={14} />
                      </button>
                      <button className="btn-danger px-2 py-1" onClick={() => setDeleteTarget(p)}>
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
        title="Delete problem statement?"
        message={`"${deleteTarget?.title}" will be removed. Teams that already selected it keep their selection recorded, but it won't be visible in the picker anymore.`}
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
