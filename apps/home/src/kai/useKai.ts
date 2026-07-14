import { useCallback, useRef, useState } from 'react';
import type { KaiAction } from '@kevinos/shared';
import { askKai } from './client.js';
import {
  detectPhotoIntent,
  detectMediaIntent,
  detectDriveIntent,
  detectHomeIntent,
  detectPlayerCommand,
} from './intent.js';
import { simulatedReply, type Message } from './simulate.js';

/** Durée minimale de « réflexion » — garde un rythme naturel même en repli. */
const MIN_THINK_MS = 550;

const SCENE_LABELS: Record<string, string> = {
  cinema: 'Cinéma',
  lecture: 'Lecture',
  bonne_nuit: 'Bonne nuit',
  bonjour: 'Bonjour',
  je_rentre: 'Je rentre',
  je_pars: 'Je pars',
  travail: 'Travail',
  diner: 'Dîner',
};

let seq = 0;
function uid(): string {
  seq += 1;
  return `m${seq}`;
}

const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

interface Reply {
  text: string;
  actions?: KaiAction[];
}

async function respond(text: string, turn: number): Promise<Reply> {
  const real = await askKai(text);
  if (real && real.text.trim()) {
    return real.actions
      ? { text: real.text.trim(), actions: real.actions }
      : { text: real.text.trim() };
  }
  // Repli hors-ligne (Preview sans Core) : on détecte quand même les compétences.
  const player = detectPlayerCommand(text);
  if (player) {
    const acks: Record<string, string> = {
      close: 'Je ferme le lecteur.',
      pause: 'En pause.',
      play: 'Je reprends la lecture.',
      fullscreen: 'Plein écran.',
      mute: 'Son coupé.',
      volumeUp: "J'augmente le volume.",
      volumeDown: 'Je baisse le volume.',
      nextEpisode: 'Épisode suivant.',
      skipIntro: "Je passe l'introduction.",
      subtitles: player.lang === 'off' ? 'Sous-titres désactivés.' : 'Sous-titres activés.',
      audio: 'Piste audio changée.',
      seekBy:
        (player.amountSec ?? 0) < 0
          ? `Je recule de ${Math.abs(player.amountSec ?? 0)} s.`
          : `J'avance de ${player.amountSec ?? 0} s.`,
    };
    return { text: acks[player.command] ?? "C'est fait.", actions: [player] };
  }
  const photo = detectPhotoIntent(text);
  if (photo) {
    return {
      text:
        photo.kind === 'timeline'
          ? 'Voici tes dernières photos.'
          : `Je te montre tes photos : « ${photo.text} ».`,
      actions: [{ type: 'open_skill', skill: 'photos', label: 'KOS Vision', photoQuery: photo }],
    };
  }
  const media = detectMediaIntent(text);
  if (media) {
    const label =
      media.kind === 'continue'
        ? 'Je reprends ta lecture.'
        : media.kind === 'series'
          ? 'Voici tes séries.'
          : media.kind === 'search'
            ? `Je cherche : « ${media.text} ».`
            : 'Voici tes films.';
    return {
      text: label,
      actions: [{ type: 'open_skill', skill: 'media', label: 'KOS Media', mediaQuery: media }],
    };
  }
  const drive = detectDriveIntent(text);
  if (drive) {
    const label =
      drive.kind === 'find'
        ? `Je retrouve ton document : « ${drive.text} ».`
        : drive.kind === 'recent'
          ? 'Voici tes documents récents.'
          : drive.kind === 'largest'
            ? 'Voici tes fichiers les plus volumineux.'
            : drive.kind === 'favorites'
              ? 'Voici tes documents favoris.'
              : drive.kind === 'search'
                ? `Je cherche : « ${drive.text ?? drive.docKind ?? ''} ».`
                : 'Voici tes documents.';
    return {
      text: label,
      actions: [{ type: 'open_skill', skill: 'drive', label: 'KOS Drive', driveQuery: drive }],
    };
  }
  const home = detectHomeIntent(text);
  if (home) {
    if ('control' in home) {
      const c = home.control;
      const label =
        c.command === 'activate_scene'
          ? `J'active l'ambiance ${SCENE_LABELS[c.scene ?? ''] ?? c.scene}.`
          : c.command === 'turn_off'
            ? "J'éteins les lumières."
            : c.command === 'turn_on'
              ? "J'allume les lumières."
              : c.command === 'close'
                ? 'Je ferme.'
                : c.command === 'open'
                  ? "J'ouvre."
                  : "C'est fait.";
      return { text: label, actions: [c] };
    }
    return {
      text: 'Voici ta maison.',
      actions: [{ type: 'open_skill', skill: 'home', label: 'KOS Home', homeQuery: home.view }],
    };
  }
  return { text: simulatedReply(text, turn) };
}

export interface KaiState {
  messages: Message[];
  thinking: boolean;
  send: (text: string) => void;
  reset: () => void;
}

/**
 * Le KAI de Home. Il interroge d'abord le **vrai KAI** (le Core) ; sinon il
 * retombe sur un repli. Quand la réponse porte une **action** (ouvrir une
 * compétence), `onAction` la remonte à Home pour la présenter sans quitter
 * l'expérience.
 */
export function useKai(opts?: { onAction?: (action: KaiAction) => void }): KaiState {
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const turn = useRef(0);
  const onAction = useRef(opts?.onAction);
  onAction.current = opts?.onAction;

  const send = useCallback((text: string) => {
    setMessages((m) => [...m, { id: uid(), role: 'user', text }]);
    setThinking(true);
    const t = turn.current;
    turn.current += 1;

    void Promise.all([respond(text, t), wait(MIN_THINK_MS)]).then(([reply]) => {
      setMessages((m) => [...m, { id: uid(), role: 'kai', text: reply.text }]);
      setThinking(false);
      reply.actions?.forEach((a) => onAction.current?.(a));
    });
  }, []);

  const reset = useCallback(() => {
    setMessages([]);
    setThinking(false);
    turn.current = 0;
  }, []);

  return { messages, thinking, send, reset };
}
