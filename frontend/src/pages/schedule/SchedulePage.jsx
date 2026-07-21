import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FiPlus, FiTrash2, FiPrinter } from "react-icons/fi";
import { fetchRegistrations } from "../../services/registrationApi";
import { fetchUsers } from "../../services/userApi";
import { fetchSchedule, createSlot, updateSlot, deleteSlot } from "../../services/scheduleApi";
import ConfirmDialog from "../../components/ConfirmDialog";
import EmptyState from "../../components/EmptyState";
import { SkeletonTable } from "../../components/Skeleton";
import { formatDateTime } from "../../utils/formatters";

export default function SchedulePage() {
  const [slots, setSlots] = useState([]);
  const [teams, setTeams] = useState([]);
  const [judges, setJudges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const load = async () => {
    setLoading(true);
    try {
      const [scheduleRes, teamsRes, judgeList] = await Promise.all([
        fetchSchedule(),
        fetchRegistrations({ pageSize: 500 }),
        fetchUsers("Judge"),
      ]);
      setSlots(scheduleRes);
      setTeams(teamsRes.data);
      setJudges(judgeList);
    } catch {
      toast.error("Failed to load schedule");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (values) => {
    const team = teams.find((t) => t.id === values.teamId);
    const judge = judges.find((j) => j.id === values.judgeId);
    try {
      await createSlot({
        ...values,
        teamId: team?.teamId || "",
        teamName: team?.teamName || "",
        judgeName: judge?.name || "",
      });
      toast.success("Slot created");
      reset();
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create slot");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSlot(deleteTarget.id);
      setSlots((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      toast.success("Slot deleted");
    } catch {
      toast.error("Failed to delete slot");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      const updated = await updateSlot(id, { status });
      setSlots((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch {
      toast.error("Failed to update slot");
    }
  };

  return (
    <div className="space-y-4 print:space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-2 print:hidden">
        <div>
          <h1 className="font-heading text-xl font-semibold text-ink">Presentation Schedule</h1>
          <p className="text-sm text-slate-500">{slots.length} slots scheduled</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => window.print()}>
            <FiPrinter size={15} /> Print
          </button>
          <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
            <FiPlus size={15} /> Create Slot
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onCreate)} className="card p-5 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end print:hidden">
          <div>
            <label className="text-xs text-slate-400">Room</label>
            <input className="input mt-1" {...register("room", { required: true })} />
          </div>
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
            <label className="text-xs text-slate-400">Judge</label>
            <select className="input mt-1" {...register("judgeId")}>
              <option value="">Unassigned</option>
              {judges.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400">Time</label>
            <input className="input mt-1" type="datetime-local" {...register("time", { required: true })} />
          </div>
          <div>
            <label className="text-xs text-slate-400">Duration</label>
            <input className="input mt-1" defaultValue="15 min" {...register("duration")} />
          </div>
          <button className="btn-primary sm:col-span-5 justify-self-start" disabled={isSubmitting}>
            {isSubmitting ? "Creating…" : "Create Slot"}
          </button>
        </form>
      )}

      {loading ? (
        <SkeletonTable rows={5} cols={6} />
      ) : slots.length === 0 ? (
        <EmptyState title="No slots scheduled" message="Create a presentation slot to get started." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="text-left px-4 py-3 font-medium text-slate-500">Room</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Team</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Judge</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Time</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Duration</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 dark:border-slate-800/60">
                  <td className="px-4 py-3">{s.room}</td>
                  <td className="px-4 py-3">{s.teamName}</td>
                  <td className="px-4 py-3 text-slate-500">{s.judgeName || "—"}</td>
                  <td className="px-4 py-3">{formatDateTime(s.time)}</td>
                  <td className="px-4 py-3">{s.duration}</td>
                  <td className="px-4 py-3">
                    <select
                      className="input py-1 text-xs"
                      value={s.status}
                      onChange={(e) => handleStatus(s.id, e.target.value)}
                    >
                      <option>Scheduled</option>
                      <option>Completed</option>
                      <option>Cancelled</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 print:hidden">
                    <button className="btn-danger px-2 py-1" onClick={() => setDeleteTarget(s)}>
                      <FiTrash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete slot?"
        message={`The slot for ${deleteTarget?.teamName} will be removed.`}
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
