# ADR-0001 — Monorepo (pnpm workspaces)

**Statut** : Acceptée (à valider — étape 6)
**Date** : 2026-07-12
**Décideurs** : Architecte principal KevinOS

## Contexte

Le code **natif** de KevinOS comprend plusieurs paquets qui partagent des types
et des contrats : Core, Dashboard (React), Kevin AI, API, SDK, CLI. Ils évoluent
ensemble et partagent des schémas (Zod), des types TypeScript et des utilitaires.

## Options

1. **Multi-repos** (un dépôt par paquet).
   - ➕ Frontières nettes, permissions fines.
   - ➖ Partage de types pénible (publication de paquets), refactors transverses
     coûteux, versions désynchronisées, CI éclatée.
2. **Monorepo** (pnpm workspaces).
   - ➕ Types/contrats partagés sans publication, refactors atomiques, une CI, DX
     unifiée, versionnement cohérent.
   - ➖ Dépôt plus gros, discipline de frontières nécessaire.

## Décision

**Monorepo** géré par **pnpm workspaces**. Les applications intégrées tierces
(Immich, Jellyfin…) ne sont **pas** du code dans le repo : elles sont référencées
par leurs images/manifestes dans `deploy/`. Le monorepo ne contient que le code
**natif** KevinOS + l'infrastructure-as-code.

Structure cible (créée en Phase 0) :

```
apps/        dashboard/ · core/ · ai/
packages/    shared-types/ · sdk/ · cli/ · ui/
deploy/      compose/ · modules/ (manifestes) · env examples
docs/        (ce dossier)
```

## Conséquences

- ➕ Contrats partagés → cohérence front/back garantie par le typage.
- ➕ Une seule pipeline CI/CD, versionnement sémantique global + changelog.
- ➖ Nécessite une discipline de dépendances entre paquets (lint des imports).
- Compatible avec la trajectoire K8s : chaque app se build en image indépendante.
