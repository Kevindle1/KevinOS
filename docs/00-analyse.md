# 00 — Analyse

> Étape 1 de la méthode projet. Objectif : comprendre le besoin réel, le
> contexte, les contraintes et les risques **avant** de décider quoi que ce soit.

---

## 1. Vision

Créer un **système d'exploitation personnel** de type « Jarvis moderne » : un
cerveau numérique qui centralise, comprend et pilote toute la vie numérique du
propriétaire. Trois piliers non négociables :

1. **Souveraineté** — les données appartiennent au propriétaire ; aucune
   dépendance Cloud obligatoire ; tout fonctionne en local.
2. **Modularité** — chaque capacité est un module indépendant, remplaçable.
3. **Longévité** — architecture pensée pour évoluer plusieurs années et, un
   jour, potentiellement des milliers d'utilisateurs.

## 2. Problème résolu

Aujourd'hui la vie numérique d'une personne est éclatée entre des dizaines de
services Cloud (Google Photos, iCloud, Dropbox, Netflix, un gestionnaire de mots
de passe, une box domotique…). Cela crée :

- une **perte de souveraineté** (données chez des tiers, revente, fermeture de
  service, changement de CGU) ;
- une **fragmentation** (aucune vue d'ensemble, aucune corrélation entre les
  domaines) ;
- un **coût récurrent** (abonnements multiples) ;
- une **absence d'intelligence transverse** (aucun assistant ne voit *tout*).

KevinOS répond en **rapatriant** ces usages sur du matériel possédé, en les
**unifiant** derrière une interface et une identité uniques, et en ajoutant une
**couche d'intelligence** (IA) qui a le contexte de l'ensemble.

## 3. Utilisateurs & personas

| Persona | Rôle | Besoin principal |
|---------|------|------------------|
| **Kevin (propriétaire/admin)** | Super-administrateur | Contrôle total, sécurité, évolutivité |
| **Foyer** (famille) | Utilisateurs | Accès simple aux médias, photos, agenda, domotique |
| **Invité** | Accès temporaire | Accès restreint et révocable |
| **Kevin AI** (agent) | Acteur système | Agir *au nom de* l'utilisateur sur les modules |

> Bien que le projet soit personnel au départ, l'architecture est conçue
> **multi-tenant-ready** : notion d'utilisateur, de rôle et d'isolation dès le
> premier jour (voir [Cahier des charges](01-cahier-des-charges.md)).

## 4. Contexte matériel & réseau

### 4.1 Matériel

- Serveur principal : **ASUS TUF**, x86-64, **16 Go RAM**, SSD système.
- Stockage additionnel : **2 × HDD USB 1 To** + **1 × HDD SATA 1 To**.
- Absence (à ce stade) de GPU dédié et d'accélérateur IA (Coral/NPU).

### 4.2 Réseau

- Routeur **Keenetic Hopper DSL**.
- Connexion internet : **partage Samsung S21 (temporaire)** puis **Freebox Delta
  Fibre**.

**Conséquences directes sur l'architecture :**

- **IP publique dynamique**, voire **CGNAT** en 4G/5G (partage S21) → l'exposition
  directe de ports n'est **pas fiable**. On privilégie un **VPN d'accès (WireGuard)**
  ou un **tunnel sortant** plutôt qu'une ouverture de ports entrants.
- **Bande passante montante limitée** en phase temporaire → l'accès distant lourd
  (streaming 4K hors du domicile) est un objectif de Phase ultérieure.
- **DNS dynamique** requis si exposition (DDNS).

## 5. Contraintes

### 5.1 Contrainte critique : la RAM (16 Go)

C'est **la** contrainte structurante. Budget mémoire réaliste :

| Poste | RAM approx. | Note |
|-------|-------------|------|
| OS Linux + Docker | ~1–2 Go | incompressible |
| Reverse proxy + SSO + DNS | ~0,5 Go | toujours actif |
| Base de données (PostgreSQL) + Redis | ~1 Go | mutualisée |
| Monitoring (Prometheus/Grafana/Loki) | ~1–1,5 Go | |
| Nextcloud / Immich / Jellyfin | ~1–3 Go chacun selon charge | pas tous à fond en même temps |
| **Ollama + LLM 7B quantisé** | **~5–8 Go** | **très lourd**, CPU only = lent |
| Frigate (vision caméra) | ~1–2 Go + **exige GPU/Coral** pour être utile | |

➡️ **Conclusion : on ne peut pas tout faire tourner à pleine charge en même
temps sur 16 Go.** L'architecture doit permettre :
- un **déploiement progressif** (activer un module à la fois) ;
- des **limites de ressources par conteneur** (`mem_limit`, `cpus`) ;
- un **profil « allégé »** (LLM distant/API au lieu de local tant que la RAM n'est
  pas augmentée) ;
- un **plan d'upgrade** documenté (RAM ≥ 32 Go, GPU) comme prérequis des modules
  IA/vision avancés.

### 5.2 Autres contraintes

- **Stockage limité** (~3 To bruts) → politique de rétention, déduplication
  (sauvegardes Restic/Kopia), et règle **3-2-1** à prévoir.
- **Fiabilité HDD USB** : les disques USB sont moins fiables → réservés aux
  données non critiques / cache / sauvegardes secondaires, jamais seul support
  d'une donnée unique.
- **Nœud unique** → pas de haute disponibilité au départ ; les **sauvegardes**
  sont la première ligne de résilience.
- **Énergie / bruit / chaleur** : machine domestique allumée 24/7.
- **Compétence & temps** : un seul mainteneur → privilégier l'**exploitabilité**
  (peu d'outils, standardisés) plutôt que l'exhaustivité prématurée.

## 6. Risques identifiés

| Risque | Prob. | Impact | Mitigation |
|--------|-------|--------|-----------|
| Saturation RAM (tout activer d'un coup) | Élevée | Élevé | Déploiement progressif + limites conteneurs + monitoring alertes |
| Perte de données (panne disque) | Moyenne | Critique | Sauvegardes 3-2-1, RAID/mirroring données, tests de restauration |
| Exposition internet mal maîtrisée | Moyenne | Critique | Accès **par VPN par défaut**, SSO/MFA, CrowdSec, pas de port ouvert inutile |
| CGNAT / IP dynamique | Élevée | Moyen | WireGuard sortant / Tailscale-Headscale, DDNS |
| Sur-ingénierie (Kubernetes trop tôt) | Moyenne | Moyen | Docker Compose d'abord, K8s seulement quand justifié (ADR-0002) |
| Dépendance à un module upstream abandonné | Faible | Moyen | Modules **remplaçables** derrière la couche Core (interfaces) |
| Fuite de secrets (clés API IA, mots de passe) | Moyenne | Élevé | Coffre de secrets, `.env` hors Git, chiffrement au repos |
| Lenteur IA locale (CPU only) | Élevée | Moyen | Mode hybride (API Cloud optionnelle) + modèles quantisés + upgrade GPU |

## 7. Hypothèses & questions ouvertes (à valider — étape 6)

1. **IA locale vs Cloud** : accepte-t-on un **mode hybride** (bascule vers
   OpenAI/Claude/Gemini quand le local ne suffit pas) ou exige-t-on du **100 %
   local** dès le départ (au prix de la lenteur / d'un upgrade GPU immédiat) ?
2. **Priorité des modules** : quels 3–4 modules apportent le plus de valeur en
   premier ? (proposition par défaut : Core+Auth, Dashboard, Cloud/Files, AI).
3. **Exposition** : accès **uniquement par VPN** au départ (recommandé) ou faut-il
   un accès web public (ex. partage de photos à la famille) dès la Phase 1 ?
4. **Budget upgrade** : upgrade RAM/GPU envisageable à court terme ? (débloque
   l'IA locale et la vision caméra).
5. **Modules à écarter/reporter** de la v1 (ex. Kevin Mail est très lourd à
   auto-héberger — le reporter ?).

➡️ Ces questions sont reprises dans la demande de validation en fin de
[Roadmap](06-roadmap.md).
