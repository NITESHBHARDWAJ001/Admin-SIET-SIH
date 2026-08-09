import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiHelpCircle } from "react-icons/fi";
import { fetchPublicProblemStatements } from "../../services/publicApi";
import EmptyState from "../../components/EmptyState";
import { SkeletonBlock } from "../../components/Skeleton";

export default function PublicProblemBoardPage() {
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicProblemStatements()
      .then(setStatements)
      .catch(() => toast.error("Failed to load problem statements"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-xl font-semibold text-ink flex items-center gap-2">
          <FiHelpCircle size={20} /> Problem Statements
        </h1>
        <p className="text-sm text-slate-500">See what's available before your team selects one</p>
      </div>

      {loading ? (
        <SkeletonBlock className="h-40" />
      ) : statements.length === 0 ? (
        <EmptyState title="No problem statements yet" message="Check back once the organizers publish them." />
      ) : (
        <div className="space-y-3">
          {statements.map((p) => (
            <div key={p.problemId} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">{p.problemId}</span>
                    <span className="badge bg-primary/10 text-primary">{p.theme}</span>
                  </div>
                  <h2 className="font-heading font-semibold text-ink dark:text-slate-100 mt-1">{p.title}</h2>
                  <p className="text-sm text-slate-500 mt-1">{p.description}</p>
                </div>
                <span
                  className={`badge shrink-0 ${p.full ? "bg-red-100 text-red-700" : "bg-success/10 text-success"}`}
                >
                  {p.full ? "Full" : `${p.remaining} of ${p.capacity} left`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
