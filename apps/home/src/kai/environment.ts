import type { InsightAccent } from '@kevinos/ui';

/**
 * L'**environnement simulé** de KevinOS — ce que KAI « sait » de la journée de
 * Kevin (Règle 9). Aujourd'hui tout est **simulé**, mais la forme est déjà la
 * bonne : le vrai KAI (via le Core) remplira ce même `Snapshot` sans que Home
 * change. C'est ce qui donne l'impression d'une **présence** dès l'ouverture.
 */
export interface Insight {
  id: string;
  icon: string;
  label: string;
  value: string;
  meta?: string;
  accent?: InsightAccent;
  /** Ce que Kevin demande à KAI en touchant la carte. */
  prompt: string;
  /** Élément « remarquable » aujourd'hui (compté dans le résumé de KAI). */
  notable?: boolean;
}

export interface Suggestion {
  id: string;
  icon: string;
  label: string;
  prompt: string;
}

export interface Greeting {
  salutation: string;
  emoji: string;
  summary: string;
}

export interface Snapshot {
  greeting: Greeting;
  /** Nombre d'éléments notables (« J'ai remarqué N éléments… »). */
  noticed: number;
  insights: Insight[];
  suggestions: Suggestion[];
}

function greetingFor(hour: number): Greeting {
  const summary = 'Tout fonctionne normalement aujourd’hui.';
  if (hour < 5) return { salutation: 'Bonne nuit', emoji: '🌙', summary };
  if (hour < 12) return { salutation: 'Bonjour', emoji: '☀️', summary };
  if (hour < 18) return { salutation: 'Bonjour', emoji: '👋', summary };
  if (hour < 23) return { salutation: 'Bonsoir', emoji: '🌙', summary };
  return { salutation: 'Bonne nuit', emoji: '🌙', summary };
}

const INSIGHTS: Insight[] = [
  {
    id: 'photos',
    icon: '📷',
    label: 'Photos',
    value: '148 nouvelles photos',
    meta: 'ajoutées aujourd’hui',
    accent: 'vision',
    prompt: 'Montre-moi les 148 photos ajoutées aujourd’hui',
    notable: true,
  },
  {
    id: 'media',
    icon: '🎬',
    label: 'À reprendre',
    value: 'The Last of Us',
    meta: 'S1 · E5 — 23 min restantes',
    accent: 'media',
    prompt: 'Reprends The Last of Us là où je m’étais arrêté',
    notable: true,
  },
  {
    id: 'backup',
    icon: '💾',
    label: 'Sauvegarde',
    value: 'Terminée avec succès',
    meta: 'cette nuit à 03:30',
    accent: 'backup',
    prompt: 'Détaille la dernière sauvegarde',
    notable: true,
  },
  {
    id: 'server',
    icon: '🖥️',
    label: 'Serveur',
    value: 'Actif depuis 17 jours',
    meta: 'tous les services répondent',
    accent: 'monitor',
    prompt: 'Quel est l’état du serveur ?',
  },
  {
    id: 'weather',
    icon: '🌤️',
    label: 'Météo',
    value: '18° · Ensoleillé',
    meta: 'aujourd’hui',
    accent: 'info',
    prompt: 'Quelle est la météo aujourd’hui ?',
  },
  {
    id: 'storage',
    icon: '💽',
    label: 'Stockage',
    value: '1,2 To libres',
    meta: 'sur 3 To — 40 % utilisés',
    accent: 'drive',
    prompt: 'Montre l’état du stockage',
  },
  {
    id: 'devices',
    icon: '🏠',
    label: 'Maison',
    value: '12 appareils connectés',
    meta: 'tout est normal',
    accent: 'home',
    prompt: 'Vérifie la maison',
  },
];

const SUGGESTIONS: Suggestion[] = [
  {
    id: 's-photos',
    icon: '📷',
    label: 'Voir les photos prises hier',
    prompt: 'Montre les photos prises hier',
  },
  {
    id: 's-media',
    icon: '🎬',
    label: 'Continuer ton dernier film',
    prompt: 'Reprends mon dernier film',
  },
  { id: 's-home', icon: '🏠', label: 'Vérifier la maison', prompt: 'Vérifie la maison' },
  {
    id: 's-storage',
    icon: '💽',
    label: 'Voir l’état du stockage',
    prompt: 'Montre l’état du stockage',
  },
];

/**
 * Instantané de l'environnement. `now` est injectable pour les tests ; par
 * défaut, l'heure réelle (le salut s'adapte au moment de la journée).
 */
export function getSnapshot(now: Date = new Date()): Snapshot {
  return {
    greeting: greetingFor(now.getHours()),
    noticed: INSIGHTS.filter((i) => i.notable).length,
    insights: INSIGHTS,
    suggestions: SUGGESTIONS,
  };
}
