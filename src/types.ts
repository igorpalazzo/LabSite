export type BlockType = "paragraph" | "heading" | "quote" | "image" | "list";

export interface ContentBlock {
  id: string;
  type: BlockType;
  data: Record<string, string | number | string[]>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR" | "AUTHOR" | "REVIEWER";
}

export interface Category {
  id: string;
  name: string;
}

export interface News {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  content: ContentBlock[];
  category_id: string;
  category?: Category;
  tags: string[];
  status: string;
  author_id: string;
  author?: { id?: string; name: string };
  cover_image_url: string;
  cover_image_alt: string;
  cover_image_credit: string;
  seo_title: string;
  seo_description: string;
  published_at?: string | null;
  scheduled_at?: string | null;
  created_at: string;
  updated_at: string;
  related?: News[];
}

export type NewsDraft = Pick<
  News,
  | "title"
  | "subtitle"
  | "excerpt"
  | "content"
  | "category_id"
  | "tags"
  | "cover_image_url"
  | "cover_image_alt"
  | "cover_image_credit"
  | "seo_title"
  | "seo_description"
>;

// Mantido apenas para compatibilidade com os componentes antigos de demonstração.
export interface Post {
  id: string;
  title: string;
  description: string;
  image: string;
  content: string;
}
