# Wireframes — vues principales

> Wireframes **structurels** (basse fidélité) : ils fixent la disposition et la
> hiérarchie, pas les couleurs finales (voir [design-system](design-system.md)).
> Ils appliquent la [charte UX/UI](ux-ui-charter.md).

Légende : `▚` surface/carte · `◦` icône · `▸` action · `▁` skeleton/champ.

---

## 1. Accueil (desktop) — « KevinOS est l'écran d'accueil »

```
┌────┬───────────────────────────────────────────────────────────────┐
│    │  ◦ Rechercher dans KevinOS…            ⌘K      ◦KAI  ◦🔔  ◦Kevin │  ← TopBar
│ ◦  │───────────────────────────────────────────────────────────────│
│Home│                                                               │
│    │   Bonjour Kevin.                                    ☀ 21°     │  ← En-tête perso
│ 📷 │   Mardi 13 juillet — tout est calme aujourd'hui.             │     (1 phrase, KAI)
│ 🎬 │                                                               │
│ 📁 │   ▚ État du système  ● Tout fonctionne · 12 services · 34%RAM │  ← Ligne de vérité
│ 🏠 │                                                               │     (clic → Monitor)
│ 📊 │   Modules                                                     │
│    │   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│    │   │📷 Vision│ │🎬 Media │ │📁 Drive │ │🏠 Home  │            │  ← Grille de modules
│    │   │1 240 ph.│ │+3 films │ │68% util.│ │21° · ok │            │     (ModuleCard :
│    │   │▸ ouvrir │ │▸ ouvrir │ │▸ ouvrir │ │▸ ouvrir │            │      état + 1 info)
│    │   └─────────┘ └─────────┘ └─────────┘ └─────────┘            │
│    │                                                               │
│    │   Activité récente            Accès rapides                  │
│    │   ▚ ◦ Sauvegarde OK · 03:30   ▸ Rechercher une photo         │  ← Activité +
│    │   ▚ ◦ 12 photos ajoutées      ▸ Lancer une sauvegarde        │     raccourcis
│    │   ▚ ◦ Maison : nuit activée   ▸ Parler à KAI                 │
│ ⚙  │                                                               │
└────┴───────────────────────────────────────────────────────────────┘
  ↑ Rail (Home + modules + Réglages). Réductible ↔ étendu.
```

**Hiérarchie** : le salut personnel domine ; l'état système est la 2ᵉ information ;
les modules sont le cœur d'action ; activité/raccourcis sont secondaires. Beaucoup
d'espace, une seule densité.

---

## 2. Recherche globale / Command Palette (`⌘K`) — overlay

```
        ┌───────────────────────────────────────────────┐
        │ ◦  vacances 2024▁                              │  ← champ unique
        ├───────────────────────────────────────────────┤
        │ KAI                                            │
        │  ◦ « Montre-moi les photos des vacances 2024 » │  ← intention (→ KAI)
        │ Photos (📷 KOS Vision)                          │
        │  ▚ ▚ ▚ ▚  4 résultats · voir tout             │  ← résultats groupés
        │ Actions                                        │
        │  ▸ Lancer une sauvegarde                       │  ← actions exécutables
        │  ▸ Ouvrir KOS Home                             │
        │ Réglages                                       │
        │  ◦ Thème clair / sombre                        │
        └───────────────────────────────────────────────┘
   ↑ scale 0.98→1 + fade. ↑/↓ navigue, Entrée exécute, Échap ferme.
```

**Principe** : une seule barre pour **tout retrouver** et **agir**. Résultats
groupés par domaine ; KAI en tête si la saisie ressemble à une intention. C'est
l'accélérateur (Arc/Notion) — jamais obligatoire.

---

## 3. 📷 KOS Vision — galerie (vue module)

```
┌────┬───────────────────────────────────────────────────────────────┐
│ ◦  │  ◦ Rechercher des photos…                     ⌘K  ◦KAI ◦🔔     │
│Home│───────────────────────────────────────────────────────────────│
│ 📷 │  📷 KOS Vision            [ Photos ][ Albums ][ Personnes ][ Carte ] │ ← segments
│ 🎬 │                                                               │
│ 📁 │   Juillet 2024                                                │  ← regroupé par
│ 🏠 │   ▚▚▚▚▚▚▚▚                                                    │     mois (timeline)
│ 📊 │   ▚▚▚▚▚▚▚▚                                                    │
│    │   Juin 2024                                                   │
│    │   ▚▚▚▚▚▚▚▚                                                    │  ← grille justifiée,
│    │   ▚▚▚▚▚▚                                                      │     lazy-load
│    │                                                               │
│    │   ┌───────── barre d'info (bas, discrète) ──────────┐        │
│    │   │ 1 240 photos · 80 vidéos · 42 Go   ▸ Sauvegarder │        │  ← usage + action
│ ⚙  │   └──────────────────────────────────────────────────┘        │
└────┴───────────────────────────────────────────────────────────────┘
```

Sous-vues (mêmes segments) : **Albums** (grille de couvertures), **Personnes**
(cercles + noms), **Carte** (points géolocalisés), **Souvenirs** (bandeau en tête
de « Photos »). Le clic sur une photo ouvre une **visionneuse** plein écran
(swipe, favori, infos). _Aucune mention d'Immich nulle part._

---

## 4. 🧠 KAI — conversation (invocable partout)

```
┌────┬───────────────────────────────────────────────────────────────┐
│ ◦  │  Retour                                        🧠 KAI          │
│    │───────────────────────────────────────────────────────────────│
│    │                                                               │
│    │            ◦ Kevin : « Retrouve les photos de ma fille »       │  ← bulle utilisateur
│    │                                                               │
│    │   🧠 J'ai trouvé 214 photos de Léa.                            │  ← réponse KAI
│    │      ▚ ▚ ▚ ▚   ▸ Voir dans KOS Vision                         │     + carte-résultat
│    │                                                               │     actionnable
│    │            ◦ Kevin : « Et l'espace utilisé ? »                 │
│    │   🧠 Tes photos occupent 42 Go (1 240 photos).                 │
│    │                                                               │
│    │───────────────────────────────────────────────────────────────│
│    │  ◦ Parler ou écrire à KAI…                            ▸ ◦🎙   │  ← saisie (texte/voix)
└────┴───────────────────────────────────────────────────────────────┘
```

KAI **répond ET agit** via les contrats des modules (Règle 5). Les résultats sont
des **cartes actionnables** (mêmes composants que les modules). Accessible depuis
la TopBar, `⌘K`, ou un lanceur discret. Local-first (Ollama, ADR-0006).

---

## 5. Notifications & Activité — panneau latéral

```
                          ┌───────────────────────────────┐
                          │ Notifications        ▸ Tout lu │
                          ├───────────────────────────────┤
                          │ ● ◦ Sauvegarde terminée · 03:30│  ← non-lu (point accent)
                          │   ◦ 12 photos ajoutées · hier  │
                          │   ◦ Mise à jour dispo · KOS… │  ▸ agir
                          │ ─ Plus tôt ─                   │
                          │   ◦ Maison : mode nuit         │
                          └───────────────────────────────┘
   ↑ glisse depuis la droite (cloche 🔔). aria-live pour les nouvelles.
```

Flux **discret, chronologique, actionnable**. Regroupé par récence. Chaque item
peut porter une action directe.

---

## 6. Réglages — vue d'ensemble

```
┌────┬───────────────────────────────────────────────────────────────┐
│ ◦  │  Réglages                                                     │
│    │───────────────────────────────────────────────────────────────│
│    │   Général      ▚ Apparence (thème)  ▚ Langue  ▚ Compte         │
│    │   Sécurité     ▚ MFA  ▚ Sessions  ▚ Sauvegardes                │
│    │   Modules      ▚ 📷 Vision  ▚ 🎬 Media  ▚ 🏠 Home  (activer…)  │
│    │   Système      ▚ Stockage  ▚ Réseau  ▚ À propos                │
│ ⚙  │                                                               │
└────┴───────────────────────────────────────────────────────────────┘
```

Réglages **par domaine**, langage clair. Les fonctions avancées d'administration
(seul cas où l'on peut atteindre un outil sous-jacent — Règle 6) vivent ici,
clairement séparées.

---

## 7. Mobile (Accueil) — même système, une colonne

```
┌───────────────────────────┐
│ ◦ Rechercher…    ◦KAI ◦🔔 │  ← TopBar compacte
│                           │
│ Bonjour Kevin.       ☀21° │
│ Tout est calme.           │
│                           │
│ ▚ État · ● Tout OK        │
│                           │
│ ┌───────────┐             │
│ │📷 Vision   │             │  ← cartes en pile
│ │1 240 ph.   │             │     (1 colonne)
│ └───────────┘             │
│ ┌───────────┐             │
│ │🎬 Media    │             │
│ └───────────┘             │
│ Activité récente          │
│ ▚ Sauvegarde OK           │
│                           │
│ ─────────────────────────  │
│  ◦Home ◦📷 ◦🧠KAI ◦🔔 ◦⚙  │  ← barre basse (rail → bottom nav)
└───────────────────────────┘
```

Le **même** système : le rail devient une **barre basse**, la grille passe à une
colonne, les composants sont identiques. Cible tactile ≥ 44 px, KAI toujours à
portée.

---

## Écrans transverses (états)

- **Chargement** : `Skeleton` à la forme du contenu (jamais de spinner plein
  écran).
- **Vide** : illustration légère + phrase utile + 1 action (« Aucune photo — Importer »).
- **Erreur** : message clair + `▸ Réessayer` ; jamais de cul-de-sac.
- **Hors-ligne** : bannière discrète « Mode local » ; tout ce qui est local reste
  utilisable (Règle 2).

---

_Prochaine étape (après validation) : implémenter `@kevinos/ui` (tokens +
composants) puis assembler ces vues dans `apps/dashboard`, en consommant
**uniquement** l'API v1 du Core._
