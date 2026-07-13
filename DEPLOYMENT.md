# Déploiement de KevinOS

> Comment KevinOS passe du code à une **URL consultable** — pour suivre le produit
> depuis un simple lien (iPhone compris), sans rien lancer localement.
>
> **Mantra :** _KevinOS ne remplace pas les meilleurs outils. Il les orchestre
> pour offrir une seule expérience._ — ici, on orchestre **Vercel** + **GitHub
> Actions** (Règle 8 : on ne réécrit pas une plateforme de déploiement).

---

## 1. Ce que l'on déploie

L'artefact déployé est **`apps/home`** — le **produit** (l'accueil KAI-first). C'est
une application web **statique** (Vite + React), construite par **assemblage** de
`@kevinos/ui`. Elle n'a **aucune dépendance serveur** : elle fonctionne en **mode
Preview** avec des **données simulées** (voir §6).

> Le Core, PostgreSQL, Redis, Immich, Jellyfin… ne sont **pas** nécessaires pour la
> Preview. Ils appartiennent au socle auto-hébergé (`deploy/`), déployé séparément
> via Docker Compose — ce document ne couvre **que** la prévisualisation produit.

---

## 2. Pourquoi Vercel

Choix retenu : **Vercel** (parmi Vercel / Netlify / GitHub Pages).

**Avantages**

- **URL de preview par branche, automatique.** Chaque push produit une URL unique —
  exactement l'objectif « tester une fonctionnalité par un simple lien ».
- **Zéro serveur à gérer.** Hébergement statique + CDN mondial, HTTPS inclus. Rapide
  sur mobile.
- **Gratuit** pour cet usage (offre Hobby), largement suffisant.
- **Monorepo pnpm** géré nativement (via `vercel.json`).
- **SPA** : réécriture `/(.*) → /index.html` triviale à configurer.

**Limites (assumées)**

- Service **tiers** et **en ligne** : la Preview n'est **pas** offline-first — mais
  ce n'est **pas** le produit, c'est un **outil de démonstration**. KevinOS
  lui-même reste offline-first (Règle 2) ; seule sa vitrine vit sur Vercel.
- L'offre gratuite est **personnelle/non commerciale** et a des quotas (bande
  passante, temps de build) — sans impact à notre échelle.
- Vercel est **remplaçable** : le produit est un simple dossier statique
  (`apps/home/dist`). On peut basculer sur Netlify ou un hébergeur statique sans
  toucher au code (cohérent avec « les moteurs sont interchangeables »).

**Pourquoi pas les autres**

- **Netlify** : équivalent, très bon second choix. Retenu comme **plan B**.
- **GitHub Pages** : pas de preview par branche native, réécritures SPA plus
  laborieuses, pas d'environnements. Écarté pour cet usage.

---

## 3. Les trois environnements

| Environnement  | Déclencheur (branche)                               | Rôle                                           | Mode                    |
| -------------- | --------------------------------------------------- | ---------------------------------------------- | ----------------------- |
| **Preview**    | toute branche (`claude/*`, `feature/*`, `develop`…) | Tester **immédiatement** une évolution         | simulé (chrome Preview) |
| **Staging**    | `develop`                                           | Version stable des features validées, URL fixe | simulé (chrome Preview) |
| **Production** | `main`                                              | Version officielle                             | sans chrome Preview     |

- **Preview** : URL **unique par déploiement** (et par branche). Éphémère, parfaite
  pour un retour rapide.
- **Staging** : `develop` obtient, comme toute branche, sa **propre URL de preview
  stable** (`…-git-develop-…vercel.app`). Un **alias dédié** (`kevinos-staging…`)
  viendra plus tard (voir §5.2).
- **Production** : `main` uniquement, déploiement de production. Le chrome
  « Preview » (écran d'accueil + badge) **disparaît**.

> **V1 (officielle) — intégration Git de Vercel.** Vercel écoute le dépôt et
> déploie **tout seul** : chaque branche → une Preview, `main` → la production.
> C'est la voie choisie pour démarrer vite (§5.1). Le durcissement par GitHub
> Actions (déploiement conditionné aux tests) est prêt mais **désactivé** (§5.2).

---

## 4. Qui fait quoi : Vercel déploie, GitHub Actions vérifie

En **V1**, les deux se répartissent le travail **sans se marcher dessus** :

```
push / pull_request
        │
        ├────────────────────────────┬───────────────────────────────┐
        ▼                            ▼                                 │
┌─────────────────────────┐   ┌──────────────────────────────┐        │
│ GitHub Actions          │   │ Vercel (intégration Git)     │        │
│ job « quality »         │   │ — SOLUTION OFFICIELLE V1     │        │
│ install → format → lint │   │ • chaque branche → Preview   │        │
│ → build → typecheck →   │   │ • main → Production          │        │
│ tests                   │   │ • VERCEL_* injectées au build│        │
└─────────────────────────┘   └──────────────────────────────┘        │
        │                                                              │
        ▼                                                              │
┌───────────────────────────────────────────────────────────┐        │
│ GitHub Actions — job « deploy » (Vercel CLI)              │◄───────┘
│ DÉSACTIVÉ par défaut (vars.ENABLE_ACTIONS_DEPLOY != true) │
│ Durcissement futur : déployer seulement si tests verts    │
└───────────────────────────────────────────────────────────┘
```

- **`quality`** ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) tourne sur
  **tous** les push et toutes les PR : c'est le **garde-fou qualité**.
- **Vercel** déploie **de son côté**, automatiquement (intégration Git). Il renseigne
  `VERCEL_ENV`, `VERCEL_GIT_COMMIT_REF`, `VERCEL_GIT_COMMIT_SHA` → lus par
  [`apps/home/vite.config.ts`](apps/home/vite.config.ts) pour l'écran de Preview.
- Le job **`deploy`** existe déjà mais reste **désactivé** (`ENABLE_ACTIONS_DEPLOY`
  non posé) : **aucun risque de double-déploiement**. On l'activera si l'on veut
  **conditionner** le déploiement aux tests (§5.2).

---

## 5. Procédure de mise en place

### 5.1 V1 — Intégration Git de Vercel (officielle, ~3 minutes)

**Aucun secret, aucune ligne de commande.**

1. Créer un compte gratuit sur <https://vercel.com> (offre Hobby) — se connecter
   **avec GitHub**.
2. **Add New… → Project → Import** le dépôt `Kevindle1/KevinOS`.
3. Vercel lit **`vercel.json`** (racine) : rien à configurer (build, dossier de
   sortie et réécritures SPA sont déjà fournis). Cliquer **Deploy**.
4. C'est fait. Vercel déploie désormais **tout seul** :
   - **chaque branche** (`claude/*`, `feature/*`, `develop`…) → une **URL de
     Preview** ;
   - **`main`** → l'URL de **production**.

> Pour ouvrir la Preview d'une branche : Vercel → projet → onglet **Deployments**
> (chaque déploiement a son lien), ou l'URL stable
> `kevinos-git-<branche>-<compte>.vercel.app`. Vercel poste aussi automatiquement
> le lien de Preview **dans chaque Pull Request**.

### 5.2 Plus tard — durcir avec GitHub Actions (optionnel)

Quand on voudra **ne déployer que si les tests passent** :

1. `npm i -g vercel && vercel login && vercel link` (crée `.vercel/project.json`).
2. Ajouter les **secrets** GitHub (_Settings → Secrets and variables → Actions_) :
   `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
3. Poser la **variable** de dépôt `ENABLE_ACTIONS_DEPLOY = true` (et _désactiver_
   l'auto-déploiement Vercel côté projet, pour éviter les doublons).
4. _(Optionnel)_ variable `STAGING_ALIAS` pour l'URL de staging.

Le job `deploy` prend alors le relais : `main` → production, `develop` → staging
(alias), autres → preview.

> ⚠️ Ne **jamais** committer `VERCEL_TOKEN` ni le dossier `.vercel/` (déjà ignoré).
> **Une seule voie active à la fois** : intégration Git **ou** job Actions.

---

## 6. Le mode Preview

En Preview et en Staging, KevinOS tourne en **mode simulé** :

- **Toutes les données sont simulées** ; les modules utiliseront des **mocks**.
  Aucune dépendance serveur (Docker, PostgreSQL, Redis, Immich, Jellyfin).
- Le mode est **clairement identifié** : un **badge** (« Preview » / « Staging »)
  dans l'en-tête, et un **écran d'accueil de la Preview** au premier chargement.
- **KAI est simulé** (itération 1) ; il se branchera au Core plus tard sans changer
  l'expérience.

**L'écran d'accueil de la Preview** (première chose vue en ouvrant le lien) affiche :

```
✦ KevinOS  [Preview]
Environnement de démonstration

Version               0.1.0-dev
Branche               claude/kevinos-architecture-v80n4x
Dernier déploiement   il y a 3 minutes
──────────────────────────────────
🆕 Nouveautés de cette version
 • Home — le premier écran de KevinOS…
 • Nouveau composant PromptInput…
 • …

[ Entrer dans KevinOS ]
Toutes les données sont simulées — aucune dépendance serveur.
```

Les nouveautés sont **curées à la main** dans
[`apps/home/src/preview/highlights.ts`](apps/home/src/preview/highlights.ts) — on
les met à jour à **chaque itération** (on ne montre que du vrai, cf.
`HOME_EXPERIENCE.md`).

### Tester le mode Preview en local

```bash
# Home normal (sans chrome Preview)
pnpm --filter @kevinos/home dev

# Simuler la Preview (écran d'accueil + badge)
KOS_PREVIEW=1 KOS_CHANNEL=preview KOS_BRANCH=ma-branche pnpm --filter @kevinos/home build
pnpm --filter @kevinos/home preview   # sert le build sur http://localhost:4173
```

---

## 7. Limitations du mode Preview

- **Vitrine, pas produit.** La Preview illustre l'**expérience** ; elle ne stocke
  rien, ne persiste rien, n'exécute aucun module réel.
- **Données simulées uniquement.** Les chiffres, photos, états système sont **faux**
  (mais **honnêtes** : on n'invente pas de fonctionnalité inexistante).
- **En ligne.** Contrairement à KevinOS auto-hébergé, la Preview dépend d'un service
  tiers (Vercel) et d'Internet.
- **Pas d'authentification.** Les liens de preview sont **publics** (obscurs mais
  non secrets). Ne rien y afficher de sensible.

---

## 8. La Preview comme outil de validation produit

La Preview fait **partie du cycle de développement** (Règle 0 — l'expérience est le
produit). Avant chaque itération :

1. On **ouvre le lien** (iPhone), on **ressent** l'expérience.
2. On **valide** ou on **oriente** (retours de Product Owner).
3. On développe l'itération suivante — puis une nouvelle Preview.

C'est la boucle courte qui garde KevinOS **vivant** et **jugé sur le ressenti**, pas
sur le code.
