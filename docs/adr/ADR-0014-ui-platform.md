# ADR-0014 — `@kevinos/ui` est une plateforme UI (pas une collection)

**Statut** : Acceptée — 2026-07-12
**Date** : 2026-07-12
**Prolonge** : [ADR-0013](ADR-0013-design-system-proprietaire.md) (Design System).

## Contexte

Le propriétaire veut que `@kevinos/ui` devienne **l'équivalent de Material UI pour
KevinOS** : une **plateforme UI** complète et cohérente. Tous les futurs modules
KOS (et le Dashboard) doivent se construire **uniquement en assemblant** cette
bibliothèque, sans logique d'interface ni composant ad hoc, sans duplication.

Conséquence de méthode : on **termine** la bibliothèque (jusqu'à maturité) **avant**
de créer `apps/dashboard`. Le Dashboard sera un pur assemblage.

## Décision

### 1. Un standard de qualité **par composant** (la « definition of done »)

Aucun composant n'est « fini » tant qu'il n'a pas les **six** livrables demandés :

| Livrable              | Comment il est fourni                                                       |
| --------------------- | --------------------------------------------------------------------------- |
| **Documentation**     | JSDoc structuré en tête du composant (rôle, props, usage)                   |
| **Exemples**          | une _story_ dans l'environnement de démo                                    |
| **États interactifs** | la story expose les états (hover, focus, disabled, loading, variants)       |
| **Accessibilité**     | bloc « A11y » en JSDoc + rôles/ARIA/focus dans le code + assertions de test |
| **Tests unitaires**   | fichier `*.test.tsx` (rendu, variants, comportement, a11y)                  |
| **Rendu visuel**      | via l'environnement de démo (source unique des captures)                    |

### 2. Conventions d'API (uniformité type Material UI)

- **Export nommé** ; `forwardRef` pour tout composant à élément DOM racine.
- **Props extends** les attributs HTML de l'élément sous-jacent (`...rest` transmis).
- **`className` fusionné** via `cx` (surchargeable par l'app, jamais écrasé).
- **Tokens uniquement** — aucune couleur/valeur en dur (garantit thème + refonte).
- **Variants & tailles typés** (unions littérales), défauts sûrs.
- **Contrôlé/non-contrôlé** pour les champs (value/defaultValue + onChange).
- **A11y par défaut** : rôles corrects, `aria-*`, focus visible (jamais retiré),
  `aria-live` pour les composants d'annonce, `prefers-reduced-motion` respecté.
- **Composables** : les gros composants (AppShell, CommandPalette…) sont bâtis sur
  les petits (Card, Button…), jamais monolithiques.

### 3. Organisation

- `packages/ui/src/components/<Nom>.tsx` (+ `<Nom>.test.tsx`).
- Catalogue et avancement suivis dans
  [docs/design/component-catalog.md](../design/component-catalog.md).
- Le paquet reste **sans dépendance runtime** hors `react` (peer) : pas de
  librairie de composants tierce (on ne réimporte pas Material UI ; on construit
  la nôtre — cohérent avec ADR-0013).

### 4. Environnement de démonstration

Un environnement permet de **visualiser tous les composants indépendamment du
Dashboard** (stories, états, doc, a11y). Deux options — voir « Question ouverte ».
Quel que soit le choix, il reste **offline-first** (Règle 2) et devient la **source
des captures**.

### 5. Construction par **vagues** (chaque vague livrée à 100 %)

On ne crée pas les composants au fil des besoins : on suit un plan de vagues (voir
catalogue). Ordre par dépendances : primitives → formulaires → layout → navigation
→ données → dialogues → médias → états → KAI → monitoring → maison.

## Question ouverte (à trancher par le propriétaire)

**Environnement de démo : Storybook vs galerie maison.**

- **Storybook** : standard de l'écosystème (ce qu'utilisent MUI & co.), addons doc
  / interactions / a11y intégrés. ➖ Lourd (nombreuses dépendances), un peu « boîte
  noire », plus long à faire tourner hors-ligne.
- **Galerie maison** (petite app Vite `apps/ui-gallery`) : ➕ légère, 100 % sous
  notre contrôle, offline par nature, cohérente avec nos règles ; ➖ on écrit
  nous-mêmes le shell de la galerie (mais c'est du simple assemblage).

_Recommandation : galerie maison_ (offline-first, contrôle total), avec la même
notion de « story » par composant. Décision consignée en addendum.

## Conséquences

- ➕ Le Dashboard et tous les modules deviennent de **purs assemblages** — zéro
  duplication, cohérence garantie.
- ➕ Chaque composant est documenté, testé, accessible et visible en isolation.
- ➖ Effort initial important **avant** toute UI produit — assumé (Règle 1/4).
- ➖ Discipline : un composant sans ses 6 livrables n'entre pas dans la biblio.

### Conséquences dans plusieurs années

- Une bibliothèque mûre rend le coût d'un **nouveau module** quasi nul côté UI :
  on assemble. C'est ce qui permet à KevinOS de grossir (20-30 modules) **sans**
  dette d'interface ni incohérence.
- La démo isolée reste la **référence vivante** : onboarding d'un nouveau
  développeur, revues visuelles, non-régression.
