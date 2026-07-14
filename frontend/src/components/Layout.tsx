import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ChatBot from "./ChatBot";

export default function Layout() {
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition ${
      isActive ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-200"
    }`;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="font-bold text-slate-800 text-lg">Task Board</h1>
          <nav className="flex gap-2">
            <NavLink to="/board" className={linkClass}>
              Board
            </NavLink>
            <NavLink to="/metrics" className={linkClass}>
              Metrics
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">{user?.name}</span>
          <button
            onClick={logout}
            className="text-sm text-slate-500 hover:text-red-600 font-medium"
          >
            Log out
          </button>
        </div>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
      <ChatBot />
    </div>
  );
}
