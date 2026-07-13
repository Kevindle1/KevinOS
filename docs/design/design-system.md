# KOS Design System (KDS)

> Le langage visuel de KevinOS, partagé par **tous** les modules KOS
> ([ADR-0013](../adr/ADR-0013-design-system-proprietaire.md)). **Token-first** :
> une seule source de vérité, thème clair/sombre au niveau des tokens. Moteur :
> **Tailwind** (piloté par ces tokens). Offline : polices & icônes packagées.

---

## 1. Fondations de marque

- **Sombre par défaut** (sensation « OS », sérénité), **clair** pris en charge à
  parité.
- **Monochrome + un accent** : l'interface est essentiellement neutre ; la couleur
  = du **sens** (accent système, accent de module, statut).
- **Signature KevinOS** : un **teal** discret (`--accent`) pour les actions
  primaires, l'état actif et le focus. Chaque **module** ajoute son accent propre
  (badging, graphes), jamais pour le chrome système.

## 2. Couleur — tokens sémantiques

> On ne référence **jamais** une couleur brute dans un composant : uniquement des
> tokens sémantiques. Valeurs de référence ci-dessous (ajustables globalement).

### Thème sombre (défaut)

| Token                | Valeur                  | Usage                               |
| -------------------- | ----------------------- | ----------------------------------- |
| `--bg`               | `#0A0B0D`               | fond de l'application               |
| `--surface`          | `#121317`               | cartes, panneaux                    |
| `--surface-elevated` | `#1A1C22`               | surfaces au-dessus (menus, modales) |
| `--surface-hover`    | `#202329`               | survol de surface                   |
| `--border`           | `rgba(255,255,255,.08)` | séparateurs, contours de carte      |
| `--border-strong`    | `rgba(255,255,255,.14)` | contours accentués                  |
| `--text`             | `#F5F6F7`               | texte principal                     |
| `--text-secondary`   | `#A8ADB7`               | texte secondaire                    |
| `--text-muted`       | `#6B7280`               | texte tertiaire / désactivé         |

### Thème clair

| Token                | Valeur               |
| -------------------- | -------------------- |
| `--bg`               | `#F6F7F9`            |
| `--surface`          | `#FFFFFF`            |
| `--surface-elevated` | `#FFFFFF`            |
| `--surface-hover`    | `#F1F3F5`            |
| `--border`           | `rgba(12,14,18,.08)` |
| `--border-strong`    | `rgba(12,14,18,.14)` |
| `--text`             | `#14161A`            |
| `--text-secondary`   | `#4A5059`            |
| `--text-muted`       | `#8A9099`            |

### Accent système (signature) & statuts (identiques aux 2 thèmes)

| Token             | Valeur                 | Usage                           |
| ----------------- | ---------------------- | ------------------------------- |
| `--accent`        | `#2FBEB4`              | actions primaires, actif, focus |
| `--accent-hover`  | `#3ACFC4`              | survol de l'accent              |
| `--accent-subtle` | `rgba(47,190,180,.14)` | fonds d'accent, halos           |
| `--on-accent`     | `#04211F`              | texte/icône sur fond accent     |
| `--success`       | `#34C759`              | succès / OK                     |
| `--warning`       | `#FFB020`              | attention                       |
| `--danger`        | `#F04438`              | erreur / destructif             |
| `--info`          | `#4C8DFF`              | information                     |

### Accents par module KOS (badging, graphes — jamais le chrome)

| Module             | Token           | Valeur    |
| ------------------ | --------------- | --------- |
| 📷 KOS Vision      | `--kos-vision`  | `#F4B740` |
| 🎬 KOS Media       | `--kos-media`   | `#8B7CF6` |
| 📁 KOS Drive       | `--kos-drive`   | `#4C8DFF` |
| 🏠 KOS Home        | `--kos-home`    | `#43C59E` |
| 🧠 KAI / KOS Brain | `--kos-brain`   | `#2FBEB4` |
| 📊 KOS Monitor     | `--kos-monitor` | `#F58A45` |
| 🌐 KOS Network     | `--kos-network` | `#56B6E9` |
| 🔐 KOS Vault       | `--kos-vault`   | `#7C89F6` |
| 💾 KOS Backup      | `--kos-backup`  | `#94A3B8` |

> **Contraste** : toute paire texte/fond respecte AA (≥ 4.5:1 texte courant). Les
> accents servent d'**accent**, pas de fond de texte long.

## 3. Typographie

- **Police UI** : **Inter** (variable, self-hosted via `@fontsource/inter`),
  fallback `system-ui, -apple-system, Segoe UI, Roboto, sans-serif`.
- **Police mono** : **JetBrains Mono** (chiffres, mesures, labels techniques —
  détail « Nothing »), fallback `ui-monospace, SFMono-Regular, monospace`.
- **Chiffres tabulaires** (`font-variant-numeric: tabular-nums`) pour les stats.

| Rôle          | Taille / interligne   | Poids                                                 |
| ------------- | --------------------- | ----------------------------------------------------- |
| Display       | 32 / 40 (clamp 28→36) | 600                                                   |
| Titre 1       | 24 / 32               | 600                                                   |
| Titre 2       | 20 / 28               | 600                                                   |
| Titre 3       | 16 / 24               | 600                                                   |
| Corps         | 16 / 24               | 400                                                   |
| Corps fort    | 16 / 24               | 500                                                   |
| Petit         | 14 / 20               | 400/500                                               |
| Légende       | 13 / 18               | 500                                                   |
| Micro / label | 12 / 16               | 600, `letter-spacing: .02em`, souvent mono/majuscules |

Règles : **une seule** taille de titre dominante par écran ; corps à 16 px
minimum ; longueur de ligne confortable (~60-75 caractères).

## 4. Espacement — grille 8 pt

Échelle (token → px) : `1→4`, `2→8`, `3→12`, `4→16`, `5→20`, `6→24`, `8→32`,
`10→40`, `12→48`, `16→64`, `20→80`.

- Padding interne de carte : `6` (24) desktop, `4` (16) mobile.
- Gouttière de grille : `4`–`6`.
- Respiration entre sections : `10`–`16`.
- **Le vide est voulu** : on n'ajoute pas de contenu pour « remplir ».

## 5. Rayons, contours, profondeur

| Token           | Valeur  | Usage                   |
| --------------- | ------- | ----------------------- |
| `--radius-sm`   | 8 px    | puces, champs compacts  |
| `--radius-md`   | 12 px   | boutons, inputs         |
| `--radius-lg`   | 16 px   | cartes                  |
| `--radius-xl`   | 20 px   | grandes cartes, modales |
| `--radius-2xl`  | 28 px   | conteneurs héros        |
| `--radius-full` | 9999 px | pastilles, avatars      |

**Profondeur** = surface plus claire + contour subtil + ombre douce (pas de gros
drop-shadow). En sombre, un léger **halo** d'accent peut marquer l'élément actif.

| Token          | Valeur                                                    |
| -------------- | --------------------------------------------------------- |
| `--shadow-1`   | `0 1px 2px rgba(0,0,0,.30)`                               |
| `--shadow-2`   | `0 6px 20px rgba(0,0,0,.35)`                              |
| `--shadow-3`   | `0 16px 48px rgba(0,0,0,.45)`                             |
| `--focus-ring` | `0 0 0 3px var(--accent-subtle), 0 0 0 1px var(--accent)` |

## 6. Motion

- **Durées** : `--dur-instant 80ms`, `--dur-fast 140ms`, `--dur-base 200ms`,
  `--dur-slow 320ms`.
- **Courbes** : `--ease-out cubic-bezier(.2,0,0,1)` (standard),
  `--ease-emph cubic-bezier(.3,0,0,1)` (entrées marquées), `--ease-spring` (rebond
  discret pour éléments joueurs).
- **Patterns** :
  - _Entrée d'élément_ : fade + translation 8 px (`--dur-base`, `--ease-out`).
  - _Overlay / palette_ : scale 0.98→1 + fade (`--dur-fast`).
  - _Changement de vue_ : cross-fade 200 ms, pas de glissement brutal.
  - _Feedback pressé_ : scale 0.98 immédiat (`--dur-instant`).
- **Toujours** : `@media (prefers-reduced-motion: reduce)` → animations réduites à
  un simple fade, ou supprimées.

## 7. Iconographie

- **Icônes fonctionnelles** : **Lucide** (stroke 1.5 px, tailles 16/20/24),
  monochromes, alignées sur `--text-secondary` (ou `--accent` si actif).
- **Marqueurs d'identité de module** : les **emojis KOS** (📷🎬📁🏠🧠📊🌐) — signe
  de marque, distincts des icônes d'action. Utilisés dans le rail et les cartes de
  module.
- Jamais d'icône seule sans libellé accessible (aria-label).

## 8. Inventaire de composants (`@kevinos/ui`)

> Chaque composant est **sans état visuel « en dur »** : il consomme les tokens.
> États standard à couvrir : `default · hover · focus-visible · active ·
disabled · loading`.

| Composant                        | Rôle                                  | Notes clés                                                                             |
| -------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------- |
| **AppShell**                     | Rail + TopBar + zone contenu          | responsive (rail ↔ barre basse)                                                        |
| **NavRail / NavRailItem**        | navigation spatiale                   | icône + emoji module + libellé, état actif (halo accent)                               |
| **TopBar**                       | recherche globale, KAI, profil, thème | `⌘K` visible, cloche notifications                                                     |
| **Button**                       | action                                | variantes `primary · secondary · ghost · danger`, tailles `sm · md · lg`, état loading |
| **IconButton**                   | action compacte                       | cible ≥ 44 px, tooltip                                                                 |
| **Card**                         | conteneur générique                   | radius-lg, `--surface`, contour `--border`                                             |
| **ModuleCard**                   | carte d'un module KOS                 | emoji + nom + statut + 1 info vive + accent module                                     |
| **StatTile**                     | chiffre glanceable                    | valeur mono/tabulaire + label + delta                                                  |
| **SearchInput / CommandPalette** | recherche globale + actions           | overlay `⌘K`, groupes de résultats, navigation clavier                                 |
| **KaiLauncher / KaiBubble**      | invoquer KAI partout                  | pastille discrète + surface de conversation                                            |
| **ListRow**                      | ligne de liste/activité               | icône + titre + méta + action, densité unique                                          |
| **Chip / Tag**                   | filtre, statut léger                  | radius-full                                                                            |
| **StatusDot / Badge**            | état (up/warn/down)                   | couleurs statut, `aria-label`                                                          |
| **Toggle / Switch**              | booléen                               | piste + pouce, focus ring                                                              |
| **SegmentedControl**             | choix exclusif                        | 2-4 segments                                                                           |
| **Toast**                        | feedback bref                         | discret, action « Annuler », auto-dismiss, `aria-live`                                 |
| **Skeleton**                     | chargement                            | remplace le contenu, pas de spinner plein écran                                        |
| **EmptyState**                   | vide utile                            | message + action, jamais de cul-de-sac                                                 |
| **Modal / Sheet**                | focus temporaire                      | scale+fade, `Échap` ferme, piège de focus                                              |
| **Tooltip**                      | aide au survol/focus                  | jamais porteur d'info essentielle                                                      |
| **Avatar**                       | identité utilisateur                  | initiales / image, radius-full                                                         |

## 9. Accessibilité (intégrée aux composants)

- Contraste **AA** garanti par les tokens texte/surface.
- **Focus visible** systématique (`--focus-ring`), jamais retiré.
- **Clavier** : tab-order logique, `⌘K` global, `Échap` ferme overlays, flèches
  dans les listes/palette.
- **ARIA** : rôles corrects (`dialog`, `listbox`, `switch`…), `aria-live` pour
  toasts/notifications, libellés explicites.
- **Cibles** ≥ 44 px ; **texte** ≥ 16 px pour le corps.
- **`prefers-reduced-motion`** respecté par tout composant animé.

## 10. Implémentation (référence — au moment du code)

Tokens exposés en **CSS custom properties** puis mappés dans `tailwind.config` :

```css
:root {
  --bg: #0a0b0d;
  --surface: #121317;
  --surface-elevated: #1a1c22;
  --surface-hover: #202329;
  --border: #ffffff14;
  --border-strong: #ffffff24;
  --text: #f5f6f7;
  --text-secondary: #a8adb7;
  --text-muted: #6b7280;
  --accent: #2fbeb4;
  --accent-hover: #3acfc4;
  --accent-subtle: #2fbeb424;
  --on-accent: #04211f;
  --success: #34c759;
  --warning: #ffb020;
  --danger: #f04438;
  --info: #4c8dff;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --dur-base: 200ms;
  --ease-out: cubic-bezier(0.2, 0, 0, 1);
}
:root[data-theme='light'] {
  --bg: #f6f7f9;
  --surface: #fff;
  --surface-elevated: #fff;
  --surface-hover: #f1f3f5;
  --border: #0c0e1214;
  --border-strong: #0c0e1224;
  --text: #14161a;
  --text-secondary: #4a5059;
  --text-muted: #8a9099;
}
```

```js
// tailwind.config — extrait : Tailwind ne fait que référencer nos tokens.
export default {
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        accent: 'var(--accent)',
        text: 'var(--text)',
        'text-secondary': 'var(--text-secondary)' /* … */,
      },
      borderRadius: { md: 'var(--radius-md)', lg: 'var(--radius-lg)', xl: 'var(--radius-xl)' },
      transitionTimingFunction: { out: 'cubic-bezier(.2,0,0,1)' },
    },
  },
};
```

> Le thème bascule en changeant `data-theme` sur `:root` — **aucun** composant ne
> connaît « clair » ou « sombre », seulement des tokens.

---

_Mise en page de ces composants : [wireframes.md](wireframes.md). Principes :
[ux-ui-charter.md](ux-ui-charter.md)._
