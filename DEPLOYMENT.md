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
- **Staging** : même build, mais **aliasé** sur une URL stable
  (`kevinos-staging.vercel.app` par défaut, réglable via la variable de dépôt
  `STAGING_ALIAS`).
- **Production** : `main` uniquement, déploiement `--prod`. Le chrome « Preview »
  (écran d'accueil + badge) **disparaît**.

---

## 4. Le pipeline CI/CD

Un seul pipeline, dans [`.github/workflows/ci.yml`](.github/workflows/ci.yml).
**Le déploiement ne part que si la qualité est verte** (`needs: [quality]`).

```
push / pull_request
        │
        ▼
┌─────────────────────────────────────────────┐
│  quality                                     │
│  1. pnpm install --frozen-lockfile           │
│  2. format:check (Prettier)                  │
│  3. lint (ESLint)                            │
│  4. build (pnpm -r run build)                │
│  5. typecheck (tsc)                          │
│  6. test (Vitest)                            │
└─────────────────────────────────────────────┘
        │ (vert, et seulement sur push)
        ▼
┌─────────────────────────────────────────────┐
│  deploy (Vercel)                             │
│  • main    → production  (vercel --prod)     │
│  • develop → staging     (+ alias stable)    │
│  • autres  → preview     (URL par déploiement)│
└─────────────────────────────────────────────┘
```

- **`quality`** tourne sur **tous** les push et toutes les PR.
- **`deploy`** ne tourne **que sur push** (jamais sur une PR de fork) et **après**
  `quality`. Sans secrets Vercel configurés, il se met en **no-op** (message
  d'information, build vert) — le projet reste fonctionnel avant même la connexion
  à Vercel.
- Les **informations de build** (version, branche, commit, canal) sont injectées à
  la construction via les variables `KOS_BRANCH`, `KOS_SHA`, `KOS_PREVIEW`,
  `KOS_CHANNEL` → lues par [`apps/home/vite.config.ts`](apps/home/vite.config.ts).

---

## 5. Procédure de mise en place (une seule fois)

Il faut connecter le dépôt à un projet Vercel, puis donner 3 secrets à GitHub.

1. **Créer un compte Vercel** (gratuit, offre Hobby) sur <https://vercel.com>.
2. **Lier le projet** depuis la racine du dépôt :
   ```bash
   npm i -g vercel
   vercel login
   vercel link           # crée .vercel/project.json (orgId + projectId)
   ```
   > `vercel.json` (racine) fournit déjà `buildCommand`, `outputDirectory` et les
   > réécritures SPA — rien à configurer dans l'interface.
3. **Créer un token** : Vercel → _Account Settings → Tokens_ → _Create_.
4. **Récupérer les identifiants** : dans `.vercel/project.json` (`orgId`,
   `projectId`) — ou dans les réglages du projet.
5. **Ajouter les secrets GitHub** : dépôt → _Settings → Secrets and variables →
   Actions_ :

   | Secret              | Valeur                                |
   | ------------------- | ------------------------------------- |
   | `VERCEL_TOKEN`      | le token créé à l'étape 3             |
   | `VERCEL_ORG_ID`     | `orgId` de `.vercel/project.json`     |
   | `VERCEL_PROJECT_ID` | `projectId` de `.vercel/project.json` |

   _(Optionnel)_ variable de dépôt `STAGING_ALIAS` pour choisir l'URL de staging.

À partir du prochain push, chaque branche obtient sa Preview automatiquement. ✅

> ⚠️ Ne **jamais** committer `VERCEL_TOKEN` ni le dossier `.vercel/` (déjà ignoré).
> Le token vit **uniquement** dans les secrets GitHub.

### Alternative encore plus simple — l'intégration Git de Vercel

Sur le tableau de bord Vercel : _Add New → Project → Import_ le dépôt GitHub. Vercel
déploie alors **tout seul** chaque branche (preview) et `main` (production), sans
aucun secret dans GitHub. `vite.config.ts` lit aussi les variables `VERCEL_*`, donc
l'écran de Preview fonctionne à l'identique.

> **Choisir _une_ voie**, pas les deux : soit le pipeline GitHub Actions ci-dessus
> (déploiement **conditionné** aux tests verts — recommandé pour la qualité), soit
> l'intégration Git de Vercel (**zéro secret**, plus simple). Les deux actives =
> doubles déploiements.

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
