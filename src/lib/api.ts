import type { NewsDraft, User } from "../types";

export const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

const TOKEN_KEY = "lira_cms_token";

export const session = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = session.get();

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    const body = await response
      .json()
      .catch(() => ({ detail: "Não foi possível concluir a operação." }));
    if (response.status === 401) session.clear();
    throw new Error(body.detail ?? "Erro inesperado.");
  }

  return response.json() as Promise<T>;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ access_token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<User>("/auth/me"),
  categories: <T>() => request<T>("/categories"),
  publicNews: <T>(query = "") => request<T>(`/posts${query}`),
  publicArticle: <T>(slug: string) => request<T>(`/posts/${slug}`),
  dashboard: <T>() => request<T>("/admin/dashboard"),
  adminNews: <T>() => request<T>("/admin/posts"),
  adminArticle: <T>(id: string) => request<T>(`/admin/posts/${id}`),
  createArticle: <T>(data: NewsDraft) =>
    request<T>("/admin/posts", { method: "POST", body: JSON.stringify(data) }),
  updateArticle: <T>(id: string, data: NewsDraft) =>
    request<T>(`/admin/posts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  action: <T>(id: string, action: string, data?: unknown) =>
    request<T>(`/admin/posts/${id}/${action}`, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),
  preview: <T>(id: string) => request<T>(`/admin/preview/${id}`),
  upload: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<{ url: string; filename: string }>("/admin/media/upload", {
      method: "POST",
      body: form,
    });
  },
};

