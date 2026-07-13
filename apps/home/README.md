# `@kevinos/home` — Home, la première expérience de KevinOS

> _KevinOS ne remplace pas les meilleurs outils. Il les orchestre pour offrir une
> seule expérience._

**Home** est le **premier écran réel** de KevinOS : l'accueil. Ce n'est pas un
Dashboard, c'est un **assistant**. Quand KevinOS s'ouvre, on doit ressentir
**calme, simplicité, intelligence, confiance** ([ADR-0017](../../docs/adr/ADR-0017-principes-conception-composants.md),
[Règle 0](../../docs/REGLES-ARCHITECTURE.md)).

L'écran est **centré sur KAI** :

```
Bonjour Kevin 👋
Comment puis-je t'aider aujourd'hui ?
[ zone de conversation ]
```

Pas une grille de widgets : une **page vivante**.

## Principes

- **Assemblage, jamais création.** Home **n'invente pas** de composant : il
  assemble ceux de [`@kevinos/ui`](../../packages/ui). S'il manque une brique, on
  la crée d'abord dans `@kevinos/ui` (doc, tests, Design Lab, a11y), puis on revient
  à Home. **Home pilote l'évolution de l'UI**, pas l'inverse.
- **Construit par itérations.** Chaque itération produit un écran **réellement
  utilisable**, même incomplet.
- **KAI d'abord.** Tout est pensé autour de KAI, même avant qu'il existe.

La **boussole émotionnelle** de Home vit dans
[`HOME_EXPERIENCE.md`](../../HOME_EXPERIENCE.md) (réflexion produit, sans code) :
l'émotion visée, le ressenti à 5 s / 30 s / plusieurs jours, les principes
psychologiques, et le **salut vivant** de KAI. On la relit **avant chaque
itération**, avec le filtre produit (valeur · cohérence · pertinence · simplicité).

## État — itération 1

- Accueil KAI-first : salutation, **zone de conversation**, suggestions.
- **KAI est simulé** (réponses calmes et honnêtes). Le vrai KAI (Vague 4) se
  branchera **au même endroit** (`onSubmit` du `PromptInput`) sans toucher à Home.
- Thème clair / sombre / système.
- Composant créé à la demande pour cette itération : **`PromptInput`**.

### À venir (prochaines itérations)

Activité récente · dernières photos · reprendre un média · état du système ·
suggestions · notifications · accès rapide aux modules. Chacune n'ajoutera à
`@kevinos/ui` que le strict nécessaire.

## Développement

```bash
pnpm --filter @kevinos/home dev        # http://localhost:5175
pnpm --filter @kevinos/home build
pnpm --filter @kevinos/home typecheck
```

Le [KOS Design Lab](../design-lab/README.md) reste l'atelier des composants ;
`@kevinos/home` est le **produit** qu'on assemble avec.
