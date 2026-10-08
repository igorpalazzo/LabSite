import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api, session } from "../../lib/api";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("admin@liralab.com.br");
  const [password, setPassword] = useState("LiraAdmin2026!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (session.get()) return <Navigate to="/admin/dashboard" replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError("");
    try {
      const result = await api.login(email, password);
      session.set(result.access_token);
      navigate("/admin/dashboard");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível entrar.");
    } finally { setLoading(false); }
  }

  return (
    <main className="grid min-h-screen bg-[#101b3d] lg:grid-cols-2">
      <section className="flex flex-col justify-between p-8 text-white md:p-14 lg:p-20">
        <Link to="/" className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center bg-[#b6202a] text-xl font-black">L</div><div><strong className="text-xl">LIRA</strong><span className="block text-[10px] uppercase tracking-[0.22em] text-white/50">IA · Robótica · Automação</span></div></Link>
        <div className="my-16"><p className="text-xs font-bold uppercase tracking-[0.25em] text-[#e05b65]">CMS institucional</p><h1 className="mt-5 max-w-2xl text-5xl font-black leading-[1.05] tracking-tight md:text-7xl">Histórias da ciência, publicadas por quem faz ciência.</h1><p className="mt-7 max-w-xl text-lg leading-relaxed text-white/60">Crie, revise e publique as notícias do laboratório sem editar arquivos ou fazer um novo deploy.</p></div>
        <p className="text-xs text-white/35">Laboratório de Inteligência Artificial, Robótica e Automação · UNAERP</p>
      </section>
      <section className="flex items-center justify-center bg-[#f7f7f5] px-6 py-16">
        <form onSubmit={handleSubmit} className="w-full max-w-md border border-gray-200 bg-white p-8 shadow-xl md:p-10">
          <Link to="/" className="text-sm font-semibold text-gray-500 hover:text-[#b6202a]">← Voltar ao site</Link>
          <p className="mt-12 text-xs font-bold uppercase tracking-[0.2em] text-[#b6202a]">Área restrita</p><h2 className="mt-2 text-4xl font-black tracking-tight text-[#101b3d]">Administração</h2><p className="mt-3 text-gray-600">Entre com suas credenciais para gerenciar o conteúdo.</p>
          <label className="mt-8 block text-sm font-semibold text-gray-700">E-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-blue-600" /></label>
          <label className="mt-5 block text-sm font-semibold text-gray-700">Senha<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required className="mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-blue-600" /></label>
          {error && <p className="mt-5 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <button disabled={loading} className="mt-7 w-full bg-[#b6202a] px-5 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#971922] disabled:opacity-60">{loading ? "Entrando…" : "Entrar no painel"}</button>
        </form>
      </section>
    </main>
  );
}

