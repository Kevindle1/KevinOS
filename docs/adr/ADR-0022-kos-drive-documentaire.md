# ADR-0022 — KOS Drive : une expérience documentaire pilotée par KAI (moteur caché)

**Statut** : Acceptée — 2026-07-14
**Date** : 2026-07-14
**Lié à** : [ADR-0021](ADR-0021-lecteur-officiel-mediaplayer.md) (lecteur officiel),
[ADR-0020](ADR-0020-competences-skills.md) (compétences / Skills),
[ADR-0018](ADR-0018-ne-pas-reinventer.md) (ne pas réinventer les moteurs),
[ADR-0005](ADR-0005-couche-integration-core.md) (le Core, couche d'intégration),
[Règle 5](../REGLES-ARCHITECTURE.md) (KAI, point d'entrée),
[Règle 6](../REGLES-ARCHITECTURE.md) (interface unique),
[Règle 8](../REGLES-ARCHITECTURE.md) (ne pas réinventer, orchestrer).

> _« Je ne veux jamais naviguer dans des dossiers. Je veux retrouver une
> information. »_ — Product Owner, 2026-07-14.

## Contexte

KOS Vision (photos) et KOS Media (films) ont prouvé le patron : une **compétence**
KAI orchestre un moteur best-of-breed **invisible** via un **contrat** de domaine.
KOS Drive applique le même patron aux **documents** — mais avec une exigence forte :
ce **n'est pas un explorateur de fichiers**. L'utilisateur ne navigue pas ; il
**demande** (« ouvre mon bail », « retrouve ma facture EDF », « les documents
contenant Crédit Agricole »). La **recherche** est la fonctionnalité principale.

## Décision

### Un contrat `DriveLibrary`, agnostique du moteur

`@kevinos/shared` définit `DriveItem` (dossier / fichier, `docKind`, taille, date,
favori, étiquettes, corbeille), `DriveSearchQuery` (nom / **contenu** / type /
date / taille / dossier), `DrivePreview` (mode + URL **du Core**), et le port
`DriveLibrary` (list, search, recent, largest, favorites, trash, preview,
rename, move, copy, remove, restore, createFolder, setFavorite, setTags,
history). KAI, Home, mobile et l'API publique ne connaissent **que** ce contrat.

### Le moteur V1 est le **système de fichiers local**, caché

`LocalFsDriveAdapter implements DriveLibrary` : le disque est un moteur
documentaire parfaitement valide, **caché** derrière le contrat. Choix
délibéré : pas de dépendance externe, **réellement utilisable au quotidien**
(pointer un dossier), et entièrement **démontrable** (renommer / déplacer /
prévisualiser opèrent sur de vrais fichiers). Les **identifiants sont opaques**
(chemin relatif encodé) et toute résolution est **bornée à la racine** (aucune
traversée `..`). Demain, un `NextcloudDriveAdapter` le remplace **sans toucher**
à KAI ni à Home. C'est le sens de _« KAI ne connaît jamais Nextcloud, ni le
système de fichiers »_.

### Les favoris et étiquettes sont **possédés par KevinOS**

Le système de fichiers n'a pas de notion de « favori ». Comme la reprise de KOS
Media, ces métadonnées appartiennent à KevinOS (`DriveMetadataStore`, fichier
JSON) et **suivent le fichier** lors d'un renommage / déplacement.

### Le contenu ne révèle jamais le moteur

`preview` renvoie une URL **du Core** (`/api/v1/drive/:id/raw`) ; le Core relaie
les octets (proxy `Range`). Aperçu **dans KevinOS** : PDF, images, texte,
markdown, CSV, JSON, code s'affichent directement (composant `DocumentPreview`).
Les formats bureautiques (Word, Excel, PowerPoint) retombent proprement sur un
téléchargement — la conversion serveur est une étape suivante (le contrat la
prévoit).

### KAI traduit le langage naturel en intention documentaire

Nouvelle action `open_skill` avec `driveQuery` (`find` / `search` / `recent` /
`largest` / `favorites` / `library`), produite par `parseDriveIntent`
(déterministe, hors ligne ; miroir Home pour le repli Preview). « Ouvre mon
bail » → `find` → Home ouvre **directement** l'aperçu du document trouvé.

### L'OCR est prévu au contrat

`DriveItem.excerpt` et `DriveSearchQuery.content` existent déjà. L'adaptateur
indexe aujourd'hui le **contenu texte** (best-effort). Demain, un `OcrIndexer`
alimentera ce même champ pour les images et PDF scannés — **sans changer le
contrat**.

## Alternatives rejetées

- **Un explorateur de fichiers classique** : contraire à la vision (« je veux
  retrouver une information, pas naviguer »). La recherche prime sur l'arborescence.
- **Exiger Nextcloud dès la V1** : dépendance lourde pour un bénéfice nul en
  démonstration ; le disque local est un moteur valide et suffisant, remplaçable.
- **Laisser le moteur porter favoris/étiquettes** : ces métadonnées d'expérience
  appartiennent à KevinOS et doivent survivre à un changement de moteur.
- **Exposer des chemins disque** comme identifiants : fuite du moteur + risque de
  traversée. Les ids sont opaques et bornés à la racine.

## Conséquences

- ➕ **Troisième compétence** ajoutée sur le même patron, **sans toucher au cœur
  de KAI** (une ligne dans `SKILLS`). La modularité est reconfirmée.
- ➕ Expérience **réellement utilisable** : retrouver en langage naturel, ouvrir,
  prévisualiser, rechercher, télécharger, renommer, déplacer — **sans quitter
  KevinOS**, sans explorateur système.
- ➕ Moteur **interchangeable jusqu'à l'octet** (proxy `Range`) : Nextcloud pourra
  remplacer le disque sans que KAI, Home ou le contrat ne bougent.
- ➖ Le Core **relaie** les octets (coût réseau/CPU) — prix de l'invisibilité du
  moteur ; optimisable (URL signées) sans changer le contrat.
- ➖ Aperçu bureautique (Word/Excel/PowerPoint) en **téléchargement** en V1 ;
  historique/versions et partage par lien renvoient encore des listes vides
  (prévus au contrat, branchés avec un moteur qui les gère).
- ➖ La recherche en langage naturel est **déterministe** (règles) : couverture
  bornée au vocabulaire courant, extensible par l'appel d'outils du modèle plus
  tard, sans rupture d'`open_skill`.

### Conséquences dans plusieurs années

- `DriveLibrary` + `OcrIndexer` font de KOS Drive la **mémoire documentaire** que
  KAI peut interroger sémantiquement (« quels documents parlent de ma maison ? »).
- Le même `DocumentPreview` servira les pièces jointes d'autres compétences
  (mails, notes) : un aperçu unique, partout, sans jamais quitter KevinOS.
