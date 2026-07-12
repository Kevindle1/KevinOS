# KevinOS

> **Un cerveau numérique personnel.** Auto-hébergé, modulaire, souverain.
> KevinOS n'est ni un NAS, ni un simple HomeLab : c'est un écosystème complet
> pensé pour évoluer pendant des années.

**Version : 0.1 — Phase Architecture**
**Statut : 📐 Conception (aucun code applicatif — validation attendue)**

---

## 🎯 En une phrase

KevinOS unifie sous une seule interface, une seule identité et un seul cerveau IA
l'ensemble de la vie numérique de son propriétaire : maison, médias, photos,
documents, développement, réseau, sécurité, sauvegardes et automatisations —
sans dépendance obligatoire au Cloud.

---

## 📚 Documentation d'architecture

Ce dépôt est actuellement en **phase de conception**. Aucune ligne de code
applicatif n'est écrite tant que l'architecture n'est pas validée (étape 6 de la
méthode projet). Toute la réflexion est documentée ici :

| # | Document | Contenu |
|---|----------|---------|
| 00 | [Analyse](docs/00-analyse.md) | Contexte, besoins, contraintes, risques |
| 01 | [Cahier des charges](docs/01-cahier-des-charges.md) | Exigences fonctionnelles & non-fonctionnelles |
| 02 | [Architecture](docs/02-architecture.md) | 4 architectures comparées + décision |
| 03 | [Choix techniques](docs/03-choix-techniques.md) | Stack détaillée et justifiée |
| 04 | [Modules](docs/04-modules.md) | Catalogue des 33 modules + priorisation |
| 05 | [Sécurité](docs/05-securite.md) | Modèle de menace, défense en profondeur |
| 06 | [Roadmap](docs/06-roadmap.md) | Feuille de route par phases |
| — | [Diagrammes](docs/diagrammes/) | Schémas Mermaid (contexte, conteneurs, réseau, données) |
| — | [Décisions (ADR)](docs/adr/) | Journal des décisions d'architecture |

👉 **Point d'entrée recommandé : [`docs/00-analyse.md`](docs/00-analyse.md)**

---

## 🧭 Principe directeur

```
Ne pas réinventer ce qui existe et excelle déjà.
Construire la valeur unique de KevinOS : le LIANT.
```

KevinOS n'écrit pas son propre stockage photo (Immich existe), son propre lecteur
multimédia (Jellyfin existe) ni sa propre domotique (Home Assistant existe). La
valeur propre de KevinOS est la **couche d'intégration** : un dashboard unifié,
une authentification unique (SSO/MFA), et surtout un **orchestrateur IA** (« le
cerveau ») capable de lire, résumer et agir sur l'ensemble de ces briques.

Voir [ADR-0004](docs/adr/ADR-0004-integrer-vs-construire.md).

---

## 🖥️ Cible matérielle (v1)

| Élément | Spéc | Impact architecture |
|---------|------|---------------------|
| Serveur | ASUS TUF, CPU x86-64 | Nœud unique Docker |
| RAM | **16 Go** | Contrainte forte — voir budget mémoire |
| Stockage | SSD système + 2×1 To USB + 1×1 To SATA | Séparation OS / données / sauvegardes |
| Réseau | Keenetic Hopper DSL → Freebox Delta Fibre | IP dynamique, CGNAT possible |

⚠️ **16 Go de RAM ne permettent pas de tout faire tourner simultanément.** Le
déploiement est **progressif** et priorisé (voir [Roadmap](docs/06-roadmap.md)).
L'IA locale performante et la vision (caméras) nécessiteront à terme un
**upgrade RAM (≥ 32 Go) et un GPU/accélérateur**.

---

## 🗺️ Où en est le projet ?

- [x] **Étape 1** — Analyse
- [x] **Étape 2** — Cahier des charges
- [x] **Étape 3** — Architecture (options + décision)
- [x] **Étape 4** — Choix techniques
- [x] **Étape 5** — Diagrammes
- [ ] **Étape 6** — ⏳ **Validation par le propriétaire** ← *nous sommes ici*
- [ ] **Étape 7** — Développement (Phase 0 : socle)
- [ ] **Étape 8** — Tests
- [ ] **Étape 9** — Documentation utilisateur
- [ ] **Étape 10** — Livraison

---

## 📄 Licence & propriété

Projet personnel. Toutes les données appartiennent au propriétaire. Aucune
donnée n'est envoyée à un tiers sans décision explicite du propriétaire.
