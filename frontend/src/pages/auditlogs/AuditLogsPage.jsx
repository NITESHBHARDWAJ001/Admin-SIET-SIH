import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { fetchAuditLogs } from "../../services/auditLogApi";
import EmptyState from "../../components/EmptyState";
import { SkeletonTable } from "../../components/Skeleton";
import { formatDateTime } from "../../utils/formatters";

const PAGE_SIZE = 20;

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchAuditLogs({ page, pageSize: PAGE_SIZE })
      .then((res) => {
        if (!active) return;
        setLogs(res.data);
        setTotal(res.total);
      })
      .catch(() => toast.error("Failed to load audit logs"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-xl font-semibold text-ink">Audit Logs</h1>
        <p className="text-sm text-slate-500">{total} recorded actions</p>
      </div>

      {loading ? (
        <SkeletonTable rows={PAGE_SIZE} cols={4} />
      ) : logs.length === 0 ? (
        <EmptyState title="No activity yet" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="text-left px-4 py-3 font-medium text-slate-500">User</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Action</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Details</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-50 dark:border-slate-800/60">
                  <td className="px-4 py-3 whitespace-nowrap">{log.user}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{log.action}</td>
                  <td className="px-4 py-3 text-slate-500">{log.details}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">{formatDateTime(log.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                className="btn-secondary px-2 py-1"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <FiChevronLeft size={15} />
              </button>
              <button
                className="btn-secondary px-2 py-1"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <FiChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
