/**
 * Preset Tailwind du KOS Design System (ADR-0013).
 *
 * Tailwind n'est qu'un moteur : il ne fait que **référencer nos tokens** (CSS
 * custom properties de `tokens.css`). On n'utilise ni la palette ni les échelles
 * Tailwind par défaut. Un module KOS étend ce preset, il ne le contourne pas.
 *
 * Usage (au niveau d'une app) :
 *   import kosPreset from '@kevinos/ui/preset';
 *   export default { presets: [kosPreset], content: [...] };
 */
const preset = {
  theme: {
    // On repart de zéro pour la couleur : uniquement des tokens sémantiques.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      bg: 'var(--kos-bg)',
      surface: 'var(--kos-surface)',
      elevated: 'var(--kos-elevated)',
      hover: 'var(--kos-hover)',
      border: 'var(--kos-border)',
      'border-strong': 'var(--kos-border-strong)',
      text: 'var(--kos-text)',
      'text-secondary': 'var(--kos-text-secondary)',
      'text-muted': 'var(--kos-text-muted)',
      accent: 'var(--kos-accent)',
      'accent-hover': 'var(--kos-accent-hover)',
      'accent-subtle': 'var(--kos-accent-subtle)',
      'on-accent': 'var(--kos-on-accent)',
      success: 'var(--kos-success)',
      warning: 'var(--kos-warning)',
      danger: 'var(--kos-danger)',
      info: 'var(--kos-info)',
      // Accents modules
      vision: 'var(--kos-vision)',
      media: 'var(--kos-media)',
      drive: 'var(--kos-drive)',
      home: 'var(--kos-home)',
      brain: 'var(--kos-brain)',
      monitor: 'var(--kos-monitor)',
      network: 'var(--kos-network)',
      vault: 'var(--kos-vault)',
      backup: 'var(--kos-backup)',
    },
    extend: {
      fontFamily: {
        sans: 'var(--kos-font-ui)',
        mono: 'var(--kos-font-mono)',
      },
      borderRadius: {
        sm: 'var(--kos-radius-sm)',
        md: 'var(--kos-radius-md)',
        lg: 'var(--kos-radius-lg)',
        xl: 'var(--kos-radius-xl)',
        '2xl': 'var(--kos-radius-2xl)',
        full: 'var(--kos-radius-full)',
      },
      boxShadow: {
        1: 'var(--kos-shadow-1)',
        2: 'var(--kos-shadow-2)',
        3: 'var(--kos-shadow-3)',
        focus: 'var(--kos-focus-ring)',
      },
      transitionTimingFunction: {
        out: 'var(--kos-ease-out)',
        emph: 'var(--kos-ease-emph)',
      },
      transitionDuration: {
        instant: '80ms',
        fast: '140ms',
        base: '200ms',
        slow: '320ms',
      },
      // Grille d'espacement 8 pt (complète l'échelle Tailwind par défaut).
      spacing: {
        '4.5': '18px',
        '18': '72px',
      },
    },
  },
} as const;

export default preset;
export { preset };
