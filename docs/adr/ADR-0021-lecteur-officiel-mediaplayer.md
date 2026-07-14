# ADR-0021 — Le lecteur officiel KevinOS (MediaPlayer), la reprise possédée et KAI télécommande

**Statut** : Acceptée — 2026-07-14
**Date** : 2026-07-14
**Lié à** : [ADR-0020](ADR-0020-competences-skills.md) (compétences / Skills),
[ADR-0019](ADR-0019-kai-orchestrateur.md) (orchestrateur KAI),
[ADR-0018](ADR-0018-ne-pas-reinventer.md) (ne pas réinventer les moteurs),
[ADR-0016](ADR-0016-plateforme-experience.md) (plateforme d'expérience),
[Règle 5](../REGLES-ARCHITECTURE.md) (KAI, point d'entrée),
[Règle 6](../REGLES-ARCHITECTURE.md) (interface unique),
[Règle 8](../REGLES-ARCHITECTURE.md) (ne pas réinventer, orchestrer).

> _« L'objectif n'est pas de créer un lecteur vidéo. L'objectif est de créer le
> meilleur compagnon multimédia personnel possible, où KAI connaît toute ma
> médiathèque et me donne l'impression qu'il vit avec moi. »_ — Product Owner,
> 2026-07-14.

## Contexte

KOS Media (ADR précédent) a prouvé qu'une compétence pouvait orchestrer Jellyfin
sans le montrer. Il restait pourtant une **fuite** possible de l'expérience : la
**lecture**. Renvoyer vers l'interface web de Jellyfin (ou son lecteur) briserait
la promesse — « une seule application : KevinOS ». Trois exigences en découlent :

1. **Un lecteur unique** — le même pour films, séries, vidéos perso, caméras,
   archives, tutoriels, enregistrements. Pas de lecteur par moteur.
2. **La reprise appartient à KevinOS** — savoir « où Kevin s'est arrêté » est une
   connaissance du produit, pas un état privé du moteur.
3. **KAI télécommande** — on ne manipule pas un lecteur, on **demande** («&nbsp;recule
   de 30 secondes&nbsp;», «&nbsp;sous-titres français&nbsp;», «&nbsp;ferme le lecteur&nbsp;»).

## Décision

### Un composant `MediaPlayer` officiel dans `@kevinos/ui`

Le lecteur est un **composant du Design System**, agnostique du moteur : il ne
reçoit qu'une **`src`** (servie par le Core), un `poster`, des `subtitles`, une
position de reprise `startAt`, et des rappels (`onProgress`, `onEnded`, `onClose`).
HTML5 `<video>`, contrôles **auto-masqués** (Apple TV / visionOS), clavier
(espace, ←/→, f, m, ↑/↓), barre de progression, temps restant, vitesse, volume,
sous-titres, plein écran, Picture-in-Picture. Il **ignore Jellyfin** — il ne sait
même pas qu'un moteur existe.

### Le flux ne révèle jamais le moteur

`MediaLibrary.getStream(id)` renvoie une **URL du Core** (`/api/v1/media/:id/stream`),
jamais une URL Jellyfin. Le Core **relaie** le flux (proxy `Range`) : l'octet vidéo
lui-même transite par KevinOS. Aucun élément (URL, en-tête, sous-titre) ne rappelle
le moteur sous-jacent.

### La reprise est un port possédé par KevinOS

Nouveau port `PlaybackStore` (get/set/all) + `MediaStreaming` (proxy de flux). Le
`MediaService` **croise** la progression du moteur avec celle du store : le store
**prime** toujours (c'est KevinOS qui sait). À l'arrêt, Home appelle
`POST /api/v1/media/:id/progress` → sauvegarde **immédiate**. Le lendemain, la
reprise nourrit `continueWatching()` et la fiche. Implémentation actuelle :
`FilePlaybackStore` (JSON) ; demain SQLite/Postgres — détail d'infrastructure.

### KAI télécommande via une API impérative

`MediaPlayer` expose un `MediaPlayerHandle` (`play/pause/seekBy/setSubtitle/
toggleFullscreen…`) via `useImperativeHandle`. Une nouvelle action KAI
`control_player` (à côté d'`open_skill`) porte la commande. Le langage naturel est
interprété **de façon déterministe** (`parsePlayerCommand`, côté Core ; miroir Home
pour le repli Preview). Home applique la commande à la `ref` du lecteur. **KAI ne
touche jamais le DOM du lecteur** — il émet une intention, Home l'exécute.

## Alternatives rejetées

- **Réutiliser le lecteur web de Jellyfin** (iframe / redirection) : viole Règles 5,
  6 et la promesse d'expérience unique ; expose le moteur.
- **Laisser Jellyfin posséder la reprise** : la connaissance « où j'en suis » se
  retrouverait piégée dans un moteur remplaçable ; KAI ne pourrait pas la formuler
  («&nbsp;il te reste 23 minutes&nbsp;») ni la porter d'un moteur à l'autre.
- **KAI manipule directement le lecteur** (impératif dans l'orchestrateur) :
  couplerait KAI au DOM et à React ; l'action `control_player` garde KAI **déclaratif**.

## Conséquences

- ➕ **Une seule expérience de lecture** pour tous les types de média, présents et à
  venir (caméras, audio, podcasts) — même composant, même télécommande.
- ➕ La **reprise intelligente** devient un actif produit : KAI peut la formuler et
  la proposer, indépendamment du moteur.
- ➕ Le moteur reste **interchangeable jusqu'à l'octet** : remplacer Jellyfin ne
  change ni le lecteur, ni la reprise, ni KAI, ni Home.
- ➕ Le contrat (`MediaStream`, sous-titres, pistes audio, notes/enrichissement)
  est **prêt** pour la suite (multi-audio HLS, notes TMDB réelles, AirPlay/Chromecast).
- ➖ Le Core **relaie** le flux : coût réseau/CPU supplémentaire (proxy `Range`).
  Acceptable — c'est le prix de l'invisibilité du moteur ; optimisable (redirections
  signées) sans changer le contrat.
- ➖ La télécommande en langage naturel est **déterministe** (règles) et non un LLM :
  couverture volontairement bornée au vocabulaire courant ; extensible par l'appel
  d'outils du modèle plus tard, sans rupture d'`control_player`.

### Conséquences dans plusieurs années

- Le `MediaPlayerHandle` est le point d'entrée par lequel KAI pilotera aussi le
  **watch party**, les **profils**, la **musique** et les **caméras** — un seul
  langage de télécommande pour toute la maison.
- `PlaybackStore` devient la mémoire de lecture **multi-appareils** : commencer sur
  la TV, reprendre sur le téléphone, parce que la reprise appartient à KevinOS.
