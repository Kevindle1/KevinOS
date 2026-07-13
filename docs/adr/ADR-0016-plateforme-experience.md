# ADR-0016 — KevinOS, plateforme d'expérience (KAI comme point d'entrée)

**Statut** : Acceptée — 2026-07-12 (nouvelle direction officielle)
**Date** : 2026-07-12
**Impacte** : [PRODUCT_VISION](../../PRODUCT_VISION.md),
[REGLES-ARCHITECTURE](../REGLES-ARCHITECTURE.md), [Roadmap](../06-roadmap.md),
[Vision KAI](../07-vision-kai.md), [Design Lab](ADR-0015-kos-design-lab.md).

> **Mantra.** _KevinOS ne remplace pas les meilleurs outils. Il les orchestre pour
> offrir une seule expérience._

## Contexte

Jusqu'ici, KevinOS était pensé comme un « système d'exploitation personnel »
auto-hébergé et on construisait surtout des **briques techniques**. Le propriétaire
acte un **virage stratégique** : KevinOS devient une **plateforme intelligente**
dont **le produit est l'expérience**. Les logiciels tiers (Immich, Jellyfin, Home
Assistant, Grafana, Docker, Nextcloud…) deviennent des **moteurs spécialisés
interchangeables et invisibles**.

## Décision

### 1. Le produit, c'est l'expérience

On se demande **« quelle expérience veut-on offrir ? »** _avant_ « quel composant /
quel moteur ? ». Toute décision future respecte cette priorité (Règle 0).

### 2. Identité

| KevinOS           | KAI                                 | KOS                 | Logiciels tiers        |
| ----------------- | ----------------------------------- | ------------------- | ---------------------- |
| la **plateforme** | l'**intelligence** (point d'entrée) | les **compétences** | **plugins invisibles** |

L'utilisateur ne connaît **jamais** le logiciel derrière une compétence.

### 3. KAI est le point d'entrée (le Dashboard change de nature)

Le premier écran n'est **plus** un tableau de bord de cartes techniques : c'est
**KAI**. On arrive dans un **assistant personnel** :

```
Bonjour Kevin 👋
Comment puis-je t'aider aujourd'hui ?
[ zone de conversation ]
```

… **puis seulement ensuite** : activité récente, dernières photos, reprendre un
film, état du système, notifications, suggestions. Les **modules deviennent des
compétences de KAI** (il choisit automatiquement lequel utiliser, via leurs
contrats — Règle 5).

### 4. `@kevinos/ui` se développe **par expériences**, pas par catégories techniques

Chaque vague doit permettre de **construire immédiatement un morceau concret** de
KevinOS. Nouvelle roadmap : Foundation → Dashboard → KAI → KOS Vision → KOS Media
→ KOS Home (voir [UI_ROADMAP](../../UI_ROADMAP.md)).

### 5. On **alterne** UI ↔ module fonctionnel

Après chaque enrichissement de `@kevinos/ui` suffisant, on livre un **morceau de
produit** utilisable. Le produit reste **vivant** ; on n'attend pas la fin du
Design System pour voir KevinOS apparaître.

### 6. Le Design Lab reste la porte de qualité

Aucun composant utilisé ailleurs sans : doc, démo (Design Lab), variantes,
accessibilité, tests. Le Dashboard **ne crée jamais** de composant (ADR-0015).

## Ce qui ne change pas

Souveraineté, offline-first, vie privée, IA locale, modularité/plugins,
versioning, sécurité — **inchangés**. Le virage est une **priorisation** (produit >
technique), pas un reniement des fondations.

## Alternatives rejetées

- **Continuer par briques techniques** : produit invisible trop longtemps ; risque
  de construire des composants sans expérience à servir.
- **Dashboard classique de cartes** : contredit « KAI = point d'entrée » et l'idée
  d'assistant ; réduit KevinOS à un énième dashboard.

## Conséquences

- ➕ Chaque vague produit un **résultat visible et utilisable**.
- ➕ Positionnement clair et **durable** (le mantra reste vrai même si on remplace
  Immich/Jellyfin/le NAS demain).
- ➖ Exige de penser l'**expérience** en amont (design/UX avant code) — assumé.

### Conséquences dans plusieurs années

- Remplacer un moteur (Immich → autre, NAS → UGREEN…) **ne change rien** pour
  l'utilisateur : l'expérience et l'identité KOS survivent au moteur. C'est
  exactement ce que le mantra garantit.
- KevinOS se différencie durablement d'un NAS / HomeLab / dashboard : il vend une
  **expérience orchestrée**, pas un assemblage d'outils.
