# KOS Design Lab

L'**environnement de développement officiel** de KevinOS ([ADR-0015](../../docs/adr/ADR-0015-kos-design-lab.md)).
Module **permanent** : visualiser, tester, documenter et assembler les composants
de `@kevinos/ui`. Le Dashboard et tous les modules KOS s'y valident **avant** d'être
construits — et n'en sont que des **consommateurs**.

## Lancer

```bash
pnpm --filter @kevinos/design-lab dev      # http://localhost:5174
pnpm --filter @kevinos/design-lab build    # build de production
```

## Principes (ADR-0015)

- **Source unique de vérité** : le Lab **importe** `@kevinos/ui`. Aucune copie de
  composant. Les seuls composants propres au Lab sont son outillage (shell, modes).
- **Architecture modulaire** : chaque **mode** est indépendant, déclaré dans un
  **registre** (`src/App.tsx` → `MODES`). Ajouter un mode = ajouter une entrée.
- **Évolutif mais solide** : on ajoute progressivement, sans usine à gaz.
- **Prêt pour KAI** : un futur assistant de conception sera **un mode de plus**,
  consommant le catalogue de composants + les outils KAI.

## Modes

| Groupe      | Mode                                                           | État |
| ----------- | -------------------------------------------------------------- | ---- |
| Composants  | **Explorer** (voir un composant, tous ses états)               | ✅   |
| Composants  | **Inspect** (nom, version, props, tokens, deps, a11y, perf)    | 🟡   |
| Composants  | **Playground** (props en direct, sans code)                    | 🟡   |
| Prototypage | **Sandbox** (assembler/tester/jeter — dev only)                | 🟡   |
| Prototypage | **Screen Builder** (composer une page)                         | 🟡   |
| Prototypage | **Dashboard Preview** (prévisualiser l'Accueil réel)           | 🟡   |
| Design      | **Theme Studio** (Light/Dark/Auto + accents modules)           | ✅   |
| Design      | **Motion Lab** (catalogue central des animations)              | 🟡   |
| Qualité     | **Accessibility** (contrastes, focus, clavier, reduced-motion) | ✅   |
| Qualité     | **Documentation** (doc vivante depuis le code)                 | 🟡   |
| Qualité     | **Tests** (statut des tests par composant)                     | 🟡   |
| Système     | **Settings**                                                   | 🟡   |

## Ajouter un composant (rappel « definition of done »)

Un composant de `@kevinos/ui` n'est **terminé** que s'il a : doc (JSDoc), tests,
**sa page dans le Design Lab** (une _story_ dans `src/stories.tsx`), ses variantes,
et son **accessibilité validée** (mode Accessibility).

## Structure

```
src/
├── App.tsx           registre des modes + shell (outillage du Lab)
├── stories.tsx       stories des composants (source des exemples)
└── modes/            un fichier par mode (indépendants)
    ├── Explorer.tsx
    ├── ThemeStudio.tsx
    └── Accessibility.tsx
```
