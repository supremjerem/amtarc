import { adminFetch } from './auth';
import type { NewsCategory } from './content';

export type AdminNewsItem = {
  id: string;
  slug: string;
  title: string;
  category: NewsCategory;
  excerpt: string | null;
  body: string;
  imageUrl: string | null;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NewsFormInput = {
  title: string;
  category: NewsCategory;
  excerpt?: string;
  body: string;
  imageUrl?: string;
  published?: boolean;
};

async function parseOrThrow(response: Response) {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }
  return response.json();
}

export async function listAdminNews(): Promise<AdminNewsItem[]> {
  const response = await adminFetch('/news/admin');
  return parseOrThrow(response);
}

export async function getAdminNews(id: string): Promise<AdminNewsItem> {
  const response = await adminFetch(`/news/admin/${id}`);
  return parseOrThrow(response);
}

export async function createNews(input: NewsFormInput): Promise<AdminNewsItem> {
  const response = await adminFetch('/news', { method: 'POST', body: JSON.stringify(input) });
  return parseOrThrow(response);
}

export async function updateNews(id: string, input: NewsFormInput): Promise<AdminNewsItem> {
  const response = await adminFetch(`/news/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return parseOrThrow(response);
}

export async function deleteNews(id: string): Promise<void> {
  const response = await adminFetch(`/news/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error(`Delete failed with status ${response.status}`);
}
