import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowLeft, FiX } from "react-icons/fi";
import { fetchUsers } from "../../services/userApi";
import { fetchRegistrations, updateRegistration } from "../../services/registrationApi";
import { fetchEvaluations } from "../../services/evaluationApi";
import EmptyState from "../../components/EmptyState";
import { SkeletonBlock } from "../../components/Skeleton";

export default function JudgeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [judge, setJudge] = useState(null);
  const [assigned, setAssigned] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [evaluatedTeamIds, setEvaluatedTeamIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [judges, teamsRes, evals] = await Promise.all([
        fetchUsers("Judge"),
        fetchRegistrations({ pageSize: 500 }),
        fetchEvaluations({ judgeId: id }),
      ]);
      setJudge(judges.find((j) => j.id === id) || null);
      setAssigned(teamsRes.data.filter((t) => t.judgeAssigned === id));
      setUnassigned(teamsRes.data.filter((t) => !t.judgeAssigned));
      setEvaluatedTeamIds(new Set(evals.map((e) => e.teamId)));
    } catch {
      toast.error("Failed to load judge details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleAssign = async () => {
    if (!selectedTeam) return;
    try {
      await updateRegistration(selectedTeam, { judgeAssigned: id });
      toast.success("Team assigned");
      setSelectedTeam("");
      load();
    } catch {
      toast.error("Failed to assign team");
    }
  };

  const handleUnassign = async (registrationId) => {
    try {
      await updateRegistration(registrationId, { judgeAssigned: "" });
      toast.success("Team unassigned");
      load();
    } catch {
      toast.error("Failed to unassign team");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonBlock className="h-8 w-48" />
        <SkeletonBlock className="h-40" />
      </div>
    );
  }

  if (!judge) return <EmptyState title="Judge not found" />;

  return (
    <div className="space-y-6">
      <button className="btn-secondary" onClick={() => navigate("/judges")}>
        <FiArrowLeft size={15} /> Back
      </button>

      <div className="card p-5">
        <h1 className="font-heading text-xl font-semibold text-ink">{judge.name}</h1>
        <p className="text-sm text-slate-500">{judge.email}</p>
        <p className="text-sm text-slate-500 mt-1">
          {evaluatedTeamIds.size} of {assigned.length} assigned teams evaluated
        </p>
      </div>

      <div className="card p-5">
        <h2 className="font-heading font-semibold text-ink mb-4">Assign a Team</h2>
        <div className="flex gap-2">
          <select className="input" value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
            <option value="">Select an unassigned team…</option>
            {unassigned.map((t) => (
              <option key={t.id} value={t.id}>
                {t.teamId} — {t.teamName}
              </option>
            ))}
          </select>
          <button className="btn-primary shrink-0" onClick={handleAssign} disabled={!selectedTeam}>
            Assign
          </button>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-heading font-semibold text-ink mb-4">Assigned Teams</h2>
        {assigned.length === 0 ? (
          <p className="text-sm text-slate-400">No teams assigned yet.</p>
        ) : (
          <div className="space-y-2">
            {assigned.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between border border-slate-100 dark:border-slate-800 rounded-lg px-4 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-ink dark:text-slate-100">{t.teamName}</p>
                  <p className="text-xs text-slate-400">{t.teamId}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`badge ${
                      evaluatedTeamIds.has(t.teamId)
                        ? "bg-success/10 text-success"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {evaluatedTeamIds.has(t.teamId) ? "Evaluated" : "Pending"}
                  </span>
                  <button className="btn-secondary px-2 py-1" onClick={() => handleUnassign(t.id)}>
                    <FiX size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
