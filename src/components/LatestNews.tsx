import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNews } from "../lib/news";
import type { News } from "../types";
import NewsCard from "./NewsCard";

export default function LatestNews({ limit = 3 }: { limit?: number }) {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getNews(limit)
      .then(setNews)
      .catch(() => setError("Não foi possível carregar as notícias agora."))
      .finally(() => setLoading(false));
  }, [limit]);

  return (
    <section id="noticias" className="py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Notícias</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">Últimas notícias</h2>
          <p className="mt-3 max-w-2xl text-gray-600">
            Acompanhe as últimas atividades, pesquisas, projetos e acontecimentos do laboratório.
          </p>
        </div>

        {loading && <p className="py-16 text-center text-gray-500">Carregando notícias…</p>}
        {error && <p className="rounded-xl bg-red-50 p-5 text-red-700">{error}</p>}
        {!loading && !error && news.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center text-gray-500">
            Nenhuma notícia publicada ainda.
          </div>
        )}
        {news.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {news.map((article) => <NewsCard key={article.id} article={article} />)}
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <Link to="/noticias" className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-800 transition hover:bg-gray-100">
            Ver todas →
          </Link>
        </div>
      </div>
    </section>
  );
}

