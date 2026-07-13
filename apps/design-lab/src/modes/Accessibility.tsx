import { useEffect, useState } from 'react';
import { Button, Card } from '@kevinos/ui';

interface PairResult {
  label: string;
  fg: string;
  bg: string;
  ratio: number;
}

const PAIRS: { label: string; fg: string; bg: string }[] = [
  { label: 'Texte / Fond', fg: '--kos-text', bg: '--kos-bg' },
  { label: 'Texte secondaire / Fond', fg: '--kos-text-secondary', bg: '--kos-bg' },
  { label: 'Texte discret / Fond', fg: '--kos-text-muted', bg: '--kos-bg' },
  { label: 'Texte / Surface', fg: '--kos-text', bg: '--kos-surface' },
  { label: 'Sur accent / Accent', fg: '--kos-on-accent', bg: '--kos-accent' },
];

function rgb(str: string): [number, number, number] {
  const m = str.match(/rgba?\(([^)]+)\)/);
  if (!m) return [0, 0, 0];
  const p = (m[1] ?? '').split(',').map((x) => parseFloat(x));
  return [p[0] ?? 0, p[1] ?? 0, p[2] ?? 0];
}
function lum([r, g, b]: [number, number, number]): number {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(fg: string, bg: string): number {
  const l1 = lum(rgb(fg));
  const l2 = lum(rgb(bg));
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

/** Résout un token en couleur rgb effective via un élément sonde. */
function resolve(varName: string): string {
  const probe = document.createElement('span');
  probe.style.color = `var(${varName})`;
  probe.style.display = 'none';
  document.body.appendChild(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c;
}

/**
 * Mode 5 — Accessibility : vérifie automatiquement les contrastes (WCAG),
 * expose l'état des préférences de mouvement, et rappelle focus / clavier /
 * lecteurs d'écran. Les contrastes se recalculent selon le thème courant.
 */
export function Accessibility({ themeKey }: { themeKey: string }) {
  const [pairs, setPairs] = useState<PairResult[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setPairs(
      PAIRS.map((p) => ({
        label: p.label,
        fg: p.fg,
        bg: p.bg,
        ratio: contrast(resolve(p.fg), resolve(p.bg)),
      })),
    );
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, [themeKey]);

  return (
    <div className="p-8 overflow-auto h-full">
      <div className="max-w-3xl">
        <h2 className="text-xl font-semibold">Accessibility</h2>
        <p className="text-sm text-text-secondary mt-1">
          Contrôles automatiques selon le thème actif. Objectif : WCAG AA (≥ 4.5:1 texte courant).
        </p>

        <Card className="mt-6">
          <div className="font-medium mb-3">Contrastes</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-muted">
                <th className="font-medium pb-2">Paire</th>
                <th className="font-medium pb-2 tabular-nums">Ratio</th>
                <th className="font-medium pb-2">AA</th>
              </tr>
            </thead>
            <tbody>
              {pairs.map((p) => {
                const pass = p.ratio >= 4.5;
                return (
                  <tr key={p.label} className="border-t border-border">
                    <td className="py-2">{p.label}</td>
                    <td className="py-2 font-mono tabular-nums">{p.ratio.toFixed(2)}:1</td>
                    <td
                      className="py-2"
                      style={{ color: pass ? 'var(--kos-success)' : 'var(--kos-danger)' }}
                    >
                      {pass ? '✓ conforme' : '✗ à corriger'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <Card className="mt-4">
          <div className="font-medium mb-2">Navigation clavier & focus</div>
          <p className="text-sm text-text-secondary mb-3">
            Tabulez ci-dessous : chaque élément a un anneau de focus visible (jamais retiré).
          </p>
          <div className="flex gap-3">
            <Button size="sm">Bouton A</Button>
            <Button size="sm" variant="secondary">
              Bouton B
            </Button>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-sm text-accent underline focus-visible:outline-none focus-visible:shadow-focus rounded px-1"
            >
              Lien focusable
            </a>
          </div>
        </Card>

        <Card className="mt-4">
          <div className="font-medium mb-2">Préférences de mouvement</div>
          <p className="text-sm text-text-secondary">
            `prefers-reduced-motion` :{' '}
            <span style={{ color: reducedMotion ? 'var(--kos-warning)' : 'var(--kos-success)' }}>
              {reducedMotion ? 'réduit (animations minimisées)' : 'complet'}
            </span>
            . Les tokens de durée passent à 0 ms quand l'utilisateur le demande.
          </p>
        </Card>

        <Card className="mt-4">
          <div className="font-medium mb-2">Lecteurs d'écran</div>
          <ul className="text-sm text-text-secondary list-disc pl-5 space-y-1">
            <li>Rôles ARIA corrects (`progressbar`, `alert`, `status`, `dialog`…).</li>
            <li>Libellés explicites ; icônes seules toujours accompagnées d'un `aria-label`.</li>
            <li>Régions `aria-live` pour toasts et notifications (à venir vague états).</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
