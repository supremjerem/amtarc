import { adminFetch } from './auth';
import { SECTION_DEFAULTS, mergeSection, type SectionKey } from './site-content';

export type FieldType = 'text' | 'textarea' | 'lines' | 'hours';

export type FieldConfig = {
  path: string;
  label: string;
  type: FieldType;
};

export type SectionConfig = {
  key: SectionKey;
  title: string;
  description: string;
  fields: FieldConfig[];
};

// Admin labels are French (user-facing), paths/keys stay English.
export const SECTION_CONFIGS: SectionConfig[] = [
  {
    key: 'hero',
    title: "Bandeau d'accueil",
    description: 'Titre, texte et boutons du haut de page.',
    fields: [
      { path: 'badge', label: 'Surtitre (badge)', type: 'text' },
      { path: 'title', label: 'Titre', type: 'textarea' },
      { path: 'paragraph', label: 'Paragraphe', type: 'textarea' },
      { path: 'ctaPrimary.label', label: 'Bouton principal', type: 'text' },
      { path: 'ctaSecondary.label', label: 'Bouton secondaire', type: 'text' },
    ],
  },
  {
    key: 'announcements',
    title: 'Messages du club',
    description: 'Les quatre encarts d’annonces sous le bandeau.',
    fields: [
      { path: 'kicker', label: 'Surtitre de section', type: 'text' },
      { path: 'heading', label: 'Titre de section', type: 'text' },
      { path: 'medicalCertificate.badge', label: 'Encart 1 — badge', type: 'text' },
      { path: 'medicalCertificate.title', label: 'Encart 1 — titre', type: 'text' },
      { path: 'medicalCertificate.body', label: 'Encart 1 — texte', type: 'textarea' },
      { path: 'medicalCertificate.cta.label', label: 'Encart 1 — bouton', type: 'text' },
      { path: 'membership.kicker', label: 'Encart 2 — surtitre', type: 'text' },
      { path: 'membership.title', label: 'Encart 2 — titre', type: 'text' },
      { path: 'membership.body', label: 'Encart 2 — texte', type: 'textarea' },
      { path: 'membership.cta.label', label: 'Encart 2 — lien', type: 'text' },
      { path: 'merch.kicker', label: 'Encart 3 — surtitre', type: 'text' },
      { path: 'merch.title', label: 'Encart 3 — titre', type: 'text' },
      { path: 'merch.body', label: 'Encart 3 — texte', type: 'textarea' },
      { path: 'merch.cta.label', label: 'Encart 3 — lien', type: 'text' },
      { path: 'newsletter.title', label: 'Bandeau lettre — titre', type: 'text' },
      { path: 'newsletter.body', label: 'Bandeau lettre — texte', type: 'text' },
      { path: 'newsletter.cta.label', label: 'Bandeau lettre — lien', type: 'text' },
    ],
  },
  {
    key: 'practical-info',
    title: 'Infos pratiques',
    description: 'Horaires, dossier d’adhésion et notes.',
    fields: [
      { path: 'hoursKicker', label: 'Surtitre horaires', type: 'text' },
      { path: 'hours', label: 'Horaires', type: 'hours' },
      { path: 'hoursNote', label: 'Note horaires', type: 'textarea' },
      { path: 'membershipKicker', label: 'Surtitre adhésion', type: 'text' },
      { path: 'membershipHeading', label: 'Titre adhésion', type: 'text' },
      { path: 'membershipChecklist', label: 'Pièces à fournir (une par ligne)', type: 'lines' },
      { path: 'membershipNote', label: 'Note adhésion', type: 'textarea' },
      { path: 'membershipCta.label', label: 'Bouton adhésion', type: 'text' },
    ],
  },
  {
    key: 'contact',
    title: 'Contact',
    description: 'Coordonnées et texte de la section contact.',
    fields: [
      { path: 'heading', label: 'Titre', type: 'text' },
      { path: 'paragraph', label: 'Paragraphe', type: 'textarea' },
      { path: 'email', label: 'Email', type: 'text' },
      { path: 'address.lines', label: 'Adresse (une ligne par ligne)', type: 'lines' },
      { path: 'hours.lines', label: 'Ouverture (une ligne par ligne)', type: 'lines' },
    ],
  },
];

export function getSectionConfig(key: string): SectionConfig | undefined {
  return SECTION_CONFIGS.find((section) => section.key === key);
}

export function getAtPath(source: unknown, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (value, segment) =>
        value && typeof value === 'object'
          ? (value as Record<string, unknown>)[segment]
          : undefined,
      source,
    );
}

export function setAtPath<T>(source: T, path: string, value: unknown): T {
  const [head, ...rest] = path.split('.');
  const base = (source ?? {}) as Record<string, unknown>;
  return {
    ...base,
    [head]: rest.length === 0 ? value : setAtPath(base[head] ?? {}, rest.join('.'), value),
  } as T;
}

export async function fetchSectionValues(key: SectionKey): Promise<unknown> {
  const response = await adminFetch('/content');
  const stored = response.ok ? ((await response.json()) as Record<string, unknown>) : {};
  return mergeSection(SECTION_DEFAULTS[key], stored[key]);
}

export async function saveSectionValues(key: SectionKey, values: unknown): Promise<void> {
  const response = await adminFetch(`/content/${key}`, {
    method: 'PUT',
    body: JSON.stringify({ data: values }),
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Save failed with status ${response.status}`);
  }
}

/**
 * Clears a section's override so it renders the built-in defaults again.
 * Returns the values the section falls back to, so the form can show them
 * without a reload.
 */
export async function resetSectionValues(key: SectionKey): Promise<unknown> {
  const response = await adminFetch(`/content/${key}`, { method: 'DELETE' });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Reset failed with status ${response.status}`);
  }
  return SECTION_DEFAULTS[key];
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await adminFetch('/uploads', { method: 'POST', body: formData });
  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }
  const { url } = (await response.json()) as { url: string };
  return url;
}
