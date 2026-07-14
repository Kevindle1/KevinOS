import { forwardRef, useEffect, useState } from 'react';
import { MediaPlayer, Spinner, type MediaPlayerHandle } from '@kevinos/ui';
import type { MediaStream } from '@kevinos/shared';
import { loadStream, saveProgress } from './mediaClient.js';
import type { PlayTarget } from './MediaDetail.js';

/**
 * Le **lecteur officiel KevinOS** en plein cadre. Charge le flux (URL du Core,
 * jamais du moteur), reprend à la bonne position et **sauve la progression** en
 * continu — c'est KevinOS qui possède la reprise. La `ref` est remontée à Home
 * pour que **KAI télécommande** la lecture.
 */
export const PlayerOverlay = forwardRef<
  MediaPlayerHandle,
  { target: PlayTarget; onClose: () => void }
>(function PlayerOverlay({ target, onClose }, ref) {
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadStream(target.id).then((s) => !cancelled && setStream(s));
    return () => {
      cancelled = true;
    };
  }, [target.id]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(0,0,0,0.94)] sm:p-6">
      {stream ? (
        <MediaPlayer
          ref={ref}
          src={stream.url}
          title={target.title}
          startAt={stream.startAtSec}
          subtitles={stream.subtitles}
          onProgress={(pos, dur) => void saveProgress(target.id, pos, dur)}
          onClose={onClose}
          onEnded={onClose}
          className="max-h-full w-full max-w-5xl"
        />
      ) : (
        <span className="text-accent">
          <Spinner size="lg" label="Préparation du lecteur" />
        </span>
      )}
    </div>
  );
});
