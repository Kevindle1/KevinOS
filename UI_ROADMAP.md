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

## Vague 2 — Foundation ✅ (livrée)

> Les composants fondamentaux utilisés **partout**. Base de toute l'interface.
> Fondation formulaire commune : **contrôlé/non-contrôlé**, **validation/erreur/
> aide/a11y** intégrées ([ADR-0017](docs/adr/ADR-0017-principes-conception-composants.md)).

**Sous-lot 1 — champs & saisie** ✅ (livré, testé, dans le Design Lab)

| Composant   | Statut | Description                                                   | Modules                         | Tests | Doc | Lab | Maturité |
| ----------- | :----: | ------------------------------------------------------------- | ------------------------------- | :---: | :-: | :-: | -------- |
| Input       |   ✅   | Champ texte (contrôlé/non-contrôlé, ornements, états)         | tous                            |  ✅   | ✅  | ✅  | stable   |
| SearchInput |   ✅   | **Recherche stratégique** (effacement, Entrée/Échap, loading) | KAI, Vision, Media, Drive, Home |  ✅   | ✅  | ✅  | stable   |
| Textarea    |   ✅   | Saisie multiligne (auto-grow)                                 | KAI, Drive                      |  ✅   | ✅  | ✅  | stable   |
| Select      |   ✅   | Liste déroulante (native, a11y/mobile)                        | tous                            |  ✅   | ✅  | ✅  | stable   |
| Checkbox    |   ✅   | Case à cocher (indéterminé)                                   | Réglages, Drive                 |  ✅   | ✅  | ✅  | stable   |
| Switch      |   ✅   | Bascule (`role=switch`)                                       | Réglages, Home                  |  ✅   | ✅  | ✅  | stable   |
| Radio       |   ✅   | Choix exclusif (`RadioGroup`)                                 | Réglages                        |  ✅   | ✅  | ✅  | stable   |
| ButtonGroup |   ✅   | Segmenté à choix unique                                       | tous                            |  ✅   | ✅  | ✅  | stable   |

**Sous-lot 2 — surfaces & primitives** ✅ (livré, testé, dans le Design Lab)

| Composant  | Statut | Description                                       | Modules           | Tests | Doc | Lab | Maturité |
| ---------- | :----: | ------------------------------------------------- | ----------------- | :---: | :-: | :-: | -------- |
| Tooltip    |   ✅   | Aide au survol/focus (**moteur Floating UI**)     | tous              |  ✅   | ✅  | ✅  | stable   |
| Popover    |   ✅   | Panneau flottant ancré (Floating UI, focus piégé) | tous              |  ✅   | ✅  | ✅  | stable   |
| Avatar     |   ✅   | Identité (initiales/image)                        | Home, KAI, Vision |  ✅   | ✅  | ✅  | stable   |
| IconButton |   ✅   | Action compacte (cible ≥ 44px)                    | tous              |  ✅   | ✅  | ✅  | stable   |
| Divider    |   ✅   | Séparateur (h/v, label)                           | tous              |  ✅   | ✅  | ✅  | stable   |
| ScrollArea |   ✅   | Zone défilable discrète                           | tous              |  ✅   | ✅  | ✅  | stable   |

> Positionnement délégué à **Floating UI** (Règle 8 / [ADR-0018](docs/adr/ADR-0018-ne-pas-reinventer.md)) —
> le composant reste 100 % KevinOS (design, API, a11y).

**Résultat concret** : formulaires, recherche et réglages sont désormais **possibles
par simple assemblage**.

---

## Vague 3 — Home (l'accueil KAI-first) 🟡 (en construction, par itérations)

> On arrête de penser « Dashboard » : le premier écran est **Home**, centré sur
> KAI ([ADR-0017](docs/adr/ADR-0017-principes-conception-composants.md)).
>
> **Nouvelle cadence (2026-07-13, Règle 0)** : la Foundation est mûre, on
> **construit désormais le produit**. Home est développé **par itérations** —
> chaque itération produit un **écran réellement utilisable**. On n'enrichit
> `@kevinos/ui` **que lorsqu'une itération l'exige** (composant manquant → créé
> avec doc/tests/Design Lab/a11y → retour immédiat à Home). **Home pilote l'UI.**

**Itération 1 — l'accueil KAI-first ✅** (`apps/home`) : « Bonjour Kevin 👋 /
Comment puis-je t'aider aujourd'hui ? », zone de conversation (KAI **simulé**),
suggestions, thème clair/sombre. Composant créé à la demande : **`PromptInput`**.

**Itération 2 — KevinOS vivant ✅** (Règle 9) : présence de KAI (orbe qui respire,
halo discret), **salut contextuel** qui **raconte** la journée, **cartes d'aperçu**
simulées (photos, média, sauvegarde, serveur, météo, stockage, maison), suggestions
intelligentes, apparition **progressive**, réponses de KAI **écrites**. Composants
créés à la demande : **primitives de mouvement**, **`InsightCard`**, **`TypingText`**.

**Itération 3 — la curation ✅** (Règle 9, [HOME_EXPERIENCE](HOME_EXPERIENCE.md)
P8–P10) : KAI ne montre que **l'essentiel maintenant** (≤ 3 cartes, jamais un mur),
classé par **importance**, **évoluant** selon le moment ; **respiration** (calme →
KevinOS « prend la parole ») ; **mémoire** (continuité). Moteur `curateHome` **testé** ;
`InsightCard` gagne `emphasis`.

Itérations suivantes (au fil du besoin) : affiner la curation et la « prise de
parole » (vrais événements), mémoire persistante, accès rapide aux modules —
chacune n'ajoutant à `@kevinos/ui` que le strict nécessaire.

| Composant           | Statut | Description                                         | Modules            |
| ------------------- | :----: | --------------------------------------------------- | ------------------ |
| InsightCard         |   ✅   | Carte glanceable actionnable (icône, valeur, méta)  | Home, tous         |
| TypingText          |   ✅   | Écriture progressive (voix de KAI)                  | Home, KAI          |
| _Motion primitives_ |   ✅   | `animate-breathe/halo/rise/fade` (+ reduced-motion) | tous               |
| StatTile            |   ⬜   | Chiffre glanceable (mono, delta)                    | Dashboard, Monitor |
| MetricCard          |   ⬜   | Métrique + mini-graphe                              | Dashboard, Monitor |
| ActivityCard        |   ⬜   | Élément d'activité récente                          | Dashboard          |
| NotificationCard    |   ⬜   | Notification actionnable                            | Dashboard          |
| QuickAction         |   ⬜   | Raccourci d'action                                  | Dashboard, KAI     |
| CommandPalette      |   ⬜   | Recherche + actions (⌘K), clavier                   | Dashboard, KAI     |
| _(StatusIndicator)_ |   ✅   | _déjà livré (vague 1)_                              | Dashboard          |

**Résultat concret** : l'**Accueil de KevinOS** (assemblage).

---

## Vague 4 — KAI ⬜

> À la fin, on peut développer l'interface de **KAI** (le point d'entrée).

| Composant         | Statut | Description                                    | Modules        |
| ----------------- | :----: | ---------------------------------------------- | -------------- |
| Conversation      |   ⬜   | Fil de conversation (scroll, groupes)          | KAI            |
| ChatBubble        |   ⬜   | Bulle utilisateur / assistant                  | KAI            |
| PromptInput       |   ✅   | Saisie, envoi, raccourcis (_livré tôt — Home_) | KAI, Home      |
| SuggestionCard    |   ⬜   | Suggestion proposée par KAI                    | KAI, Dashboard |
| ThinkingIndicator |   ⬜   | KAI réfléchit (discret)                        | KAI            |
| AIResponse        |   ⬜   | Réponse riche (texte + cartes actionnables)    | KAI            |
| Citation          |   ⬜   | Source d'une réponse (traçabilité)             | KAI            |
| ActionSuggestion  |   ⬜   | Action exécutable proposée par KAI             | KAI            |

**Résultat concret** : l'écran d'accueil **KAI-first**.

---

## Vague 5 — KOS Vision (photos) 🟡 (compétence photos réelle livrée)

> **Phase 2 (2026-07-14)** : première **compétence** réelle — « montre-moi mes
> photos » ouvre une vraie galerie **dans Home** (contrat `PhotoLibrary`, moteur
> Immich caché ; repli mock en Preview). Vocabulaire **Skills** ([ADR-0020](docs/adr/ADR-0020-competences-skills.md)).

| Composant    | Statut | Description                                   | Modules       |
| ------------ | :----: | --------------------------------------------- | ------------- |
| Lightbox     |   ✅   | Visionneuse plein écran (Échap/flèches, a11y) | Vision, Media |
| PhotoCard    |   ⬜   | Vignette photo (favori, sélection)            | Vision        |
| AlbumCard    |   ⬜   | Couverture d'album                            | Vision        |
| Timeline     |   ⬜   | Grille chronologique (par mois)               | Vision        |
| MapViewer    |   ⬜   | Carte des photos géolocalisées                | Vision        |
| FaceCard     |   ⬜   | Personne reconnue                             | Vision        |
| MemoriesCard |   ⬜   | Souvenir (« il y a un an »)                   | Vision        |

**Résultat concret** : **KOS Vision** — demander ses photos à KAI et les voir
(galerie + recherche + visionneuse), moteur Immich caché.

---

## Vague 6 — KOS Media (films & séries) 🟡 (compétence media réelle livrée)

> **Phase 3 (2026-07-14)** : deuxième **compétence** réelle, **calquée sur KOS
> Vision** (contrat `MediaLibrary`, moteur Jellyfin caché) — « continue mon film »,
> médiathèque, fiche + reprise, **sans toucher au cœur de KAI** (preuve de
> modularité). Surface assemblée **sans nouveau composant** `@kevinos/ui`.

| Composant        | Statut | Description                                     | Modules          |
| ---------------- | :----: | ----------------------------------------------- | ---------------- |
| MovieCard        |   ⬜   | Affiche de film (extraire de la surface Media)  | Media            |
| SeriesCard       |   ⬜   | Affiche de série                                | Media            |
| EpisodeCard      |   ⬜   | Épisode (progression)                           | Media            |
| PlayerOverlay    |   ⬜   | Contrôles de lecture (lecteur — étape suivante) | Media            |
| ContinueWatching |   ⬜   | Reprendre la lecture                            | Media, Dashboard |
| CollectionCard   |   ⬜   | Collection / genre                              | Media            |
| MediaInfo        |   ⬜   | Fiche détaillée                                 | Media            |

**Résultat concret** : **KOS Media** — « continue mon film », médiathèque
(films/séries/collections/reprise), fiche + progression ; moteur Jellyfin caché.

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

On **alterne** (Règle 0) : enrichir `@kevinos/ui` ↔ livrer un **module fonctionnel**.
La Foundation (Vagues 1–2) étant mûre, la cadence change : **le produit pilote la
bibliothèque**. On construit **Home par itérations** (chacune = un écran utilisable),
et on n'ajoute à `@kevinos/ui` que ce que l'itération courante exige. Les vagues 4–7
ci-dessus deviennent des **réservoirs de composants** dans lesquels Home pioche à la
demande — elles ne sont plus des étapes séquentielles. Le produit reste vivant à
chaque itération.
