import {beforeAll, describe, expect, it} from 'vitest';
import {filterPages, loadPages} from './searchData';

const MAX_RESULTS = 13;

describe('filterPages', () => {
  beforeAll(async () => {
    await loadPages();
  });

  it('returns nothing for an empty or whitespace query', () => {
    expect(filterPages('')).toEqual([]);
    expect(filterPages('   ')).toEqual([]);
  });

  it('finds an exact title and ranks it first', () => {
    const results = filterPages('inception');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toBe('Inception');
  });

  it('returns results sorted by descending score', () => {
    const scores = filterPages('the').map((r) => r.score);
    const sorted = [...scores].sort((a, b) => b - a);
    expect(scores).toEqual(sorted);
  });

  it('caps the result count at MAX_RESULTS', () => {
    expect(filterPages('the').length).toBeLessThanOrEqual(MAX_RESULTS);
  });

  it('attaches highlighted markup for the matched query', () => {
    const [top] = filterPages('inception');
    expect(top.highlightedName).toContain('<mark>');
  });

  it('returns no results for a query that matches nothing', () => {
    expect(filterPages('zzzqqqxxx')).toEqual([]);
  });
});
