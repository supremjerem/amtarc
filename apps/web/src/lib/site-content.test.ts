import { describe, expect, it } from 'vitest';
import { mergeSection } from './site-content';

describe('mergeSection', () => {
  const defaults = {
    title: 'Titre par défaut',
    cta: { href: '#infos', label: 'Voir' },
    checklist: ['a', 'b'],
  };

  it('returns defaults when nothing is stored', () => {
    expect(mergeSection(defaults, undefined)).toEqual(defaults);
  });

  it('lets stored values win field by field', () => {
    const merged = mergeSection(defaults, { title: 'Titre modifié' });

    expect(merged.title).toBe('Titre modifié');
    expect(merged.cta).toEqual({ href: '#infos', label: 'Voir' });
  });

  it('merges nested objects and keeps default-only fields', () => {
    const merged = mergeSection(defaults, { cta: { label: 'Découvrir' } });

    expect(merged.cta).toEqual({ href: '#infos', label: 'Découvrir' });
  });

  it('replaces arrays whole', () => {
    const merged = mergeSection(defaults, { checklist: ['c'] });

    expect(merged.checklist).toEqual(['c']);
  });

  it('drops stored keys unknown to the defaults', () => {
    const merged = mergeSection(defaults, { legacyField: 'x' });

    expect(merged).toEqual(defaults);
  });
});
