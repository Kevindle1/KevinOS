import { useState, cloneElement, isValidElement, type ReactNode, type ReactElement } from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  useMergeRefs,
  FloatingPortal,
  type Placement,
} from '@floating-ui/react';
import { cx } from '../../cx.js';

export interface TooltipProps {
  /** Contenu de l'infobulle. */
  content: ReactNode;
  /** Élément déclencheur (doit accepter une ref — bouton, lien…). */
  children: ReactElement;
  placement?: Placement;
  /** Délai d'ouverture (ms). */
  delay?: number;
  className?: string;
}

/**
 * Infobulle — composant **KevinOS**. Le **positionnement** (flip/shift/collisions)
 * est délégué à Floating UI (Règle 8 / ADR-0018) ; le design, l'API, l'animation
 * et l'a11y restent nôtres. Sobre et discrète.
 *
 * A11y : `role="tooltip"`, apparaît au survol **et au focus clavier**, se ferme à
 * `Échap`. Respecte `prefers-reduced-motion` via les tokens.
 */
export function Tooltip({
  content,
  children,
  placement = 'top',
  delay = 200,
  className,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, { move: false, delay: { open: delay, close: 80 } });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const childRef = (children as any).ref as React.Ref<unknown> | undefined;
  const ref = useMergeRefs([refs.setReference, childRef ?? null]);

  const trigger = isValidElement(children) ? children : <span>{children}</span>;

  return (
    <>
      {cloneElement(trigger, getReferenceProps({ ref, ...trigger.props }))}
      {open ? (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className={cx(
              'z-50 max-w-xs rounded-md border border-border-strong bg-elevated px-2.5 py-1.5',
              'text-sm text-text shadow-2',
              className,
            )}
          >
            {content}
          </div>
        </FloatingPortal>
      ) : null}
    </>
  );
}
