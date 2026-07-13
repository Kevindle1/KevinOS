import { describe, it, expect } from 'vitest';
import { curateHome } from './environment.js';

/** Heure locale fixe (getHours() = l'heure passée). */
const at = (hour: number) => new Date(2026, 0, 5, hour, 0, 0);

describe('curateHome — la bonne info au bon moment', () => {
  it('ne montre jamais un mur : au plus 3 cartes', () => {
    for (const h of [8, 14, 20, 2]) {
      expect(curateHome(at(h)).cards.length).toBeLessThanOrEqual(3);
    }
  });

  it('le matin : salut ensoleillé + agenda mis en avant', () => {
    const s = curateHome(at(9));
    expect(s.greeting.salutation).toBe('Bonjour');
    expect(s.greeting.emoji).toBe('☀️');
    expect(s.cards.map((c) => c.id)).toContain('agenda');
  });

  it('le soir : « Bonsoir » et le film à reprendre', () => {
    const s = curateHome(at(20));
    expect(s.greeting.salutation).toBe('Bonsoir');
    expect(s.cards.map((c) => c.id)).toContain('media');
  });

  it('la nuit : KevinOS respire (≤ 1 carte, calme, pas de rappel)', () => {
    const s = curateHome(at(2));
    expect(s.greeting.salutation).toBe('Bonne nuit');
    expect(s.cards.length).toBeLessThanOrEqual(1);
    expect(s.calm).toBe(true);
    expect(s.nudge).toBeUndefined();
  });

  it('les cartes sont classées par importance (aucune « info » avant une « normale »)', () => {
    const rank = { high: 0, normal: 1, info: 2 } as const;
    for (const h of [9, 14, 20]) {
      const p = curateHome(at(h)).cards.map((c) => rank[c.priority]);
      const sorted = [...p].sort((a, b) => a - b);
      expect(p).toEqual(sorted);
    }
  });

  it('propose une continuité (mémoire) hors de la nuit', () => {
    expect(curateHome(at(20)).nudge).toBeDefined();
  });
});
