# ADR-0005 — Le Core comme unique couche d'intégration

**Statut** : Acceptée — validée le 2026-07-12 (étape 6)
**Date** : 2026-07-12

## Contexte

L'architecture retenue ([ADR-0004](ADR-0004-integrer-vs-construire.md)) intègre de
nombreuses applications tierces. Le CDC exige des modules **indépendants et
remplaçables** (ENF-01) et un fonctionnement en **mode dégradé** (ENF-13). Si le
Dashboard ou Kevin AI appelaient « en dur » chaque application (URLs, formats,
authentification spécifiques), remplacer un module deviendrait un refactor global.

## Options

1. **Intégration directe** : chaque consommateur (Dashboard, AI) appelle
   directement chaque app tierce.
   - ➕ Moins de couches, un peu moins de latence.
   - ➖ Couplage fort ; remplacer une app impacte tous les consommateurs ; logique
     d'auth/format dupliquée ; mode dégradé difficile à garantir.
2. **Le Core comme façade/anti-corruption layer** : les consommateurs ne parlent
   qu'au Core via des **ports** (interfaces stables) ; le Core possède les
   **adaptateurs** vers chaque app.
   - ➕ Modules **remplaçables** (on ne touche qu'un adaptateur) ; auth/format
     centralisés ; mode dégradé géré au même endroit ; API/SDK/CLI cohérents.
   - ➖ Une couche de plus à maintenir.

## Décision

**Le Core est l'unique couche d'intégration** (pattern _Anti-Corruption Layer_ /
_API Gateway_) :

- Le **domaine** définit des **ports** (ex. `PhotoLibrary`, `MediaLibrary`,
  `HomeAutomation`) — des interfaces exprimées dans le langage de KevinOS.
- L'**infrastructure** du Core fournit un **adaptateur** concret par application
  (ex. `ImmichPhotoAdapter implements PhotoLibrary`).
- **Dashboard, Kevin AI, API, SDK, CLI** ne connaissent **que les ports**, jamais
  l'app concrète.
- Chaque module est décrit par un **manifeste** (`deploy/modules/<nom>/module.yaml`)
  consommé par le **registre de services** du Core.

Remplacer Immich par PhotoPrism = écrire `PhotoPrismPhotoAdapter` + mettre à jour
le manifeste. Aucun autre code ne change.

## Conséquences

- ➕ Modularité et remplaçabilité réelles (ENF-01) ; mode dégradé centralisé
  (ENF-13) ; API/SDK/CLI homogènes malgré des apps hétérogènes.
- ➕ Point unique pour l'observabilité, l'audit et le contrôle d'accès des actions
  IA sur les modules.
- ➖ Chaque nouveau type de module demande de définir un port + un adaptateur
  (coût maîtrisé, et c'est le prix de la modularité).
