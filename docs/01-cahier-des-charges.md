# 01 — Cahier des charges

> Étape 2. Exigences **fonctionnelles** (ce que le système fait) et **non
> fonctionnelles** (comment il doit le faire). Chaque exigence est identifiée
> (`EF-xx` / `ENF-xx`) et priorisée avec **MoSCoW** :
> **M** = Must, **S** = Should, **C** = Could, **W** = Won't (pas cette version).

---

## 1. Exigences fonctionnelles

### 1.1 Socle & identité

| ID | Exigence | Prio |
|----|----------|------|
| EF-01 | Une **interface unique** (dashboard) donne accès à tous les modules | M |
| EF-02 | **Authentification unique (SSO)** : une seule connexion pour tous les modules | M |
| EF-03 | **MFA** (2ᵉ facteur) obligatoire pour les comptes administrateurs | M |
| EF-04 | **Gestion des utilisateurs et des rôles** (admin, membre, invité) | M |
| EF-05 | **Passerelle API (API Gateway)** exposant un point d'entrée unique | M |
| EF-06 | **Registre de services** : chaque module se déclare et est découvrable | S |
| EF-07 | **Bus d'événements** : les modules publient/consomment des événements | S |

### 1.2 Dashboard vivant

| ID | Exigence | Prio |
|----|----------|------|
| EF-10 | Page d'accueil personnalisée : *« Bonjour Kevin. Aujourd'hui… »* | M |
| EF-11 | Widgets : météo, agenda, notifications, état serveurs, statistiques | M |
| EF-12 | Widgets : derniers films, nouvelles photos, état sauvegardes, conso énergie, maison, IA, musique | S |
| EF-13 | **Résumé de la journée** généré par l'IA | S |
| EF-14 | Thème **clair/sombre**, responsive, **mobile-first** | M |

### 1.3 Intelligence (Kevin AI)

| ID | Exigence | Prio |
|----|----------|------|
| EF-20 | Conversation en langage naturel (texte) avec l'assistant | M |
| EF-21 | Support **LLM local** (Ollama) **et** fournisseurs Cloud (OpenAI, Claude, Gemini) — pluggable | M |
| EF-22 | **RAG** : l'IA répond en s'appuyant sur les données du propriétaire (documents, notes) | S |
| EF-23 | **Mémoire** persistante (préférences, historique, contexte long terme) | S |
| EF-24 | **Agents / planification** : l'IA peut déclencher des actions sur les modules | S |
| EF-25 | **Voix** : STT (Whisper) + TTS (synthèse) + reconnaissance vocale | C |
| EF-26 | **Vision** : analyse d'images / flux caméra | C |
| EF-27 | Personnalité paramétrable : calme, pro, humour léger, jamais bavard, proactif | S |

### 1.4 Domaines fonctionnels (modules métier)

| ID | Domaine | Prio | Solution pressentie (voir [Modules](04-modules.md)) |
|----|---------|------|------------------------------------------------------|
| EF-30 | Cloud / Fichiers | M | Nextcloud / File Browser |
| EF-31 | Photos | M | Immich |
| EF-32 | Médias (films/séries) | S | Jellyfin |
| EF-33 | Musique | C | Navidrome |
| EF-34 | Livres | C | Kavita / Calibre-Web |
| EF-35 | Sauvegardes | M | Restic / Kopia |
| EF-36 | VPN (accès distant) | M | WireGuard / Headscale |
| EF-37 | Domotique | S | Home Assistant |
| EF-38 | Monitoring / Logs | M | Prometheus + Grafana + Loki + Uptime Kuma |
| EF-39 | DNS / filtrage | S | AdGuard Home + Unbound |
| EF-40 | Mots de passe | S | Vaultwarden |
| EF-41 | Agenda / Contacts | S | Radicale / Nextcloud |
| EF-42 | Caméras | C | Frigate (⚠ GPU/Coral) |
| EF-43 | Automatisations | S | n8n / Node-RED |
| EF-44 | Développement | C | Gitea + code-server + CI |
| EF-45 | Finance | C | Actual / Firefly III |
| EF-46 | Inventaire | C | Homebox |
| EF-47 | Téléchargements | C | qBittorrent (+ *arr, cadre légal) |
| EF-48 | Mail | W | Auto-hébergement mail = très lourd → reporté |
| EF-49 | Santé / Énergie / Météo | C | Intégrations / Home Assistant |

### 1.5 Interfaces développeur

| ID | Exigence | Prio |
|----|----------|------|
| EF-50 | **API publique** documentée (OpenAPI) | S |
| EF-51 | **SDK** (client TypeScript) pour consommer l'API | C |
| EF-52 | **CLI** d'administration (`kevin …`) | C |

---

## 2. Exigences non fonctionnelles

### 2.1 Architecture & qualité

| ID | Exigence | Prio |
|----|----------|------|
| ENF-01 | **Architecture modulaire** : chaque module indépendant et **remplaçable** | M |
| ENF-02 | **Conteneurisation** : tout tourne en Docker / Docker Compose | M |
| ENF-03 | **Trajectoire Kubernetes** possible sans refonte majeure | S |
| ENF-04 | Principes **Clean Architecture, DDD, SOLID** pour le code KevinOS natif | M |
| ENF-05 | **Tests** automatisés (unitaires, intégration, e2e ciblés) | M |
| ENF-06 | **CI/CD** (lint, tests, build, publication d'images) | M |
| ENF-07 | **Versionnement sémantique** + journal des changements | M |
| ENF-08 | **Documentation** à jour (archi, ADR, guides d'exploitation) | M |
| ENF-09 | **Infrastructure as Code** : tout l'état déployable est en Git | M |

### 2.2 Performance & ressources

| ID | Exigence | Prio |
|----|----------|------|
| ENF-10 | Chaque conteneur a des **limites CPU/RAM** explicites | M |
| ENF-11 | Le socle (Core+Auth+proxy+DB) tient dans **≤ 4 Go** RAM | M |
| ENF-12 | Dashboard : temps de réponse perçu **< 1 s** sur le réseau local | S |
| ENF-13 | Fonctionnement en **mode dégradé** si un module est arrêté (pas d'effet domino) | M |

### 2.3 Sécurité (détaillé dans [05-securite.md](05-securite.md))

| ID | Exigence | Prio |
|----|----------|------|
| ENF-20 | **HTTPS** partout (TLS), y compris en interne au domicile | M |
| ENF-21 | **Reverse proxy** unique en frontal | M |
| ENF-22 | Accès distant **par VPN par défaut** ; exposition publique = exception maîtrisée | M |
| ENF-23 | **Secrets** hors du dépôt Git, chiffrés (coffre) | M |
| ENF-24 | **Chiffrement au repos** des sauvegardes et données sensibles | M |
| ENF-25 | **Journalisation** centralisée et auditable des accès et actions | M |
| ENF-26 | **Moindre privilège** : conteneurs non-root, réseaux Docker segmentés | S |

### 2.4 Fiabilité & exploitation

| ID | Exigence | Prio |
|----|----------|------|
| ENF-30 | **Sauvegardes** automatiques, chiffrées, **testées** (règle 3-2-1) | M |
| ENF-31 | **Monitoring** métriques + **alertes** (RAM, disque, service down) | M |
| ENF-32 | **Redémarrage automatique** des conteneurs (`restart: unless-stopped`) | M |
| ENF-33 | **Observabilité** : logs + métriques + traces (au moins logs+métriques v1) | S |
| ENF-34 | Procédures documentées : restauration, mise à jour, ajout de module | M |

### 2.5 Expérience & accessibilité

| ID | Exigence | Prio |
|----|----------|------|
| ENF-40 | Design moderne (inspirations Apple, Tesla, Nothing, Arc, Home Assistant) | S |
| ENF-41 | Responsive **mobile-first** | M |
| ENF-42 | Accessibilité (contrastes, navigation clavier, ARIA) | S |
| ENF-43 | Internationalisation prête (FR par défaut) | C |

---

## 3. Périmètre exclu de la v1 (Won't)

- **Kevin Mail** (serveur mail complet auto-hébergé) — trop lourd/risqué, reporté.
- **Haute disponibilité multi-nœuds** / Kubernetes en production — reporté (ADR-0002).
- **IA vision temps réel sur caméras** à grande échelle — nécessite GPU/Coral (Phase ultérieure).
- **Multi-tenant public** (milliers d'utilisateurs réels) — l'architecture le
  *prépare* mais la v1 vise le foyer.

---

## 4. Critères d'acceptation de la v1 (Phase socle)

La v1 « socle » sera considérée livrée quand :

1. Le **reverse proxy + SSO/MFA** protègent un premier module réel.
2. Le **Dashboard** affiche au moins 3 widgets vivants avec données réelles.
3. Un **module métier** (proposé : Cloud/Files ou Photos) est intégré derrière le SSO.
4. **Kevin AI** répond en langage naturel (local **ou** API) depuis le Dashboard.
5. **Sauvegarde + monitoring + alertes** sont opérationnels et une **restauration
   a été testée**.
6. Tout est **déployable depuis Git** (compose + IaC) et **documenté**.
