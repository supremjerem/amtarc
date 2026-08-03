import { announcements, contact, hero, practicalInfo } from './content';

// Sections editable from the admin panel; keys must stay in sync with
// SECTION_KEYS in apps/api/src/content/content.service.ts.
export const SECTION_DEFAULTS = {
  hero,
  announcements,
  'practical-info': practicalInfo,
  contact,
} as const;

export type SectionKey = keyof typeof SECTION_DEFAULTS;
export type SiteContent = { [K in SectionKey]: (typeof SECTION_DEFAULTS)[K] };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Stored values win field by field, so fields added to the defaults after a
// section was saved still render; arrays are replaced whole and keys unknown
// to the defaults are dropped.
export function mergeSection<T>(defaults: T, stored: unknown): T {
  if (stored === undefined || stored === null) return defaults;
  if (!isPlainObject(defaults) || !isPlainObject(stored)) return stored as T;

  const merged: Record<string, unknown> = { ...defaults };
  for (const [key, value] of Object.entries(stored)) {
    if (key in defaults) merged[key] = mergeSection(defaults[key], value);
  }
  return merged as T;
}

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export async function getSiteContent(): Promise<SiteContent> {
  let stored: Record<string, unknown> = {};
  try {
    const response = await fetch(`${API_URL}/content`, {
      next: { revalidate: 300, tags: ['content'] },
    });
    if (response.ok) stored = (await response.json()) as Record<string, unknown>;
  } catch {
    // API unreachable: render the built-in defaults.
  }
  return Object.fromEntries(
    Object.entries(SECTION_DEFAULTS).map(([key, defaults]) => [
      key,
      mergeSection(defaults, stored[key]),
    ]),
  ) as SiteContent;
}
