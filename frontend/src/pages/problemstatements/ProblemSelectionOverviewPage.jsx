import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowLeft, FiUsers, FiAlertCircle } from "react-icons/fi";
import { fetchSelectionOverview } from "../../services/problemStatementApi";
import { SkeletonBlock } from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";
import { formatDateTime } from "../../utils/formatters";

export default function ProblemSelectionOverviewPage() {
  const [statements, setStatements] = useState([]);
  const [pendingTeams, setPendingTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSelectionOverview()
      .then((data) => {
        setStatements(data.statements);
        setPendingTeams(data.pendingTeams);
      })
      .catch(() => toast.error("Failed to load selection overview"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonBlock className="h-8 w-64" />
        <SkeletonBlock className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Link to="/problem-statements" className="text-sm text-slate-500 hover:text-ink inline-flex items-center gap-1">
          <FiArrowLeft size={14} /> Back to Problem Statements
        </Link>
        <h1 className="font-heading text-xl font-semibold text-ink mt-1">Team Selections</h1>
        <p className="text-sm text-slate-500">Which teams picked which problem statement, and who's still pending</p>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <FiAlertCircle size={16} className="text-accent" />
          <h2 className="font-heading font-semibold text-ink dark:text-slate-100">
            Pending Selection ({pendingTeams.length})
          </h2>
        </div>
        {pendingTeams.length === 0 ? (
          <p className="text-sm text-slate-500">Every approved team has selected a problem statement.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left px-3 py-2 font-medium text-slate-500">Team ID</th>
                  <th className="text-left px-3 py-2 font-medium text-slate-500">Team Name</th>
                  <th className="text-left px-3 py-2 font-medium text-slate-500">Password Issued</th>
                </tr>
              </thead>
              <tbody>
                {pendingTeams.map((t) => (
                  <tr key={t.id} className="border-b border-slate-50 dark:border-slate-800/60">
                    <td className="px-3 py-2 font-medium">
                      <Link to={`/registrations/${t.id}`} className="text-primary hover:underline">
                        {t.teamId}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{t.teamName}</td>
                    <td className="px-3 py-2">
                      <span className={`badge ${t.hasPassword ? "bg-success/10 text-success" : "bg-slate-100 text-slate-500"}`}>
                        {t.hasPassword ? "Yes" : "Not yet"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {statements.length === 0 ? (
        <EmptyState title="No problem statements yet" message="Add problem statements first to see selections here." />
      ) : (
        <div className="space-y-3">
          {statements.map((s) => (
            <div key={s.id} className="card p-4">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <div>
                  <span className="text-xs font-mono text-slate-400">{s.problemId}</span>
                  <h3 className="font-heading font-semibold text-ink dark:text-slate-100">{s.title}</h3>
                  <p className="text-xs text-slate-400">{s.theme}</p>
                </div>
                <span className={`badge ${s.taken >= s.capacity ? "bg-red-100 text-red-700" : "bg-success/10 text-success"}`}>
                  <FiUsers size={12} className="mr-1" />
                  {s.taken} / {s.capacity}
                </span>
              </div>
              {s.teams.length === 0 ? (
                <p className="text-sm text-slate-400">No team has selected this yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        <th className="text-left px-3 py-2 font-medium text-slate-500">Team ID</th>
                        <th className="text-left px-3 py-2 font-medium text-slate-500">Team Name</th>
                        <th className="text-left px-3 py-2 font-medium text-slate-500">Locked At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {s.teams.map((t) => (
                        <tr key={t.id} className="border-b border-slate-50 dark:border-slate-800/60">
                          <td className="px-3 py-2 font-medium">
                            <Link to={`/registrations/${t.id}`} className="text-primary hover:underline">
                              {t.teamId}
                            </Link>
                          </td>
                          <td className="px-3 py-2">{t.teamName}</td>
                          <td className="px-3 py-2 text-slate-500">{formatDateTime(t.lockedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
