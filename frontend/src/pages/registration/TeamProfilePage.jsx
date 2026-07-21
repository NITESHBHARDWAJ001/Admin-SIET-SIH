import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
  FiClock,
  FiPrinter,
} from "react-icons/fi";
import StatusBadge from "../../components/StatusBadge";
import ConfirmDialog from "../../components/ConfirmDialog";
import EmptyState from "../../components/EmptyState";
import { SkeletonBlock } from "../../components/Skeleton";
import {
  fetchRegistration,
  updateRegistration,
  deleteRegistration,
  addRemark,
} from "../../services/registrationApi";
import { formatDateTime } from "../../utils/formatters";
import { GENDERS, YEARS } from "../../constants/registration";

const MEMBER_NUMBERS = [2, 3, 4, 5, 6];

const EDIT_FORM_FIELDS = [
  "teamName",
  "teamLeaderFullName",
  "teamLeaderRollNumber",
  "teamLeaderBranchSection",
  "teamLeaderYear",
  "teamLeaderGender",
  "teamLeaderPhoneNumber",
  "teamLeaderEmailAddress",
];

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm text-ink dark:text-slate-100 mt-0.5">{value || "—"}</p>
    </div>
  );
}

export default function TeamProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [remarkText, setRemarkText] = useState("");
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  const load = () => {
    setLoading(true);
    fetchRegistration(id)
      .then((data) => {
        setTeam(data);
        reset(data);
      })
      .catch(() => toast.error("Failed to load team"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleStatusChange = async (status) => {
    try {
      const updated = await updateRegistration(id, { status });
      setTeam(updated);
      reset(updated);
      toast.success(`Team marked as ${status}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setConfirmAction(null);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRegistration(id);
      toast.success("Team deleted");
      navigate("/registrations", { replace: true });
    } catch {
      toast.error("Failed to delete team");
      setConfirmAction(null);
    }
  };

  const onSaveEdit = async (values) => {
    // react-hook-form's `reset(team)` seeds the whole team object (incl. status,
    // remarks, timestamps) into form state even though only the fields below are
    // registered — only forward those, so a stale snapshot never clobbers status
    // or other data changed by actions taken since the form was last reset.
    const patch = {};
    for (const field of EDIT_FORM_FIELDS) {
      patch[field] = values[field];
    }

    setSaving(true);
    try {
      const updated = await updateRegistration(id, patch);
      setTeam(updated);
      reset(updated);
      setEditing(false);
      toast.success("Team details updated");
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleAddRemark = async () => {
    if (!remarkText.trim()) return;
    try {
      const updated = await addRemark(id, remarkText);
      setTeam(updated);
      reset(updated);
      setRemarkText("");
      toast.success("Remark added");
    } catch {
      toast.error("Failed to add remark");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonBlock className="h-8 w-48" />
        <SkeletonBlock className="h-40" />
        <SkeletonBlock className="h-40" />
      </div>
    );
  }

  if (!team) {
    return <EmptyState title="Team not found" />;
  }

  const activeMembers = MEMBER_NUMBERS.filter((n) => team[`member${n}FullName`]);

  return (
    <div className="space-y-6 print:space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-3 print:hidden">
        <button className="btn-secondary" onClick={() => navigate("/registrations")}>
          <FiArrowLeft size={15} /> Back
        </button>
        <div className="flex items-center gap-2 flex-wrap">
          {!editing && (
            <>
              <button className="btn-secondary" onClick={() => window.print()}>
                <FiPrinter size={15} /> Print
              </button>
              <button
                className="btn-secondary"
                onClick={() => setConfirmAction({ type: "Approved" })}
                disabled={team.status === "Approved"}
              >
                <FiCheck size={15} /> Approve
              </button>
              <button
                className="btn-secondary"
                onClick={() => setConfirmAction({ type: "Rejected" })}
                disabled={team.status === "Rejected"}
              >
                <FiX size={15} /> Reject
              </button>
              <button
                className="btn-secondary"
                onClick={() => setConfirmAction({ type: "Pending" })}
                disabled={team.status === "Pending"}
              >
                <FiClock size={15} /> Mark Pending
              </button>
              <button className="btn-secondary" onClick={() => setEditing(true)}>
                <FiEdit2 size={15} /> Edit
              </button>
              <button className="btn-danger" onClick={() => setConfirmAction({ type: "delete" })}>
                <FiTrash2 size={15} /> Delete
              </button>
            </>
          )}
          {editing && (
            <>
              <button className="btn-secondary" onClick={() => { setEditing(false); reset(team); }}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSubmit(onSaveEdit)} disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="font-heading text-xl font-semibold text-ink">{team.teamName}</h1>
            <p className="text-sm text-slate-500">{team.teamId}</p>
          </div>
          <StatusBadge status={team.status} />
        </div>
      </div>

      {editing ? (
        <form className="card p-5 space-y-4">
          <h2 className="font-heading font-semibold text-ink">Edit Team & Leader Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400">Team Name</label>
              <input className="input mt-1" {...register("teamName")} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Leader Full Name</label>
              <input className="input mt-1" {...register("teamLeaderFullName")} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Roll Number</label>
              <input className="input mt-1" {...register("teamLeaderRollNumber")} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Branch & Section</label>
              <input className="input mt-1" {...register("teamLeaderBranchSection")} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Year</label>
              <select className="input mt-1" {...register("teamLeaderYear")}>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400">Gender</label>
              <select className="input mt-1" {...register("teamLeaderGender")}>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400">Phone Number</label>
              <input className="input mt-1" {...register("teamLeaderPhoneNumber")} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Email Address</label>
              <input className="input mt-1" {...register("teamLeaderEmailAddress")} />
            </div>
          </div>
        </form>
      ) : (
        <>
          <section className="card p-5">
            <h2 className="font-heading font-semibold text-ink mb-4">General Information</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Field label="Team ID" value={team.teamId} />
              <Field label="Team Name" value={team.teamName} />
              <Field label="Registration Time" value={formatDateTime(team.timestamp)} />
              <Field label="Status" value={team.status} />
            </div>
          </section>

          <section className="card p-5">
            <h2 className="font-heading font-semibold text-ink mb-4">Leader Information</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Field label="Full Name" value={team.teamLeaderFullName} />
              <Field label="Roll Number" value={team.teamLeaderRollNumber} />
              <Field label="Branch & Section" value={team.teamLeaderBranchSection} />
              <Field label="Year" value={team.teamLeaderYear} />
              <Field label="Gender" value={team.teamLeaderGender} />
              <Field label="Phone Number" value={team.teamLeaderPhoneNumber} />
              <Field label="Email Address" value={team.teamLeaderEmailAddress} />
            </div>
          </section>

          <section className="card p-5">
            <h2 className="font-heading font-semibold text-ink mb-4">
              Member Information ({activeMembers.length} additional member{activeMembers.length === 1 ? "" : "s"})
            </h2>
            {activeMembers.length === 0 ? (
              <p className="text-sm text-slate-400">No additional members.</p>
            ) : (
              <div className="space-y-4">
                {activeMembers.map((n) => (
                  <div key={n} className="border-t border-slate-100 dark:border-slate-800 pt-4 first:border-0 first:pt-0">
                    <p className="text-xs font-medium text-primary mb-2">Member {n}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <Field label="Full Name" value={team[`member${n}FullName`]} />
                      <Field label="Roll Number" value={team[`member${n}RollNumber`]} />
                      <Field label="Branch & Section" value={team[`member${n}BranchSection`]} />
                      <Field label="Year" value={team[`member${n}Year`]} />
                      <Field label="Gender" value={team[`member${n}Gender`]} />
                      <Field label="Email Address" value={team[`member${n}EmailAddress`]} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card p-5">
            <h2 className="font-heading font-semibold text-ink mb-4">Declaration</h2>
            <p className="text-sm text-ink dark:text-slate-100">
              {team.declaration ? "Team has accepted the declaration." : "Declaration not accepted."}
            </p>
          </section>

          <section className="card p-5">
            <h2 className="font-heading font-semibold text-ink mb-4">System Information</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Field label="Record ID" value={team.id} />
              <Field label="Judge Assigned" value={team.judgeAssigned} />
              <Field label="Presentation Slot" value={team.presentationSlot} />
              <Field label="Created At" value={formatDateTime(team.createdAt)} />
              <Field label="Last Updated" value={formatDateTime(team.updatedAt)} />
            </div>
          </section>

          <section className="card p-5 print:hidden">
            <h2 className="font-heading font-semibold text-ink mb-4">Internal Remarks</h2>
            <div className="space-y-3 mb-4">
              {(team.remarks || []).length === 0 && (
                <p className="text-sm text-slate-400">No remarks yet.</p>
              )}
              {(team.remarks || [])
                .slice()
                .reverse()
                .map((r) => (
                  <div key={r.id} className="border border-slate-100 dark:border-slate-800 rounded-lg p-3">
                    <p className="text-sm text-ink dark:text-slate-100">{r.text}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {r.author} · {formatDateTime(r.timestamp)}
                    </p>
                  </div>
                ))}
            </div>
            <div className="flex gap-2">
              <input
                className="input"
                placeholder="Add an internal remark…"
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddRemark()}
              />
              <button className="btn-primary shrink-0" onClick={handleAddRemark}>
                Add
              </button>
            </div>
          </section>
        </>
      )}

      <ConfirmDialog
        open={Boolean(confirmAction)}
        title={confirmAction?.type === "delete" ? "Delete team?" : `Mark team as ${confirmAction?.type}?`}
        message={
          confirmAction?.type === "delete"
            ? "This will permanently remove the team's registration. This cannot be undone."
            : `${team.teamName} will be marked as ${confirmAction?.type}.`
        }
        confirmLabel={confirmAction?.type === "delete" ? "Delete" : "Confirm"}
        danger={confirmAction?.type === "delete"}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() =>
          confirmAction?.type === "delete" ? handleDelete() : handleStatusChange(confirmAction.type)
        }
      />
    </div>
  );
}
