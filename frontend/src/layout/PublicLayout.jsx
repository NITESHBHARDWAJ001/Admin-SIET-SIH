import { NavLink, Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface dark:bg-slate-950">
      <header className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center font-heading font-bold">
              S
            </div>
            <div>
              <p className="font-heading font-semibold text-sm text-ink dark:text-slate-100 leading-tight">
                SIH SIET 2026
              </p>
              <p className="text-xs text-slate-400 leading-tight">Internal Hackathon</p>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            <NavLink
              to="/register"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? "bg-primary/10 text-primary" : "text-slate-600 dark:text-slate-300"
                }`
              }
            >
              Register
            </NavLink>
            <NavLink
              to="/notices"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? "bg-primary/10 text-primary" : "text-slate-600 dark:text-slate-300"
                }`
              }
            >
              Notices
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-100 dark:border-slate-800 py-4">
        <p className="text-center text-xs text-slate-400">
          State Institute of Engineering & Technology, Nilokheri — SIH 2026 Internal Hackathon
        </p>
      </footer>
    </div>
  );
}
