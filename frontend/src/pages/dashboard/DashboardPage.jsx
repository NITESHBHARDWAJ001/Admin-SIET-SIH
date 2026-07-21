import { useEffect, useState } from "react";
import {
  FiUsers,
  FiUserCheck,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAward,
  FiCalendar,
  FiFlag,
} from "react-icons/fi";
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
  LineChart,
  Line,
  Legend,
} from "recharts";
import toast from "react-hot-toast";
import StatCard from "../../components/StatCard";
import { SkeletonCards, SkeletonBlock } from "../../components/Skeleton";
import { fetchDashboard } from "../../services/dashboardApi";

const PIE_COLORS = ["#1F2A8A", "#E8B200", "#2DBB3C", "#94A3B8"];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchDashboard()
      .then((res) => {
        if (active) setData(res);
      })
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <SkeletonCards count={8} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonBlock className="h-72" />
          <SkeletonBlock className="h-72" />
        </div>
      </div>
    );
  }

  const { stats, charts } = data;

  const cards = [
    { label: "Total Teams", value: stats.totalTeams, icon: FiUsers, tone: "primary" },
    { label: "Total Participants", value: stats.totalParticipants, icon: FiUserCheck, tone: "primary" },
    { label: "Pending Verification", value: stats.pending, icon: FiClock, tone: "accent" },
    { label: "Approved Teams", value: stats.approved, icon: FiCheckCircle, tone: "success" },
    { label: "Rejected Teams", value: stats.rejected, icon: FiXCircle, tone: "danger" },
    { label: "Prototype Submitted", value: stats.prototypeSubmitted, icon: FiFlag, tone: "primary" },
    { label: "Presentation Scheduled", value: stats.presentationScheduled, icon: FiCalendar, tone: "accent" },
    { label: "Judges", value: stats.judges, icon: FiAward, tone: "primary" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold text-ink">Dashboard</h1>
          <p className="text-sm text-slate-500">Overview of the internal hackathon</p>
        </div>
        <span className="badge bg-primary/10 text-primary">Phase: {stats.currentPhase}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="font-heading font-semibold text-ink mb-4">Department Wise Registration</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={charts.departmentWise}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#1F2A8A" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="font-heading font-semibold text-ink mb-4">Year Wise Registration</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={charts.yearWise}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#E8B200" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="font-heading font-semibold text-ink mb-4">Gender Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={charts.genderWise}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {charts.genderWise.map((entry, i) => (
                  <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="font-heading font-semibold text-ink mb-4">Registration Timeline</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={charts.timeline}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2DBB3C" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
