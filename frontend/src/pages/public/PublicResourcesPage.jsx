import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiExternalLink } from "react-icons/fi";
import { fetchPublicResources } from "../../services/publicApi";
import EmptyState from "../../components/EmptyState";
import { SkeletonBlock } from "../../components/Skeleton";

export default function PublicResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicResources()
      .then(setResources)
      .catch(() => toast.error("Failed to load resources"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-xl font-semibold text-ink">Resources</h1>
        <p className="text-sm text-slate-500">Rulebook, guidelines, templates and useful links</p>
      </div>

      {loading ? (
        <SkeletonBlock className="h-40" />
      ) : resources.length === 0 ? (
        <EmptyState title="No resources yet" message="Check back soon for downloadable resources." />
      ) : (
        <div className="card divide-y divide-slate-100 dark:divide-slate-800">
          {resources.map((r) => (
            <a
              key={r.id}
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40"
            >
              <div>
                <p className="font-medium text-ink dark:text-slate-100">{r.name}</p>
                <p className="text-xs text-slate-400">{r.category}</p>
              </div>
              <FiExternalLink size={16} className="text-primary shrink-0" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
