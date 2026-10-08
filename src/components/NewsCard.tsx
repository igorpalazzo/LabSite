import { Link } from "react-router-dom";
import { formatNewsDate } from "../lib/news";
import type { News } from "../types";

export default function NewsCard({ article }: { article: News }) {
  return (
    <Link
      to={`/noticias/${article.slug}`}
      className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="aspect-[16/9] overflow-hidden bg-gray-100">
        {article.cover_image_url ? (
          <img
            src={article.cover_image_url}
            alt={article.cover_image_alt || article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[#101b3d] text-5xl text-white/40">L</div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between gap-4">
          <time className="text-sm text-gray-500">{formatNewsDate(article.published_at)}</time>
          {article.category && (
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#b6202a]">
              {article.category.name}
            </span>
          )}
        </div>
        <h3 className="mt-3 text-xl font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
          {article.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-gray-600">{article.excerpt || article.subtitle}</p>
        <div className="mt-5 font-medium text-blue-600">Ler notícia →</div>
      </div>
    </Link>
  );
}

