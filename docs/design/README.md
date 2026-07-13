# Fondation design de KevinOS

> À produire et **valider AVANT** d'écrire la moindre ligne d'interface (demande
> du propriétaire). Trois piliers, plus une décision d'architecture.

| Document                                                  | Rôle                                                                   |
| --------------------------------------------------------- | ---------------------------------------------------------------------- |
| [ux-ui-charter.md](ux-ui-charter.md)                      | **Charte UX/UI** : philosophie, navigation, interaction, accessibilité |
| [design-system.md](design-system.md)                      | **KOS Design System (KDS)** : tokens, composants, motion, icônes       |
| [wireframes.md](wireframes.md)                            | **Wireframes** de toutes les vues principales                          |
| [ADR-0013](../adr/ADR-0013-design-system-proprietaire.md) | Décision : DS **propriétaire** sur Tailwind                            |

**Aperçu visuel** : un prototype HTML autonome (thème clair/sombre) accompagne
cette fondation pour la _ressentir_ avant tout code. Ce n'est **pas** le Dashboard
de production — juste un support de validation.

---

## Ce que nous validons ici

1. La **direction visuelle** (premium, minimale, cohérente — « un vrai OS »).
2. Le **modèle de navigation** (rail + recherche globale/command palette + KAI
   omniprésent).
3. Le **langage de composants** que **tous** les modules KOS réutiliseront.

> Rien n'est codé dans `apps/dashboard` tant que cette base n'est pas validée.
