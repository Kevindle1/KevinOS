import { cloneElement, isValidElement, type ReactNode, type ReactElement } from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  useMergeRefs,
  FloatingPortal,
  FloatingFocusManager,
  type Placement,
} from '@floating-ui/react';
import { cx } from '../../cx.js';
import { useControllableState } from '../../hooks.js';

export interface PopoverProps {
  /** Déclencheur (élément focusable). */
  children: ReactElement;
  /** Contenu du panneau (rendu quand ouvert). */
  content: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
  className?: string;
}

/**
 * Panneau flottant ancré (menu, filtres, détails) — composant **KevinOS**.
 * Positionnement délégué à Floating UI (Règle 8 / ADR-0018) ; design/API/a11y
 * nôtres. Contrôlé ou non-contrôlé.
 *
 * A11y : `role="dialog"`, **piège de focus** (FloatingFocusManager), fermeture au
 * clic extérieur et à `Échap`, ouverture au clavier via le déclencheur.
 */
export function Popover({
  children,
  content,
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom-start',
  className,
}: PopoverProps) {
  const [isOpen, setOpen] = useControllableState<boolean>({
    ...(open !== undefined ? { value: open } : {}),
    defaultValue: defaultOpen,
    ...(onOpenChange ? { onChange: onOpenChange } : {}),
  });

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setOpen,
    placement,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'dialog' });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const childRef = (children as any).ref as React.Ref<unknown> | undefined;
  const ref = useMergeRefs([refs.setReference, childRef ?? null]);
  const trigger = isValidElement(children) ? children : <span>{children}</span>;

  return (
    <>
      {cloneElement(trigger, getReferenceProps({ ref, ...trigger.props }))}
      {isOpen ? (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
              className={cx(
                'z-50 min-w-48 rounded-lg border border-border bg-elevated p-2 shadow-3',
                'focus-visible:outline-none',
                className,
              )}
            >
              {content}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      ) : null}
    </>
  );
}
