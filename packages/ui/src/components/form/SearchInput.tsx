import { forwardRef, type InputHTMLAttributes } from 'react';
import { cx } from '../../cx.js';
import { Spinner } from '../Spinner.js';
import { useControllableState } from '../../hooks.js';
import { controlBase } from './Field.js';

export interface SearchInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'defaultValue' | 'onChange' | 'size' | 'type'
> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Soumission (touche Entrée) — c'est ici que KAI / la recherche globale se branchent. */
  onSearch?: (value: string) => void;
  /** Effacement (bouton ✕ ou touche Échap). */
  onClear?: () => void;
  loading?: boolean;
  inputSize?: 'sm' | 'md' | 'lg';
}

const heights = { sm: 'h-9 text-sm', md: 'h-11', lg: 'h-12 text-base' } as const;

/**
 * Recherche — composant **stratégique** de KevinOS (ADR-0017), partagé par KAI,
 * KOS Vision/Media/Drive et Home. Contrôlé ou non-contrôlé ; effacement intégré ;
 * `Entrée` soumet, `Échap` efface. Sobre, calme, immédiatement compréhensible.
 *
 * A11y : `role="searchbox"`, `aria-label` par défaut, bouton d'effacement labellisé,
 * focus visible.
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  {
    value,
    defaultValue = '',
    onValueChange,
    onSearch,
    onClear,
    loading = false,
    inputSize = 'md',
    placeholder = 'Rechercher…',
    className,
    'aria-label': ariaLabel = 'Rechercher',
    disabled,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const [val, setVal] = useControllableState<string>({
    ...(value !== undefined ? { value } : {}),
    defaultValue,
    ...(onValueChange ? { onChange: onValueChange } : {}),
  });

  function clear() {
    setVal('');
    onClear?.();
  }

  return (
    <div className="relative flex items-center">
      <span className="pointer-events-none absolute left-3.5 text-text-muted" aria-hidden="true">
        {loading ? (
          <Spinner size="sm" label="" />
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </span>
      <input
        ref={ref}
        type="search"
        role="searchbox"
        aria-label={ariaLabel}
        value={val}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.key === 'Enter') onSearch?.(val);
          else if (e.key === 'Escape' && val) {
            e.preventDefault();
            clear();
          }
        }}
        className={cx(
          controlBase,
          'border-border-strong pl-11',
          val ? 'pr-10' : 'pr-3',
          heights[inputSize],
          // Masque la croix native de type=search (on fournit la nôtre).
          '[&::-webkit-search-cancel-button]:hidden',
          className,
        )}
        {...rest}
      />
      {val && !disabled ? (
        <button
          type="button"
          onClick={clear}
          aria-label="Effacer la recherche"
          className={cx(
            'absolute right-2.5 grid h-6 w-6 place-items-center rounded-full text-text-muted',
            'hover:bg-hover hover:text-text transition duration-fast ease-out',
            'focus-visible:outline-none focus-visible:shadow-focus',
          )}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ) : null}
    </div>
  );
});
