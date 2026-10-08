import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import BlockEditor from "../../components/BlockEditor";
import { api } from "../../lib/api";
import type { Category, News, NewsDraft } from "../../types";
import { StatusBadge } from "./AdminDashboardPage";

const emptyDraft: NewsDraft = { title: "", subtitle: "", excerpt: "", content: [], category_id: "institucional", tags: [], cover_image_url: "", cover_image_alt: "", cover_image_credit: "", seo_title: "", seo_description: "" };

export default function AdminEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<NewsDraft>(emptyDraft);
  const [post, setPost] = useState<News | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.categories<Category[]>().then(setCategories);
    if (id) api.adminArticle<News>(id).then((article) => { setPost(article); setDraft(article); setTags(article.tags.join(", ")); }).catch((reason: Error) => setError(reason.message));
  }, [id]);

  const set = <K extends keyof NewsDraft>(key: K, value: NewsDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));

  async function save() {
    if (!draft.title.trim()) { setError("Informe o título da notícia."); return null; }
    setSaving(true); setError(""); setMessage("");
    try {
      const payload = { ...draft, tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean) };
      const result = id ? await api.updateArticle<News>(id, payload) : await api.createArticle<News>(payload);
      setPost(result); setMessage("Alterações salvas com sucesso.");
      if (!id) navigate(`/admin/publicacoes/${result.id}`, { replace: true });
      return result;
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível salvar."); return null; }
    finally { setSaving(false); }
  }

  async function workflow(action: string) {
    const saved = await save();
    const postId = saved?.id ?? post?.id;
    if (!postId) return;
    try { const result = await api.action<News>(postId, action); setPost(result); setMessage(action === "publish" ? "Arquivos gerados. Confira o git status e envie a notícia por commit e Pull Request." : "Status atualizado."); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível atualizar o status."); }
  }

  async function schedule() {
    const date = window.prompt("Data e hora da publicação (ex.: 2026-11-06T09:00)");
    if (!date) return;
    const saved = await save(); const postId = saved?.id ?? post?.id;
    if (!postId) return;
    try { const result = await api.action<News>(postId, "schedule", { scheduled_at: new Date(date).toISOString() }); setPost(result); setMessage("Publicação agendada."); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível agendar."); }
  }

  async function uploadCover(file?: File) {
    if (!file) return;
    try { const result = await api.upload(file); set("cover_image_url", result.url); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Falha no upload."); }
  }

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-10 md:px-10">
      <div className="flex flex-col justify-between gap-6 border-b border-[#cfcfca] pb-8 xl:flex-row xl:items-end">
        <div><Link to="/admin/publicacoes" className="text-sm font-semibold text-gray-500 hover:text-[#b6202a]">← Notícias</Link><div className="mt-3 flex flex-wrap items-center gap-4"><h1 className="text-3xl font-black tracking-tight text-[#101b3d] md:text-5xl">{id ? "Editar notícia" : "Nova notícia"}</h1>{post && <StatusBadge status={post.status} />}</div></div>
        <div className="flex flex-wrap gap-2">{post && <Link to={`/admin/preview/${post.id}`} target="_blank" className="border border-[#101b3d] px-4 py-3 text-xs font-bold uppercase text-[#101b3d]">Visualizar</Link>}<button onClick={save} disabled={saving} className="border border-[#101b3d] px-4 py-3 text-xs font-bold uppercase text-[#101b3d] disabled:opacity-50">{saving ? "Salvando…" : "Salvar"}</button>{post?.status === "IN_REVIEW" && <button onClick={() => workflow("approve")} className="border border-purple-700 px-4 py-3 text-xs font-bold uppercase text-purple-700">Aprovar</button>}<button onClick={() => workflow(post?.status === "APPROVED" ? "publish" : "submit")} className="bg-[#b6202a] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">{post?.status === "APPROVED" ? "Publicar" : "Enviar para revisão"}</button></div>
      </div>
      {message && <p className="mt-6 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">{message}</p>}{error && <p className="mt-6 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">{error}</p>}
      <div className="mt-8 grid items-start gap-7 xl:grid-cols-[1fr_330px]">
        <div className="space-y-7">
          <section className="border border-gray-200 bg-white p-6 md:p-8"><label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Título<input value={draft.title} onChange={(event) => set("title", event.target.value)} placeholder="Título da notícia" className="mt-3 w-full border-0 border-b border-gray-200 px-0 pb-4 text-3xl font-black tracking-tight text-[#101b3d] outline-none focus:border-blue-600 md:text-4xl" /></label><label className="mt-7 block text-sm font-semibold text-gray-700">Subtítulo<textarea rows={3} value={draft.subtitle} onChange={(event) => set("subtitle", event.target.value)} placeholder="Apresente a notícia em uma ou duas frases" className="mt-2 w-full rounded-lg border border-gray-200 p-4 outline-none focus:border-blue-600" /></label><label className="mt-5 block text-sm font-semibold text-gray-700">Resumo para os cards<textarea rows={2} value={draft.excerpt} onChange={(event) => set("excerpt", event.target.value)} className="mt-2 w-full rounded-lg border border-gray-200 p-4 outline-none focus:border-blue-600" /></label></section>
          <section className="border border-gray-200 bg-white p-6 md:p-8"><div className="mb-6 border-b border-gray-200 pb-5"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b6202a]">Conteúdo</p><h2 className="mt-2 text-2xl font-black text-[#101b3d]">Corpo da notícia</h2></div><BlockEditor value={draft.content} onChange={(blocks) => set("content", blocks)} /></section>
        </div>
        <aside className="space-y-6 xl:sticky xl:top-6">
          <section className="border border-gray-200 bg-white p-5"><h2 className="font-black text-[#101b3d]">Publicação</h2><div className="mt-5 space-y-3 text-sm"><p className="flex justify-between text-gray-500"><span>Status</span><strong>{post ? <StatusBadge status={post.status} /> : "Não salva"}</strong></p><p className="flex justify-between text-gray-500"><span>Autor</span><strong className="text-gray-800">{post?.author?.name ?? "Você"}</strong></p></div>{post && <div className="mt-5 space-y-2"><button onClick={schedule} className="w-full border border-gray-300 px-4 py-3 text-xs font-bold uppercase text-gray-700">Agendar</button><button onClick={() => workflow("archive")} className="w-full px-4 py-3 text-xs font-bold uppercase text-red-700">Arquivar</button></div>}</section>
          <section className="border border-gray-200 bg-white p-5"><h2 className="font-black text-[#101b3d]">Organização</h2><label className="mt-5 block text-sm font-semibold text-gray-700">Categoria<select value={draft.category_id} onChange={(event) => set("category_id", event.target.value)} className="mt-2 w-full border border-gray-300 p-3">{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="mt-5 block text-sm font-semibold text-gray-700">Tags<input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="IA, Robótica, UNAERP" className="mt-2 w-full border border-gray-300 p-3" /><small className="mt-2 block font-normal text-gray-500">Separe por vírgulas.</small></label></section>
          <section className="border border-gray-200 bg-white p-5"><h2 className="font-black text-[#101b3d]">Imagem de capa</h2>{draft.cover_image_url ? <img src={draft.cover_image_url} alt="Prévia da capa" className="mt-5 aspect-video w-full object-cover" /> : <div className="mt-5 border border-dashed border-gray-300 py-10 text-center text-sm text-gray-500">Nenhuma imagem</div>}<label className="mt-4 block cursor-pointer bg-gray-100 px-4 py-3 text-center text-xs font-bold uppercase text-[#101b3d]">{draft.cover_image_url ? "Trocar imagem" : "Enviar imagem"}<input type="file" accept="image/*" onChange={(event) => uploadCover(event.target.files?.[0])} className="hidden" /></label><label className="mt-4 block text-xs font-semibold text-gray-600">Texto alternativo<input value={draft.cover_image_alt} onChange={(event) => set("cover_image_alt", event.target.value)} className="mt-2 w-full border border-gray-300 p-3" /></label><label className="mt-4 block text-xs font-semibold text-gray-600">Crédito<input value={draft.cover_image_credit} onChange={(event) => set("cover_image_credit", event.target.value)} className="mt-2 w-full border border-gray-300 p-3" /></label></section>
          <section className="border border-gray-200 bg-white p-5"><h2 className="font-black text-[#101b3d]">SEO</h2><label className="mt-5 block text-xs font-semibold text-gray-600">Título SEO<input maxLength={70} value={draft.seo_title} onChange={(event) => set("seo_title", event.target.value)} className="mt-2 w-full border border-gray-300 p-3" /><small className="mt-1 block text-right font-normal">{draft.seo_title.length}/70</small></label><label className="mt-4 block text-xs font-semibold text-gray-600">Descrição SEO<textarea maxLength={170} rows={4} value={draft.seo_description} onChange={(event) => set("seo_description", event.target.value)} className="mt-2 w-full border border-gray-300 p-3" /><small className="mt-1 block text-right font-normal">{draft.seo_description.length}/170</small></label></section>
        </aside>
      </div>
    </main>
  );
}
