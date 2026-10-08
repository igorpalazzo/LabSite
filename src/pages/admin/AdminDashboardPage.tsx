import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import type { News } from "../../types";

interface Dashboard { total: number; counts: Record<string, number>; recent: News[] }
const statusName: Record<string, string> = { DRAFT: "Rascunho", IN_REVIEW: "Em revisão", APPROVED: "Aprovada", SCHEDULED: "Agendada", PUBLISHED: "Publicada", ARCHIVED: "Arquivada" };

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = { DRAFT: "bg-amber-50 text-amber-800", IN_REVIEW: "bg-blue-50 text-blue-800", APPROVED: "bg-purple-50 text-purple-800", SCHEDULED: "bg-cyan-50 text-cyan-800", PUBLISHED: "bg-emerald-50 text-emerald-800", ARCHIVED: "bg-gray-100 text-gray-600" };
  return <span className={`inline-flex px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${colors[status] ?? "bg-gray-100"}`}>{statusName[status] ?? status}</span>;
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { api.dashboard<Dashboard>().then(setDashboard).catch((reason: Error) => setError(reason.message)); }, []);
  return (
    <main className="mx-auto max-w-[1500px] px-6 py-14 md:px-10">
      <section className="border-b border-[#cfcfca] pb-12"><p className="text-xs font-bold uppercase tracking-[0.25em] text-[#b6202a]">LIRA / CMS</p><div className="mt-4 flex flex-col justify-between gap-8 lg:flex-row lg:items-end"><div><h1 className="text-4xl font-black tracking-tight text-[#101b3d] md:text-6xl">Painel administrativo</h1><p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-600">Gerencie as notícias publicadas no site do laboratório.</p></div><Link to="/admin/publicacoes/nova" className="inline-flex justify-center bg-[#b6202a] px-6 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white hover:bg-[#971922]">+ Nova notícia</Link></div></section>
      {error && <p className="mt-8 bg-red-50 p-4 text-red-700">{error}</p>}
      {!dashboard ? <p className="py-20 text-gray-500">Carregando painel…</p> : <>
        <section className="py-12"><p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Visão geral</p><div className="mt-6 grid border-l border-t border-[#cfcfca] sm:grid-cols-2 lg:grid-cols-4">{[["Total", dashboard.total], ["Rascunhos", dashboard.counts.DRAFT], ["Em revisão", dashboard.counts.IN_REVIEW], ["Publicadas", dashboard.counts.PUBLISHED]].map(([label, value]) => <div key={String(label)} className="border-b border-r border-[#cfcfca] bg-white p-7"><p className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</p><strong className="mt-3 block text-5xl font-black tracking-tight text-[#101b3d]">{value}</strong></div>)}</div></section>
        <section className="border-t border-[#cfcfca] py-12"><div className="flex justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b6202a]">Conteúdo</p><h2 className="mt-3 text-3xl font-black tracking-tight text-[#101b3d]">Publicações recentes</h2></div><Link to="/admin/publicacoes" className="self-end text-xs font-bold uppercase tracking-wider text-[#b6202a]">Ver todas →</Link></div><div className="mt-8 border-t border-[#101b3d]">{dashboard.recent.map((post) => <div key={post.id} className="grid gap-4 border-b border-gray-200 py-5 sm:grid-cols-[1fr_auto_auto] sm:items-center"><div><Link to={`/admin/publicacoes/${post.id}`} className="font-bold text-[#101b3d] hover:text-[#b6202a]">{post.title}</Link><p className="mt-1 text-xs text-gray-500">{post.category?.name} · {post.author?.name}</p></div><StatusBadge status={post.status} /><span className="text-xs text-gray-500">{new Date(post.updated_at).toLocaleDateString("pt-BR")}</span></div>)}</div></section>
      </>}
    </main>
  );
}

