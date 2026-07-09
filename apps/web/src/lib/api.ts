import { fallbackNews, type NewsItem } from './content';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export async function getPublishedNews(): Promise<NewsItem[]> {
  try {
    const response = await fetch(`${API_URL}/news`, {
      next: { revalidate: 300, tags: ['news'] },
    });
    if (!response.ok) throw new Error(`Unexpected status ${response.status}`);
    return (await response.json()) as NewsItem[];
  } catch {
    return fallbackNews;
  }
}
