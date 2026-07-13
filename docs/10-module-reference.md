# 10 — Module de référence : 📷 KOS Vision

> **KOS Vision** (photos) est le **patron** de tous les futurs modules KevinOS
> (KOS Media, KOS Drive, KOS Home…). Il matérialise les règles
> ([REGLES-ARCHITECTURE](REGLES-ARCHITECTURE.md)) en code. Copier sa structure =
> obtenir un module conforme.

---

## Le principe : Immich est caché et remplaçable

```
Utilisateur / KAI / Dashboard
        │  (langage naturel ou API v1)
        ▼
   KevinOS Core ── PhotoLibrary (port, agnostique) ──▶ ImmichPhotoAdapter ──▶ Immich
        ▲                                                     (SEUL à connaître Immich)
        └── /api/v1/photos/*  (contrat public, identique pour tous les clients)
```

- L'utilisateur ne voit jamais « Immich » : il voit **KOS Vision** ([ADR-0012](adr/ADR-0012-identite-modules-kos.md)).
- Le Dashboard et KAI ne parlent qu'au **contrat** (Règles 3 & 5).
- Remplacer Immich = réécrire **un seul fichier** (l'adaptateur) + l'overlay.

## Les 7 pièces d'un module (et où KOS Vision les place)

| #   | Pièce                    | Rôle                            | Emplacement KOS Vision                                                       |
| --- | ------------------------ | ------------------------------- | ---------------------------------------------------------------------------- |
| 1   | **Contrat (port + DTO)** | interface agnostique du moteur  | `packages/shared/src/photos.ts` (`PhotoLibrary`)                             |
| 2   | **Adaptateur**           | seul code qui connaît le moteur | `apps/core/src/infrastructure/immich/immich-photo-adapter.ts`                |
| 3   | **Service (use-cases)**  | garde-fous, valeurs par défaut  | `apps/core/src/application/photo-service.ts`                                 |
| 4   | **API v1**               | contrat HTTP public             | `apps/core/src/interfaces/http/routes/photos.routes.ts` (`/api/v1/photos/*`) |
| 5   | **Outils KAI**           | intentions → actions            | `packages/shared/src/photos.ts` (`photoTools`)                               |
| 6   | **Manifeste**            | déclaration + compatibilité     | `deploy/modules/kos-vision/module.yaml`                                      |
| 7   | **Overlay (moteur)**     | déploiement du moteur, isolé    | `deploy/compose/docker-compose.kos-vision.yml`                               |

_(La 8ᵉ pièce — l'intégration Dashboard — arrive avec l'app Dashboard ; elle ne
consommera que la pièce 4, jamais le moteur.)_

## Le flux, de l'intention à la photo

1. **Utilisateur** : « Montre-moi les photos des vacances 2024. »
2. **KAI (KOS Brain)** choisit l'outil `photos.search` avec `{ text: "vacances 2024" }`.
3. **Core** exécute via `PhotoService.search` → `PhotoLibrary.search`.
4. **ImmichPhotoAdapter** traduit en `POST /search/smart` vers Immich, **transforme**
   la réponse en DTO KevinOS (miniatures → `/api/v1/photos/:id/thumbnail`).
5. **Dashboard** (ou KAI) affiche le résultat via `/api/v1/photos/search?q=...`.

À aucun moment un client ne connaît Immich.

## Capacités exposées (objectifs du module)

| Objectif                 | Endpoint API v1                    | Port                    |
| ------------------------ | ---------------------------------- | ----------------------- |
| Parcourir la photothèque | `GET /api/v1/photos`               | `browse`                |
| Rechercher               | `GET /api/v1/photos/search?q=`     | `search`                |
| Albums                   | `GET /api/v1/photos/albums[/:id]`  | `listAlbums`/`getAlbum` |
| Personnes reconnues      | `GET /api/v1/photos/people`        | `listPeople`            |
| Souvenirs                | `GET /api/v1/photos/memories`      | `getMemories`           |
| Carte                    | `GET /api/v1/photos/map`           | `getMapPoints`          |
| Espace utilisé           | `GET /api/v1/photos/usage`         | `getUsage`              |
| Miniatures (proxy)       | `GET /api/v1/photos/:id/thumbnail` | `PhotoThumbnails`       |

> « Lancer les sauvegardes » relève du module **KOS Backup** (transverse) ; KAI
> composera les deux (« sauvegarde mes photos ») sans couplage entre modules.

## Checklist « créer un nouveau module » (ex. KOS Media)

1. **Contrat** : définir le port + DTO agnostiques dans `@kevinos/shared`.
2. **Outils KAI** : lister les `ToolDefinition` (intentions → actions).
3. **Adaptateur** : implémenter le port pour le moteur choisi (le seul fichier
   qui connaît le moteur) + tests avec `fetch` mocké.
4. **Service** : use-cases + garde-fous.
5. **API v1** : routes `/api/v1/<domaine>/*` + tests supertest.
6. **Enregistrement** : `module.yaml` (version + `compat`) + montage dans le
   registre (garde de compatibilité, ADR-0008) + readiness.
7. **Overlay** : `docker-compose.<module>.yml` (moteur isolé, secrets par fichier).
8. **Docs** : mettre à jour le catalogue + l'identité ([09](09-identite-modules.md)).

Un module qui coche cette liste est **conforme, testé, remplaçable et versionné**.

## Ce qui reste pour rendre KOS Vision « visible »

Le **backend de référence est complet et testé** (contrat, adaptateur, API v1,
outils KAI, manifeste, overlay). Restent, prochaine étape :

- **Dashboard** (app React) : la galerie, la recherche, les albums, la carte —
  consommant **uniquement** `/api/v1/photos/*`.
- **KOS Brain (KAI)** : l'orchestrateur qui sélectionne les `photoTools` à partir
  du langage naturel (modèle local Ollama, ADR-0006).
