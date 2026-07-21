import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiTrash2, FiSave } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { fetchRegistrations } from "../../services/registrationApi";
import { fetchUsers } from "../../services/userApi";
import { fetchEvaluations, saveEvaluation, deleteEvaluation } from "../../services/evaluationApi";
import { CRITERIA, computeTotal } from "../../constants/evaluation";
import ConfirmDialog from "../../components/ConfirmDialog";
import { SkeletonBlock } from "../../components/Skeleton";

const emptyScores = CRITERIA.reduce((acc, c) => ({ ...acc, [c.key]: 0 }), {});

export default function EvaluationPage() {
  const { user } = useAuth();
  const isJudge = user?.role === "Judge";

  const [teams, setTeams] = useState([]);
  const [judges, setJudges] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [teamId, setTeamId] = useState("");
  const [judgeId, setJudgeId] = useState(isJudge ? user.id : "");
  const [scores, setScores] = useState(emptyScores);
  const [judgeRemarks, setJudgeRemarks] = useState("");
  const [facultyRemarks, setFacultyRemarks] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [teamsRes, judgeList, evals] = await Promise.all([
        fetchRegistrations({ pageSize: 500 }),
        fetchUsers("Judge"),
        fetchEvaluations({}),
      ]);
      const scoped = isJudge
        ? teamsRes.data.filter((t) => t.judgeAssigned === user.id)
        : teamsRes.data;
      setTeams(scoped);
      setJudges(judgeList);
      setEvaluations(evals);
    } catch {
      toast.error("Failed to load evaluation data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!teamId || !judgeId) {
      setScores(emptyScores);
      setJudgeRemarks("");
      setFacultyRemarks("");
      return;
    }
    const existing = evaluations.find((e) => e.teamId === teamId && e.judgeId === judgeId);
    if (existing) {
      const s = {};
      CRITERIA.forEach((c) => (s[c.key] = Number(existing[c.key]) || 0));
      setScores(s);
      setJudgeRemarks(existing.judgeRemarks || "");
      setFacultyRemarks(existing.facultyRemarks || "");
    } else {
      setScores(emptyScores);
      setJudgeRemarks("");
      setFacultyRemarks("");
    }
  }, [teamId, judgeId, evaluations]);

  const total = useMemo(() => computeTotal(scores), [scores]);

  const selectedTeam = teams.find((t) => t.id === teamId);
  const selectedJudge = judges.find((j) => j.id === judgeId);

  const handleScoreChange = (key, max, value) => {
    const num = Math.max(0, Math.min(max, Number(value) || 0));
    setScores((prev) => ({ ...prev, [key]: num }));
  };

  const handleSave = async () => {
    if (!teamId || !judgeId) {
      toast.error("Select a team and judge first");
      return;
    }
    setSaving(true);
    try {
      await saveEvaluation({
        teamId: selectedTeam.teamId,
        teamName: selectedTeam.teamName,
        judgeId,
        judgeName: selectedJudge?.name || user.name,
        ...scores,
        judgeRemarks,
        facultyRemarks,
      });
      toast.success("Evaluation saved");
      load();
    } catch {
      toast.error("Failed to save evaluation");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEvaluation(deleteTarget.id);
      toast.success("Evaluation deleted");
      setEvaluations((prev) => prev.filter((e) => e.id !== deleteTarget.id));
    } catch {
      toast.error("Failed to delete evaluation");
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonBlock className="h-8 w-48" />
        <SkeletonBlock className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-ink">Evaluation</h1>
        <p className="text-sm text-slate-500">Score teams across the 9 judging criteria</p>
      </div>

      <div className="card p-5 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400">Team</label>
            <select className="input mt-1" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
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
            <select
              className="input mt-1"
              value={judgeId}
              onChange={(e) => setJudgeId(e.target.value)}
              disabled={isJudge}
            >
              <option value="">Select judge…</option>
              {judges.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          {CRITERIA.map((c) => (
            <div key={c.key}>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>{c.label}</span>
                <span>
                  {scores[c.key]} / {c.max}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={c.max}
                value={scores[c.key]}
                onChange={(e) => handleScoreChange(c.key, c.max, e.target.value)}
                className="w-full accent-primary"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
          <span className="font-heading font-semibold text-ink dark:text-slate-100">Total</span>
          <span className="font-heading text-2xl font-semibold text-primary">{total} / 100</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400">Judge Remarks</label>
            <textarea
              className="input mt-1"
              rows={2}
              value={judgeRemarks}
              onChange={(e) => setJudgeRemarks(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Faculty Remarks</label>
            <textarea
              className="input mt-1"
              rows={2}
              value={facultyRemarks}
              onChange={(e) => setFacultyRemarks(e.target.value)}
              disabled={isJudge}
            />
          </div>
        </div>

        <button className="btn-primary" onClick={handleSave} disabled={saving || !teamId || !judgeId}>
          <FiSave size={15} /> {saving ? "Saving…" : "Save Evaluation"}
        </button>
      </div>

      <div className="card overflow-x-auto">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-heading font-semibold text-ink">All Evaluations</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="text-left px-4 py-3 font-medium text-slate-500">Team</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Judge</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Score</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {evaluations.map((e) => (
              <tr key={e.id} className="border-b border-slate-50 dark:border-slate-800/60">
                <td className="px-4 py-3">{e.teamName}</td>
                <td className="px-4 py-3 text-slate-500">{e.judgeName}</td>
                <td className="px-4 py-3 font-medium">{e.total} / 100</td>
                <td className="px-4 py-3">
                  <button className="btn-danger px-2 py-1" onClick={() => setDeleteTarget(e)}>
                    <FiTrash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {evaluations.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-400">
                  No evaluations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete evaluation?"
        message={`Score for ${deleteTarget?.teamName} by ${deleteTarget?.judgeName} will be removed.`}
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
