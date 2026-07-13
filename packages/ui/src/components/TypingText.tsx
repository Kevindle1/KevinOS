import { useEffect, useRef, useState, type ElementType } from 'react';
import { cx } from '../cx.js';

export interface TypingTextProps {
  /** Texte à révéler progressivement. */
  text: string;
  /** Vitesse de frappe (caractères / seconde). */
  cps?: number;
  /** Délai avant de commencer (ms). */
  startDelay?: number;
  /** Appelé une fois le texte entièrement révélé. */
  onDone?: () => void;
  /** Élément conteneur (`span` par défaut). */
  as?: ElementType;
  /** Affiche un curseur clignotant pendant la frappe. */
  caret?: boolean;
  className?: string;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Texte **écrit progressivement** — la signature de la voix de KAI (Règle 9).
 * Donne l'impression que quelqu'un compose la réponse, plutôt que de l'afficher
 * d'un bloc.
 *
 * A11y : le texte **complet** est exposé aux lecteurs d'écran (`aria-label`) —
 * pas d'annonce hachée. En `prefers-reduced-motion`, le texte s'affiche
 * **immédiatement** (aucune animation).
 */
export function TypingText({
  text,
  cps = 45,
  startDelay = 0,
  onDone,
  as: Tag = 'span',
  caret = true,
  className,
}: TypingTextProps) {
  const instant = prefersReducedMotion();
  const [count, setCount] = useState(instant ? text.length : 0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (instant) {
      setCount(text.length);
      onDoneRef.current?.();
      return;
    }
    setCount(0);
    const step = Math.max(16, 1000 / cps);
    let i = 0;
    let interval: number | undefined;
    const startTimer = window.setTimeout(() => {
      interval = window.setInterval(() => {
        i += 1;
        setCount(i);
        if (i >= text.length) {
          window.clearInterval(interval);
          onDoneRef.current?.();
        }
      }, step);
    }, startDelay);

    return () => {
      window.clearTimeout(startTimer);
      if (interval) window.clearInterval(interval);
    };
  }, [text, cps, startDelay, instant]);

  const done = count >= text.length;

  return (
    <Tag aria-label={text} className={className}>
      <span aria-hidden="true">{text.slice(0, count)}</span>
      {caret && !done ? (
        <span
          aria-hidden="true"
          className={cx(
            'ml-0.5 inline-block w-px animate-breathe self-stretch align-baseline',
            'bg-current',
          )}
          style={{ height: '1em', verticalAlign: '-0.15em' }}
        />
      ) : null}
    </Tag>
  );
}
