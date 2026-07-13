# ADR-0015 — KOS Design Lab, module officiel & environnement de dev

**Statut** : Acceptée — 2026-07-12
**Date** : 2026-07-12
**Prolonge** : [ADR-0014](ADR-0014-ui-platform.md) (plateforme UI). Remplace la
décision « galerie maison » par une vision élargie.

## Contexte

L'environnement de démo ne doit pas être une simple galerie : le propriétaire veut
un **KOS Design Lab** — l'**environnement de développement officiel** de KevinOS,
**module permanent** qui évolue au même rythme que le reste. Il sert à visualiser,
tester (états, thèmes, responsive), vérifier l'accessibilité, documenter, et
**construire des écrans par assemblage** — devenant la **référence unique** de tout
développement d'interface.

## Décision

### 1. Le Design Lab est un **module officiel et permanent**

- App `apps/design-lab` (`@kevinos/design-lab`), maintenue à parité avec `@kevinos/ui`.
- C'est la **source vivante** de la documentation visuelle, des états et des captures.

### 2. « Definition of Done » d'un composant — **étendue**

Un composant n'est **terminé** que s'il a **tout** ceci (ADR-0014 + ajout Lab) :

1. Documentation (JSDoc)
2. Tests unitaires
3. **Sa page dans le Design Lab**
4. Ses variantes / états
5. Accessibilité validée (dans le Lab)

### 3. Règle d'or — le **Dashboard ne crée jamais de composant**

Le Dashboard (et tout module KOS) est un **pur consommateur** de `@kevinos/ui`.
S'il manque un composant, il est **d'abord** créé dans `@kevinos/ui` — documenté,
testé, ajouté au Design Lab, accessibilité validée — **avant** d'être utilisé.
Aucune logique d'interface ni composant ad hoc hors de la bibliothèque.

### 4. Les 7 modes du Design Lab

| #   | Mode                   | Rôle                                                         | État       |
| --- | ---------------------- | ------------------------------------------------------------ | ---------- |
| 1   | **Component Explorer** | voir un composant seul, toutes variantes/tailles/états       | ✅ v1      |
| 2   | **Playground**         | modifier les props en direct (sans code)                     | 🟡 à venir |
| 3   | **Screen Builder**     | composer une page en assemblant des composants               | 🟡 à venir |
| 4   | **Theme Studio**       | Light / Dark / Auto + accents de module en direct            | ✅ v1      |
| 5   | **Accessibility**      | contrastes, focus, clavier, lecteurs d'écran, reduced-motion | ✅ v1      |
| 6   | **Motion Lab**         | catalogue central des animations (voir règle motion)         | 🟡 à venir |
| 7   | **Dashboard Preview**  | prévisualiser l'Accueil par assemblage — base du Dashboard   | 🟡 à venir |

### 5. Règle **motion centralisée**

Aucune animation n'est codée « en dur » dans un composant : toutes les
transitions dérivent des **tokens de motion** (durées, courbes) et d'un jeu
d'**utilitaires d'animation** centralisés. Le **Motion Lab** en est le catalogue et
la référence. _(Les composants actuels utilisent déjà `duration-*`/`ease-*` mappés
sur les tokens ; le Motion Lab formalisera keyframes et presets réutilisables.)_

## Règles complémentaires (validées le 2026-07-12)

1. **Le Design Lab est un produit** — pas une page de démo : environnement
   officiel de conception, validation et maintenance, maintenable des années.
   Chaque fonctionnalité doit avoir une **vraie valeur** pour le développement.
2. **Architecture modulaire** — le Lab est organisé **comme KevinOS** : chaque
   mode est un « module » **indépendant** (Explorer, Playground, Theme Studio,
   Motion Lab, Accessibility, Screen Builder, Documentation, Tests, Settings,
   Sandbox, Inspect…). Implémenté via un **registre de modes** : ajouter un mode =
   ajouter une entrée, sans toucher aux autres.
3. **Source unique de vérité** — le Lab **importe** exactement les composants de
   `@kevinos/ui`. Aucune copie de composant. Les seuls composants propres au Lab
   sont ceux de son **outillage** (shell, modes).
4. **Documentation vivante** — générée depuis le code (JSDoc/types) autant que
   possible ; reflète toujours l'état réel de `@kevinos/ui` ; **aucune doc
   dupliquée**.
5. **Prévisualisation réelle** — quand le Dashboard existera, il s'exécutera dans
   le Lab avec les **vrais** composants (mode Dashboard Preview), sans duplication.
6. **Mode Sandbox** — espace de prototypage : assembler, régler, enregistrer puis
   supprimer un prototype. **Outil de dev uniquement**, jamais dans le produit.
7. **Mode Inspect** — diagnostic d'un composant : nom, **version**, props, **tokens
   utilisés**, dépendances, accessibilité, **performances de rendu**. Le Lab devient
   aussi un outil de débogage.
8. **Évolutivité** — simple mais **très solide** ; on ajoute progressivement ;
   pas d'usine à gaz ; chaque mode répond à un vrai besoin.

### Prêt pour KAI (sans refonte)

L'architecture est pensée **dès aujourd'hui** pour accueillir plus tard un
**assistant de conception KAI** dans le Lab (« crée une carte de stats pour KOS
Media », « génère une variante sombre », « quels composants pour un écran
galerie ? »). Ce sera **un mode de plus** dans le registre, qui consommera : le
**catalogue de composants** (métadonnées + tokens, source unique) et les **outils
KAI** ([`@kevinos/shared`](../../packages/shared/src/ai-provider.ts)). Aucune
remise en cause de la structure : le registre de modes + les métadonnées de
composants sont les points d'extension prévus.

## Conséquences

- ➕ Un **vrai environnement de développement** : chaque module futur (Vision,
  Media, Drive, Home…) se construit par assemblage, avec une référence unique.
- ➕ Qualité forcée : pas de composant « fini » sans sa page Lab + a11y validée.
- ➕ Le Dashboard devient trivial (assemblage) et **cohérent** par construction.
- ➖ Le Lab est un module à maintenir en continu (assumé — il fait gagner du temps
  à chaque nouveau module).

### Conséquences dans plusieurs années

- Le Lab devient l'**outil d'onboarding** et de **non-régression visuelle** : un
  nouveau développeur comprend tout le système en un endroit.
- Screen Builder + Dashboard Preview permettront de **prototyper un module entier**
  avant d'écrire son app — accélérant chaque ajout au catalogue KevinOS.
- La règle « Dashboard = consommateur » garantit qu'à 30 modules, l'UI reste **une
  seule bibliothèque**, sans duplication ni dérive.
