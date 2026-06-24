import {describe, expect, it} from 'vitest';
import {analyzeMatch, calculateScore} from './searchEngine';
import {preparePage} from './searchDocument';

const page = preparePage(
  {name: 'The Dark Knight', tag: 'Action, Crime', short_description: 'A Nolan film'},
  0,
);

const score = (tokens: string[]) => calculateScore(page, tokens, tokens.join(' '));

describe('calculateScore', () => {
  it('rewards an exact name-word match highest', () => {
    expect(score(['dark'])).toBe(300);
  });

  it('rewards a name prefix match', () => {
    expect(score(['kni'])).toBe(150);
  });

  it('rewards a name substring match (>= 3 chars)', () => {
    expect(score(['night'])).toBe(80);
  });

  it('rewards an exact tag match', () => {
    expect(score(['crime'])).toBe(200);
  });

  it('rewards a description substring match', () => {
    expect(score(['nolan'])).toBe(10);
  });

  it('adds the whole-name bonus when the full query equals the title', () => {
    // 300 (name bonus) + 300 * 3 exact words.
    expect(calculateScore(page, ['the', 'dark', 'knight'], 'the dark knight')).toBe(
      1200,
    );
  });

  it('requires every token to match (AND semantics)', () => {
    expect(score(['dark', 'zzzzz'])).toBe(0);
  });

  it('falls back to an acronym match when nothing else hits', () => {
    expect(score(['tdk'])).toBe(20);
  });

  it('falls back to a typo match when nothing else hits', () => {
    expect(score(['knigt'])).toBe(10);
  });
});

describe('analyzeMatch', () => {
  it('reports the matching reason for a name hit', () => {
    expect(analyzeMatch(page, ['dark'], 'dark').reasons).toEqual(['name']);
  });

  it('reports the acronym reason for a fallback acronym hit', () => {
    expect(analyzeMatch(page, ['tdk'], 'tdk').reasons).toEqual(['acronym']);
  });

  it('reports the typo reason for a fallback typo hit', () => {
    expect(analyzeMatch(page, ['knigt'], 'knigt').reasons).toEqual(['typo']);
  });

  it('orders multiple reasons as name > tag > desc', () => {
    const {reasons} = analyzeMatch(
      page,
      ['knight', 'action', 'nolan'],
      'knight action nolan',
    );
    expect(reasons).toEqual(['name', 'tag', 'desc']);
  });

  it('returns no reasons when the score is zero', () => {
    expect(analyzeMatch(page, ['zzzzz'], 'zzzzz').reasons).toEqual([]);
  });
});
