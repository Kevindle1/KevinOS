import { describe, it, expect } from 'vitest';
import { runSkills } from './skills.js';
import type { KaiContext } from './capabilities.js';

const ctx: KaiContext = {
  now: new Date('2026-07-14T20:30:00'),
  system: { version: '1.2.3', startedAt: Date.now() },
  modules: [{ id: 'kos-vision', name: 'KOS Vision', keywords: ['photo', 'photos'] }],
};

function action(message: string) {
  const r = runSkills(message, ctx);
  return r?.actions?.[0];
}

describe('compétence Photos (📷 → KOS Vision)', () => {
  it('« montre-moi mes photos » → ouvre la compétence photos (timeline)', () => {
    expect(action('Montre-moi mes photos')).toEqual({
      type: 'open_skill',
      skill: 'photos',
      label: 'KOS Vision',
      photoQuery: { kind: 'timeline' },
    });
  });

  it('« les dernières photos » → timeline', () => {
    expect(action('Montre-moi les dernières photos')?.photoQuery).toEqual({ kind: 'timeline' });
  });

  it('« photos de juillet » → recherche', () => {
    const q = action('Montre-moi les photos de juillet')?.photoQuery;
    expect(q?.kind).toBe('search');
    expect(q?.text).toMatch(/juillet/i);
  });

  it('« photos où apparaît mon chien » → recherche « chien »', () => {
    const q = action('Montre-moi les photos où apparaît mon chien')?.photoQuery;
    expect(q?.kind).toBe('search');
    expect(q?.text).toMatch(/chien/i);
  });

  it('« recherche les photos prises à la montagne » → recherche « montagne »', () => {
    const q = action('Recherche les photos prises à la montagne')?.photoQuery;
    expect(q?.kind).toBe('search');
    expect(q?.text).toMatch(/montagne/i);
  });

  it('ce qui ne parle pas de photos → null (délégué)', () => {
    expect(runSkills('Quelle heure est-il ?', ctx)).toBeNull();
  });
});
