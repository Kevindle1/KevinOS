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

describe('compétence Drive (📁 → KOS Drive)', () => {
  it('« ouvre mon bail » → retrouve le document (find)', () => {
    expect(action('Ouvre mon bail')).toEqual({
      type: 'open_skill',
      skill: 'drive',
      label: 'KOS Drive',
      driveQuery: { kind: 'find', text: 'bail' },
    });
  });

  it('« retrouve ma facture EDF » → find « facture edf »', () => {
    const q = action('Retrouve ma facture EDF')?.driveQuery;
    expect(q?.kind).toBe('find');
    expect(q?.text).toMatch(/facture edf/i);
  });

  it('« recherche les documents contenant Crédit Agricole » → search', () => {
    const q = action('Recherche les documents contenant Crédit Agricole')?.driveQuery;
    expect(q?.kind).toBe('search');
    expect(q?.text).toMatch(/cr[ée]dit agricole/i);
  });

  it('« montre-moi tous les PDF de juillet » → search + docKind pdf', () => {
    const q = action('Montre-moi tous les PDF de juillet')?.driveQuery;
    expect(q?.kind).toBe('search');
    expect(q?.docKind).toBe('pdf');
    expect(q?.text).toMatch(/juillet/i);
  });

  it('« ouvre mon dernier document » → recent', () => {
    expect(action('Ouvre mon dernier document')?.driveQuery).toEqual({ kind: 'recent' });
  });

  it('« quels sont les fichiers les plus volumineux ? » → largest', () => {
    expect(action('Quels sont les fichiers les plus volumineux ?')?.driveQuery).toEqual({
      kind: 'largest',
    });
  });

  it('« montre-moi mes documents » → bibliothèque', () => {
    expect(action('Montre-moi mes documents')?.driveQuery).toEqual({ kind: 'library' });
  });

  it('ce qui ne parle pas de documents → null (délégué)', () => {
    expect(runSkills('Quelle heure est-il ?', ctx)).toBeNull();
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

describe('compétence Home (🏠 → KOS Home)', () => {
  it('« allume la lumière du salon » → control_home turn_on light Salon', () => {
    expect(action('Allume la lumière du salon')).toEqual({
      type: 'control_home',
      command: 'turn_on',
      deviceKind: 'light',
      room: 'Salon',
    });
  });

  it('« éteins toutes les lumières » → turn_off light (toute la maison)', () => {
    expect(action('Éteins toutes les lumières')).toEqual({
      type: 'control_home',
      command: 'turn_off',
      deviceKind: 'light',
    });
  });

  it('« ferme les volets » → close cover', () => {
    expect(action('Ferme les volets')).toEqual({
      type: 'control_home',
      command: 'close',
      deviceKind: 'cover',
    });
  });

  it('« ouvre le portail » → open door', () => {
    expect(action('Ouvre le portail')).toEqual({
      type: 'control_home',
      command: 'open',
      deviceKind: 'door',
    });
  });

  it('« active le mode cinéma » → activate_scene cinema (pas une recherche de film)', () => {
    expect(action('Active le mode cinéma')).toEqual({
      type: 'control_home',
      command: 'activate_scene',
      scene: 'cinema',
    });
  });

  it('« bonne nuit » → activate_scene bonne_nuit', () => {
    expect(action('Bonne nuit')).toEqual({
      type: 'control_home',
      command: 'activate_scene',
      scene: 'bonne_nuit',
    });
  });

  it('« quelle est la température du salon ? » → ouvre home (climate)', () => {
    expect(action('Quelle est la température du salon ?')).toEqual({
      type: 'open_skill',
      skill: 'home',
      label: 'KOS Home',
      homeQuery: { kind: 'climate', room: 'Salon' },
    });
  });

  it('« qui est à la maison ? » → presence', () => {
    expect(action('Qui est à la maison ?')?.homeQuery).toEqual({ kind: 'presence' });
  });

  it('« montre-moi la caméra du garage » → cameras (Garage)', () => {
    expect(action('Montre-moi la caméra du garage')?.homeQuery).toEqual({
      kind: 'cameras',
      room: 'Garage',
    });
  });

  it('« quelle est ma consommation aujourd’hui ? » → energy', () => {
    expect(action('Quelle est ma consommation aujourd’hui ?')?.homeQuery).toEqual({
      kind: 'energy',
    });
  });

  it('« ai-je laissé une lumière allumée ? » → lights', () => {
    expect(action('Ai-je laissé une lumière allumée ?')?.homeQuery).toEqual({ kind: 'lights' });
  });
});
