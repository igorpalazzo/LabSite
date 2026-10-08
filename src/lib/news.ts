import type { ContentBlock, News } from "../types";

interface LegacyNews {
  title: string;
  date: string;
  placeholder: string;
  abstract: string;
  content: string[];
}

type NewsFile = Partial<News> & Partial<LegacyNews>;

const modules = import.meta.glob<{ default: NewsFile }>(
  "../data/blog/*.json",
  { eager: true },
);

function normalizeArticle(path: string, source: NewsFile): News {
  const filename = path.split("/").pop() ?? "noticia.json";
  const fallbackSlug = filename.replace(/\.json$/, "");
  const legacyContent = Array.isArray(source.content) &&
    source.content.every((item) => typeof item === "string");

  const content: ContentBlock[] = legacyContent
    ? (source.content as string[]).map((text, index) => ({
        id: `${fallbackSlug}-${index + 1}`,
        type: "paragraph",
        data: { text },
      }))
    : ((source.content ?? []) as ContentBlock[]);

  const publishedAt = source.published_at ??
    (source.date ? `${source.date}T12:00:00-03:00` : null);

  return {
    id: source.id ?? `static-${fallbackSlug}`,
    slug: source.slug ?? fallbackSlug,
    title: source.title ?? "Notícia sem título",
    subtitle: source.subtitle ?? source.abstract ?? "",
    excerpt: source.excerpt ?? source.abstract ?? "",
    content,
    category_id: source.category_id ?? "institucional",
    category: source.category ?? { id: "institucional", name: "Institucional" },
    tags: source.tags ?? [],
    status: "PUBLISHED",
    author_id: source.author_id ?? "lira-team",
    author: source.author ?? { name: "Equipe LIRA" },
    cover_image_url: source.cover_image_url ?? source.placeholder ?? "",
    cover_image_alt: source.cover_image_alt ?? source.title ?? "",
    cover_image_credit: source.cover_image_credit ?? "",
    seo_title: source.seo_title ?? "",
    seo_description: source.seo_description ?? source.abstract ?? "",
    published_at: publishedAt,
    scheduled_at: null,
    created_at: source.created_at ?? publishedAt ?? new Date(0).toISOString(),
    updated_at: source.updated_at ?? publishedAt ?? new Date(0).toISOString(),
  };
}

const staticNews = Object.entries(modules)
  .map(([path, module]) => normalizeArticle(path, module.default))
  .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));

export async function getNews(limit = 50): Promise<News[]> {
  return staticNews.slice(0, limit);
}

export async function getNewsBySlug(slug: string): Promise<News> {
  const article = staticNews.find((item) => item.slug === slug);
  if (!article) throw new Error("Notícia não encontrada");

  return {
    ...article,
    related: staticNews
      .filter((item) => item.id !== article.id && item.category_id === article.category_id)
      .slice(0, 3),
  };
}

export function formatNewsDate(value?: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

