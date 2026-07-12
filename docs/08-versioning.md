# 08 — Versioning & compatibilité des modules

> Fondation posée dès le jour 1 (demande du propriétaire, [ADR-0008](adr/ADR-0008-versioning-compatibilite.md)).
> Objectif : quand KevinOS comptera 20-30 modules, l'ajout d'un plugin ne cassera
> **jamais** rien silencieusement. La compatibilité est **explicite** et
> **vérifiée par le Core**.

---

## 1. Principe

Tout suit le **versionnement sémantique** `MAJEUR.MINEUR.CORRECTIF` :

- **MAJEUR** → rupture de contrat (incompatible).
- **MINEUR** → ajout rétrocompatible.
- **CORRECTIF** → correctif rétrocompatible.

## 2. Les briques versionnées

| Brique                                   | Version initiale | Rôle                                                         |
| ---------------------------------------- | :--------------: | ------------------------------------------------------------ |
| **KAI Core** (`core`)                    |     `0.1.0`      | Runtime du Core                                              |
| **API** (`api`)                          |     `1.0.0`      | API HTTP publique (`/api/v1`)                                |
| **Plugin Interface** (`pluginInterface`) |     `1.0.0`      | **Contrat qu'implémente tout module** — axe de compatibilité |
| **Module Files**                         |   `1.0.0` (v1)   | version propre du module                                     |
| **Module Photos**                        |   `1.0.0` (v1)   | version propre du module                                     |
| **Module Media**                         |   `1.0.0` (v1)   | version propre du module                                     |
| … chaque module                          |     `x.y.z`      | version propre                                               |

Les trois versions de l'hôte sont la **source unique de vérité**, dans
`@kevinos/shared` → `KEVINOS_VERSIONS` :

```ts
export const KEVINOS_VERSIONS = {
  core: '0.1.0',
  api: '1.0.0',
  pluginInterface: '1.0.0',
} as const;
```

Elles sont exposées à chaud : `GET /versions` →
`{"core":"0.1.0","api":"1.0.0","pluginInterface":"1.0.0"}`.

## 3. Ce que déclare un module

Dans son manifeste ([contrat de module](adr/ADR-0005-couche-integration-core.md)) :

```yaml
id: kevin-files
name: Kevin Files
version: 1.0.0 # ← version PROPRE du module (Module Files v1)
compat:
  pluginApi: '^1.0.0' # ← plage du Plugin Interface de l'hôte supportée
implementation: kevin-files-native
capabilities: [files]
internalUrl: http://kevin-files:8080
```

- `version` : la version du module lui-même.
- `compat.pluginApi` : la **plage** de `pluginInterface` de l'hôte qu'il supporte.
  `^1.0.0` = « toute version 1.x » = `>=1.0.0 <2.0.0`.
  _(Par défaut : « même MAJEUR que l'interface courante ».)_

## 4. La règle de compatibilité

Sémantique « peerDependency » : un module est compatible si la version
**fournie par l'hôte** satisfait la **plage** déclarée par le module.

```
compatible  ⇔  satisfies(host.pluginInterface, module.compat.pluginApi)
```

Exemple exactement comme demandé :

```
Core expose pluginInterface = 1.4.0
Module « compat.pluginApi = ^1.0.0 »  (= >=1.0.0 <2.0.0)
  → 1.4.0 ∈ [1.0.0, 2.0.0)  → ✅ COMPATIBLE

Module « compat.pluginApi = ^2.0.0 »
  → 1.4.0 ∉ [2.0.0, 3.0.0)  → ❌ REFUSÉ (raison journalisée)
```

## 5. Le Core applique la garde

À l'enregistrement d'un module, le **registre de services** du Core
(`ModuleRegistry.register`) vérifie la compatibilité :

- **compatible** → le module est monté ;
- **incompatible** → il **n'est pas monté**, la **raison est renvoyée** et
  journalisée. Aucun échec silencieux ; le reste du système continue (mode
  dégradé, ENF-13).

État consultable : `GET /modules` liste les modules montés avec leur `version` et
leur `compat`.

## 6. Faire évoluer sans casser

| Changement                       | Action                                 | Effet                                                                                        |
| -------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------- |
| Ajout rétrocompatible au contrat | `pluginInterface` MINEUR (`1.0 → 1.1`) | les plugins `^1` restent compatibles                                                         |
| Correctif                        | `pluginInterface` CORRECTIF            | idem                                                                                         |
| **Rupture** du contrat           | `pluginInterface` MAJEUR (`1.x → 2.0`) | **tous** les plugins `^1` deviennent incompatibles → mise à jour requise, signalée d'un coup |

Toute montée MAJEURE du `pluginInterface` = **ADR + entrée CHANGELOG** dédiés.

## 7. Pourquoi maintenant

Cela paraît anodin avec 3 modules. Avec 25, c'est ce qui évite les pannes
silencieuses et les après-midis de débogage. C'est une fondation **peu coûteuse à
poser aujourd'hui, très coûteuse à rétro-installer plus tard** — donc posée
maintenant.

## 8. Implémentation & tests

- Code : `@kevinos/shared` → `versioning.ts` (`KEVINOS_VERSIONS`,
  `checkCompatibility`, `defaultPluginApiRange`) + `module-contract.ts`
  (`version`, `compat`).
- On s'appuie sur la bibliothèque standard **`semver`** (on ne réimplémente pas
  le versionnement — [ADR-0004](adr/ADR-0004-integrer-vs-construire.md)).
- Couverts par tests unitaires (compatibilité, plages, refus) et par le registre
  du Core (montage/refus, `GET /modules`, `GET /versions`).
