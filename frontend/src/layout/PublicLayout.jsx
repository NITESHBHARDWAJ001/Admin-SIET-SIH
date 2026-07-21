import { Link, NavLink, Outlet } from "react-router-dom";
import { FiLogIn } from "react-icons/fi";

const NAV_LINKS = [
  { to: "/register", label: "Register" },
  { to: "/submit", label: "Submit" },
  { to: "/notices", label: "Notices" },
  { to: "/downloads", label: "Resources" },
];

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface dark:bg-slate-950">
      <header className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center font-heading font-bold">
              S
            </div>
            <div>
              <p className="font-heading font-semibold text-sm text-ink dark:text-slate-100 leading-tight">
                SIH SIET 2026
              </p>
              <p className="text-xs text-slate-400 leading-tight">Internal Hackathon</p>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium hidden sm:inline-block ${
                    isActive ? "bg-primary/10 text-primary" : "text-slate-600 dark:text-slate-300"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link to="/login" className="btn-secondary ml-2">
              <FiLogIn size={14} /> Login
            </Link>
          </nav>
        </div>
        <div className="sm:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isActive ? "bg-primary/10 text-primary" : "text-slate-600 dark:text-slate-300"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
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
