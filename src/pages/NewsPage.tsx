import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import NewsCard from "../components/NewsCard";
import { getNews } from "../lib/news";
import type { News } from "../types";

function normalizeText(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getNews()
      .then(setNews)
      .catch(() => setError("Não foi possível carregar as notícias."))
      .finally(() => setLoading(false));
  }, []);

  const filteredNews = useMemo(() => {
    const query = normalizeText(search.trim());
    if (!query) return news;
    return news.filter((article) => normalizeText(`${article.title} ${article.excerpt}`).includes(query));
  }, [news, search]);

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <Link to="/" className="mb-10 inline-flex text-sm font-medium text-gray-500 transition hover:text-blue-600">← Página inicial</Link>
        <header className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#b6202a]">LIRA</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-[#101b3d] md:text-6xl">Notícias</h1>
        </header>
        <div className="mb-10 max-w-2xl">
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar por título ou resumo…" className="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
          {search && <p className="mt-3 text-sm text-gray-500">{filteredNews.length} resultado(s)</p>}
        </div>
        {loading && <p className="py-20 text-center text-gray-500">Carregando notícias…</p>}
        {error && <p className="rounded-xl bg-red-50 p-5 text-red-700">{error}</p>}
        {!loading && !error && filteredNews.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">{filteredNews.map((article) => <NewsCard key={article.id} article={article} />)}</div>
        )}
        {!loading && !error && filteredNews.length === 0 && <div className="py-20 text-center text-gray-600"><h2 className="text-2xl font-semibold text-gray-900">Nenhuma notícia encontrada</h2></div>}
      </section>
    </main>
  );
}

