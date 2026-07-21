import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="card p-8 text-center max-w-sm">
        <h1 className="font-heading text-2xl font-semibold text-ink">404</h1>
        <p className="text-sm text-slate-500 mt-2">This page doesn't exist.</p>
        <Link to="/dashboard" className="btn-primary mt-5 inline-flex">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
