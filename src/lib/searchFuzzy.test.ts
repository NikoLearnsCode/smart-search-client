import {describe, expect, it} from 'vitest';
import {damerauLevenshtein, hasTypoMatch, isAcronymMatch} from './searchFuzzy';

describe('isAcronymMatch', () => {
  const words = ['the', 'dark', 'knight'];

  it('matches the full contiguous acronym', () => {
    expect(isAcronymMatch('tdk', words)).toBe(true);
  });

  it('matches a contiguous substring of the acronym', () => {
    expect(isAcronymMatch('dk', words)).toBe(true);
    expect(isAcronymMatch('td', words)).toBe(true);
  });

  it('rejects non-contiguous initials', () => {
    expect(isAcronymMatch('tk', words)).toBe(false);
  });

  it('rejects tokens shorter than 2 or longer than 4 chars', () => {
    expect(isAcronymMatch('t', words)).toBe(false);
    expect(isAcronymMatch('tdknx', ['the', 'dark', 'knight', 'never', 'ends']))
      .toBe(false);
  });
});

describe('damerauLevenshtein', () => {
  it('is 0 for identical strings', () => {
    expect(damerauLevenshtein('cat', 'cat')).toBe(0);
  });

  it('counts a single substitution', () => {
    expect(damerauLevenshtein('cat', 'car')).toBe(1);
  });

  it('counts an adjacent transposition as distance 1', () => {
    expect(damerauLevenshtein('cat', 'cta')).toBe(1);
    expect(damerauLevenshtein('ab', 'ba')).toBe(1);
  });

  it('counts a single insertion/deletion', () => {
    expect(damerauLevenshtein('inception', 'incepton')).toBe(1);
  });

  it('short-circuits to 2 when length differs by more than 1', () => {
    // Real distance is larger, but the guard caps it for the typo use case.
    expect(damerauLevenshtein('abc', 'abcde')).toBe(2);
  });
});

describe('hasTypoMatch', () => {
  const words = ['inception', 'dream'];

  it('matches a word within edit distance 1', () => {
    expect(hasTypoMatch('incepton', words)).toBe(true);
  });

  it('matches a typo against a word prefix', () => {
    // "incept" is a near-prefix of "inception".
    expect(hasTypoMatch('incept', words)).toBe(true);
  });

  it('rejects tokens shorter than 3 chars', () => {
    expect(hasTypoMatch('in', words)).toBe(false);
  });

  it('rejects unrelated tokens', () => {
    expect(hasTypoMatch('zzzzz', words)).toBe(false);
  });
});
