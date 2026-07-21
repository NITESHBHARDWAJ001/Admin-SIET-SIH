import { useState } from "react";
import toast from "react-hot-toast";
import { FiDownload } from "react-icons/fi";
import { downloadReport } from "../../services/reportApi";

const REPORT_TYPES = [
  { type: "registration", label: "Registration Report", description: "All registered teams and leader details" },
  { type: "department", label: "Department Report", description: "Team counts grouped by department" },
  { type: "year", label: "Year Report", description: "Team counts grouped by academic year" },
  { type: "submission", label: "Submission Report", description: "Prototype submissions and status" },
  { type: "evaluation", label: "Evaluation Report", description: "Judge scores per team" },
  { type: "selected", label: "Selected Teams", description: "Teams shortlisted after evaluation" },
  { type: "rejected", label: "Rejected Teams", description: "Teams rejected at registration or ranking" },
];

export default function ReportsPage() {
  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (type, format) => {
    setDownloading(`${type}-${format}`);
    try {
      await downloadReport(type, format);
    } catch {
      toast.error("Failed to generate report");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-xl font-semibold text-ink">Reports</h1>
        <p className="text-sm text-slate-500">Generate and export reports</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {REPORT_TYPES.map((r) => (
          <div key={r.type} className="card p-5 flex items-center justify-between">
            <div>
              <p className="font-medium text-ink dark:text-slate-100">{r.label}</p>
              <p className="text-xs text-slate-400 mt-1">{r.description}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                className="btn-secondary"
                onClick={() => handleDownload(r.type, "csv")}
                disabled={downloading === `${r.type}-csv`}
              >
                <FiDownload size={14} /> CSV
              </button>
              <button
                className="btn-secondary"
                onClick={() => handleDownload(r.type, "xlsx")}
                disabled={downloading === `${r.type}-xlsx`}
              >
                <FiDownload size={14} /> Excel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
