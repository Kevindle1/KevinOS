# @kevinos/ui — KOS Design System

Tokens, preset Tailwind et composants réutilisables par **tous** les modules KOS
([ADR-0013](../../docs/adr/ADR-0013-design-system-proprietaire.md)). Aucune valeur
visuelle « en dur » dans les modules : tout passe par ce paquet.

## Contenu

- **`src/tokens.css`** — source unique de vérité (couleurs, rayons, ombres,
  motion, typo). Thème clair par défaut ; sombre via `prefers-color-scheme` **et**
  `data-theme` (la bascule utilisateur prime).
- **`preset`** — preset Tailwind qui **référence** ces tokens (`@kevinos/ui/preset`).
- **`theme`** — helpers sans dépendance : `initTheme`, `applyTheme`, `resolveTheme`.
- **composants** — `Button`, `Card` (d'autres à venir : StatTile, ModuleCard,
  SearchInput/CommandPalette, Toast…).

## Utilisation (au niveau d'une app)

```ts
// styles d'entrée
import '@kevinos/ui/tokens.css';

// tailwind.config.ts
import kosPreset from '@kevinos/ui/preset';
export default { presets: [kosPreset], content: ['./src/**/*.{ts,tsx}'] };
```

```tsx
import { Button, Card, initTheme } from '@kevinos/ui';

initTheme(); // applique la préférence enregistrée au démarrage
<Card interactive>
  <Button variant="primary">Enregistrer</Button>
</Card>;
```

## Principe

Le thème bascule en changeant `data-theme` sur `<html>` — **aucun** composant ne
connaît « clair » ou « sombre », seulement des tokens. Un rafraîchissement visuel
futur = changer les tokens, sans toucher aux modules.
