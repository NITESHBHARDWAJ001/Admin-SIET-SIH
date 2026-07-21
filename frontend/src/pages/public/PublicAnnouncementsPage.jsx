import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchPublicAnnouncements } from "../../services/publicApi";
import EmptyState from "../../components/EmptyState";
import { SkeletonBlock } from "../../components/Skeleton";
import { formatDate } from "../../utils/formatters";

export default function PublicAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicAnnouncements()
      .then(setAnnouncements)
      .catch(() => toast.error("Failed to load notices"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-xl font-semibold text-ink">Notices</h1>
        <p className="text-sm text-slate-500">Latest updates for SIH SIET 2026</p>
      </div>

      {loading ? (
        <SkeletonBlock className="h-40" />
      ) : announcements.length === 0 ? (
        <EmptyState title="No notices yet" message="Check back soon for updates." />
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="card p-5">
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-semibold text-ink dark:text-slate-100">{a.title}</h2>
                {a.priority !== "Normal" && <span className="badge bg-red-100 text-red-700">{a.priority}</span>}
                {a.pinned && <span className="badge bg-primary/10 text-primary">Pinned</span>}
              </div>
              <p className="text-sm text-slate-500 mt-2">{a.description}</p>
              <p className="text-xs text-slate-400 mt-3">{formatDate(a.publishDate)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
