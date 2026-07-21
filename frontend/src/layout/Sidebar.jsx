import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "../constants/nav";

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:static z-30 top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center gap-2 px-5 border-b border-slate-100 dark:border-slate-800">
          <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center font-heading font-bold">
            S
          </div>
          <div>
            <p className="font-heading font-semibold text-sm text-ink dark:text-slate-100 leading-tight">
              SIH SIET 2026
            </p>
            <p className="text-xs text-slate-400 leading-tight">Admin Portal</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            if (!item.available) {
              return (
                <div
                  key={item.to}
                  className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 dark:text-slate-600 cursor-not-allowed select-none"
                  title="Coming soon"
                >
                  <span className="flex items-center gap-3">
                    <Icon size={17} />
                    {item.label}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide bg-slate-100 dark:bg-slate-800 rounded px-1.5 py-0.5">
                    Soon
                  </span>
                </div>
              );
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`
                }
              >
                <Icon size={17} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
