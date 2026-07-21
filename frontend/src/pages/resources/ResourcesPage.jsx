import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FiPlus, FiTrash2, FiExternalLink, FiEye, FiEyeOff, FiArrowUp, FiArrowDown } from "react-icons/fi";
import {
  fetchResources,
  createResource,
  updateResource,
  deleteResource,
} from "../../services/resourceApi";
import ConfirmDialog from "../../components/ConfirmDialog";
import EmptyState from "../../components/EmptyState";
import { SkeletonBlock } from "../../components/Skeleton";

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const load = async () => {
    setLoading(true);
    try {
      setResources(await fetchResources());
    } catch {
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (values) => {
    try {
      await createResource(values);
      toast.success("Resource added");
      reset();
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add resource");
    }
  };

  const toggleVisible = async (r) => {
    const updated = await updateResource(r.id, { visible: !r.visible });
    setResources((prev) => prev.map((x) => (x.id === r.id ? updated : x)));
  };

  const move = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= resources.length) return;
    const reordered = [...resources];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setResources(reordered);
    await Promise.all(reordered.map((r, i) => updateResource(r.id, { order: i })));
  };

  const handleDelete = async () => {
    try {
      await deleteResource(deleteTarget.id);
      setResources((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      toast.success("Resource deleted");
    } catch {
      toast.error("Failed to delete resource");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold text-ink">Resources</h1>
          <p className="text-sm text-slate-500">Downloadable links shown to participants</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          <FiPlus size={15} /> Add Resource
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onCreate)} className="card p-5 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-xs text-slate-400">Name</label>
            <input className="input mt-1" {...register("name", { required: true })} />
          </div>
          <div>
            <label className="text-xs text-slate-400">Category</label>
            <select className="input mt-1" {...register("category")}>
              <option>Rulebook</option>
              <option>Guidelines</option>
              <option>PPT Template</option>
              <option>Report Format</option>
              <option>Problem Statements</option>
              <option>Official Links</option>
              <option>General</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400">URL</label>
            <input className="input mt-1" {...register("url", { required: true })} />
          </div>
          <button className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Adding…" : "Add"}
          </button>
        </form>
      )}

      {loading ? (
        <SkeletonBlock className="h-40" />
      ) : resources.length === 0 ? (
        <EmptyState title="No resources" message="Add downloadable resources for participants." />
      ) : (
        <div className="card divide-y divide-slate-100 dark:divide-slate-800">
          {resources.map((r, i) => (
            <div key={r.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-ink dark:text-slate-100">{r.name}</p>
                <p className="text-xs text-slate-400">{r.category}</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={r.url} target="_blank" rel="noreferrer" className="btn-secondary px-2 py-1">
                  <FiExternalLink size={14} />
                </a>
                <button className="btn-secondary px-2 py-1" onClick={() => move(i, -1)} disabled={i === 0}>
                  <FiArrowUp size={14} />
                </button>
                <button
                  className="btn-secondary px-2 py-1"
                  onClick={() => move(i, 1)}
                  disabled={i === resources.length - 1}
                >
                  <FiArrowDown size={14} />
                </button>
                <button className="btn-secondary px-2 py-1" onClick={() => toggleVisible(r)}>
                  {r.visible ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                </button>
                <button className="btn-danger px-2 py-1" onClick={() => setDeleteTarget(r)}>
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete resource?"
        message={`"${deleteTarget?.name}" will be removed.`}
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
