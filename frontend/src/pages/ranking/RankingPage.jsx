import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiDownload, FiPrinter } from "react-icons/fi";
import { fetchRanking, setRankingStatus } from "../../services/rankingApi";
import EmptyState from "../../components/EmptyState";
import { SkeletonTable } from "../../components/Skeleton";

const STATUS_STYLES = {
  Shortlisted: "bg-success/10 text-success",
  Waitlisted: "bg-amber-100 text-amber-700",
  Rejected: "bg-red-100 text-red-700",
};

export default function RankingPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchRanking();
      setRows(data);
    } catch {
      toast.error("Failed to load ranking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatus = async (row, status) => {
    try {
      await setRankingStatus(row.registrationId, status);
      setRows((prev) =>
        prev.map((r) => (r.registrationId === row.registrationId ? { ...r, rankingStatus: status } : r))
      );
      toast.success(`${row.teamName} ${status.toLowerCase()}`);
    } catch {
      toast.error("Failed to update ranking status");
    }
  };

  return (
    <div className="space-y-4 print:space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-2 print:hidden">
        <div>
          <h1 className="font-heading text-xl font-semibold text-ink">Ranking</h1>
          <p className="text-sm text-slate-500">Teams ranked by average evaluation score</p>
        </div>
        <button className="btn-secondary" onClick={() => window.print()}>
          <FiPrinter size={15} /> Print
        </button>
      </div>

      {loading ? (
        <SkeletonTable rows={6} cols={6} />
      ) : rows.length === 0 ? (
        <EmptyState title="No evaluated teams yet" message="Rankings will appear once judges submit scores." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="text-left px-4 py-3 font-medium text-slate-500">Rank</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Team</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Department</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Judge(s)</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Score</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.registrationId} className="border-b border-slate-50 dark:border-slate-800/60">
                  <td className="px-4 py-3 font-heading font-semibold">#{row.rank}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink dark:text-slate-100">{row.teamName}</p>
                    <p className="text-xs text-slate-400">{row.teamId}</p>
                  </td>
                  <td className="px-4 py-3">{row.department}</td>
                  <td className="px-4 py-3 text-slate-500">{row.judges}</td>
                  <td className="px-4 py-3 font-medium">{row.score} / 100</td>
                  <td className="px-4 py-3">
                    {row.rankingStatus ? (
                      <span className={`badge ${STATUS_STYLES[row.rankingStatus] || ""}`}>
                        {row.rankingStatus}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 print:hidden">
                    <div className="flex gap-2">
                      <button className="btn-secondary px-2 py-1" onClick={() => handleStatus(row, "Shortlisted")}>
                        Shortlist
                      </button>
                      <button className="btn-secondary px-2 py-1" onClick={() => handleStatus(row, "Waitlisted")}>
                        Waitlist
                      </button>
                      <button className="btn-danger px-2 py-1" onClick={() => handleStatus(row, "Rejected")}>
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
