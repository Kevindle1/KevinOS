import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { cx } from '../../cx.js';

export interface MediaPlayerSubtitle {
  id: string;
  lang: string;
  label: string;
  url: string;
}

export interface MediaPlayerProps {
  src: string;
  poster?: string;
  title?: ReactNode;
  /** Reprise : position de départ (secondes). */
  startAt?: number;
  subtitles?: MediaPlayerSubtitle[];
  autoPlay?: boolean;
  /** Progression (throttlée ~toutes les 5 s + aux moments clés). */
  onProgress?: (positionSec: number, durationSec: number) => void;
  onEnded?: () => void;
  onClose?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  className?: string;
}

/** API impérative — **c'est par là que KAI télécommande la lecture**. */
export interface MediaPlayerHandle {
  play(): void;
  pause(): void;
  toggle(): void;
  seekBy(sec: number): void;
  seekTo(sec: number): void;
  setRate(rate: number): void;
  setVolume(delta: number): void;
  toggleMute(): void;
  setSubtitle(lang: string): void;
  toggleFullscreen(): void;
  togglePiP(): void;
}

function fmt(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const s = Math.floor(sec % 60);
  const m = Math.floor((sec / 60) % 60);
  const h = Math.floor(sec / 3600);
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  return `${h > 0 ? `${h}:` : ''}${mm}:${String(s).padStart(2, '0')}`;
}

const RATES = [0.5, 1, 1.25, 1.5, 2];

/**
 * **MediaPlayer** — le lecteur **officiel et unique** de KevinOS (films, séries,
 * vidéos, caméras, archives…). HTML5, agnostique du moteur : il ne reçoit qu'une
 * `src` servie par le Core. Contrôles **auto-masqués** (Apple TV / visionOS),
 * clavier, sous-titres, PiP, plein écran, reprise, `onProgress`. Une **API
 * impérative** (ref) permet à **KAI** de tout piloter en langage naturel.
 *
 * A11y : contrôles labellisés, support clavier (espace, ←/→, f, m, ↑/↓).
 */
export const MediaPlayer = forwardRef<MediaPlayerHandle, MediaPlayerProps>(function MediaPlayer(
  {
    src,
    poster,
    title,
    startAt = 0,
    subtitles = [],
    autoPlay = true,
    onProgress,
    onEnded,
    onClose,
    onNext,
    onPrev,
    className,
  },
  ref,
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hideTimer = useRef<number | undefined>(undefined);
  const lastReport = useRef(0);

  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [rate, setRateState] = useState(1);
  const [controls, setControls] = useState(true);
  const [menu, setMenu] = useState<'none' | 'rate' | 'subs'>('none');

  const report = useCallback(
    (pos: number) => {
      const v = videoRef.current;
      if (v && v.duration) onProgress?.(pos, v.duration);
    },
    [onProgress],
  );

  const showControls = useCallback(() => {
    setControls(true);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (!videoRef.current?.paused) setControls(false);
    }, 3000);
  }, []);

  // API impérative (KAI).
  useImperativeHandle(
    ref,
    (): MediaPlayerHandle => ({
      play: () => void videoRef.current?.play?.()?.catch?.(() => {}),
      pause: () => videoRef.current?.pause?.(),
      toggle: () => {
        const v = videoRef.current;
        if (!v) return;
        if (v.paused) void v.play?.()?.catch?.(() => {});
        else v.pause?.();
      },
      seekBy: (s) => {
        const v = videoRef.current;
        if (v) v.currentTime = Math.max(0, Math.min(v.duration || Infinity, v.currentTime + s));
        showControls();
      },
      seekTo: (s) => {
        const v = videoRef.current;
        if (v) v.currentTime = Math.max(0, s);
      },
      setRate: (r) => {
        const v = videoRef.current;
        if (v) v.playbackRate = r;
        setRateState(r);
      },
      setVolume: (delta) => {
        const v = videoRef.current;
        if (v) v.volume = Math.max(0, Math.min(1, v.volume + delta));
        showControls();
      },
      toggleMute: () => {
        const v = videoRef.current;
        if (v) {
          v.muted = !v.muted;
          setMuted(v.muted);
        }
      },
      setSubtitle: (lang) => {
        const v = videoRef.current;
        if (!v) return;
        for (const track of Array.from(v.textTracks)) {
          track.mode = lang !== 'off' && track.language === lang ? 'showing' : 'hidden';
        }
        showControls();
      },
      toggleFullscreen: () => {
        const el = containerRef.current;
        if (!el) return;
        if (document.fullscreenElement) void document.exitFullscreen?.();
        else void el.requestFullscreen?.();
      },
      togglePiP: () => {
        const v = videoRef.current as HTMLVideoElement & {
          requestPictureInPicture?: () => Promise<unknown>;
        };
        if (document.pictureInPictureElement) void document.exitPictureInPicture?.();
        else void v?.requestPictureInPicture?.();
      },
    }),
    [showControls],
  );

  // Reprise à l'ouverture.
  useEffect(() => {
    const v = videoRef.current;
    if (v && startAt > 0) v.currentTime = startAt;
  }, [src]);

  // Rapport de progression aux moments clés.
  useEffect(() => {
    return () => {
      const v = videoRef.current;
      if (v) report(v.currentTime);
    };
  }, [report]);

  function onTimeUpdate() {
    const v = videoRef.current;
    if (!v) return;
    setCurrent(v.currentTime);
    if (v.currentTime - lastReport.current >= 5) {
      lastReport.current = v.currentTime;
      report(v.currentTime);
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const v = videoRef.current;
    if (!v) return;
    const k = e.key.toLowerCase();
    if (k === ' ' || k === 'k') {
      e.preventDefault();
      if (v.paused) void v.play?.()?.catch?.(() => {});
      else v.pause?.();
    } else if (k === 'arrowleft') v.currentTime = Math.max(0, v.currentTime - 10);
    else if (k === 'arrowright') v.currentTime = v.currentTime + 10;
    else if (k === 'arrowup') v.volume = Math.min(1, v.volume + 0.1);
    else if (k === 'arrowdown') v.volume = Math.max(0, v.volume - 0.1);
    else if (k === 'f') void containerRef.current?.requestFullscreen?.();
    else if (k === 'm') {
      v.muted = !v.muted;
      setMuted(v.muted);
    }
    showControls();
  }

  const remaining = duration - current;
  const ctlBtn =
    'grid h-10 w-10 place-items-center rounded-full text-[#fff] bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.2)] transition duration-fast ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fff]';

  return (
    <div
      ref={containerRef}
      className={cx(
        'relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-[#000] outline-none',
        className,
      )}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerMove={showControls}
      onClick={showControls}
    >
      <video
        ref={videoRef}
        src={src}
        {...(poster ? { poster } : {})}
        autoPlay={autoPlay}
        playsInline
        className="h-full w-full"
        onPlay={() => {
          setPlaying(true);
          showControls();
        }}
        onPause={() => {
          setPlaying(false);
          setControls(true);
          const v = videoRef.current;
          if (v) report(v.currentTime);
        }}
        onLoadedMetadata={() => {
          const v = videoRef.current;
          if (v) {
            setDuration(v.duration || 0);
            if (startAt > 0) v.currentTime = startAt;
          }
        }}
        onTimeUpdate={onTimeUpdate}
        onEnded={() => {
          setPlaying(false);
          onEnded?.();
        }}
      >
        {subtitles.map((s) => (
          <track key={s.id} kind="subtitles" src={s.url} srcLang={s.lang} label={s.label} />
        ))}
      </video>

      {/* Overlay des contrôles — apparaît au toucher, disparaît seul */}
      <div
        className={cx(
          'pointer-events-none absolute inset-0 flex flex-col justify-between bg-[linear-gradient(to_bottom,rgba(0,0,0,0.5),transparent_20%,transparent_60%,rgba(0,0,0,0.6))] transition-opacity duration-base ease-out',
          controls ? 'opacity-100' : 'opacity-0',
        )}
      >
        {/* Haut : titre + fermer */}
        <div className="pointer-events-auto flex items-center justify-between gap-3 p-3">
          <span className="min-w-0 truncate text-sm font-medium text-[#fff]">{title}</span>
          {onClose ? (
            <button
              type="button"
              aria-label="Fermer le lecteur"
              onClick={onClose}
              className={ctlBtn}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ) : null}
        </div>

        {/* Centre : gros play/pause */}
        <div className="pointer-events-auto flex items-center justify-center gap-8">
          {onPrev ? (
            <button type="button" aria-label="Précédent" onClick={onPrev} className={ctlBtn}>
              ⏮
            </button>
          ) : null}
          <button
            type="button"
            aria-label={playing ? 'Pause' : 'Lecture'}
            onClick={() => {
              const v = videoRef.current;
              if (!v) return;
              if (v.paused) void v.play?.()?.catch?.(() => {});
              else v.pause?.();
            }}
            className="grid h-16 w-16 place-items-center rounded-full bg-[rgba(255,255,255,0.15)] text-2xl text-[#fff] backdrop-blur-sm transition duration-fast ease-out hover:bg-[rgba(255,255,255,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fff]"
          >
            {playing ? '❚❚' : '▶'}
          </button>
          {onNext ? (
            <button type="button" aria-label="Suivant" onClick={onNext} className={ctlBtn}>
              ⏭
            </button>
          ) : null}
        </div>

        {/* Bas : barre + temps + réglages */}
        <div className="pointer-events-auto space-y-2 p-3">
          <input
            type="range"
            aria-label="Progression"
            min={0}
            max={duration || 0}
            step={1}
            value={current}
            onChange={(e) => {
              const v = videoRef.current;
              if (v) {
                v.currentTime = Number(e.target.value);
                setCurrent(v.currentTime);
              }
            }}
            className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[rgba(255,255,255,0.25)] accent-accent"
          />
          <div className="flex items-center justify-between gap-2 text-[#fff]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Reculer de 10 secondes"
                onClick={() => (videoRef.current!.currentTime -= 10)}
                className={ctlBtn}
              >
                ↺
              </button>
              <button
                type="button"
                aria-label="Avancer de 10 secondes"
                onClick={() => (videoRef.current!.currentTime += 10)}
                className={ctlBtn}
              >
                ↻
              </button>
              <button
                type="button"
                aria-label={muted ? 'Activer le son' : 'Couper le son'}
                onClick={() => {
                  const v = videoRef.current;
                  if (v) {
                    v.muted = !v.muted;
                    setMuted(v.muted);
                  }
                }}
                className={ctlBtn}
              >
                {muted ? '🔇' : '🔊'}
              </button>
              <span className="ml-1 text-xs tabular-nums">
                {fmt(current)} <span className="opacity-60">/ {fmt(duration)}</span> · −
                {fmt(remaining)}
              </span>
            </div>

            <div className="relative flex items-center gap-2">
              {subtitles.length > 0 ? (
                <button
                  type="button"
                  aria-label="Sous-titres"
                  onClick={() => setMenu((m) => (m === 'subs' ? 'none' : 'subs'))}
                  className={ctlBtn}
                >
                  CC
                </button>
              ) : null}
              <button
                type="button"
                aria-label="Vitesse de lecture"
                onClick={() => setMenu((m) => (m === 'rate' ? 'none' : 'rate'))}
                className={cx(ctlBtn, 'text-xs')}
              >
                {rate}×
              </button>
              <button
                type="button"
                aria-label="Image dans l'image"
                onClick={() => {
                  const v = videoRef.current as HTMLVideoElement & {
                    requestPictureInPicture?: () => Promise<unknown>;
                  };
                  void v?.requestPictureInPicture?.();
                }}
                className={ctlBtn}
              >
                ⧉
              </button>
              <button
                type="button"
                aria-label="Plein écran"
                onClick={() => void containerRef.current?.requestFullscreen?.()}
                className={ctlBtn}
              >
                ⛶
              </button>

              {menu === 'rate' ? (
                <div className="absolute bottom-12 right-0 flex flex-col rounded-lg bg-[rgba(20,20,20,0.95)] p-1 text-sm text-[#fff]">
                  {RATES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        const v = videoRef.current;
                        if (v) v.playbackRate = r;
                        setRateState(r);
                        setMenu('none');
                      }}
                      className={cx(
                        'rounded px-3 py-1 text-left hover:bg-[rgba(255,255,255,0.14)]',
                        r === rate && 'text-accent',
                      )}
                    >
                      {r}×
                    </button>
                  ))}
                </div>
              ) : null}
              {menu === 'subs' ? (
                <div className="absolute bottom-12 right-0 flex flex-col rounded-lg bg-[rgba(20,20,20,0.95)] p-1 text-sm text-[#fff]">
                  <button
                    type="button"
                    onClick={() => {
                      for (const t of Array.from(videoRef.current?.textTracks ?? []))
                        t.mode = 'hidden';
                      setMenu('none');
                    }}
                    className="rounded px-3 py-1 text-left hover:bg-[rgba(255,255,255,0.14)]"
                  >
                    Désactivés
                  </button>
                  {subtitles.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        for (const t of Array.from(videoRef.current?.textTracks ?? []))
                          t.mode = t.language === s.lang ? 'showing' : 'hidden';
                        setMenu('none');
                      }}
                      className="rounded px-3 py-1 text-left hover:bg-[rgba(255,255,255,0.14)]"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
