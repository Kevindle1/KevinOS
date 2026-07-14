import { useState } from 'react';
import type { KaiPhotoQuery, KaiMediaQuery } from '@kevinos/shared';
import { useKai } from './useKai.js';
import { curateHome } from './environment.js';
import { LivingHome } from './LivingHome.js';
import { Conversation } from './Conversation.js';
import { PhotosSurface } from '../photos/PhotosSurface.js';
import { MediaSurface } from '../media/MediaSurface.js';

/**
 * Home — la première expérience de KevinOS, et le lieu où KAI **invoque des
 * compétences**. Au repos, un accueil vivant ; en conversation, un fil ; et quand
 * KAI ouvre une compétence (📷 Photos → KOS Vision, 🎬 Media → KOS Media), sa
 * **surface s'affiche ici même** — on ne quitte jamais l'expérience.
 */
export function Home() {
  const [state] = useState(curateHome);
  const [photos, setPhotos] = useState<KaiPhotoQuery | null>(null);
  const [media, setMedia] = useState<KaiMediaQuery | null>(null);

  const { messages, thinking, send, reset } = useKai({
    onAction: (action) => {
      if (action.type !== 'open_skill') return;
      if (action.skill === 'photos') setPhotos(action.photoQuery ?? { kind: 'timeline' });
      else if (action.skill === 'media') setMedia(action.mediaQuery ?? { kind: 'library' });
    },
  });

  // Une compétence est ouverte : KAI nous y a amenés (surface dans Home).
  if (photos) return <PhotosSurface query={photos} onClose={() => setPhotos(null)} />;
  if (media) return <MediaSurface query={media} onClose={() => setMedia(null)} />;

  if (messages.length === 0) {
    return <LivingHome state={state} onSend={send} busy={thinking} />;
  }
  return <Conversation messages={messages} thinking={thinking} onSend={send} onHome={reset} />;
}
