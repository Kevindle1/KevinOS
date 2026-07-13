# ADR-0018 — Ne pas réinventer un problème résolu (Floating UI pour le positionnement)

**Statut** : Acceptée — 2026-07-12
**Date** : 2026-07-12
**Lié à** : [Règle 8](../REGLES-ARCHITECTURE.md), [ADR-0004](ADR-0004-integrer-vs-construire.md)
(intégrer plutôt que construire), [ADR-0014](ADR-0014-ui-platform.md).

> **Mantra.** _KevinOS ne remplace pas les meilleurs outils. Il les orchestre pour
> offrir une seule expérience._ — **y compris dans notre code.**

## Contexte

Les composants flottants (`Tooltip`, `Popover`, plus tard `CommandPalette`,
menus…) exigent un **positionnement** correct : ancrage, détection de collision,
`flip`, `shift`, mise à jour au scroll/redimensionnement, gestion du portail et des
interactions clavier. C'est un problème **complexe, mature et déjà parfaitement
résolu**. Le réécrire représenterait des centaines de lignes de logique sans
**aucune valeur métier** pour KevinOS.

## Décision

Conformément à la **Règle 8**, on utilise un **moteur de positionnement externe**,
léger et reconnu : **Floating UI** (`@floating-ui/react`). Mais **le composant
reste un composant KevinOS** :

| Sous le contrôle de `@kevinos/ui`           | Délégué au moteur                          |
| ------------------------------------------- | ------------------------------------------ |
| composant, **API publique**, design, tokens | calcul de **position** (flip/shift/offset) |
| **animations**, interactions, focus         | mise à jour au scroll/resize               |
| **accessibilité** (rôles/aria), copie       | primitives de portail                      |

Floating UI n'est **jamais** exposé dans l'API publique de nos composants :
l'appelant voit `<Tooltip>` / `<Popover>`, pas Floating UI. On pourrait le
remplacer sans changer nos API (cohérent avec la remplaçabilité, ADR-0005).

**Note sur [ADR-0014](ADR-0014-ui-platform.md)** : la formulation « sans
dépendance runtime hors React » est **assouplie** par la Règle 8 — on autorise des
**moteurs spécialisés, mûrs et légers** (comme Floating UI) quand ils améliorent
robustesse, maintenance et qualité. On ne réécrit pas ; on orchestre.

## Alternatives rejetées

- **Réimplémenter un moteur de positionnement maison** : des centaines de lignes
  complexes à maintenir (collisions, virtualisation, RTL, edge cases mobiles), zéro
  valeur produit, source de bugs. Contraire à la Règle 8.
- **Popper.js (v2)** : bon mais moins moderne/traité que son successeur Floating UI.
- **Positionnement CSS pur (`anchor()`)** : encore inégalement supporté ; on y
  passera peut-être plus tard, sans changer nos API.

## Conséquences

- ➕ Tooltip/Popover **robustes** (collisions, mobile) sans dette maison.
- ➕ Temps de dev **réinvesti** dans ce qui rend KevinOS unique (KAI, KOS, Home).
- ➕ Offline-first respecté : dépendance **packagée** (npm), aucun CDN.
- ➖ Une dépendance de plus à suivre (mûre, largement adoptée — risque faible).

### Conséquences dans plusieurs années

- Le moteur étant **caché derrière nos API**, on pourra le remplacer (ex. par le
  CSS `anchor()` natif quand il sera universel) **sans toucher aux modules**.
- La Règle 8 devient un **filtre permanent** : à chaque brique « infra » (Markdown,
  chiffrement, WebSocket…), on orchestre le meilleur outil plutôt que réécrire —
  ce qui garde la base **petite, sûre et concentrée sur le produit**.
