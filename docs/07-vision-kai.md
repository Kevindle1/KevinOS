# 07 — Vision : KAI, le cerveau unique

> Ce document fige la vision validée par le propriétaire (étape 6). Il prime sur
> toute interprétation antérieure : **KevinOS est le système d'exploitation
> numérique de la maison**, et **KAI en est le point d'entrée**.

---

## 1. Le principe

```
Une seule interface.
Un seul point d'entrée.
Un seul cerveau : KAI.
```

**KAI** (Kevin Artificial Intelligence) n'est pas un widget parmi d'autres : c'est
le **mode d'interaction principal** de KevinOS. L'utilisateur exprime une
intention en langage naturel ; KAI comprend, décide, agit sur les modules, et
répond.

> « L'utilisateur ne doit jamais avoir besoin de savoir quel logiciel est utilisé
> en arrière-plan. »

On ne dit pas « ouvre Immich » : on dit « montre-moi les photos de cet été ». KAI
sait que, _aujourd'hui_, c'est Immich qui répond — et demain ce pourrait être
autre chose, sans que l'utilisateur le remarque.

## 2. Ce que KAI doit savoir faire (V1, cadré)

KAI est un **assistant système** (façon Jarvis), **pas** un concurrent de ChatGPT.
Périmètre validé :

1. **Comprendre des commandes naturelles** (intention → action).
2. **Piloter KevinOS** (naviguer, configurer, informer).
3. **Contrôler les services Docker** (état, démarrage/arrêt, santé) — via le Core,
   avec garde-fous.
4. **Chercher dans les fichiers, photos et médias** (RAG + connecteurs modules).
5. **Lancer des automatisations**.
6. **Répondre aux questions sur l'infrastructure** (« combien de RAM libre ? »,
   « la sauvegarde de cette nuit a-t-elle réussi ? »).

Hors périmètre V1 : conversation généraliste encyclopédique, vision temps réel
(matériel dépendant).

## 3. Architecture de l'interaction

KAI ne « contient » pas les modules : il les **orchestre via le Core**, qui expose
des **ports** (interfaces) et des **outils** (actions). Voir
[ADR-0005](adr/ADR-0005-couche-integration-core.md) et
[diagrammes/ia.md](diagrammes/ia.md).

```
Utilisateur ──(langage naturel)──▶ KAI
                                    │  1. comprend l'intention
                                    │  2. choisit des OUTILS (via le Core)
                                    ▼
                              KevinOS Core  ──ports/adaptateurs──▶ Modules
                                    │                              (Immich, Files,
                                    │  3. exécute, agrège           Jellyfin, HA…)
                                    ▼
                                    KAI ──(réponse en langage naturel)──▶ Utilisateur
```

**Deux surfaces d'entrée, un seul cerveau :**

- **Conversationnelle** (le premier plan) : on parle/écrit à KAI.
- **Graphique** (le Dashboard) : vues riches (galeries, lecteurs, jauges). Le
  Dashboard n'appelle **jamais** les modules en direct — il passe par le Core,
  exactement comme KAI. Ainsi les deux surfaces restent cohérentes et les modules
  restent remplaçables.

## 3bis. Tout est plugin (rien ne modifie le cœur)

Renforcement validé par le propriétaire : **KAI n'est pas un chatbot, c'est le
cerveau de KevinOS.** Conséquence architecturale directe :

- Chaque module (Immich, Jellyfin, Home Assistant, Nextcloud…) expose au Core un
  **contrat standard** (le _Plugin Interface_, [versioning](08-versioning.md)).
- **Toute nouvelle fonctionnalité s'ajoute comme un plugin, sans modifier le cœur
  du système.** Le Core découvre, valide (compatibilité) et orchestre ; il n'est
  jamais réécrit pour accueillir un module.
- KAI orchestre ces plugins ; l'utilisateur ne connaît jamais le logiciel derrière.

C'est la condition pour tenir « plusieurs années » avec 20-30 modules sans
accumuler de dette : le cœur reste stable, les modules vont et viennent.

## 4. Souveraineté & local-first (ADR-0006)

- KAI tourne **100 % en local** (Ollama, modèle léger), **hors-ligne**, **gratuit**.
- **Aucune donnée ne sort** ; aucun fournisseur IA externe dans le cœur V1.
- Le moteur IA est un **fournisseur interchangeable** : on pourra brancher
  OpenAI/Claude/Gemini plus tard **sans modifier le cœur**.

## 5. Garde-fous (KAI agit sur le système)

Puisque KAI peut **agir** (contrôler Docker, lancer des automatisations), la
sécurité est intégrée dès la conception :

- KAI agit via un **compte de service à privilèges limités et traçables**
  (jamais root, jamais les droits admin bruts) — voir
  [Sécurité §3.3](05-securite.md).
- Les **actions sensibles** (arrêt de service, suppression, changement de config)
  passent par une **confirmation** et sont **journalisées** (audit log).
- Le **catalogue d'outils** de KAI est **explicite** : KAI ne peut faire que ce
  qu'un outil déclaré autorise (pas d'accès arbitraire au système hôte).

## 6. Conséquence sur la feuille de route

L'ordre de développement validé construit d'abord **le corps** (infra, stockage,
photos, médias, dashboard) **puis le cerveau** (KAI), afin que KAI ait, dès son
arrivée, de vrais modules à piloter. Voir [Roadmap](06-roadmap.md).
