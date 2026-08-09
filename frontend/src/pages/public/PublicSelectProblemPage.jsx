import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiLock, FiCheckCircle, FiHelpCircle } from "react-icons/fi";
import {
  fetchPublicSettings,
  authenticateTeamForSelection,
  selectProblemStatement,
} from "../../services/publicApi";
import { SkeletonBlock } from "../../components/Skeleton";
import ConfirmDialog from "../../components/ConfirmDialog";
import { formatDateTime } from "../../utils/formatters";

export default function PublicSelectProblemPage() {
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [teamId, setTeamId] = useState("");
  const [password, setPassword] = useState("");
  const [authenticating, setAuthenticating] = useState(false);
  const [session, setSession] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    fetchPublicSettings()
      .then(setSettings)
      .catch(() => toast.error("Failed to load problem selection status"))
      .finally(() => setLoadingSettings(false));
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!teamId.trim() || !password.trim()) return;
    setAuthenticating(true);
    try {
      const result = await authenticateTeamForSelection(teamId.trim(), password.trim());
      setSession(result);
    } catch (err) {
      toast.error(err.response?.data?.message || "Authentication failed");
    } finally {
      setAuthenticating(false);
    }
  };

  const handleSelect = async () => {
    setSelecting(true);
    try {
      const result = await selectProblemStatement(session.teamId, password.trim(), confirmTarget.problemId);
      toast.success(`Selected: ${result.selection.title}`);
      setSession((prev) => ({ ...prev, locked: true, selection: result.selection }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to select problem statement");
    } finally {
      setSelecting(false);
      setConfirmTarget(null);
    }
  };

  if (loadingSettings) {
    return (
      <div className="space-y-4">
        <SkeletonBlock className="h-8 w-64" />
        <SkeletonBlock className="h-40" />
      </div>
    );
  }

  if (settings?.problemSelectionOpen !== "true") {
    return (
      <div className="card p-8 text-center">
        <h1 className="font-heading text-xl font-semibold text-ink">Selection Closed</h1>
        <p className="text-sm text-slate-500 mt-2">
          Problem statement selection isn't open right now. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-ink flex items-center gap-2">
          <FiHelpCircle size={20} /> Select Your Problem Statement
        </h1>
        <p className="text-sm text-slate-500">
          Enter your Team ID and the password provided by the organizers. Selection is one-time only,
          so choose carefully.
        </p>
      </div>

      {!session ? (
        <form onSubmit={handleAuth} className="card p-5 space-y-3">
          <div>
            <label className="text-xs text-slate-400">Team ID</label>
            <input
              className="input mt-1"
              placeholder="e.g. SIH26-014"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Password</label>
            <input
              className="input mt-1"
              type="password"
              placeholder="Password from the organizers"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn-primary" disabled={authenticating}>
            <FiLock size={14} /> {authenticating ? "Verifying…" : "Continue"}
          </button>
        </form>
      ) : session.locked ? (
        <div className="card p-8 text-center">
          <FiCheckCircle size={40} className="text-success mx-auto mb-3" />
          <h2 className="font-heading text-lg font-semibold text-ink">Already Selected</h2>
          <p className="text-sm text-slate-500 mt-2">
            <strong>{session.teamName}</strong> selected{" "}
            <strong>
              {session.selection.problemId}: {session.selection.title}
            </strong>
            .
          </p>
          <p className="text-xs text-slate-400 mt-2">Locked {formatDateTime(session.selection.lockedAt)}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="card p-4">
            <p className="text-xs text-slate-400">Selecting for</p>
            <p className="font-medium text-ink dark:text-slate-100">
              {session.teamName} ({session.teamId})
            </p>
          </div>

          {session.available.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-sm text-slate-500">
                All problem statements are currently full. Please check back or contact the organizers.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {session.available.map((p) => (
                <div key={p.problemId} className="card p-5 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">{p.problemId}</span>
                      <span className="badge bg-primary/10 text-primary">{p.theme}</span>
                    </div>
                    <h3 className="font-heading font-semibold text-ink dark:text-slate-100 mt-1">{p.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{p.description}</p>
                    <p className="text-xs text-slate-400 mt-2">{p.remaining} of {p.capacity} slots left</p>
                  </div>
                  <button className="btn-primary shrink-0" onClick={() => setConfirmTarget(p)}>
                    Select
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmTarget)}
        title="Confirm your selection?"
        message={`You're about to select "${confirmTarget?.title}". This cannot be changed once confirmed — choose carefully.`}
        confirmLabel="Confirm Selection"
        onCancel={() => setConfirmTarget(null)}
        onConfirm={handleSelect}
      />
      {selecting && <p className="text-xs text-slate-400 text-center">Saving your selection…</p>}
    </div>
  );
}
