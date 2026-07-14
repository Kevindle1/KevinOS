import { describe, it, expect } from 'vitest';
import { runCapabilities, type KaiContext } from './capabilities.js';

const ctx: KaiContext = {
  now: new Date('2026-07-14T20:30:00'),
  system: { version: '1.2.3', startedAt: Date.parse('2026-07-14T20:00:00') },
  modules: [{ id: 'kos-vision', name: 'KOS Vision', keywords: ['photo', 'photos'] }],
};

describe('capacités KAI (déterministes, hors ligne)', () => {
  it('salue', () => {
    const r = runCapabilities('Bonjour KAI', ctx);
    expect(r?.source).toBe('capability');
    expect(r?.text).toMatch(/KAI/);
  });

  it('donne l’heure', () => {
    expect(runCapabilities('Il est quelle heure ?', ctx)?.text).toMatch(/20.30/);
  });

  it('donne la date', () => {
    const r = runCapabilities('On est quel jour ?', ctx);
    expect(r?.text).toMatch(/14/);
    expect(r?.text).toMatch(/juillet/i);
  });

  it('donne l’état du système (version + module)', () => {
    const r = runCapabilities('Quel est l’état du système ?', ctx);
    expect(r?.text).toMatch(/1\.2\.3/);
    expect(r?.text).toMatch(/KOS Vision/);
  });

  it('ouvre un module avec une action structurée', () => {
    const r = runCapabilities('Montre-moi mes photos', ctx);
    expect(r?.actions?.[0]).toEqual({
      type: 'open_module',
      moduleId: 'kos-vision',
      label: 'KOS Vision',
    });
  });

  it('délègue (null) ce qu’elle ne sait pas traiter', () => {
    expect(runCapabilities('Raconte-moi une histoire de dragons', ctx)).toBeNull();
  });
});
