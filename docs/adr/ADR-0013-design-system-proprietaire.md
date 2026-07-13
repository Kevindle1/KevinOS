# ADR-0013 — Design System propriétaire (KDS) sur Tailwind

**Statut** : Acceptée — 2026-07-12
**Date** : 2026-07-12
**Lié à** : [Règle 4 — UX-First](../REGLES-ARCHITECTURE.md), [Règle 6 — interface unique](../REGLES-ARCHITECTURE.md),
[Identité KOS](../09-identite-modules.md).

## Contexte

Le Dashboard doit devenir l'**écran d'accueil de KevinOS** et rester **la base
pendant plusieurs années**. Il doit sembler **premium, minimaliste, cohérent**
(inspirations Apple, Nothing, Tesla, Arc, Notion, Home Assistant) — pas une
interface d'admin. Tous les futurs modules KOS partageront cette base. Contraintes
du projet : **offline-first** (aucune dépendance CDN), qualité durable,
accessibilité.

## Décision

Créer un **Design System propriétaire, le KOS Design System (KDS)**, plutôt que
d'adopter un thème/kit existant.

1. **Tailwind CSS comme moteur** (validé), mais **piloté par nos tokens** : les
   couleurs, espacements, rayons, ombres, durées de Tailwind sont **remplacés** par
   les tokens KDS (thème Tailwind étendu). On n'utilise pas la palette Tailwind par
   défaut ni un thème tiers.
2. **Architecture token-first** : une **seule source de vérité** de design tokens
   (CSS custom properties), exposée à Tailwind. Le thème **clair/sombre** se joue
   au niveau des tokens, pas des composants.
3. **Composants maison** (React) construits sur ces tokens, dans un paquet partagé
   `@kevinos/ui`, **réutilisé par tous les modules KOS**.
4. **Icônes offline** : jeu **Lucide** (licence ISC, tree-shakeable, packagé via
   npm — aucun CDN). Les **emojis d'identité** de module (📷🎬📁…) restent des
   marqueurs de marque, distincts des icônes fonctionnelles.
5. **Typographie self-hosted** : **Inter** (variable, via `@fontsource`) +
   fallback système ; une mono (**JetBrains Mono**) pour chiffres/labels techniques
   (clin d'œil « Nothing »). Aucune police chargée depuis Internet (offline-first).
6. **Accessibilité intégrée** : contrastes AA minimum, focus visibles, navigation
   clavier, `prefers-reduced-motion`, cibles tactiles ≥ 44 px.

## Alternatives rejetées

- **Adopter un kit tiers** (Material, Ant, shadcn/ui tel quel, thème HA) :
  - ➖ Identité générique/« déjà vue » ; on hérite d'un langage visuel qu'on ne
    contrôle pas ; dépendance à l'évolution d'un tiers ; risque de « look daté »
    difficile à corriger. Contraire à l'objectif « rester moderne des années ».
  - _(shadcn/ui pourra inspirer nos patterns d'implémentation, mais les tokens et
    l'identité restent KDS.)_
- **Tailwind « par défaut »** (palette/échelles standard) :
  - ➖ Uniformise vers un look « Tailwind » reconnaissable ; ne porte aucune
    identité KevinOS.
- **CSS-in-JS / autre moteur** :
  - ➖ Le propriétaire a validé Tailwind ; pas de raison de s'en écarter.
- **Icônes/polices via CDN** :
  - ➖ Violent l'offline-first (Règle 2). Rejeté.

## Conséquences

- ➕ Identité **unique et cohérente** sur tous les modules KOS ; contrôle total du
  langage visuel.
- ➕ Le thème clair/sombre et les futures évolutions se pilotent depuis **un seul
  fichier de tokens**.
- ➕ 100 % offline (polices + icônes packagées).
- ➖ Coût initial plus élevé (concevoir avant de coder) — **assumé** : le
  propriétaire préfère la qualité durable à la vitesse (Règle 1/4).
- ➖ Discipline requise : tout composant passe par `@kevinos/ui` et les tokens ; pas
  de valeurs « en dur » dans les modules.

### Conséquences dans plusieurs années

- Un **rafraîchissement visuel** (nouvelle palette, nouveau style) se fera en
  **changeant les tokens**, sans réécrire les modules : l'UI peut « rajeunir » sans
  refonte. C'est précisément ce qui permet de **rester moderne dans le temps**.
- Une **app mobile** ou une **API publique** réutiliseront les mêmes tokens/patterns
  (cohérence multi-surfaces), cohérent avec l'API-First (Règle 3).
- Le DS étant découplé des modules, ajouter un module (KOS Media…) n'implique
  **aucune** décision visuelle nouvelle : on assemble des composants existants.
