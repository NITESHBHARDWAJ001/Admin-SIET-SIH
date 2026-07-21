import { useState } from "react";
import { FiMenu, FiLogOut, FiUser } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="h-16 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-4 lg:px-6">
      <button
        className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        onClick={onMenuClick}
      >
        <FiMenu size={20} />
      </button>
      <div className="hidden lg:block" />

      <div className="relative">
        <button
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <FiUser size={16} />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-ink dark:text-slate-100 leading-tight">
              {user?.name}
            </p>
            <p className="text-xs text-slate-400 leading-tight">{user?.role}</p>
          </div>
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-44 card p-1 z-40">
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={handleLogout}
            >
              <FiLogOut size={15} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
