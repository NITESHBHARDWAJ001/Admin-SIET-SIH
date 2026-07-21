import { STATUS_STYLES } from "../constants/registration";

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || "bg-slate-100 text-slate-700";
  return <span className={`badge ${style}`}>{status}</span>;
}
