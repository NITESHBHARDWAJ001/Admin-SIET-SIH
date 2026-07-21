export default function StatCard({ label, value, icon: Icon, tone = "primary" }) {
  const toneStyles = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    success: "bg-success/10 text-success",
    danger: "bg-red-100 text-red-600",
  };

  return (
    <div className="card p-5 flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-heading font-semibold text-ink mt-1 dark:text-slate-100">
          {value}
        </p>
      </div>
      {Icon && (
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${toneStyles[tone]}`}>
          <Icon size={20} />
        </div>
      )}
    </div>
  );
}
