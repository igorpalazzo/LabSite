import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import type { News } from "../../types";
import { StatusBadge } from "./AdminDashboardPage";

export default function AdminNewsPage() {
  const [posts, setPosts] = useState<News[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.adminNews<News[]>().then(setPosts).finally(() => setLoading(false)); }, []);
  const visible = useMemo(() => posts.filter((post) => post.title.toLowerCase().includes(search.toLowerCase())), [posts, search]);
  return (
    <main className="mx-auto max-w-[1500px] px-6 py-14 md:px-10">
      <div className="flex flex-col justify-between gap-7 border-b border-[#cfcfca] pb-10 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b6202a]">Conteúdo</p><h1 className="mt-3 text-4xl font-black tracking-tight text-[#101b3d] md:text-6xl">Notícias</h1><p className="mt-4 text-gray-600">Edite, revise, agende e publique as matérias do laboratório.</p></div><Link to="/admin/publicacoes/nova" className="bg-[#b6202a] px-6 py-4 text-center text-sm font-bold uppercase tracking-wider text-white">+ Nova notícia</Link></div>
      <div className="mt-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><p className="text-sm font-semibold text-gray-500">{visible.length} notícia(s)</p><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por título…" className="w-full border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-600 sm:max-w-sm" /></div>
      {loading ? <p className="py-20 text-gray-500">Carregando…</p> : <div className="mt-6 overflow-x-auto border-t border-[#101b3d]"><div className="min-w-[760px]">{visible.map((post) => <div key={post.id} className="grid grid-cols-[2fr_1fr_1fr_120px] items-center gap-5 border-b border-gray-200 bg-white px-5 py-5"><div><Link to={`/admin/publicacoes/${post.id}`} className="font-bold text-[#101b3d] hover:text-[#b6202a]">{post.title}</Link><p className="mt-1 text-xs text-gray-500">por {post.author?.name}</p></div><span className="text-sm text-gray-600">{post.category?.name}</span><StatusBadge status={post.status} /><Link to={`/admin/publicacoes/${post.id}`} className="text-right text-xs font-bold uppercase text-[#b6202a]">Editar →</Link></div>)}</div></div>}
    </main>
  );
}

