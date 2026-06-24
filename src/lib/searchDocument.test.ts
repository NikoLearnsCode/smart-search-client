import {describe, expect, it} from 'vitest';
import {highlightTextAsSafeHtml, preparePage} from './searchDocument';

describe('preparePage', () => {
  it('lowercases fields and splits the tag list', () => {
    const page = preparePage(
      {name: 'Inception', tag: 'Action, Sci-Fi', short_description: 'Nolan'},
      0,
    );
    expect(page.nameLower).toBe('inception');
    expect(page.tagLower).toBe('action, sci-fi');
    expect(page.descLower).toBe('nolan');
    expect(page.tagList).toEqual(['action', 'sci-fi']);
  });

  it('derives name words from both space and hyphen splits', () => {
    const page = preparePage(
      {name: 'The Dark-Knight', tag: '', short_description: ''},
      0,
    );
    expect(page.nameWords).toEqual(['the', 'dark-knight', 'dark', 'knight']);
  });

  it('falls back to the array index when id is absent', () => {
    expect(preparePage({name: 'A', tag: '', short_description: ''}, 7).id).toBe(
      7,
    );
    expect(
      preparePage({id: 42, name: 'A', tag: '', short_description: ''}, 7).id,
    ).toBe(42);
  });

  it('handles empty fields without throwing', () => {
    const page = preparePage({name: '', tag: '', short_description: ''}, 0);
    expect(page.nameWords).toEqual([]);
    expect(page.tagList).toEqual([]);
  });
});

describe('highlightTextAsSafeHtml', () => {
  it('returns text unchanged when there are no tokens', () => {
    expect(highlightTextAsSafeHtml('Inception', [])).toBe('Inception');
  });

  it('wraps matched substrings in <mark>', () => {
    expect(highlightTextAsSafeHtml('Inception', ['ception'])).toBe(
      'In<mark>ception</mark>',
    );
  });

  it('escapes HTML special characters in the output', () => {
    expect(highlightTextAsSafeHtml('Cat & <Dog>', ['cat'])).toBe(
      '<mark>Cat</mark> &amp; &lt;Dog&gt;',
    );
  });

  it('skips single-character tokens', () => {
    expect(highlightTextAsSafeHtml('Inception', ['i'])).toBe('Inception');
  });

  it('highlights initials on an acronym match', () => {
    expect(highlightTextAsSafeHtml('The Dark Knight', ['tdk'])).toBe(
      '<mark>T</mark>he <mark>D</mark>ark <mark>K</mark>night',
    );
  });

  it('returns an empty string for empty text', () => {
    expect(highlightTextAsSafeHtml('', ['anything'])).toBe('');
  });
});
