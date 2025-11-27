import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('merges class names and removes duplicates', () => {
    const res = cn('btn', { 'btn-active': true }, 'mt-2', 'btn');
    expect(res).toContain('btn');
    expect(res).toContain('btn-active');
    expect(res).toContain('mt-2');
  });
});
