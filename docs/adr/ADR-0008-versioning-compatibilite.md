# ADR-0008 — Versioning des modules & compatibilité (SemVer + Plugin Interface)

**Statut** : Acceptée — validée par le propriétaire le 2026-07-12
**Date** : 2026-07-12
**Lié à** : [ADR-0005](ADR-0005-couche-integration-core.md) (le Core comme couche
d'intégration) — le versioning est le pendant _temporel_ de la modularité.

## Contexte

KevinOS visera à terme 20 à 30 modules, ajoutés sous forme de **plugins sans
modifier le cœur**. Sans règle de compatibilité posée **dès le départ**, on
s'expose, dans un an, à des ruptures silencieuses : un module écrit pour une
ancienne version du contrat cesse de fonctionner, ou pire, fonctionne mal sans
qu'on sache pourquoi.

Le propriétaire demande explicitement un système de versions par brique :

```
KAI Core v1 · Module Files v1 · Module Photos v1 · Module Media v1
API v1 · Plugin Interface v1
```

… avec une **compatibilité par plage** :

```
Core 1.0  ↳ accepte les plugins >= 1.0 < 2.0
```

## Décision

### 1. SemVer partout (MAJOR.MINOR.PATCH)

Chaque brique versionnée suit le [versionnement sémantique](https://semver.org) :

- **MAJOR** : rupture de contrat (incompatible).
- **MINOR** : ajout rétrocompatible.
- **PATCH** : correctif rétrocompatible.

### 2. Trois contrats versionnés exposés par l'hôte

L'hôte (KevinOS Core) publie trois versions indépendantes :

| Contrat               | Rôle                                             | v initiale |
| --------------------- | ------------------------------------------------ | ---------- |
| **`core`**            | version du runtime Core (KAI Core)               | `0.1.0`    |
| **`api`**             | version de l'API HTTP publique (`/api/v1`)       | `1.0.0`    |
| **`pluginInterface`** | **le contrat que tout module/plugin implémente** | `1.0.0`    |

Le **`pluginInterface`** est **l'axe de compatibilité central** : c'est lui qui
détermine si un plugin peut se brancher.

### 3. Chaque module déclare sa version **et** sa plage de compatibilité

Dans son manifeste, un module fournit :

- `version` : sa **propre** version SemVer (ex. « Module Files v1 » = `1.0.0`).
- `compat.pluginApi` : la **plage** de versions du `pluginInterface` de l'hôte
  qu'il supporte (ex. `^1.0.0`, équivalent à `>=1.0.0 <2.0.0`).

### 4. Règle de compatibilité (sémantique « peerDependency »)

Un module est **compatible** si la version `pluginInterface` **fournie par
l'hôte** satisfait la **plage** déclarée par le module :

```
compatible  ⇔  semver.satisfies(host.pluginInterface, module.compat.pluginApi)
```

Exemple demandé : hôte `pluginInterface = 1.4.0`, module `compat.pluginApi = ^1.0.0`
→ `1.4.0` ∈ `[1.0.0, 2.0.0)` → **compatible**. Un module `^2.0.0` serait **refusé**.

### 5. Le Core **refuse** d'enregistrer un module incompatible

Le registre de services (ADR-0005) valide la compatibilité **à
l'enregistrement**. Un module incompatible n'est pas monté ; l'incompatibilité
est **journalisée** avec une raison explicite (pas d'échec silencieux). Le reste
du système continue de fonctionner (mode dégradé, ENF-13).

### 6. On n'implémente pas SemVer soi-même

On s'appuie sur la bibliothèque **`semver`** (standard de l'écosystème), cohérent
avec la philosophie « ne pas réinventer » ([ADR-0004](ADR-0004-integrer-vs-construire.md)).

## Conséquences

- ➕ **Fondation posée dès le jour 1** : ajouter un plugin dans un an ne cassera
  rien sans qu'on le sache — la compatibilité est vérifiée et explicite.
- ➕ Contrat unique et clair pour les auteurs de modules : « je cible
  `pluginInterface ^1` ».
- ➕ Évolution maîtrisée : passer le `pluginInterface` en `2.0.0` signale d'un
  coup tous les modules à mettre à jour.
- ➖ Discipline requise : toute rupture de contrat = **bump MAJEUR** du
  `pluginInterface` (à documenter dans un ADR + CHANGELOG).
- Les versions vivent dans `@kevinos/shared` (source unique de vérité), donc
  Core, SDK et futurs plugins partagent la même définition.

## Suivi

- Un **CHANGELOG du Plugin Interface** sera tenu à part quand les premiers
  plugins tiers existeront.
- Politique de dépréciation (combien de temps une MINOR obsolète reste supportée)
  à définir quand le besoin apparaîtra.
