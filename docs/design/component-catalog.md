# Catalogue des composants `@kevinos/ui`

> La plateforme UI de KevinOS ([ADR-0014](../adr/ADR-0014-ui-platform.md)).
> Construite par **vagues**, chaque composant livré avec ses **6 livrables**
> (doc, exemples, états interactifs, a11y, tests, rendu). Le Dashboard n'est
> développé qu'une fois la bibliothèque mûre.

**Statut** : ✅ livré (6/6) · 🟡 en cours · ⬜ à faire

---

## Avancement

| Vague | Thème                 | État        |
| ----: | --------------------- | ----------- |
|     1 | Primitives & feedback | 🟡 en cours |
|     2 | Formulaires           | ⬜          |
|     3 | Layout                | ⬜          |
|     4 | Navigation            | ⬜          |
|     5 | Données               | ⬜          |
|     6 | Dialogues & overlays  | ⬜          |
|     7 | Médias                | ⬜          |
|     8 | États                 | ⬜          |
|     9 | KAI                   | ⬜          |
|    10 | Monitoring            | ⬜          |
|    11 | Maison                | ⬜          |

---

## Vague 1 — Primitives & feedback

| Composant         | Rôle                                           | État |
| ----------------- | ---------------------------------------------- | ---- |
| `Button`          | action (variants/tailles/loading)              | ✅   |
| `Card`            | conteneur de base                              | ✅   |
| `Badge`           | statut compact (pastille)                      | ✅   |
| `Tag`             | étiquette (optionnellement supprimable)        | ✅   |
| `StatusIndicator` | point + libellé d'état (up/warn/down)          | ✅   |
| `Spinner`         | indicateur de chargement circulaire            | ✅   |
| `Skeleton`        | placeholder de chargement                      | ✅   |
| `Progress`        | barre de progression (déterminée/indéterminée) | ✅   |
| `Banner`          | message inline (info/succès/alerte/erreur)     | ✅   |
| `Toast`           | feedback bref, empilable, auto-dismiss         | ⬜   |
| `Tooltip`         | aide au survol/focus                           | ⬜   |

## Vague 2 — Formulaires

`Input` ⬜ · `Textarea` ⬜ · `Select` ⬜ · `Switch` ⬜ · `Checkbox` ⬜ ·
`Radio` ⬜ · `Slider` ⬜ · `FilePicker` ⬜

## Vague 3 — Layout

`AppShell` ⬜ · `Sidebar` ⬜ · `NavigationRail` ⬜ · `TopBar` ⬜ · `BottomBar` ⬜ ·
`ContentLayout` ⬜ · `SplitView` ⬜ · `ScrollArea` ⬜

## Vague 4 — Navigation

`NavigationItem` ⬜ · `Breadcrumb` ⬜ · `Tabs` ⬜ · `SearchInput` ⬜ ·
`SearchBar` ⬜ · `CommandPalette` ⬜ · `ModuleCard` ⬜ · `ModuleGrid` ⬜

## Vague 5 — Données

`StatTile` ⬜ · `MetricCard` ⬜ · `ActivityCard` ⬜ · `Timeline` ⬜ · `Table` ⬜ ·
`DataGrid` ⬜

## Vague 6 — Dialogues & overlays

`Modal` ⬜ · `Drawer` ⬜ · `Popover` ⬜ · `ContextMenu` ⬜

## Vague 7 — Médias

`Thumbnail` ⬜ · `PhotoCard` ⬜ · `AlbumCard` ⬜ · `MediaCard` ⬜ · `Viewer` ⬜ ·
`Lightbox` ⬜

## Vague 8 — États

`EmptyState` ⬜ · `LoadingState` ⬜ · `ErrorState` ⬜

## Vague 9 — KAI

`ChatBubble` ⬜ · `PromptInput` ⬜ · `Conversation` ⬜ · `SuggestionCard` ⬜ ·
`AIResponse` ⬜ · `ThinkingIndicator` ⬜

## Vague 10 — Monitoring

`Gauge` ⬜ · `GraphCard` ⬜ · `LogViewer` ⬜ · `ServiceCard` ⬜
_(`StatusIndicator` fourni en vague 1)_

## Vague 11 — Maison

`CameraCard` ⬜ · `DeviceCard` ⬜ · `RoomCard` ⬜ · `AutomationCard` ⬜

---

## Les 6 livrables par composant (rappel — ADR-0014)

1. **Documentation** (JSDoc : rôle, props, usage)
2. **Exemples** (story dans la démo)
3. **États interactifs** (variants/hover/focus/disabled/loading)
4. **Accessibilité** (bloc A11y + rôles/ARIA/focus + tests)
5. **Tests unitaires** (`*.test.tsx`)
6. **Rendu visuel** (via l'environnement de démo)
