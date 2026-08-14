import { describe, expect, it } from 'vitest';
import { isSafeApiSegment } from './api-path';

describe('isSafeApiSegment', () => {
  it.each(['abc123', 'seed-match-level-ii', 'cmf3k0a1b0000abcd', 'file.name_1'])(
    'accepts %s',
    (segment) => {
      expect(isSafeApiSegment(segment)).toBe(true);
    },
  );

  it.each([
    ['traversal', '..'],
    ['current directory', '.'],
    ['dots only', '...'],
    ['smuggled separator', 'admin/secret'],
    ['injected query', 'admin?'],
    ['injected fragment', 'admin#x'],
    ['encoded separator', 'admin%2Fsecret'],
    ['empty', ''],
    ['whitespace', 'a b'],
  ])('rejects %s', (_label, segment) => {
    expect(isSafeApiSegment(segment)).toBe(false);
  });
});
