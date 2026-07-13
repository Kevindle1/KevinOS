# KevinOS

> ### KevinOS ne remplace pas les meilleurs outils. Il les orchestre pour offrir une seule expérience.

> **Une plateforme intelligente pour la vie numérique.** Auto-hébergée, souveraine,
> offline-first. KevinOS n'est ni un NAS ni un HomeLab : c'est un **assistant
> personnel** (KAI) qui orchestre les meilleurs moteurs open-source derrière **une
> seule interface, une seule intelligence, une seule expérience**.
>
> **KevinOS** = la plateforme · **KAI** = l'intelligence · **KOS** = les compétences ·
> logiciels tiers = moteurs interchangeables **invisibles**.

**Version : 0.1 — Phase 0 (fondations) ✅ → Phase 1 (socle sécurité) en cours**
**Statut : 🏗️ Socle livré (monorepo + Core + infra + versioning) ; Phase 1 = Authelia / Restic / secrets / monitoring**

---

## 🧭 Commencer par le « pourquoi »

- **[`PRODUCT_VISION.md`](PRODUCT_VISION.md)** — la **boussole** : pourquoi KevinOS
  existe, pour qui, et ce qu'il ne doit jamais devenir. _(À lire en premier.)_
- **[`docs/REGLES-ARCHITECTURE.md`](docs/REGLES-ARCHITECTURE.md)** — les **règles
  permanentes** (Règle 0 : **l'expérience est le produit** ; offline-first,
  API-first, UX-first, KAI, interface unique, documentation), opposables à toute
  décision.
- **[`UI_ROADMAP.md`](UI_ROADMAP.md)** — la plateforme UI par **expériences**
  (Foundation → Dashboard → KAI → Vision → Media → Home).
- **[`HOME_EXPERIENCE.md`](HOME_EXPERIENCE.md)** — la **boussole émotionnelle** de
  Home (l'émotion visée, le salut vivant de KAI, les principes psychologiques).
- **[`DEPLOYMENT.md`](DEPLOYMENT.md)** — la **Preview** : suivre KevinOS par une
  simple URL (iPhone), pipeline CI/CD, mode simulé, trois environnements.

---

## 🎯 En une phrase

KevinOS unifie sous une seule interface, une seule identité et un seul cerveau IA
l'ensemble de la vie numérique de son propriétaire : maison, médias, photos,
documents, développement, réseau, sécurité, sauvegardes et automatisations —
sans dépendance obligatoire au Cloud.

---

## 📚 Documentation d'architecture

L'architecture est **validée** ; le développement du socle est en cours. Toute la
réflexion est documentée ici :

| #   | Document                                            | Contenu                                                 |
| --- | --------------------------------------------------- | ------------------------------------------------------- |
| 00  | [Analyse](docs/00-analyse.md)                       | Contexte, besoins, contraintes, risques                 |
| 01  | [Cahier des charges](docs/01-cahier-des-charges.md) | Exigences fonctionnelles & non-fonctionnelles           |
| 02  | [Architecture](docs/02-architecture.md)             | 4 architectures comparées + décision                    |
| 03  | [Choix techniques](docs/03-choix-techniques.md)     | Stack détaillée et justifiée                            |
| 04  | [Modules](docs/04-modules.md)                       | Catalogue des 33 modules + priorisation                 |
| 05  | [Sécurité](docs/05-securite.md)                     | Modèle de menace, défense en profondeur                 |
| 06  | [Roadmap](docs/06-roadmap.md)                       | Feuille de route par phases                             |
| 07  | [Vision KAI](docs/07-vision-kai.md)                 | Le cerveau unique : « tout passe par KAI »              |
| 08  | [Versioning](docs/08-versioning.md)                 | SemVer & compatibilité des modules/plugins              |
| 09  | [Identité modules](docs/09-identite-modules.md)     | Convention `KOS <Nom>` (KOS Vision, Media, Drive…)      |
| 10  | [Module de référence](docs/10-module-reference.md)  | 📷 KOS Vision, le patron de tout module                 |
| —   | [Fondation design](docs/design/)                    | Charte UX/UI, KOS Design System, wireframes             |
| —   | [Diagrammes](docs/diagrammes/)                      | Schémas Mermaid (contexte, conteneurs, réseau, données) |
| —   | [Décisions (ADR)](docs/adr/)                        | Journal des décisions d'architecture                    |

👉 **Point d'entrée recommandé : [`docs/00-analyse.md`](docs/00-analyse.md)**

---

## 🛠️ Développement

**Prérequis** : Node 22 et pnpm 10 (`corepack enable`).

```bash
pnpm install                          # installe tout le monorepo

pnpm --filter @kevinos/home dev       # Home (le produit)        → http://localhost:5175
pnpm --filter @kevinos/design-lab dev # KOS Design Lab (l'atelier) → http://localhost:5174

pnpm run check                        # format + lint + typecheck + tests (avant chaque commit)
```

### Obtenir une Preview en ligne (Vercel) — ~3 minutes

Pour tester KevinOS depuis un simple lien (iPhone compris), sans rien lancer, on
utilise l'**intégration Git de Vercel** (solution officielle V1) :

1. Créer un compte gratuit sur [vercel.com](https://vercel.com) — se connecter **avec
   GitHub**.
2. **Add New… → Project → Import** ce dépôt. Vercel lit `vercel.json` : **rien à
   configurer**, cliquer **Deploy**.
3. C'est tout. Désormais **chaque branche** obtient automatiquement sa **propre URL
   de Preview** (données simulées), et `main` alimente la production.

> Le lien de Preview de chaque branche apparaît dans l'onglet **Deployments** du
> projet Vercel (et directement dans les Pull Requests). Détails, environnements et
> durcissement CI/CD : **[`DEPLOYMENT.md`](DEPLOYMENT.md)**.

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

| Élément  | Spéc                                      | Impact architecture                    |
| -------- | ----------------------------------------- | -------------------------------------- |
| Serveur  | ASUS TUF, CPU x86-64                      | Nœud unique Docker                     |
| RAM      | **16 Go**                                 | Contrainte forte — voir budget mémoire |
| Stockage | SSD système + 2×1 To USB + 1×1 To SATA    | Séparation OS / données / sauvegardes  |
| Réseau   | Keenetic Hopper DSL → Freebox Delta Fibre | IP dynamique, CGNAT possible           |

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
- [x] **Étape 6** — Validation par le propriétaire (2026-07-12)
- [~] **Étape 7** — Développement — Phase 0 ✅, **Phase 1 : socle sécurité (SSO/MFA, secrets, sauvegardes, monitoring)** ← _nous sommes ici_
- [ ] **Étape 8** — Tests
- [ ] **Étape 9** — Documentation utilisateur
- [ ] **Étape 10** — Livraison

---

## 📄 Licence & propriété

Projet personnel. Toutes les données appartiennent au propriétaire. Aucune
donnée n'est envoyée à un tiers sans décision explicite du propriétaire.
