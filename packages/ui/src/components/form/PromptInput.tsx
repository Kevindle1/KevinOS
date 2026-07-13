import { forwardRef, useRef, type KeyboardEvent, type TextareaHTMLAttributes } from 'react';
import { cx } from '../../cx.js';
import { Spinner } from '../Spinner.js';
import { useControllableState, useConst } from '../../hooks.js';

export interface PromptInputProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'value' | 'defaultValue' | 'onChange' | 'onSubmit'
> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /**
   * Envoi du message — **c'est ici que KAI se branche**. Reçoit le texte
   * (rogné). En mode non-contrôlé, la zone se vide automatiquement après l'envoi.
   */
  onSubmit: (value: string) => void;
  placeholder?: string;
  /** KAI réfléchit : la saisie reste possible, l'envoi affiche un spinner. */
  busy?: boolean;
  disabled?: boolean;
  /** Libellé accessible de la zone de saisie. */
  'aria-label'?: string;
  /** Libellé accessible du bouton d'envoi. */
  sendLabel?: string;
  className?: string;
}

/**
 * Zone de conversation — composant **stratégique** de KevinOS (ADR-0017),
 * pensé autour de **KAI** : c'est le point d'entrée de l'assistant sur l'écran
 * d'accueil (Home) et, plus tard, dans l'expérience KAI complète.
 *
 * Contrôlé ou non-contrôlé. `Entrée` envoie, `Maj+Entrée` insère un saut de
 * ligne. La hauteur s'ajuste au contenu. Calme et silencieux : une seule
 * surface, un seul bouton, aucune décoration superflue.
 *
 * A11y : `aria-label` par défaut sur la saisie, bouton d'envoi labellisé et
 * désactivé quand il n'y a rien à envoyer, focus visible.
 */
export const PromptInput = forwardRef<HTMLTextAreaElement, PromptInputProps>(function PromptInput(
  {
    value,
    defaultValue = '',
    onValueChange,
    onSubmit,
    placeholder = 'Écris à KAI…',
    busy = false,
    disabled = false,
    'aria-label': ariaLabel = 'Message à KAI',
    sendLabel = 'Envoyer',
    onKeyDown,
    className,
    ...rest
  },
  ref,
) {
  const [val, setVal] = useControllableState<string>({
    ...(value !== undefined ? { value } : {}),
    defaultValue,
    ...(onValueChange ? { onChange: onValueChange } : {}),
  });
  const uncontrolled = value === undefined;
  const areaRef = useRef<HTMLTextAreaElement | null>(null);
  const setRefs = useConst(() => (node: HTMLTextAreaElement | null) => {
    areaRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  });

  const canSend = val.trim().length > 0 && !busy && !disabled;

  function grow() {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }

  function submit() {
    if (!canSend) return;
    onSubmit(val.trim());
    if (uncontrolled) {
      setVal('');
      requestAnimationFrame(grow);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    onKeyDown?.(e);
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div
      className={cx(
        'flex items-end gap-2 rounded-2xl border border-border-strong bg-surface',
        'px-3 py-2 transition duration-fast ease-out',
        'focus-within:border-accent focus-within:shadow-focus',
        disabled && 'opacity-50',
        className,
      )}
    >
      <textarea
        ref={setRefs}
        rows={1}
        value={val}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => {
          setVal(e.target.value);
          grow();
        }}
        onKeyDown={handleKeyDown}
        className={cx(
          'max-h-[200px] flex-1 resize-none bg-transparent py-1.5 text-text',
          'placeholder:text-text-muted focus-visible:outline-none',
          'disabled:pointer-events-none',
        )}
        {...rest}
      />
      <button
        type="button"
        onClick={submit}
        disabled={!canSend}
        aria-label={sendLabel}
        className={cx(
          'grid h-9 w-9 shrink-0 place-items-center rounded-full transition duration-fast ease-out',
          'bg-accent text-on-accent hover:bg-accent-hover active:scale-[.96]',
          'focus-visible:outline-none focus-visible:shadow-focus',
          'disabled:opacity-40 disabled:pointer-events-none',
        )}
      >
        {busy ? (
          <Spinner size="sm" label="" />
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 19V5M12 5l-6 6M12 5l6 6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
});
