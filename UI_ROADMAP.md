# UI Roadmap — `@kevinos/ui`

> Suivi de la plateforme UI, **organisée par expériences** (pas par catégories
> techniques — [ADR-0016](docs/adr/ADR-0016-plateforme-experience.md)). Chaque
> vague permet de construire **immédiatement un morceau concret de KevinOS**.
>
> **Mantra :** _KevinOS ne remplace pas les meilleurs outils. Il les orchestre
> pour offrir une seule expérience._

## Légende

- **Statut** : ⬜ à faire · 🟡 en cours · ✅ prêt (5 livrables : doc, tests, story
  Lab, variantes, a11y validée — [ADR-0015](docs/adr/ADR-0015-kos-design-lab.md)).
- **Maturité** : `idée` → `spec` → `bêta` → `stable`.
- **Modules** : les compétences KOS qui consomment le composant.

> Un composant n'est **utilisable** dans un module qu'une fois **✅** (validé dans
> le [KOS Design Lab](apps/design-lab/README.md)). Le Dashboard ne crée jamais de
> composant : il assemble ceux-ci.

---

## Vague 1 — Primitives & feedback ✅ (livrée)

| Composant       | Statut | Description                       | Modules                  | Tests | Doc | Lab | Maturité |
| --------------- | :----: | --------------------------------- | ------------------------ | :---: | :-: | :-: | -------- |
| Button          |   ✅   | Action (variants/tailles/loading) | tous                     |  ✅   | ✅  | ✅  | stable   |
| Card            |   ✅   | Conteneur de base                 | tous                     |  ✅   | ✅  | ✅  | stable   |
| Badge           |   ✅   | Statut compact                    | tous                     |  ✅   | ✅  | ✅  | stable   |
| Tag             |   ✅   | Étiquette supprimable             | Vision, Drive            |  ✅   | ✅  | ✅  | stable   |
| StatusIndicator |   ✅   | État up/warn/down                 | Dashboard, Monitor, Home |  ✅   | ✅  | ✅  | stable   |
| Spinner         |   ✅   | Chargement circulaire             | tous                     |  ✅   | ✅  | ✅  | stable   |
| Skeleton        |   ✅   | Placeholder de chargement         | tous                     |  ✅   | ✅  | ✅  | stable   |
| Progress        |   ✅   | Barre de progression              | Dashboard, Drive         |  ✅   | ✅  | ✅  | stable   |
| Banner          |   ✅   | Message inline                    | tous                     |  ✅   | ✅  | ✅  | stable   |

---

## Vague 2 — Foundation ⬜ (à venir — **prochaine**)

> Les composants fondamentaux utilisés **partout**. Base de toute l'interface.

| Composant   | Statut | Description                                | Modules                | Maturité |
| ----------- | :----: | ------------------------------------------ | ---------------------- | -------- |
| Input       |   ⬜   | Champ texte (contrôlé/non-contrôlé, états) | tous                   | idée     |
| SearchInput |   ⬜   | Champ de recherche (icône, effacement)     | Dashboard, Vision, KAI | idée     |
| Textarea    |   ⬜   | Saisie multiligne (auto-grow)              | KAI, Drive             | idée     |
| ButtonGroup |   ⬜   | Groupe de boutons / segments               | tous                   | idée     |
| Select      |   ⬜   | Liste déroulante accessible                | tous                   | idée     |
| Checkbox    |   ⬜   | Case à cocher                              | Réglages, Drive        | idée     |
| Switch      |   ⬜   | Bascule booléenne                          | Réglages, Home         | idée     |
| Radio       |   ⬜   | Choix exclusif                             | Réglages               | idée     |
| Tooltip     |   ⬜   | Aide au survol/focus                       | tous                   | idée     |
| Popover     |   ⬜   | Panneau flottant ancré                     | tous                   | idée     |
| Avatar      |   ⬜   | Identité (initiales/image)                 | Dashboard, KAI, Vision | idée     |
| IconButton  |   ⬜   | Action compacte (cible ≥ 44px)             | tous                   | idée     |
| Divider     |   ⬜   | Séparateur                                 | tous                   | idée     |
| ScrollArea  |   ⬜   | Zone défilable stylée                      | tous                   | idée     |
| _(Badge)_   |   ✅   | _déjà livré (vague 1)_                     | tous                   | stable   |

**Résultat concret** : formulaires, recherche et réglages deviennent possibles.

---

## Vague 3 — Dashboard ⬜

> Une fois cette vague finie, le Dashboard se construit **uniquement par
> assemblage**.

| Composant           | Statut | Description                                         | Modules            |
| ------------------- | :----: | --------------------------------------------------- | ------------------ |
| ModuleCard          |   ⬜   | Carte d'une compétence KOS (emoji, état, info vive) | Dashboard          |
| StatTile            |   ⬜   | Chiffre glanceable (mono, delta)                    | Dashboard, Monitor |
| MetricCard          |   ⬜   | Métrique + mini-graphe                              | Dashboard, Monitor |
| ActivityCard        |   ⬜   | Élément d'activité récente                          | Dashboard          |
| NotificationCard    |   ⬜   | Notification actionnable                            | Dashboard          |
| ServiceCard         |   ⬜   | État d'un service                                   | Dashboard, Monitor |
| QuickAction         |   ⬜   | Raccourci d'action                                  | Dashboard, KAI     |
| SearchBar           |   ⬜   | Barre de recherche globale (déclenche ⌘K)           | Dashboard          |
| CommandPalette      |   ⬜   | Recherche + actions (⌘K), clavier                   | Dashboard, KAI     |
| _(StatusIndicator)_ |   ✅   | _déjà livré (vague 1)_                              | Dashboard          |

**Résultat concret** : l'**Accueil de KevinOS** (assemblage).

---

## Vague 4 — KAI ⬜

> À la fin, on peut développer l'interface de **KAI** (le point d'entrée).

| Composant         | Statut | Description                                 | Modules        |
| ----------------- | :----: | ------------------------------------------- | -------------- |
| Conversation      |   ⬜   | Fil de conversation (scroll, groupes)       | KAI            |
| ChatBubble        |   ⬜   | Bulle utilisateur / assistant               | KAI            |
| PromptInput       |   ⬜   | Saisie (texte/voix), envoi, raccourcis      | KAI            |
| SuggestionCard    |   ⬜   | Suggestion proposée par KAI                 | KAI, Dashboard |
| ThinkingIndicator |   ⬜   | KAI réfléchit (discret)                     | KAI            |
| AIResponse        |   ⬜   | Réponse riche (texte + cartes actionnables) | KAI            |
| Citation          |   ⬜   | Source d'une réponse (traçabilité)          | KAI            |
| ActionSuggestion  |   ⬜   | Action exécutable proposée par KAI          | KAI            |

**Résultat concret** : l'écran d'accueil **KAI-first**.

---

## Vague 5 — KOS Vision (photos) ⬜

| Composant    | Statut | Description                        | Modules       |
| ------------ | :----: | ---------------------------------- | ------------- |
| PhotoCard    |   ⬜   | Vignette photo (favori, sélection) | Vision        |
| AlbumCard    |   ⬜   | Couverture d'album                 | Vision        |
| Timeline     |   ⬜   | Grille chronologique (par mois)    | Vision        |
| Viewer       |   ⬜   | Visionneuse plein écran            | Vision        |
| Lightbox     |   ⬜   | Overlay média (swipe, infos)       | Vision, Media |
| MapViewer    |   ⬜   | Carte des photos géolocalisées     | Vision        |
| FaceCard     |   ⬜   | Personne reconnue                  | Vision        |
| MemoriesCard |   ⬜   | Souvenir (« il y a un an »)        | Vision        |

**Résultat concret** : **KOS Vision** = assemblage de ces composants (moteur Immich caché).

---

## Vague 6 — KOS Media (films & séries) ⬜

| Composant        | Statut | Description           | Modules          |
| ---------------- | :----: | --------------------- | ---------------- |
| MovieCard        |   ⬜   | Affiche de film       | Media            |
| SeriesCard       |   ⬜   | Affiche de série      | Media            |
| EpisodeCard      |   ⬜   | Épisode (progression) | Media            |
| PlayerOverlay    |   ⬜   | Contrôles de lecture  | Media            |
| ContinueWatching |   ⬜   | Reprendre la lecture  | Media, Dashboard |
| CollectionCard   |   ⬜   | Collection / genre    | Media            |
| MediaInfo        |   ⬜   | Fiche détaillée       | Media            |

---

## Vague 7 — KOS Home (domotique) ⬜

| Composant      | Statut | Description                    | Modules         |
| -------------- | :----: | ------------------------------ | --------------- |
| DeviceCard     |   ⬜   | Appareil (état, action)        | Home            |
| CameraCard     |   ⬜   | Flux caméra                    | Home            |
| RoomCard       |   ⬜   | Pièce (regroupe des appareils) | Home            |
| AutomationCard |   ⬜   | Scénario d'automatisation      | Home            |
| EnergyCard     |   ⬜   | Consommation d'énergie         | Home, Dashboard |

---

## Cadence de développement

On **alterne** (Règle 0) : enrichir `@kevinos/ui` ↔ livrer un **module fonctionnel**
utilisable. Après la Vague 2 (Foundation) et la Vague 3 (Dashboard), on assemble le
**premier Accueil** ; après la Vague 4, l'**expérience KAI** ; après la Vague 5,
**KOS Vision**. Le produit reste vivant à chaque étape.
