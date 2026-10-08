import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { api, session } from "../lib/api";
import type { User } from "../types";

export default function AdminLayout() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.me().then(setUser).catch(() => { session.clear(); navigate("/admin", { replace: true }); });
  }, [navigate]);

  function logout() {
    session.clear();
    navigate("/admin");
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#111]">
      <header className="border-b border-[#d9d9d5] bg-white">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-5 px-6 py-5 md:px-10">
          <Link to="/admin/dashboard" className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center bg-[#101b3d] text-lg font-black text-white">L</div>
            <div><p className="text-lg font-black tracking-tight text-[#101b3d]">LIRA</p><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500">CMS editorial</p></div>
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-gray-500">
            <NavLink to="/admin/dashboard" className={({ isActive }) => `px-3 py-2 ${isActive ? "bg-[#101b3d] text-white" : "hover:text-[#101b3d]"}`}>Visão geral</NavLink>
            <NavLink to="/admin/publicacoes" className={({ isActive }) => `px-3 py-2 ${isActive ? "bg-[#101b3d] text-white" : "hover:text-[#101b3d]"}`}>Notícias</NavLink>
            <NavLink to="/admin/publicacoes/nova" className={({ isActive }) => `px-3 py-2 ${isActive ? "bg-[#b6202a] text-white" : "hover:text-[#b6202a]"}`}>+ Nova</NavLink>
          </nav>
          <div className="flex items-center gap-5">
            <div className="hidden text-right sm:block"><p className="text-xs font-bold text-[#101b3d]">{user?.name ?? "Carregando…"}</p><p className="text-[9px] uppercase tracking-wider text-gray-400">{user?.role}</p></div>
            <Link to="/" target="_blank" className="text-xs font-bold uppercase tracking-[0.1em] text-gray-500 hover:text-[#101b3d]">Ver site ↗</Link>
            <button onClick={logout} className="border border-[#101b3d] px-4 py-2 text-xs font-bold uppercase text-[#101b3d] transition hover:bg-[#101b3d] hover:text-white">Sair</button>
          </div>
        </div>
      </header>
      <div className="h-1 bg-[#b6202a]" />
      <Outlet />
    </div>
  );
}

