import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { fetchDashboard } from "../../services/dashboardApi";
import { fetchRegistrations } from "../../services/registrationApi";
import { fetchSubmissions } from "../../services/submissionApi";
import { fetchEvaluations } from "../../services/evaluationApi";
import { SkeletonBlock } from "../../components/Skeleton";

const COLORS = ["#1F2A8A", "#E8B200", "#2DBB3C", "#94A3B8"];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [departmentWise, setDepartmentWise] = useState([]);
  const [submissionProgress, setSubmissionProgress] = useState([]);
  const [evaluationProgress, setEvaluationProgress] = useState([]);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchDashboard(),
      fetchRegistrations({ pageSize: 500 }),
      fetchSubmissions(),
      fetchEvaluations({}),
    ])
      .then(([dashboard, teamsRes, submissions, evaluations]) => {
        if (!active) return;
        const dept = [...dashboard.charts.departmentWise].sort((a, b) => b.value - a.value);
        setDepartmentWise(dept);

        const approvedTeams = teamsRes.data.filter((t) => t.status === "Approved");
        const submittedTeamIds = new Set(submissions.map((s) => s.teamId));
        const submittedCount = approvedTeams.filter((t) => submittedTeamIds.has(t.teamId)).length;
        setSubmissionProgress([
          { name: "Submitted", value: submittedCount },
          { name: "Not Submitted", value: Math.max(0, approvedTeams.length - submittedCount) },
        ]);

        const evaluatedTeamIds = new Set(evaluations.map((e) => e.teamId));
        const evaluatedCount = approvedTeams.filter((t) => evaluatedTeamIds.has(t.teamId)).length;
        setEvaluationProgress([
          { name: "Evaluated", value: evaluatedCount },
          { name: "Pending", value: Math.max(0, approvedTeams.length - evaluatedCount) },
        ]);
      })
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonBlock className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonBlock className="h-72" />
          <SkeletonBlock className="h-72" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-ink">Analytics</h1>
        <p className="text-sm text-slate-500">Deeper insight into event progress</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="font-heading font-semibold text-ink mb-4">Top Departments</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={departmentWise} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={50} />
              <Tooltip />
              <Bar dataKey="value" fill="#1F2A8A" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="font-heading font-semibold text-ink mb-4">Submission Progress</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={submissionProgress} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {submissionProgress.map((entry, i) => (
                  <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="font-heading font-semibold text-ink mb-4">Evaluation Completion</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={evaluationProgress} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {evaluationProgress.map((entry, i) => (
                  <Cell key={entry.name} fill={COLORS[(i + 1) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
