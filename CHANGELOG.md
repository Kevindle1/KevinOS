# Journal des changements

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/) et le
projet le [versionnement sémantique](https://semver.org/lang/fr/).

## [Non publié]

### Ajouté — ▶️ Le lecteur officiel KevinOS (MediaPlayer), la reprise possédée, KAI télécommande

Jellyfin **disparaît jusqu'à la lecture**. Une seule application : KevinOS.
Voir [ADR-0021](docs/adr/ADR-0021-lecteur-officiel-mediaplayer.md).

- **`MediaPlayer`** — le lecteur **officiel et unique** de KevinOS, composant
  `@kevinos/ui` (films, séries, vidéos perso, caméras, archives…). HTML5,
  contrôles **auto-masqués** (Apple TV / visionOS), clavier (espace, ←/→, f, m,
  ↑/↓), barre de progression, temps restant, vitesse, volume, **sous-titres**,
  **plein écran**, **Picture-in-Picture**. Agnostique du moteur : il ne reçoit
  qu'une `src` servie par le Core.
- **Fiche intelligente immersive** (Home) avant de lancer : affiche/backdrop,
  notes, année, genres, réalisateur, casting, durée, qualité, **progression**,
  résumé, similaires ; pour les séries : saisons/épisodes, **prochain épisode**,
  vus/non-vus, temps restant. Bouton **Reprendre / Lire**.
- **La reprise appartient à KevinOS** (pas au moteur) : ports `PlaybackStore`
  (JSON aujourd'hui) + `MediaStreaming`. Le `MediaService` **croise** la
  progression et fait **primer** celle de KevinOS. À l'arrêt →
  `POST /api/v1/media/:id/progress` (sauvegarde immédiate) ; le lendemain, la
  reprise nourrit « Continuer la lecture » et la fiche.
- **Le flux ne révèle jamais le moteur** : `getStream` renvoie une **URL du
  Core** (`/api/v1/media/:id/stream`) que le Core **relaie** (proxy `Range`).
  Aucune URL/entête/sous-titre ne rappelle Jellyfin.
- **KAI = télécommande universelle** : nouvelle action `control_player` (à côté
  d'`open_skill`). « Mets en pause », « recule de 30 secondes », « avance de deux
  minutes », « sous-titres français », « passe en VO », « plein écran », « passe
  au prochain épisode », « ferme le lecteur » → interprétation **déterministe**
  (`parsePlayerCommand`), appliquée à l'API impérative du lecteur
  (`MediaPlayerHandle`). **KAI ne touche jamais le DOM** ; il émet une intention.
- **Design Lab** : story `MediaPlayer`. **Tests** : Core **58** (télécommande KAI :
  8 commandes ; reprise possédée : `MediaService` × store) ; `@kevinos/ui` (rendu
  des contrôles, `onClose`, API impérative). Repli **honnête** en Preview
  (localStorage pour la reprise, badge « démo »).

### Ajouté — 🎬 Phase 3 : KOS Media, deuxième compétence (preuve de modularité)

Deuxième compétence réelle, **développée en recopiant la structure de KOS
Vision** — sans **aucune** modification du cœur de KAI (orchestrateur, providers).
La preuve de modularité est faite.

- **Contrat MediaLibrary** (`@kevinos/shared`) : Films, Séries, Saisons,
  Épisodes, Collections, Favoris, Historique, **reprise de lecture** — calqué sur
  `PhotoLibrary`.
- **Compétence Media** (Core) : « continue mon film », « montre-moi mes films »,
  « mes séries », « trouve le film … » → intention structurée (`parseMediaIntent`)
  → action `open_skill`. **Ajoutée en une ligne dans `SKILLS`** ; l'orchestrateur
  n'a pas bougé. KAI parle **uniquement** au contrat — **jamais** à Jellyfin.
- **Adaptateur Jellyfin** (`JellyfinMediaAdapter`) + `MediaService` + routes
  `/api/v1/media/*` — même patron qu'Immich/KOS Vision. Affiches proxifiées par le
  Core. Testé (fetch mocké : mapping, reprise ticks→secondes, recherche).
- **Surface KOS Media dans Home** : « Continuer la lecture », « Récemment
  ajoutés », bibliothèque (films/séries), recherche, collections ; **fiche**
  (métadonnées, **progression**, **Reprendre**) ; épisodes par saison. Repli mock
  honnête (badge « démo ») en Preview. **Zéro nouveau composant `@kevinos/ui`**
  (assemblage de l'existant : Progress, Button, SearchInput…).
- **Infra** : overlay `docker-compose.kos-media.yml` (Jellyfin, jamais exposé) +
  secret d'exemple, validé en CI. Config `KEVINOS_JELLYFIN_*`.
- **Tests** : Core **44** (compétence media + adaptateur Jellyfin) ; vérifié en
  réel via `curl` (les deux compétences coexistent, cœur inchangé).

### Ajouté — 📷 Phase 2 : KOS Vision, la première compétence réelle (Skills)

KevinOS gagne sa **première compétence utilisable** : demander ses photos en
langage naturel et **voir une vraie galerie**, sans quitter Home.

- **Vocabulaire Skills** ([ADR-0020](docs/adr/ADR-0020-competences-skills.md)) :
  KAI n'ouvre plus des « modules » mais **invoque des compétences** (📷 photos →
  KOS Vision). L'action `open_module` devient `open_skill`.
- **Compétence Photos** (Core) : KAI comprend « montre-moi mes photos »,
  « …de juillet », « …à la montagne », « …où apparaît mon chien » → intention
  structurée (`parsePhotoIntent`, testé) → action `open_skill`. KAI parle
  **uniquement** au contrat `PhotoLibrary` — **jamais** à Immich (Règle 5).
- **Galerie dans Home** (`apps/home`) : la surface **KOS Vision** s'ouvre **dans**
  Home (transition naturelle, retour naturel) — vraies miniatures via
  `/api/v1/photos*`, recherche, albums, **Lightbox** pour ouvrir une photo. Repli
  **mock** honnête (badge « démo ») quand aucun Core n'est joignable (Preview).
- **`@kevinos/ui`** : `Lightbox` (visionneuse plein écran, focus/Échap/flèches,
  a11y) — doc, tests, story. Tests UI : **50**.
- **Tests** : Core **36** (compétence photos + intentions) ; vérifié en réel via
  `curl` (intentions → actions structurées).

### Ajouté — 🧠 Phase KAI : une vraie IA (orchestrateur + Ollama + providers)

Bascule du KAI **simulé** vers le **vrai KAI** — offline-first, IA locale,
fournisseurs interchangeables, KAI comme **unique point d'entrée** (Règle 5).

- **Contrat public** (`@kevinos/shared`) : `KaiReply` / `KaiAction` +
  `POST /api/v1/kai/message` (API-first). Consommé identiquement par Home, mobile
  ou une API publique.
- **Orchestrateur KAI** (Core, [ADR-0019](docs/adr/ADR-0019-kai-orchestrateur.md)) :
  1. **capacités déterministes locales, hors ligne, sans modèle** — bonjour,
     heure, date, état système, **ouvrir un module** (action structurée) ;
  2. sinon **fournisseur IA** ; 3) **repli honnête** si l'IA est absente. KAI ne
     plante jamais.
- **Fournisseurs interchangeables** : `OllamaProvider` (local, packagé) + fabrique
  `createAIProvider(config)` ; OpenAI/Claude/Gemini restent des adaptateurs futurs.
  Modèle léger par défaut `qwen2.5:3b` (16 Go, sans GPU).
- **Home** connecté au vrai KAI (proxy Vite en dev) avec **repli simulé** quand
  aucun Core n'est joignable (Preview statique) — l'expérience ne casse jamais.
- **Infra** : overlay `docker-compose.kai.yml` (Ollama, réseau `apps`, jamais
  exposé), validé en CI.
- **Tests** : Core **31** (capacités, orchestrateur, route KAI) ; vérifié en réel
  (heure/date/système/ouvrir/repli via `curl`).

### Changé — 🎯 Home itération 3 : la curation (« l'essentiel, maintenant »)

- **Minimalisme radical** : KAI ne montre plus tout. Il **choisit** — **au plus
  3 cartes**, jamais un mur. La question devient « quelle est l'information la plus
  utile à Kevin **maintenant** ? » et non « que puis-je afficher ? ».
- **Moteur de curation** (`curateHome`, testé) : cartes classées par **importance**
  (haute / normale / info), **évoluant selon le moment** (matin / après-midi / soir
  / nuit). Une **alerte** haute priorité remonte et **remplace** une carte. La nuit,
  KevinOS **respire** (≤ 1 carte).
- **Respiration** : très calme par défaut, puis KevinOS « **prend la parole** » —
  un rappel discret et différé apparaît (effaçable).
- **Mémoire / continuité** : KAI se souvient (« hier tu avais commencé… », « 3
  jours sans sauvegarde de tes photos… ») — ce qui lui donne une personnalité.
- `@kevinos/ui` : `InsightCard` gagne `emphasis` (carte prioritaire, contour
  accentué). Tests : **UI 46**, **Home 6** (curation).
- Doctrine : **HOME_EXPERIENCE** enrichi (P8 curation, P9 respiration, P10 mémoire).

### Ajouté — ✨ Home itération 2 : KevinOS vivant (présence) + Règle 9

- **Règle 9** (RÈGLES) : « KevinOS doit donner l'impression d'être **vivant** » —
  une **présence**, jamais un écran vide ; KAI **compagnon** (connaît, anticipe,
  propose) ; le premier écran **raconte une histoire** ; micro-interactions
  **signature** (Apple / visionOS / Nothing OS), toujours `prefers-reduced-motion`.
- **Home refondu** (`apps/home`) : accueil **vivant** — présence de KAI (orbe qui
  respire + halo), **salut contextuel** (heure de la journée) qui **raconte** la
  journée, **cartes d'aperçu** (photos, média à reprendre, sauvegarde, serveur,
  météo, stockage, maison — simulées), **suggestions intelligentes**, apparition
  **progressive**. KAI **répond en contexte** (il « connaît » l'environnement) et
  ses réponses **s'écrivent** progressivement.
- **`@kevinos/ui`** (créés à la demande de Home, doc + tests + Design Lab + a11y) :
  **primitives de mouvement** (`animate-breathe/halo/rise/fade` + garde-fou
  `prefers-reduced-motion` global), **`InsightCard`** (carte glanceable
  actionnable), **`TypingText`** (écriture progressive, texte complet exposé à
  l'a11y). Tests UI : **46**.

### Ajouté — 🚀 Environnement de Preview (Vercel) + mode Preview

- **Chaîne de déploiement** : chaque push construit une **version consultable par
  URL** (iPhone compris), sans rien lancer localement. Le produit déployé est
  `apps/home` (statique, sans dépendance serveur).
- **Trois environnements** : **Preview** (toute branche, URL par déploiement),
  **Staging** (`develop`), **Production** (`main`).
- **V1 officielle : intégration Git de Vercel** — Vercel déploie automatiquement
  chaque branche (Preview) et `main` (production), **sans secret**. Mise en place
  en ~3 minutes (README → « Développement »).
- **Garde-fou qualité** ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) :
  install → format → lint → build → typecheck → tests sur chaque push/PR. Un job
  `deploy` (Vercel CLI, déploiement **conditionné aux tests**) est prêt mais
  **désactivé par défaut** (`vars.ENABLE_ACTIONS_DEPLOY`) pour éviter tout
  double-déploiement — durcissement futur.
- **Mode Preview** dans `apps/home` : données **simulées**, aucune dépendance
  serveur (Docker/PostgreSQL/Redis/Immich/Jellyfin), clairement identifié par un
  **badge** et un **écran d'accueil de la Preview** (version · branche · dernier
  déploiement · 🆕 nouveautés · « Entrer dans KevinOS »). Infos de build injectées
  au build (`__KOS_BUILD__` via `vite.config.ts`).
- **`vercel.json`** (build monorepo + réécritures SPA) et **`DEPLOYMENT.md`**
  (architecture, environnements, pipeline, procédure, gestion des previews,
  limitations, alternative « intégration Git »).

### Documenté — 🧭 HOME_EXPERIENCE.md : la boussole émotionnelle de Home

- **`HOME_EXPERIENCE.md`** (réflexion produit, **sans code**) : l'émotion que Home
  doit provoquer, le ressenti à **5 s / 30 s / plusieurs jours**, **7 principes
  psychologiques** (charge cognitive, assistant vivant, silence, confiance, être
  attendu, révélation progressive, respect) et le **filtre produit** (valeur ·
  cohérence · pertinence · simplicité) à appliquer avant chaque itération.
- **Le salut vivant de KAI** adopté comme principe fondateur : KAI ne salue jamais
  Kevin deux fois de la même façon (moment + état réel + variation), toujours
  honnête, sobre et calme — la présence plutôt que l'écran figé.

### Ajouté — 🏠 Home, la première expérience de KevinOS (itération 1)

- **`apps/home`** : la **coque du produit** (Vite + React + `@kevinos/ui`). On
  passe de « faire grandir la bibliothèque » à **« construire KevinOS »**.
- **Accueil centré sur KAI** (ADR-0017 / Règle 0) : « Bonjour Kevin 👋 / Comment
  puis-je t'aider aujourd'hui ? », zone de conversation, suggestions. Pas une
  grille de widgets — une page **vivante**. KAI est **simulé** (itération 1) ; le
  vrai KAI (Vague 4) se branchera au même `onSubmit`, sans toucher à Home.
- **Nouvelle cadence** (Règle 0) : `@kevinos/ui` évolue **quand Home en a besoin**,
  au fil des itérations — plus de vague complète en amont. **Home pilote l'UI.**
- **`PromptInput`** créé dans `@kevinos/ui` (1ᵉ besoin piloté par Home) :
  composant **stratégique** KAI-first, contrôlé/non-contrôlé, `Entrée` envoie /
  `Maj+Entrée` saut de ligne, auto-grow, état `busy`, a11y. Doc, **6 tests**,
  story Design Lab. Tests UI : **41**.

### Ajouté — Règle 8 & Vague 2 (sous-lot 2) : surfaces & primitives

- **Règle 8** (RÈGLES) + **ADR-0018** : « ne jamais réimplémenter un problème déjà
  résolu, sauf valeur produit directe ». Le mantra appliqué au code.
- **Tooltip** et **Popover** : positionnement délégué à **Floating UI** (moteur),
  mais composant/design/API/animations/a11y **100 % KevinOS** (Floating UI n'est
  jamais exposé dans l'API publique). Popover : `role=dialog`, focus piégé,
  fermeture clic-extérieur/Échap.
- **Avatar** (initiales/image), **IconButton** (`aria-label` requis, cible ≥ 44px),
  **Divider** (h/v + label), **ScrollArea** (barre discrète).
- Stories ajoutées au Design Lab (groupe « Surfaces »). Tests UI : **35** (7
  nouveaux). **Vague 2 (Foundation) complète.**

### Ajouté — Vague 2 (sous-lot 1) : fondation formulaire de `@kevinos/ui`

- **ADR-0017** : principes de conception permanents (calme, simplicité, fluidité,
  **silence**, lisibilité, performance) ; **API formulaire commune** (contrôlé/
  non-contrôlé + validation/erreur/aide/loading/a11y mutualisées) ;
  **SearchInput** stratégique ; **le premier écran s'appelle « Home »** (plus
  « Dashboard »).
- **Fondation formulaire** : `useControllableState`, `useFieldIds`, `Field`
  (label/aide/erreur/a11y mutualisés — les modules ne les réimplémentent jamais).
- **Composants** (contrôlés/non-contrôlés, a11y, states) : `Input`, `SearchInput`
  (effacement, Entrée/Échap, loading), `Textarea` (auto-grow), `Select` (natif),
  `Checkbox` (indéterminé), `Switch` (`role=switch`), `RadioGroup`, `ButtonGroup`.
- Éléments **natifs** privilégiés (a11y + performance mobile). Stories ajoutées au
  Design Lab. Tests UI : **28** (10 nouveaux formulaires).
- UI_ROADMAP : sous-lot 1 ✅ ; Vague 3 renommée **« Home »**.

### Changé — 🔄 Virage stratégique : KevinOS, plateforme d'expérience

- **Mantra** adopté (README, PRODUCT_VISION, RÈGLES, identité, roadmap) :
  _« KevinOS ne remplace pas les meilleurs outils. Il les orchestre pour offrir
  une seule expérience. »_
- **ADR-0016** : nouvelle direction officielle — le **produit, c'est
  l'expérience** ; **KAI est le point d'entrée** (le Dashboard devient un
  assistant, plus un tableau de cartes) ; moteurs tiers **invisibles** ; on
  développe l'UI **par expériences** et on **alterne** UI ↔ module.
- **Identité** précisée : KevinOS = plateforme · KAI = intelligence · **KOS =
  compétences** · logiciels tiers = plugins interchangeables invisibles.
- **`UI_ROADMAP.md`** : nouvelle roadmap UI par expériences (Foundation →
  Dashboard → KAI → Vision → Media → Home), avec statut/description/modules/
  tests/doc/maturité par composant. L'ancien `component-catalog.md` redirige (pas
  de doc dupliquée).
- **RÈGLES** : ajout de la **Règle 0 — l'expérience est le produit**. PRODUCT_VISION
  et roadmap mis à jour.

### Ajouté — KOS Design Lab (module officiel)

- **ADR-0015** : le Design Lab devient l'**environnement de développement officiel**
  et permanent de KevinOS. Règles : produit maintenable, **architecture modulaire**
  (modes indépendants via registre), **source unique de vérité** (importe
  `@kevinos/ui`, aucune copie), **doc vivante**, **Sandbox**, **Inspect**,
  évolutivité, et **architecture prête pour un futur assistant KAI**.
- **App `apps/design-lab`** (`@kevinos/design-lab`, Vite + React + Tailwind sur le
  preset `@kevinos/ui`), organisée en **modes** :
  - ✅ **Component Explorer** (composant seul, tous ses états),
  - ✅ **Theme Studio** (Light/Dark/Auto + accents de module en direct, par tokens),
  - ✅ **Accessibility** (vérificateur de **contrastes WCAG** en direct selon le
    thème, focus/clavier, état `prefers-reduced-motion`),
  - 🟡 Inspect, Playground, Sandbox, Screen Builder, Dashboard Preview, Motion Lab,
    Documentation, Tests, Settings (cadrés, à venir progressivement).
- Renomme l'ex-`ui-gallery` → `design-lab`. Build de production vérifié.

### Ajouté — `@kevinos/ui` en **plateforme UI** (Vague 1)

- **ADR-0014** : `@kevinos/ui` devient une plateforme UI (façon Material UI) —
  standard qualité **par composant** (doc, exemples, états, a11y, tests, rendu),
  conventions d'API, construction par **vagues**. Le Dashboard sera un pur
  assemblage, construit **après** maturité de la bibliothèque.
- **Catalogue** des ~60 composants en 11 vagues avec suivi
  ([docs/design/component-catalog.md](docs/design/component-catalog.md)).
- **Vague 1 — primitives & feedback** (livrée) : `Badge`, `Tag`,
  `StatusIndicator`, `Spinner`, `Skeleton`, `Progress`, `Banner` (+ `Button`,
  `Card`). Tokens uniquement, a11y intégrée, 18 tests UI (59 au total).
- Tokens « subtle » de statut dérivés via `color-mix` (auto-adaptés au thème) ;
  `Spinner` branché dans `Button`.

### Ajouté — `@kevinos/ui` : implémentation du KOS Design System

- **Tokens** (`src/tokens.css`) : source unique de vérité (couleurs clair/sombre,
  accents modules, rayons, ombres, motion, typo) ; thème via `prefers-color-scheme`
  **et** `data-theme` (bascule utilisateur prioritaire) ; `prefers-reduced-motion`.
- **Preset Tailwind** (`@kevinos/ui/preset`) : Tailwind ne fait que **référencer**
  les tokens (pas de palette par défaut).
- **Helpers de thème** sans dépendance (`initTheme`/`applyTheme`/`resolveTheme`).
- **Composants** `Button` (variants/tailles/loading, a11y) et `Card`, sur tokens.
- Tests jsdom + Testing Library (7). Total workspace : 48 tests verts.

> Première brique d'implémentation après validation de la fondation design.
> Prochaine étape : compléter les composants puis assembler `apps/dashboard`.

### Ajouté — Fondation design (à valider avant de coder l'interface)

- **KOS Design System (KDS)** propriétaire sur Tailwind, token-first, offline
  ([ADR-0013](docs/adr/ADR-0013-design-system-proprietaire.md),
  [docs/design/design-system.md](docs/design/design-system.md)) : palette
  clair/sombre, accents par module, typographie, espacements, rayons, profondeur,
  motion, iconographie (Lucide), inventaire de composants, accessibilité, tokens CSS.
- **Charte UX/UI** ([docs/design/ux-ui-charter.md](docs/design/ux-ui-charter.md)) :
  philosophie (vide, hiérarchie, mouvement discret), navigation (rail + command
  palette `⌘K` + KAI omniprésent), interaction, responsive, accessibilité.
- **Wireframes** de toutes les vues principales
  ([docs/design/wireframes.md](docs/design/wireframes.md)) : Accueil (OS), recherche
  globale, KOS Vision, KAI, notifications, réglages, mobile.
- **Aperçu visuel** (Artifact HTML autonome, thème clair/sombre) pour ressentir la
  direction avant tout code — non-production.

> Aucune ligne d'interface n'est écrite dans `apps/dashboard` tant que cette
> fondation n'est pas validée par le propriétaire.

### Ajouté — 📷 KOS Vision, premier module (backend de référence)

- **Identité de marque `KOS <Nom>`** ([ADR-0012](docs/adr/ADR-0012-identite-modules-kos.md),
  [doc 09](docs/09-identite-modules.md)) : Kevin Photos → **KOS Vision** (moteur
  Immich, caché et remplaçable).
- **Contrat agnostique** `PhotoLibrary` + DTO + **outils KAI** (`photoTools`) dans
  `@kevinos/shared` — aucun détail Immich exposé (Règles 3 & 5).
- **Adaptateur Immich** (seul code connaissant le moteur), **PhotoService**
  (use-cases), **API v1** `/api/v1/photos/*` (browse, search, albums, people,
  memories, map, usage, thumbnail proxy).
- **Enregistrement** de KOS Vision dans le registre avec **garde de compatibilité**
  (ADR-0008) + **readiness** ; module désactivé proprement si moteur absent.
- **Overlay Immich** (`docker-compose.kos-vision.yml`, moteur isolé, secrets par
  fichier) + **manifeste** `deploy/modules/kos-vision/module.yaml`.
- **Doc du module de référence** ([doc 10](docs/10-module-reference.md)) : le patron
  des 7 pièces réutilisable pour KOS Media, KOS Drive, etc.
- Tests : 41 au total (23 shared, 18 core) ; toutes combinaisons Compose validées.

> Suite : Dashboard (galerie/recherche via `/api/v1/photos`) + KOS Brain (KAI local
> qui sélectionne les `photoTools`).

### Ajouté — Gouvernance du projet

- **`PRODUCT_VISION.md`** : la boussole (pourquoi KevinOS existe, pour qui, ce
  qu'il ne doit jamais devenir).
- **`docs/REGLES-ARCHITECTURE.md`** : 7 règles permanentes (produit, offline-first,
  API-first, UX-first, KAI, interface unique, documentation), opposables à toute
  décision future.

### Ajouté — Phase 1 : socle sécurité & sauvegardes

- **Authelia (SSO + MFA)** ([ADR-0009](docs/adr/ADR-0009-authelia-sso-mfa.md)) :
  portail d'auth offline-first (base utilisateurs fichier, notifier fichier,
  sessions Redis), intégré à Traefik en **ForwardAuth** ; protège le Core et
  Grafana. Config + gabarit `users_database`.
- **Gestion des secrets** ([ADR-0010](docs/adr/ADR-0010-gestion-secrets.md)) :
  secrets **par fichier** (convention `*_FILE`, mécanisme `secrets:` de Compose,
  moindre privilège) ; l'`.env` ne contient plus aucun secret. Structure
  `deploy/secrets/` (gabarits versionnés, secrets réels ignorés par Git).
- **Sauvegardes Restic** ([ADR-0011](docs/adr/ADR-0011-sauvegardes-restic.md)) :
  image dédiée transparente (Restic + `pg_dump`), chiffrées, dédupliquées,
  rétention 3-2-1, ordonnancement autonome, **script de test de restauration**.
  Overlay `docker-compose.backup.yml`.
- **Monitoring finalisé** : node-exporter (hôte), cAdvisor (conteneurs), promtail
  (logs → Loki), **règles d'alerte** Prometheus (RAM > 90 %, disque < 10 %,
  service down, CPU soutenu). Grafana derrière le SSO.
- Runbook de déploiement complet (secrets, SSO, sauvegardes, restauration,
  monitoring) ; CI valide toutes les combinaisons Compose.

### Ajouté — Système de versioning & compatibilité des modules (ADR-0008)

- **`@kevinos/shared` → `versioning.ts`** : `KEVINOS_VERSIONS`
  (`core` / `api` / `pluginInterface`), `checkCompatibility` (SemVer via `semver`),
  `defaultPluginApiRange`. Règle « peerDependency » : un module est compatible si
  le `pluginInterface` de l'hôte satisfait sa plage `compat.pluginApi`.
- **Contrat de module enrichi** : champs `version` (SemVer du module) et
  `compat.pluginApi` (plage supportée), validés par SemVer.
- **`ModuleRegistry` (Core)** : garde de compatibilité à l'enregistrement — un
  module incompatible est **refusé** (raison journalisée), jamais monté
  silencieusement. Routes `GET /versions` et `GET /modules`.
- Doc [08-versioning](docs/08-versioning.md) + [ADR-0008](docs/adr/ADR-0008-versioning-compatibilite.md).
- Tests : 29 au total (20 shared, 9 core), tous verts.

### Modifié — Repriorisation validée (2026-07-12)

- **Phase 1** = finaliser le socle (Authelia SSO/MFA, Restic sauvegardes, gestion
  des secrets, monitoring, validation sécurité) **avant toute donnée métier**.
- **Phase 2** = module **Fichiers** en tant que **connecteur** de stockage (et non
  clone de Nextcloud). Roadmap et vision KAI (tout est plugin) mises à jour.

### Ajouté — Étape 6 (validation) & Phase 0 (fondations du socle)

**Décisions validées par le propriétaire (2026-07-12)**

- **KAI 100 % local** (Ollama + modèle léger), hors-ligne, gratuit, **sans GPU** ;
  moteur conçu comme **fournisseur interchangeable** ([ADR-0006](docs/adr/ADR-0006-kai-ia-locale.md)).
- **KAI = point d'entrée unique** — « tout passe par KAI » ([Vision KAI](docs/07-vision-kai.md)).
- **Reverse proxy Traefik** (découverte auto + TLS auto) ([ADR-0007](docs/adr/ADR-0007-reverse-proxy-traefik.md)).
- Ordre de développement acté : infra → fichiers → photos → média → dashboard →
  KAI → domotique → reste. Doc mise à jour en conséquence.

**Fondations du monorepo**

- pnpm workspaces, TypeScript strict (`tsconfig.base.json`), ESLint 9 (flat),
  Prettier, EditorConfig, `.nvmrc`, `.gitignore` (exclusion stricte des secrets).

**Paquet `@kevinos/shared`**

- Schéma de configuration (Zod) chargé depuis l'environnement, fail-fast.
- Logger structuré (Pino) avec redaction des secrets.
- Contrat de module (`moduleManifestSchema`) — base de la remplaçabilité (ADR-0005).
- Port `AIProvider` — l'abstraction interchangeable de KAI (ADR-0006).
- 9 tests unitaires.

**Application `@kevinos/core`**

- Service Express + TypeScript en Clean Architecture
  (`domain`/`application`/`infrastructure`/`interfaces`).
- Sondes `/health` (liveness) et `/ready` (readiness, avec mode dégradé).
- Journalisation de requêtes, gestion d'erreurs centralisée, arrêt gracieux.
- Dockerfile multi-étapes, non-root, avec healthcheck. 4 tests (supertest).

**Infrastructure de déploiement (`deploy/`)**

- `docker-compose.yml` du socle : Traefik, Core, PostgreSQL (pgvector), Redis —
  réseaux segmentés `edge`/`apps`/`data`, limites mémoire, healthchecks, aucun
  port entrant hormis le proxy.
- Overlay `docker-compose.observability.yml` : Prometheus, Grafana, Loki,
  Uptime Kuma (optionnel).
- `.env.example`, runbook de déploiement, dossier `modules/` (manifestes).

**Qualité / CI**

- Workflow GitHub Actions : format, lint, build, typecheck, tests + validation
  des fichiers Compose.
- Chaîne `pnpm run check` verte (13 tests) ; Core vérifié en exécution réelle.

## [0.1.0] — 2026-07-12 — Phase Architecture

### Ajouté

- Socle documentaire d'architecture (étapes 1 à 5 de la méthode projet) :
  - **Analyse** du besoin, contexte, contraintes (RAM 16 Go, réseau CGNAT) et risques.
  - **Cahier des charges** fonctionnel & non fonctionnel (exigences `EF-*` / `ENF-*`, MoSCoW).
  - **Architecture** : 4 options comparées, décision = « cœur natif + intégration best-of-breed ».
  - **Choix techniques** justifiés (stack imposée + compléments).
  - **Catalogue des 33 modules** (natifs vs intégrés) + priorisation.
  - **Modèle de sécurité** (défense en profondeur, STRIDE).
  - **Roadmap** en phases P0 → v2 avec budget mémoire.
  - **Diagrammes Mermaid** : contexte, conteneurs, réseau, données, IA.
  - **5 ADR** documentant les décisions structurantes.

[Non publié]: https://github.com/kevindle1/kevinos/compare/main...claude/kevinos-architecture-v80n4x
[0.1.0]: https://github.com/kevindle1/kevinos/tree/main
