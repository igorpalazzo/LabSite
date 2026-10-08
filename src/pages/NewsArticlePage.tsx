import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BlockRenderer from "../components/BlockRenderer";
import NewsCard from "../components/NewsCard";
import { formatNewsDate, getNewsBySlug } from "../lib/news";
import type { News } from "../types";

export default function NewsArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    getNewsBySlug(slug).then(setArticle).catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!article) return;
    document.title = `${article.seo_title || article.title} | LIRA`;
    const description = article.seo_description || article.excerpt || article.subtitle;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement("meta"); meta.setAttribute("name", "description"); document.head.appendChild(meta); }
    meta.setAttribute("content", description);
  }, [article]);

  if (loading) return <main className="flex min-h-[70vh] items-center justify-center text-gray-500">Carregando matéria…</main>;
  if (error || !article) return <main className="flex min-h-[70vh] items-center justify-center px-6"><div className="text-center"><h1 className="text-3xl font-bold text-gray-900">Notícia não encontrada</h1><p className="mt-3 text-gray-600">{error}</p><Link to="/noticias" className="mt-8 inline-flex bg-[#101b3d] px-6 py-3 font-medium text-white">← Todas as notícias</Link></div></main>;

  return (
    <main className="bg-white">
      <article>
        <header className="border-b border-gray-200 bg-[#f7f7f5]">
          <div className="mx-auto max-w-4xl px-6 py-16 mb">
            <Link to="/noticias" className="mb-10 inline-flex text-sm font-medium text-gray-500 transition hover:text-[#b6202a]">← Todas as notícias</Link>
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[#b6202a]"><time>{formatNewsDate(article.published_at)}</time>{article.category && <><span>•</span><span>{article.category.name}</span></>}</div>
            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-[#101b3d] md:text-6xl">{article.title}</h1>
            <p className="mt-6 text-xl leading-relaxed text-gray-600">{article.subtitle}</p>
            <p className="mt-8 text-sm text-gray-500">Por <strong className="text-gray-800">{article.author?.name ?? "Equipe LIRA"}</strong></p>
          </div>
        </header>
        <div className="mx-auto max-w-5xl px-6 pt-12">
          {article.cover_image_url && <figure><img src={article.cover_image_url} alt={article.cover_image_alt || article.title} className="aspect-[16/9] w-full rounded-2xl object-cover" />{(article.cover_image_alt || article.cover_image_credit) && <figcaption className="mt-3 text-sm text-gray-500">{article.cover_image_alt}{article.cover_image_credit && <strong> Foto: {article.cover_image_credit}</strong>}</figcaption>}</figure>}
        </div>
        <div className="mx-auto max-w-4xl px-6 mb-20"><BlockRenderer blocks={article.content} />{article.tags.length > 0 && <footer className="my-16 flex flex-wrap gap-2 border-t border-gray-200 pt-8">{article.tags.map((tag) => <span key={tag} className="rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-600">{tag}</span>)}</footer>}</div>
      </article>
      {article.related && article.related.length > 0 && <section className="border-t border-gray-200 bg-gray-50 py-16"><div className="mx-auto max-w-7xl px-6"><h2 className="text-3xl font-black tracking-tight text-[#101b3d]">Leia também</h2><div className="mt-8 grid gap-8 md:grid-cols-3">{article.related.map((item) => <NewsCard key={item.id} article={item} />)}</div></div></section>}
    </main>
  );
}

