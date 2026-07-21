import { FiInbox } from "react-icons/fi";

export default function EmptyState({ title = "Nothing here yet", message, icon: Icon = FiInbox }) {
  return (
    <div className="card flex flex-col items-center justify-center text-center py-16 px-6">
      <Icon size={36} className="text-slate-300 mb-3" />
      <p className="font-medium text-ink dark:text-slate-100">{title}</p>
      {message && <p className="text-sm text-slate-500 mt-1 max-w-sm">{message}</p>}
    </div>
  );
}
