import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FiPlus, FiTrash2, FiEye, FiEyeOff } from "react-icons/fi";
import { BsPinAngle, BsPinAngleFill } from "react-icons/bs";
import {
  fetchAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../../services/announcementApi";
import ConfirmDialog from "../../components/ConfirmDialog";
import EmptyState from "../../components/EmptyState";
import { SkeletonBlock } from "../../components/Skeleton";
import { formatDate } from "../../utils/formatters";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const load = async () => {
    setLoading(true);
    try {
      setAnnouncements(await fetchAnnouncements());
    } catch {
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (values) => {
    try {
      await createAnnouncement(values);
      toast.success("Announcement published");
      reset();
      setShowForm(false);
      load();
    } catch {
      toast.error("Failed to publish announcement");
    }
  };

  const togglePin = async (a) => {
    const updated = await updateAnnouncement(a.id, { pinned: !a.pinned });
    setAnnouncements((prev) => prev.map((x) => (x.id === a.id ? updated : x)).sort(sortFn));
  };

  const toggleVisibility = async (a) => {
    const updated = await updateAnnouncement(a.id, {
      visibility: a.visibility === "Hidden" ? "Public" : "Hidden",
    });
    setAnnouncements((prev) => prev.map((x) => (x.id === a.id ? updated : x)));
  };

  const sortFn = (a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return (b.publishDate || "").localeCompare(a.publishDate || "");
  };

  const handleDelete = async () => {
    try {
      await deleteAnnouncement(deleteTarget.id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      toast.success("Announcement deleted");
    } catch {
      toast.error("Failed to delete announcement");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold text-ink">Announcements</h1>
          <p className="text-sm text-slate-500">Published to the public website</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          <FiPlus size={15} /> New Announcement
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onCreate)} className="card p-5 space-y-3">
          <div>
            <label className="text-xs text-slate-400">Title</label>
            <input className="input mt-1" {...register("title", { required: true })} />
          </div>
          <div>
            <label className="text-xs text-slate-400">Description</label>
            <textarea className="input mt-1" rows={2} {...register("description")} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-slate-400">Priority</label>
              <select className="input mt-1" {...register("priority")}>
                <option>Normal</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400">Visibility</label>
              <select className="input mt-1" {...register("visibility")}>
                <option>Public</option>
                <option>Hidden</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400">Publish Date</label>
              <input className="input mt-1" type="date" {...register("publishDate")} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Expiry Date</label>
              <input className="input mt-1" type="date" {...register("expiryDate")} />
            </div>
          </div>
          <button className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Publishing…" : "Publish"}
          </button>
        </form>
      )}

      {loading ? (
        <SkeletonBlock className="h-40" />
      ) : announcements.length === 0 ? (
        <EmptyState title="No announcements" message="Publish an announcement to notify participants." />
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-semibold text-ink dark:text-slate-100">{a.title}</h3>
                    {a.priority !== "Normal" && (
                      <span className="badge bg-red-100 text-red-700">{a.priority}</span>
                    )}
                    {a.visibility === "Hidden" && (
                      <span className="badge bg-slate-100 text-slate-500">Hidden</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{a.description}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {formatDate(a.publishDate)}
                    {a.expiryDate && ` – ${formatDate(a.expiryDate)}`}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="btn-secondary px-2 py-1" onClick={() => togglePin(a)}>
                    {a.pinned ? <BsPinAngleFill size={14} /> : <BsPinAngle size={14} />}
                  </button>
                  <button className="btn-secondary px-2 py-1" onClick={() => toggleVisibility(a)}>
                    {a.visibility === "Hidden" ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                  <button className="btn-danger px-2 py-1" onClick={() => setDeleteTarget(a)}>
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete announcement?"
        message={`"${deleteTarget?.title}" will be removed from the public website.`}
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
