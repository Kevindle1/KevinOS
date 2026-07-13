import { useEffect, useState, type ReactNode } from 'react';
import { initTheme, applyTheme, resolveTheme, type ThemeSetting } from '@kevinos/ui';
import { Explorer } from './modes/Explorer.js';
import { ThemeStudio } from './modes/ThemeStudio.js';
import { Accessibility } from './modes/Accessibility.js';

/**
 * Contexte partagé fourni à chaque mode. Un mode est **indépendant** : il ne
 * reçoit que ce contrat, ce qui permet d'en ajouter (Sandbox, Inspect, et un
 * futur mode « KAI ») sans toucher aux autres (ADR-0015, règles 2 & 8).
 */
export interface LabContext {
  theme: ThemeSetting;
  setTheme: (t: ThemeSetting) => void;
}

interface ModeDef {
  id: string;
  label: string;
  group: string;
  render?: (ctx: LabContext) => ReactNode;
  /** Description affichée tant que le mode n'est pas implémenté. */
  soon?: string;
}

/**
 * Registre des modes. Source unique : ajouter un mode = ajouter une entrée.
 * (Explorer / Theme Studio / Accessibility sont opérationnels ; les autres sont
 * décrits et arriveront progressivement — « simple mais solide ».)
 */
const MODES: ModeDef[] = [
  { id: 'explorer', label: 'Explorer', group: 'Composants', render: () => <Explorer /> },
  {
    id: 'inspect',
    label: 'Inspect',
    group: 'Composants',
    soon: 'Diagnostic d’un composant : nom, version, props, tokens utilisés, dépendances, accessibilité, performances de rendu.',
  },
  {
    id: 'playground',
    label: 'Playground',
    group: 'Composants',
    soon: 'Modifier les props d’un composant en direct (couleurs, tailles, icônes, loading, disabled…) sans écrire de code.',
  },
  {
    id: 'sandbox',
    label: 'Sandbox',
    group: 'Prototypage',
    soon: 'Tester une idée : assembler des composants, régler leurs props, enregistrer un prototype puis le supprimer. Outil de dev, jamais dans le produit.',
  },
  {
    id: 'screen-builder',
    label: 'Screen Builder',
    group: 'Prototypage',
    soon: 'Composer une page complète (Dashboard, Vision, Media, Drive, Home) par assemblage de composants existants.',
  },
  {
    id: 'dashboard-preview',
    label: 'Dashboard Preview',
    group: 'Prototypage',
    soon: 'Prévisualiser l’écran d’accueil de KevinOS — puis, quand il existera, exécuter le vrai Dashboard avec les vrais composants (sans duplication).',
  },
  {
    id: 'theme-studio',
    label: 'Theme Studio',
    group: 'Design',
    render: (ctx) => <ThemeStudio theme={ctx.theme} onTheme={ctx.setTheme} />,
  },
  {
    id: 'motion-lab',
    label: 'Motion Lab',
    group: 'Design',
    soon: 'Catalogue central des animations. Aucune transition n’est codée dans un composant : toutes dérivent des tokens et presets de motion.',
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    group: 'Qualité',
    render: (ctx) => <Accessibility themeKey={resolveTheme(ctx.theme)} />,
  },
  {
    id: 'documentation',
    label: 'Documentation',
    group: 'Qualité',
    soon: 'Documentation vivante, générée depuis le code (JSDoc/types). Reflète toujours l’état réel de @kevinos/ui — aucune doc dupliquée.',
  },
  {
    id: 'tests',
    label: 'Tests',
    group: 'Qualité',
    soon: 'État des tests de chaque composant (couverture, statut) — pour garantir la « definition of done ».',
  },
  {
    id: 'settings',
    label: 'Settings',
    group: 'Système',
    soon: 'Réglages du Design Lab (préférences d’affichage, densité, options de dev).',
  },
];

function ComingSoon({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="p-8 h-full">
      <div className="max-w-2xl rounded-xl border border-dashed border-border-strong p-8">
        <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
          Mode à venir
        </div>
        <h2 className="text-xl font-semibold mt-2">{title}</h2>
        <p className="text-sm text-text-secondary mt-2">{children}</p>
      </div>
    </div>
  );
}

export function App() {
  const [modeId, setModeId] = useState('explorer');
  const [theme, setThemeState] = useState<ThemeSetting>('system');

  useEffect(() => {
    setThemeState(initTheme());
  }, []);

  const ctx: LabContext = {
    theme,
    setTheme: (t) => {
      applyTheme(t);
      setThemeState(t);
    },
  };

  const groups = [...new Set(MODES.map((m) => m.group))];
  const active = MODES.find((m) => m.id === modeId) ?? MODES[0];

  return (
    <div className="flex h-full min-h-0">
      {/* Rail des modes — le Design Lab est organisé comme KevinOS (modules) */}
      <aside className="w-56 flex-none border-r border-border bg-surface overflow-y-auto">
        <div className="px-4 h-14 flex items-center gap-2 border-b border-border">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-accent text-on-accent text-sm font-bold">
            K
          </span>
          <span className="font-semibold">Design Lab</span>
        </div>
        <nav className="p-3">
          {groups.map((group) => (
            <div key={group} className="mb-4">
              <div className="px-2 mb-1 font-mono text-[11px] uppercase tracking-wider text-text-muted">
                {group}
              </div>
              {MODES.filter((m) => m.group === group).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModeId(m.id)}
                  className={
                    'w-full text-left px-2 h-9 rounded-md text-sm flex items-center justify-between transition duration-fast ease-out ' +
                    'focus-visible:outline-none focus-visible:shadow-focus ' +
                    (m.id === active?.id
                      ? 'bg-accent-subtle text-accent'
                      : 'text-text-secondary hover:bg-hover hover:text-text')
                  }
                >
                  {m.label}
                  {m.render ? null : <span className="text-[10px] text-text-muted">bientôt</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex-1 min-w-0 min-h-0">
        {active?.render ? (
          active.render(ctx)
        ) : (
          <ComingSoon title={active?.label ?? ''}>{active?.soon}</ComingSoon>
        )}
      </main>
    </div>
  );
}
