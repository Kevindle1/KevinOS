import type { InsightAccent } from '@kevinos/ui';

/**
 * Le **moteur de curation** de Home (Règle 9, itération 3).
 *
 * KevinOS ne répond pas à « quelles informations puis-je afficher ? » mais à
 * « **quelle est l'information la plus utile à Kevin maintenant ?** ». KAI
 * **choisit** : au plus quelques cartes, classées par **importance**, qui
 * **évoluent** selon le moment de la journée. L'utilisateur ne voit que ce qui
 * mérite son attention — jamais un mur.
 *
 * Tout est simulé aujourd'hui ; le vrai KAI (via le Core) alimentera ce même
 * modèle sans que Home change.
 */
export type Priority = 'high' | 'normal' | 'info';
export type PartOfDay = 'night' | 'morning' | 'afternoon' | 'evening';

export interface HomeCard {
  id: string;
  priority: Priority;
  icon: string;
  label: string;
  value: string;
  meta?: string;
  accent?: InsightAccent;
  /** Ce que Kevin demande à KAI en touchant la carte. */
  prompt: string;
}

export interface Suggestion {
  id: string;
  icon: string;
  label: string;
  prompt: string;
}

/** Continuité — la **mémoire** de KAI (personnalité). */
export interface MemoryFact {
  id: string;
  icon: string;
  text: string;
  /** Libellé de l'action proposée (ex. « Reprendre »). */
  action: string;
  prompt: string;
}

export interface Greeting {
  salutation: string;
  emoji: string;
}

export interface HomeState {
  greeting: Greeting;
  /** La phrase de KAI (sa voix), contextuelle et parfois teintée de mémoire. */
  headline: string;
  /** Ce que KAI met en avant maintenant — **au plus 3**, classées. */
  cards: HomeCard[];
  suggestions: Suggestion[];
  /** Rien de notable → interface minimale (respiration). */
  calm: boolean;
  /** « Prise de parole » différée et discrète (mémoire/continuité). */
  nudge?: MemoryFact;
}

interface Signal extends HomeCard {
  /** Moments où ce signal est pertinent. */
  when: PartOfDay[];
  /** Un signal inactif n'est **jamais** montré (données honnêtes). */
  active: boolean;
}

function partOfDay(hour: number): PartOfDay {
  if (hour < 5) return 'night';
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  if (hour < 23) return 'evening';
  return 'night';
}

function greetingFor(part: PartOfDay): Greeting {
  switch (part) {
    case 'morning':
      return { salutation: 'Bonjour', emoji: '☀️' };
    case 'afternoon':
      return { salutation: 'Bonjour', emoji: '👋' };
    case 'evening':
      return { salutation: 'Bonsoir', emoji: '🌙' };
    case 'night':
      return { salutation: 'Bonne nuit', emoji: '🌙' };
  }
}

const PRIORITY_RANK: Record<Priority, number> = { high: 0, normal: 1, info: 2 };

/**
 * Ce que KAI **pourrait** montrer. La curation en retient très peu. Chaque signal
 * porte son **importance** et les **moments** où il compte.
 */
const SIGNALS: Signal[] = [
  {
    id: 'agenda',
    priority: 'normal',
    icon: '🗓️',
    label: 'Agenda',
    value: '3 rendez-vous aujourd’hui',
    meta: 'le premier à 9 h 30',
    accent: 'accent',
    prompt: 'Montre mon agenda du jour',
    when: ['morning', 'afternoon'],
    active: true,
  },
  {
    id: 'weather',
    priority: 'info',
    icon: '🌤️',
    label: 'Météo',
    value: '18° · Ensoleillé',
    meta: 'toute la journée',
    accent: 'info',
    prompt: 'Quelle est la météo aujourd’hui ?',
    when: ['morning', 'afternoon'],
    active: true,
  },
  {
    id: 'backup-morning',
    priority: 'info',
    icon: '💾',
    label: 'Sauvegarde',
    value: 'Terminée cette nuit',
    meta: 'à 03:30, sans erreur',
    accent: 'backup',
    prompt: 'Détaille la sauvegarde de cette nuit',
    when: ['morning'],
    active: true,
  },
  {
    id: 'photos',
    priority: 'normal',
    icon: '📷',
    label: 'Photos du jour',
    value: '148 nouvelles',
    meta: 'surtout cet après-midi',
    accent: 'vision',
    prompt: 'Montre les photos de la journée',
    when: ['afternoon', 'evening'],
    active: true,
  },
  {
    id: 'media',
    priority: 'normal',
    icon: '🎬',
    label: 'À reprendre',
    value: 'The Last of Us',
    meta: 'S1 · E5 — 23 min restantes',
    accent: 'media',
    prompt: 'Reprends The Last of Us',
    when: ['afternoon', 'evening'],
    active: true,
  },
  {
    id: 'backup-evening',
    priority: 'info',
    icon: '💾',
    label: 'Sauvegarde',
    value: 'Terminée avec succès',
    meta: 'aujourd’hui',
    accent: 'backup',
    prompt: 'Détaille la dernière sauvegarde',
    when: ['evening'],
    active: true,
  },
  {
    id: 'server',
    priority: 'info',
    icon: '🖥️',
    label: 'Serveur',
    value: 'Actif depuis 17 jours',
    meta: 'tous les services répondent',
    accent: 'monitor',
    prompt: 'Quel est l’état du serveur ?',
    when: ['night'],
    active: true,
  },
  // Alerte — **inactive** par défaut (le disque va bien). Le mécanisme existe :
  // active → elle remonte en tête (priorité haute) et remplace une carte normale.
  {
    id: 'disk-alert',
    priority: 'high',
    icon: '⚠️',
    label: 'Stockage',
    value: 'Disque bientôt plein',
    meta: '92 % utilisés',
    accent: 'drive',
    prompt: 'Que faire pour libérer de l’espace ?',
    when: ['morning', 'afternoon', 'evening', 'night'],
    active: false,
  },
];

/** Suggestions **contextuelles** (au plus 3) — elles aussi évoluent. */
const SUGGESTIONS_BY_PART: Record<PartOfDay, Suggestion[]> = {
  morning: [
    { id: 'sg-agenda', icon: '🗓️', label: 'Voir mon agenda', prompt: 'Montre mon agenda du jour' },
    {
      id: 'sg-weather',
      icon: '🌤️',
      label: 'La météo aujourd’hui',
      prompt: 'Quelle est la météo ?',
    },
  ],
  afternoon: [
    {
      id: 'sg-photos',
      icon: '📷',
      label: 'Voir les photos du jour',
      prompt: 'Montre les photos de la journée',
    },
    { id: 'sg-home', icon: '🏠', label: 'Vérifier la maison', prompt: 'Vérifie la maison' },
  ],
  evening: [
    { id: 'sg-film', icon: '🎬', label: 'Reprendre ton film', prompt: 'Reprends The Last of Us' },
    {
      id: 'sg-photos',
      icon: '📷',
      label: 'Voir les photos du jour',
      prompt: 'Montre les photos de la journée',
    },
    { id: 'sg-home', icon: '🏠', label: 'Vérifier la maison', prompt: 'Vérifie la maison' },
  ],
  night: [{ id: 'sg-home', icon: '🏠', label: 'Vérifier la maison', prompt: 'Vérifie la maison' }],
};

/** Mémoire (continuité). Sert la « prise de parole » différée. */
const MEMORY: MemoryFact[] = [
  {
    id: 'photos-backup',
    icon: '💾',
    text: 'Cela fait 3 jours que tes nouvelles photos ne sont pas sauvegardées.',
    action: 'Sauvegarder',
    prompt: 'Sauvegarde mes photos maintenant',
  },
  {
    id: 'reminder-doc',
    icon: '📄',
    text: 'Tu m’avais demandé de te rappeler le document « bail ».',
    action: 'Ouvrir',
    prompt: 'Ouvre le document « bail »',
  },
  {
    id: 'film',
    icon: '🎬',
    text: 'Hier soir, tu avais laissé The Last of Us en pause.',
    action: 'Reprendre',
    prompt: 'Reprends The Last of Us',
  },
];

function headlineFor(part: PartOfDay, cards: HomeCard[]): string {
  if (cards.some((c) => c.priority === 'high')) return 'Un point mérite ton attention.';
  switch (part) {
    case 'morning':
      return 'Voici l’essentiel pour bien commencer.';
    case 'afternoon':
      return 'Voici où en est ta journée.';
    case 'evening':
      return cards.some((c) => c.id === 'media')
        ? 'Ta soirée est prête — tu avais laissé un film en cours.'
        : 'Voici ta fin de journée.';
    case 'night':
      return 'Tout est calme. Repose-toi, je veille.';
  }
}

/** Choisit une continuité qui **complète** (n'apparaît pas déjà en carte). */
function nudgeFor(part: PartOfDay, cards: HomeCard[]): MemoryFact | undefined {
  if (part === 'night') return undefined;
  const shown = new Set(cards.map((c) => c.id));
  return MEMORY.find((m) => !shown.has(m.id)) ?? MEMORY[0];
}

/**
 * La curation : à partir de l'heure, produit **peu** de cartes, classées par
 * importance, avec la voix de KAI et une éventuelle continuité. `now` est
 * injectable pour les tests.
 */
export function curateHome(now: Date = new Date()): HomeState {
  const part = partOfDay(now.getHours());
  const greeting = greetingFor(part);

  // La nuit, KevinOS respire : une seule carte au plus.
  const cap = part === 'night' ? 1 : 3;

  const cards: HomeCard[] = SIGNALS.filter((s) => s.active && s.when.includes(part))
    .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority])
    .slice(0, cap)
    .map(({ when: _when, active: _active, ...card }) => card);

  const calm = !cards.some((c) => c.priority === 'high' || c.priority === 'normal');
  const nudge = nudgeFor(part, cards);

  return {
    greeting,
    headline: headlineFor(part, cards),
    cards,
    suggestions: SUGGESTIONS_BY_PART[part].slice(0, 3),
    calm,
    ...(nudge ? { nudge } : {}),
  };
}
