# Charte UX/UI de KevinOS

> Les principes de navigation et d'interaction. Ce document **précède** le code
> (Règle 4 — UX-First). Il s'applique au Dashboard **et** à tous les modules KOS.

---

## 1. Intention

KevinOS doit **se ressentir comme un système d'exploitation personnel**, pas comme
un tableau de bord technique. À l'ouverture, en une seconde, on doit percevoir : un
produit **calme, premium, sous contrôle**.

Références assumées : **Apple** (clarté, profondeur, retenue), **Nothing**
(monochrome, honnêteté, détail typographique), **Tesla** (sombre, focalisé,
serein), **Arc** (spatial, arrondi, joyeux mais sobre), **Notion** (typographie,
densité maîtrisée), **Home Assistant** (cartes lisibles d'un coup d'œil).

## 2. Principes directeurs

1. **Le vide est une fonctionnalité.** L'espace négatif hiérarchise et apaise. On
   préfère retirer que remplir.
2. **Une hiérarchie visuelle forte.** À chaque écran, une seule chose est la plus
   importante. Taille, poids, couleur et espace la désignent sans ambiguïté.
3. **Chaque pixel a une raison.** Pas d'ornement gratuit. Si un élément
   n'aide pas à comprendre ou à agir, il dégage.
4. **Discrétion du mouvement.** Les animations **révèlent la logique** (d'où vient
   un panneau, où va un élément), elles ne décorent pas. Rapides, fluides,
   jamais tape-à-l'œil. Toujours respect de `prefers-reduced-motion`.
5. **Cohérence absolue.** Un bouton, une carte, un espacement se comportent
   **partout** de la même façon. Les modules ne réinventent rien.
6. **Calme par défaut, information à la demande.** Peu de couleur, peu de bruit ;
   la couleur et la densité apparaissent quand elles portent du sens (alerte,
   accent de module).
7. **Accessible, donc meilleur pour tous.** Contraste, focus, clavier, tailles de
   cible : des contraintes qui améliorent l'expérience de chacun.

## 3. Modèle de navigation

Trois moyens d'atteindre **tout**, du plus spatial au plus rapide :

### 3.1 Le rail (navigation spatiale, persistante)

Un **rail vertical fin à gauche**, toujours présent : Accueil, puis les modules
KOS (📷 Vision, 🎬 Media, 📁 Drive, 🏠 Home, 📊 Monitor…), et en bas Réglages.
Chaque entrée = une icône et son marqueur d'identité ; le libellé apparaît au
survol/expansion. C'est la **carte mentale** du système — stable, mémorisable.

- Sur desktop : rail réductible (icônes) ↔ étendu (icônes + libellés).
- Sur mobile : le rail devient une **barre de navigation basse** (4-5 entrées
  max), plus un accès « plus ».

### 3.2 La recherche globale / Command Palette (navigation rapide)

Invoquée par **`⌘K` / `Ctrl-K`** (et par la barre de recherche du haut). Elle
permet, à terme, de **retrouver n'importe quelle information de KevinOS** (photos,
fichiers, réglages, actions, modules) et d'**exécuter des actions** (« lancer une
sauvegarde »). Inspirations Arc/Notion. C'est l'accélérateur des utilisateurs
avancés — **jamais** un prérequis pour les débutants.

### 3.3 KAI (navigation par intention)

**KAI est omniprésent** : une entrée d'invocation accessible depuis partout
(raccourci + point d'accès visuel discret). On lui parle en langage naturel ; il
**agit** via les contrats des modules (Règle 5). KAI et la recherche globale
partagent la même surface d'invocation : on tape → suggestions/résultats ; on pose
une question → KAI répond/agit.

> **Règle d'or de navigation** : tout ce qui est faisable est atteignable en **≤ 2
> intentions** — soit par le rail (spatial), soit par `⌘K`/KAI (direct).

## 4. Architecture de l'écran d'accueil

L'Accueil **est** KevinOS. De haut en bas, une hiérarchie claire :

1. **En-tête personnel** — « Bonjour Kevin », date, météo/résumé du jour (une
   phrase). Ton calme, humain.
2. **État général du système** — une ligne de vérité : tout va bien / X à regarder.
   Détail au clic (vers KOS Monitor).
3. **Grille de modules** — cartes KOS glanceables (état + 1 info vive : dernières
   photos, espace, maison…). Point d'entrée vers chaque module.
4. **Activité récente & Notifications** — flux discret, chronologique, actionnable.
5. **Accès rapides** — 3-4 actions contextuelles (rechercher une photo, lancer une
   sauvegarde, parler à KAI…).

Le tout **respire** : marges généreuses, regroupements clairs, une seule densité.

## 5. Interaction — règles

- **Réactivité perçue < 100 ms** : tout clic répond immédiatement (état pressé,
  skeleton), même si les données arrivent après.
- **États explicites** partout : _chargement_ (skeleton, pas de spinner plein
  écran), _vide_ (message utile + action), _erreur_ (message clair + réessayer),
  _succès_ (feedback discret, toast bref).
- **Optimiste quand c'est sûr** : les actions réversibles s'affichent comme
  réussies immédiatement, avec annulation possible (toast « Annuler »).
- **Pas de cul-de-sac** : chaque état vide/erreur propose l'étape suivante.
- **Confirmation seulement si l'action est risquée/irréversible** (supprimer,
  arrêter un service) — sinon, action directe + annulation.
- **Le survol enrichit, le focus révèle** ; rien d'essentiel n'est caché derrière
  le seul survol (accessibilité + tactile).

## 6. Responsive & multi-surface

- **Mobile-first** dans la pensée, **fluide** jusqu'au grand écran.
- Points de rupture indicatifs : ~640 (mobile), ~1024 (tablette/rail réduit),
  ~1440 (desktop confort).
- Les **mêmes composants** s'adaptent (le rail devient barre basse, la grille passe
  de 1 à N colonnes). On ne conçoit pas deux interfaces, une seule qui respire.

## 7. Accessibilité (non négociable)

- **Contraste** : AA minimum (4.5:1 texte, 3:1 gros texte/éléments).
- **Clavier** : tout est atteignable et actionnable au clavier ; ordre logique ;
  `⌘K` universel ; `Échap` ferme les surfaces.
- **Focus visible** : anneau de focus net et cohérent (jamais supprimé).
- **Lecteurs d'écran** : sémantique HTML correcte, ARIA là où nécessaire, libellés
  explicites, régions live pour notifications.
- **Mouvement** : `prefers-reduced-motion` désactive les animations non
  essentielles.
- **Cibles tactiles** : ≥ 44 × 44 px.
- **Langue** : FR par défaut, structure prête à l'i18n.

## 8. Ton & voix

Calme, clair, humain, avec un **humour léger et rare** (jamais envahissant — c'est
la personnalité de KAI). On explique quand il le faut, on résume par défaut. Jamais
de jargon inutile devant l'utilisateur (l'implémentation — Immich, etc. — reste
invisible, Règle 5).

---

_La traduction de ces principes en tokens et composants concrets est dans
[design-system.md](design-system.md) ; leur mise en page dans
[wireframes.md](wireframes.md)._
