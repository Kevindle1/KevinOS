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

describe('compétence Media (🎬 → KOS Media)', () => {
  it('« continue mon film » → ouvre media (reprise)', () => {
    expect(action('Continue mon film')).toEqual({
      type: 'open_skill',
      skill: 'media',
      label: 'KOS Media',
      mediaQuery: { kind: 'continue' },
    });
  });

  it('« montre-moi mes films » → bibliothèque films', () => {
    expect(action('Montre-moi mes films')?.mediaQuery).toEqual({ kind: 'library' });
  });

  it('« montre-moi mes séries » → séries', () => {
    expect(action('Montre-moi mes séries')?.mediaQuery).toEqual({ kind: 'series' });
  });

  it('« trouve le film Inception » → recherche', () => {
    const q = action('Trouve le film Inception')?.mediaQuery;
    expect(q?.kind).toBe('search');
    expect(q?.text).toMatch(/inception/i);
  });
});

describe('télécommande KAI (contrôle du lecteur)', () => {
  it('« mets en pause » → pause', () => {
    expect(action('mets en pause')).toEqual({ type: 'control_player', command: 'pause' });
  });

  it('« recule de 30 secondes » → seekBy -30', () => {
    expect(action('Recule de 30 secondes')).toEqual({
      type: 'control_player',
      command: 'seekBy',
      amountSec: -30,
    });
  });

  it('« avance de deux minutes » → seekBy +120', () => {
    expect(action('Avance de deux minutes')).toEqual({
      type: 'control_player',
      command: 'seekBy',
      amountSec: 120,
    });
  });

  it('« sous-titres français » → subtitles fr', () => {
    expect(action('Sous-titres français')).toEqual({
      type: 'control_player',
      command: 'subtitles',
      lang: 'fr',
    });
  });

  it('« passe en VO » → audio en', () => {
    expect(action('Passe en VO')).toEqual({ type: 'control_player', command: 'audio', lang: 'en' });
  });

  it('« plein écran » → fullscreen', () => {
    expect(action('Active le plein écran')).toEqual({
      type: 'control_player',
      command: 'fullscreen',
    });
  });

  it('« ferme le lecteur » → close', () => {
    expect(action('Ferme le lecteur')).toEqual({ type: 'control_player', command: 'close' });
  });

  it('« passe au prochain épisode » → nextEpisode', () => {
    expect(action('Passe au prochain épisode')).toEqual({
      type: 'control_player',
      command: 'nextEpisode',
    });
  });
});
