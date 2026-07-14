# ADR-0023 — KOS Home : la maison orchestrée par KAI (Ambiances, moteur caché)

**Statut** : Acceptée — 2026-07-14
**Date** : 2026-07-14
**Lié à** : [ADR-0022](ADR-0022-kos-drive-documentaire.md) (KOS Drive),
[ADR-0021](ADR-0021-lecteur-officiel-mediaplayer.md) (lecteur officiel),
[ADR-0020](ADR-0020-competences-skills.md) (compétences / Skills),
[ADR-0005](ADR-0005-couche-integration-core.md) (le Core, couche d'intégration),
[Règle 5](../REGLES-ARCHITECTURE.md) (KAI, point d'entrée),
[Règle 6](../REGLES-ARCHITECTURE.md) (interface unique),
[Règle 8](../REGLES-ARCHITECTURE.md) (ne pas réinventer, orchestrer).

> _« Je ne veux pas créer un clone de Home Assistant. Je veux créer une
> expérience KevinOS. L'utilisateur ne manipule jamais des entités : il parle à
> KAI, KAI orchestre la maison. »_ — Product Owner, 2026-07-14.

## Contexte

Quatrième pilier du quotidien, après Photos, Médias et Documents. L'exigence est
la même que pour les trois précédentes — un moteur best-of-breed **invisible**
derrière un **contrat** — mais avec deux spécificités fortes :

1. **Pas de tableau de bord technique.** On n'expose ni entités, ni automatismes,
   ni dashboards. On **pilote en langage naturel** (« allume la lumière du
   salon », « ferme les volets ») et on **interroge** (« quelle est la
   température ? », « qui est à la maison ? »).
2. **Les Ambiances.** Une notion produit au-dessus des scénarios : « mode
   cinéma », « bonne nuit », « je rentre » — une intention qui pilote plusieurs
   appareils d'un coup, et qui peut **collaborer avec les autres compétences**.

## Décision

### Un contrat `HomeProvider`, agnostique du moteur

`@kevinos/shared` définit `HomeDevice` (light, plug, thermostat, temperature,
camera, door, cover, sensor, energy, presence), `HomeScene` (Ambiance),
`HomeCommand`, `CameraEvent`, `EnergySummary`, `PresenceState`, `ClimateSummary`,
et le port `HomeProvider` (overview, listDevices, runCommand, listScenes,
activateScene, cameras, cameraEvents, energy, presence, climate). KAI, Home et
l'API publique ne connaissent **que** ce contrat.

### Le moteur V1 est une **maison simulée en mémoire**, stateful

`InMemoryHomeAdapter implements HomeProvider` : une maison **stateful** est un
moteur domotique parfaitement valide — allumer une lumière change l'état,
l'interroger le reflète. Choix délibéré : **aucune dépendance externe**,
**toujours actif**, entièrement **démontrable** (contrairement à Home Assistant
qui exige une installation + un jeton). Demain, `HomeAssistantAdapter` (REST
`/api/states`, `/api/services/...`) et `FrigateAdapter` (détection caméra) le
remplacent **sans toucher** à KAI ni à Home. Les instantanés caméra pointent vers
le **Core** (`/api/v1/home/cameras/:id/snapshot`), jamais vers un flux moteur.

### KAI pilote **et** interroge

Deux formes d'intention, produites par `parseHomeIntent` (déterministe, hors
ligne ; miroir Home pour le repli Preview) :

- **Pilotage** → action `KaiControlHomeAction` (`control_home`), comme la
  télécommande du lecteur. « Allume la lumière du salon », « éteins toutes les
  lumières », « ferme les volets », « ouvre le portail », « active le mode
  cinéma ». Home exécute via l'API du Core ; **KAI ne touche jamais un
  protocole domotique**.
- **Question** → action `open_skill` avec `KaiHomeQuery` (climate, presence,
  cameras, energy, lights, room, overview). « Quelle est la température ? »,
  « qui est à la maison ? », « montre-moi la caméra du garage », « ma
  consommation », « ai-je laissé une lumière allumée ? ».

### Les Ambiances collaborent entre compétences

Une `HomeScene` peut porter `opens: 'media'`. **Le mode cinéma baisse les volets,
tamise les lumières, allume le téléviseur — puis ouvre KOS Media.** C'est la
première **collaboration inter-compétences**, prélude à la recherche universelle
(« prépare une soirée cinéma »).

### La présence est un actif partagé

`PresenceState` (qui est là, qui est absent, depuis quand) est exposé par le
contrat pour être **réutilisé dans toute la plateforme** (par exemple : ne pas
proposer une reprise de lecture si personne n'est là).

## Alternatives rejetées

- **Un tableau de bord domotique** (entités, cartes, automatismes) : contraire à
  la vision. On parle à KAI ; la maison répond.
- **Exiger Home Assistant dès la V1** : dépendance lourde, non démontrable sans
  installation. Une maison simulée est un moteur valide et suffisant, remplaçable.
- **Exposer les entités du moteur** (identifiants HA) : fuite du moteur et
  couplage. Les appareils sont des DTO agnostiques ; les ids restent internes.
- **KAI manipule le moteur directement** : couplerait KAI au protocole. L'action
  `control_home` garde KAI **déclaratif**.

## Conséquences

- ➕ **Quatrième compétence** sur le même patron, **sans toucher au cœur de KAI**
  (une ligne dans `SKILLS`). Les quatre piliers du quotidien sont réels.
- ➕ Expérience **réellement utilisable** : piloter et interroger la maison en
  langage naturel, activer des **Ambiances**, voir ses caméras — **sans quitter
  KevinOS**, sans explorateur technique.
- ➕ **Première collaboration inter-compétences** (cinéma → KOS Media) : la preuve
  que les compétences peuvent s'enchaîner, socle de la recherche universelle.
- ➕ Moteur **interchangeable** : Home Assistant / Frigate remplacent la maison
  simulée sans que KAI, Home ou le contrat ne bougent.
- ➖ Le moteur V1 est **simulé** : il ne pilote pas encore de vrais appareils
  (c'est l'objet de `HomeAssistantAdapter`). Le contrat, lui, est prêt.
- ➖ Les instantanés caméra sont des **placeholders générés** (pas de vrai flux) ;
  le flux temps réel et la détection viendront avec `FrigateAdapter`.
- ➖ Le langage naturel est **déterministe** (règles) : couverture bornée au
  vocabulaire courant, extensible par l'appel d'outils du modèle plus tard.

### Conséquences dans plusieurs années

- `HomeProvider` + `presence` deviennent le **contexte ambiant** de KevinOS : KAI
  saura qui est là, quelle pièce est occupée, et adaptera **toutes** les
  compétences.
- Les Ambiances généralisent la **collaboration inter-compétences** : « prépare
  une soirée cinéma » orchestrera Home, Media, notifications et caméras d'un seul
  souffle — la véritable intelligence de KevinOS.
