import { useEffect, useRef, type ReactNode } from 'react';
import { FloatingPortal } from '@floating-ui/react';
import { cx } from '../../cx.js';

export interface LightboxProps {
  open: boolean;
  onClose: () => void;
  /** Navigation optionnelle (flèches clavier ← →). */
  onPrev?: () => void;
  onNext?: () => void;
  /** Libellé accessible du dialogue. */
  label?: string;
  /** Légende sous le média. */
  caption?: ReactNode;
  /** Le média (image, vidéo…). */
  children: ReactNode;
}

/** Bouton de contrôle clair, lisible sur le fond sombre de la visionneuse. */
function ControlButton({
  label,
  onClick,
  refCb,
  children,
  className,
}: {
  label: string;
  onClick: () => void;
  refCb?: (n: HTMLButtonElement | null) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      ref={refCb}
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cx(
        'grid h-11 w-11 place-items-center rounded-full text-[#fff]',
        'bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.18)]',
        'transition duration-fast ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fff]',
        className,
      )}
    >
      {children}
    </button>
  );
}

/**
 * Visionneuse plein écran (média) — réutilisable par KOS Vision et KOS Media.
 * Sobre : fond sombre, une image centrée, des contrôles discrets.
 *
 * A11y : `role="dialog"` `aria-modal`, focus placé sur Fermer, **Échap** ferme,
 * **← / →** naviguent (si fournis), clic sur le fond ferme, défilement verrouillé.
 */
export function Lightbox({
  open,
  onClose,
  onPrev,
  onNext,
  label = 'Aperçu',
  caption,
  children,
}: LightboxProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') onPrev?.();
      else if (e.key === 'ArrowRight') onNext?.();
    }
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose, onPrev, onNext]);

  if (!open) return null;

  return (
    <FloatingPortal>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={onClose}
        className="animate-fade fixed inset-0 z-50 flex flex-col bg-[rgba(0,0,0,0.82)] backdrop-blur-sm"
      >
        <div className="flex justify-end p-3">
          <ControlButton label="Fermer" onClick={onClose} refCb={(n) => (closeRef.current = n)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </svg>
          </ControlButton>
        </div>

        <div
          className="flex flex-1 items-center justify-center gap-3 px-4 pb-2"
          onClick={(e) => e.stopPropagation()}
        >
          {onPrev ? (
            <ControlButton label="Photo précédente" onClick={onPrev} className="shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M15 6l-6 6 6 6"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </ControlButton>
          ) : null}
          <div className="flex max-h-full max-w-3xl items-center justify-center overflow-hidden">
            {children}
          </div>
          {onNext ? (
            <ControlButton label="Photo suivante" onClick={onNext} className="shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </ControlButton>
          ) : null}
        </div>

        {caption ? (
          <div className="p-4 text-center text-sm text-[rgba(255,255,255,0.82)]">{caption}</div>
        ) : null}
      </div>
    </FloatingPortal>
  );
}
