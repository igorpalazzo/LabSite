import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BlockRenderer from "../../components/BlockRenderer";
import { api } from "../../lib/api";
import type { News } from "../../types";

export default function AdminPreviewPage() {
  const { id } = useParams();
  const [article, setArticle] = useState<News | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { if (id) api.preview<News>(id).then(setArticle).catch((reason: Error) => setError(reason.message)); }, [id]);
  if (error) return <main className="p-16 text-center text-red-700">{error}</main>;
  if (!article) return <main className="p-16 text-center text-gray-500">Carregando prévia…</main>;
  return <main className="min-h-screen bg-white"><div className="bg-amber-100 px-5 py-3 text-center text-sm font-bold text-amber-900">PRÉ-VISUALIZAÇÃO — esta notícia pode ainda não estar publicada.</div><article><header className="bg-[#f7f7f5]"><div className="mx-auto max-w-4xl px-6 py-16"><Link to={`/admin/publicacoes/${article.id}`} className="text-sm font-semibold text-[#b6202a]">← Voltar ao editor</Link><h1 className="mt-8 text-4xl font-black tracking-tight text-[#101b3d] md:text-6xl">{article.title}</h1><p className="mt-6 text-xl leading-relaxed text-gray-600">{article.subtitle}</p><p className="mt-8 text-sm text-gray-500">Por <strong>{article.author?.name}</strong></p></div></header>{article.cover_image_url && <div className="mx-auto max-w-5xl px-6 pt-12"><img src={article.cover_image_url} alt={article.cover_image_alt} className="aspect-[16/9] w-full rounded-2xl object-cover" /></div>}<div className="mx-auto max-w-4xl px-6"><BlockRenderer blocks={article.content} /></div></article></main>;
}

