# Règles d'architecture permanentes

> Ces règles sont des **invariants** du projet, validés par le propriétaire le
> 2026-07-12. Elles sont **opposables à toute décision future** : une proposition
> qui viole une de ces règles est rejetée par défaut, quels que soient ses autres
> mérites.
>
> Le « pourquoi » profond vit dans [`PRODUCT_VISION.md`](../PRODUCT_VISION.md) ;
> ce document en est la traduction **opérationnelle** pour les développeurs.
>
> **Mantra :** _KevinOS ne remplace pas les meilleurs outils. Il les orchestre
> pour offrir une seule expérience._

---

## Règle 0 — L'**expérience** est le produit ⭐

Virage stratégique validé le 2026-07-12 : **le produit prime sur la technique.**

- Avant tout développement, se demander **« quelle expérience veut-on offrir ? »**
  **avant** « quel composant / quel moteur ? ».
- Les logiciels tiers (Immich, Jellyfin, Home Assistant, Grafana, Docker,
  Nextcloud…) sont des **moteurs interchangeables** et **jamais visibles**.
- **KAI est le point d'entrée** : l'utilisateur arrive dans un **assistant**, pas
  dans un tableau de bord. Les modules sont des **compétences de KAI**.
- On développe `@kevinos/ui` **par expériences utilisateur**, pas par catégories
  techniques : chaque vague doit permettre de construire **immédiatement un
  morceau concret de KevinOS**.
- On **alterne** systématiquement : enrichir `@kevinos/ui` ↔ livrer un module
  fonctionnel. Le produit reste **vivant** ; on n'attend pas la fin du Design
  System pour voir apparaître KevinOS.
- **Le produit pilote la bibliothèque** (précision 2026-07-13) : depuis que la
  Foundation est mûre, on **construit Home par itérations** ; on n'enrichit
  `@kevinos/ui` **que lorsqu'une itération de Home l'exige** (composant manquant →
  créé avec doc/tests/Design Lab/a11y → retour immédiat à Home). Les évolutions de
  l'UI **accompagnent** Home, elles ne le précèdent plus.

_Identité :_ **KevinOS** = la plateforme · **KAI** = l'intelligence · **KOS** =
les compétences · logiciels tiers = plugins interchangeables invisibles.

## Règle 1 — KevinOS est un **produit**

KevinOS n'est **jamais** traité comme un simple homelab. Chaque décision est prise
comme si le projet devait un jour servir **des milliers d'utilisateurs**.

- La **qualité de l'architecture** prime sur la **rapidité** de développement.
- On préfère avancer plus lentement avec des fondations exemplaires.

**En pratique** : tests, CI, ADR, versioning, documentation ne sont pas
optionnels. Pas de raccourci « parce que c'est juste pour moi ».

## Règle 2 — **Offline-First**

Toute fonctionnalité doit fonctionner **sans Internet**.

- Les services Cloud sont **toujours optionnels**.
- Le fonctionnement **local** est la priorité absolue.

**En pratique** : aucune dépendance réseau sortante pour une fonction essentielle.
L'IA est locale ([ADR-0006](adr/ADR-0006-kai-ia-locale.md)). Les notifications, la
recherche, l'auth, les sauvegardes fonctionnent hors ligne. Un adaptateur Cloud
est toujours _en plus_, jamais _à la place_.

## Règle 3 — **API-First**

Aucun module n'est **directement lié à l'interface**.

- Chaque module expose **uniquement un contrat** (au Core).
- Le Dashboard, KAI, une future app mobile ou une API publique utilisent
  **exactement les mêmes interfaces**.

**En pratique** : la logique vit derrière l'API du Core
([ADR-0005](adr/ADR-0005-couche-integration-core.md)). Une UI ne contient **jamais**
de logique métier ni d'appel direct à un module (Immich, Jellyfin…). Si le
Dashboard peut le faire, l'app mobile et l'API publique le peuvent aussi, via le
même contrat.

## Règle 4 — **UX-First**

L'expérience utilisateur doit être **exceptionnelle**.

Avant tout nouveau module, on réfléchit **autant** à :

- son expérience utilisateur,
- son ergonomie,
- sa simplicité,
- sa cohérence avec le reste de KevinOS.

**Règle d'or** : mieux vaut **supprimer** une fonctionnalité que **compliquer**
l'interface. La complexité vit sous le capot, jamais devant l'utilisateur.

## Règle 5 — **KAI**

KAI n'est **pas un chatbot**. KAI est le **système d'exploitation intelligent** de
KevinOS.

- Il **orchestre** tous les modules.
- Il ne connaît **jamais** leur implémentation.
- Il ne dialogue qu'avec leurs **contrats**.
- Il **évolue indépendamment** des modules.

**En pratique** : KAI parle au Core via des ports/outils standardisés
([Vision KAI](07-vision-kai.md)). Remplacer Immich par autre chose ne change rien
pour KAI. Faire évoluer KAI ne touche aucun module.

## Règle 6 — **Interface unique**

À terme, KevinOS a **une seule interface**. Depuis elle, on doit pouvoir : piloter
la maison, retrouver une photo, regarder un film, gérer ses fichiers, surveiller
le serveur, administrer Docker, lancer une sauvegarde, développer, parler à KAI.

- On ne doit **jamais** avoir à ouvrir directement Immich, Jellyfin, Home
  Assistant, etc. — **sauf** pour des fonctions **avancées d'administration**.
- KevinOS est leur **point d'entrée unique**.

**En pratique** : chaque module intégré est projeté dans l'interface unique via
son contrat. L'accès direct à l'outil sous-jacent est une **exception**
d'administration, documentée, pas le mode d'usage normal.

## Règle 7 — **Documentation**

Chaque décision d'architecture est **documentée**. Chaque ADR explique :

- **pourquoi** cette décision a été prise ;
- **quelles alternatives** ont été rejetées (et pourquoi) ;
- **quelles conséquences** dans **plusieurs années**.

**Objectif** : la documentation doit suffire à un **nouveau développeur** pour
comprendre KevinOS **sans explication supplémentaire**.

**En pratique** : pas de décision structurante sans ADR. Le format
Contexte → Options → Décision → Conséquences (dont une projection à long terme)
est obligatoire. La doc est mise à jour **dans le même commit** que le changement.

## Règle 8 — Ne jamais réimplémenter un problème déjà résolu ⭐

**Le mantra vaut aussi pour notre code.** On ne réécrit **jamais** une brique
complexe, mature et déjà parfaitement résolue — **sauf** si le faire apporte une
**valeur directe au produit**. On réserve notre temps à ce qui rend KevinOS
**unique**.

- ❌ **On ne réécrit pas** : moteur de positionnement (Floating UI), moteur
  Markdown, SQLite, chiffrement, OAuth, WebSocket, moteur vidéo, moteur photo, ORM…
- ✅ **On construit** : KAI, KOS Vision / Media / Drive, l'**expérience**,
  l'orchestration, les plugins, le Design Lab, les composants KOS, les workflows,
  les automatisations.

**En pratique** : une dépendance externe n'est qu'un **moteur**. On garde le
**contrôle total** des composants, du design, des tokens, des animations, des
interactions, de l'accessibilité et des **API publiques**. Exemple : Floating UI
**calcule la position** ; le Tooltip/Popover **reste un composant KevinOS**
([ADR-0018](adr/ADR-0018-ne-pas-reinventer.md)). C'est le mantra appliqué à
l'ingénierie : _KevinOS ne remplace pas les meilleurs outils, il les orchestre._

---

## Comment appliquer ces règles

Toute Pull Request, tout nouveau module, toute techno passe ce **filtre** :

| #   | Question de contrôle                                                           |
| --- | ------------------------------------------------------------------------------ |
| 1   | Est-ce pensé comme un **produit** durable (tests, doc, versioning) ?           |
| 2   | Est-ce que ça marche **hors ligne** ?                                          |
| 3   | Est-ce derrière un **contrat** (pas lié à l'UI) ?                              |
| 4   | Est-ce que ça rend l'expérience **plus simple** ?                              |
| 5   | KAI reste-t-il **découplé** de l'implémentation ?                              |
| 6   | Est-ce accessible depuis l'**interface unique** ?                              |
| 7   | Est-ce **documenté** (ADR si structurant) ?                                    |
| 8   | Est-ce un problème **déjà résolu** ? (si oui, on orchestre, on ne réécrit pas) |

Une seule réponse « non » = on reconçoit avant d'avancer.
