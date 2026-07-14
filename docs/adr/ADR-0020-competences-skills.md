# ADR-0020 — Les compétences (Skills), vocabulaire de KAI

**Statut** : Acceptée — 2026-07-14
**Date** : 2026-07-14
**Lié à** : [ADR-0019](ADR-0019-kai-orchestrateur.md) (orchestrateur KAI),
[ADR-0016](ADR-0016-plateforme-experience.md) (plateforme d'expérience),
[ADR-0012](ADR-0012-identite-modules-kos.md) (identité KOS), [Règle 5](../REGLES-ARCHITECTURE.md)
(KAI, point d'entrée), [Règle 6](../REGLES-ARCHITECTURE.md) (interface unique).

> _« L'utilisateur ne manipule plus des applications, il demande simplement à KAI
> d'accomplir une tâche. »_ — Product Owner, 2026-07-14.

## Contexte

Jusqu'ici, KAI proposait d'« ouvrir un **module** » (`open_module`). Mais du point
de vue de l'utilisateur, KevinOS n'est pas un lanceur d'applications : c'est un
**assistant** à qui l'on confie des **tâches**. Nommer « module » ce que l'on
invoque trahit la vision (un tableau de bord de plus) ; « **compétence** » la sert.

## Décision

KAI raisonne et agit en **compétences (Skills)**, pas en modules. Une compétence
est ce que KAI **sait faire** ; elle s'appuie sur un **module KOS** (moteur caché,
remplaçable) :

| Compétence  | Module KOS | Moteur (caché) |
| ----------- | ---------- | -------------- |
| 📷 `photos` | KOS Vision | Immich         |
| 🎬 `media`  | KOS Media  | Jellyfin       |
| 📁 `drive`  | KOS Drive  | Nextcloud…     |
| 🏠 `home`   | KOS Home   | Home Assistant |

- **Contrat** (`@kevinos/shared`) : l'action de KAI est `open_skill`
  (`skill: KaiSkillId`, paramètres éventuels — ex. `photoQuery`). `open_module`
  est retiré.
- **Core** : une couche `skills` (à côté des capacités système). Une compétence
  interprète l'intention en langage naturel (déterministe, hors ligne) et renvoie
  un `KaiReply` avec une action. La compétence `photos` parle **uniquement** au
  contrat `PhotoLibrary` — jamais à Immich (Règle 5).
- **Home** : l'action ouvre la **surface** de la compétence **dans** Home (pas une
  autre app) — transition naturelle, retour naturel. « KAI m'amène vers les
  photos », il n'« ouvre pas un logiciel ».
- **Repli** : sans Core, Home détecte l'intention et affiche une **démonstration**
  simulée — l'expérience ne casse jamais, et l'écran reste **honnête** (mention
  « démo »).

## Alternatives rejetées

- **Garder « module »** dans le vocabulaire de KAI : techniquement correct, mais
  contraire à la promesse produit (on demande une tâche, pas une app).
- **Exposer les moteurs** (ouvrir Immich) : viole Règles 5 et 6, et la
  remplaçabilité. Le moteur reste un détail derrière le contrat.

## Conséquences

- ➕ Le **même patron** se réplique pour KOS Media / Drive / Home : ajouter une
  compétence = un intent + une surface, sans toucher à KAI ni aux autres.
- ➕ L'expérience reste **unifiée** : tout passe par KAI, tout s'affiche dans Home.
- ➕ Découplage strict : une compétence ne dépend que d'un **contrat** de module ;
  changer de moteur ne change ni la compétence, ni KAI, ni Home.
- ➖ La distinction « compétence / module » demande de la **discipline** de nommage
  (compétence côté utilisateur & KAI ; module côté implémentation & registre).

### Conséquences dans plusieurs années

- KAI pourra **composer** des compétences (« retrouve les photos de la montagne et
  fais-en un album ») via l'appel d'outils du modèle — la couche `skills` est
  l'endroit prévu pour ça, sans rupture du contrat `open_skill`.
- Le catalogue de compétences devient la vraie **surface fonctionnelle** de
  KevinOS ; les modules KOS (et leurs moteurs) restent interchangeables dessous.
