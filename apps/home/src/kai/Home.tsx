import { useRef, useState } from 'react';
import type { KaiPhotoQuery, KaiMediaQuery, KaiControlPlayerAction } from '@kevinos/shared';
import type { MediaPlayerHandle } from '@kevinos/ui';
import { useKai } from './useKai.js';
import { curateHome } from './environment.js';
import { LivingHome } from './LivingHome.js';
import { Conversation } from './Conversation.js';
import { PhotosSurface } from '../photos/PhotosSurface.js';
import { MediaSurface } from '../media/MediaSurface.js';
import { PlayerOverlay } from '../media/PlayerOverlay.js';
import type { PlayTarget } from '../media/MediaDetail.js';

/** Applique une commande de KAI au lecteur (best-effort selon la commande). */
function applyPlayerCommand(h: MediaPlayerHandle, a: KaiControlPlayerAction): void {
  switch (a.command) {
    case 'play':
      h.play();
      break;
    case 'pause':
      h.pause();
      break;
    case 'toggle':
      h.toggle();
      break;
    case 'seekBy':
      h.seekBy(a.amountSec ?? 0);
      break;
    case 'skipIntro':
      h.seekBy(85);
      break;
    case 'subtitles':
    case 'audio':
      h.setSubtitle(a.lang ?? 'fr');
      break;
    case 'volumeUp':
      h.setVolume(0.1);
      break;
    case 'volumeDown':
      h.setVolume(-0.1);
      break;
    case 'mute':
      h.toggleMute();
      break;
    case 'fullscreen':
      h.toggleFullscreen();
      break;
    default:
      break; // nextEpisode/prevEpisode/close : gérés ailleurs
  }
}

/**
 * Home — la première expérience de KevinOS, et le lieu où KAI **invoque des
 * compétences** et **télécommande** le lecteur. Photos, Média et le lecteur
 * officiel s'affichent **ici même** — on ne quitte jamais l'expérience.
 */
export function Home() {
  const [state] = useState(curateHome);
  const [photos, setPhotos] = useState<KaiPhotoQuery | null>(null);
  const [media, setMedia] = useState<KaiMediaQuery | null>(null);
  const [playing, setPlaying] = useState<PlayTarget | null>(null);
  const playerRef = useRef<MediaPlayerHandle | null>(null);

  const { messages, thinking, send, reset } = useKai({
    onAction: (action) => {
      if (action.type === 'control_player') {
        if (action.command === 'close') setPlaying(null);
        else if (playerRef.current) applyPlayerCommand(playerRef.current, action);
        return;
      }
      if (action.type === 'open_skill') {
        if (action.skill === 'photos') setPhotos(action.photoQuery ?? { kind: 'timeline' });
        else if (action.skill === 'media') setMedia(action.mediaQuery ?? { kind: 'library' });
      }
    },
  });

  const surface = photos ? (
    <PhotosSurface query={photos} onClose={() => setPhotos(null)} />
  ) : media ? (
    <MediaSurface
      query={media}
      onClose={() => setMedia(null)}
      onPlay={setPlaying}
      onSuggest={send}
    />
  ) : messages.length === 0 ? (
    <LivingHome state={state} onSend={send} busy={thinking} />
  ) : (
    <Conversation messages={messages} thinking={thinking} onSend={send} onHome={reset} />
  );

  return (
    <>
      {surface}
      {playing ? (
        <PlayerOverlay ref={playerRef} target={playing} onClose={() => setPlaying(null)} />
      ) : null}
    </>
  );
}
