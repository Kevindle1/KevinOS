# ADR-0017 — Principes de conception des composants + API formulaires + « Home »

**Statut** : Acceptée — 2026-07-12
**Date** : 2026-07-12
**Prolonge** : [ADR-0013](ADR-0013-design-system-proprietaire.md) (DS),
[ADR-0016](ADR-0016-plateforme-experience.md) (plateforme d'expérience).

> **Mantra.** _KevinOS ne remplace pas les meilleurs outils. Il les orchestre pour
> offrir une seule expérience._ On ne construit pas une bibliothèque React : on
> construit **l'identité visuelle de KevinOS**.

## Contexte

Le propriétaire fixe des **règles de conception permanentes** applicables à **tous**
les composants `@kevinos/ui`, une **API formulaire** commune, et renomme le premier
écran : **« Home »**, pas « Dashboard ».

## Décision

### 1. Philosophie UX — l'impression recherchée

**Calme · simplicité · fluidité · confiance · modernité.** Jamais l'impression d'un
**outil d'administration**. L'utilisateur doit **oublier** qu'il administre une
infrastructure — il **discute avec son environnement numérique**.

### 2. Les 5 règles de conception (tout composant s'y conforme)

1. **Simplicité** — immédiatement compréhensible, aucune surcharge visuelle.
2. **Fluidité** — interactions naturelles ; les animations **accompagnent** sans
   attirer l'attention (motion discret, `prefers-reduced-motion`).
3. **Silence** — interface discrète : pas de couleurs agressives, pas de bordures
   inutiles, pas d'ombres excessives, pas d'animations démonstratives.
4. **Lisibilité** — **le contenu prime toujours sur la décoration**.
5. **Performance** — parfait sur PC, Mac, iPhone, Android, tablette (léger, cibles
   tactiles ≥ 44 px, éléments **natifs** privilégiés pour la robustesse et l'a11y).

### 3. API formulaire commune (moderne)

- **Contrôlé ET non-contrôlé** : chaque champ accepte `value`/`onChange` **ou**
  `defaultValue` (via un hook interne `useControllableState`).
- **Validation & états intégrés nativement**, une seule fois, pour que **les
  modules ne les réimplémentent jamais** : `label`, `help`, `error`/`invalid`,
  `required`, `loading`, `disabled`.
- **Accessibilité automatique** : `label` lié (`htmlFor`), `aria-describedby` vers
  l'aide/erreur, `aria-invalid`, `aria-required`, focus visible, message d'erreur
  en `role="alert"`.
- Ces éléments sont fournis par une **fondation partagée** (`Field` + hook), pas
  copiés dans chaque composant.

### 4. `SearchInput` est un composant **stratégique**

Utilisé par **KAI, KOS Vision, KOS Media, KOS Drive, Dashboard/Home**. Conçu
**dès aujourd'hui** comme un composant de **très haut niveau** : valeur
contrôlable, bouton d'effacement, état de chargement, soumission clavier
(`Entrée`/`Échap`), slots d'icône/actions, prêt à alimenter la recherche globale
et KAI.

### 5. Évolutivité & compatibilité

Un composant peut **évoluer sans casser** les modules : ajout **rétrocompatible**
(nouvelles props optionnelles) ; rupture = **MAJEUR** du Plugin Interface
([ADR-0008](ADR-0008-versioning-compatibilite.md)). La compatibilité est une
**priorité**.

### 6. Le premier écran s'appelle **« Home »** (plus de « Dashboard »)

On **arrête de penser « Dashboard »**. KevinOS s'ouvre sur un **accueil**, comme un
téléphone ou un ordinateur — **KAI au centre** :

```
Bonjour Kevin 👋
Que souhaites-tu faire aujourd'hui ?
[______________________________]
📷 Reprendre les photos   🎬 Continuer Fallout   🏠 Maison
💬 Demander à KAI         ⚙️ Paramètres
```

Il n'y a plus « un dashboard » : il y a un **Home**. Les modules sont des
**capacités** auxquelles on accède **sans y penser**. C'est ce qui distingue
durablement KevinOS d'un NAS / Home Assistant / Grafana (qui ont tous un tableau
de bord). _KevinOS n'orchestre pas des écrans, il orchestre une expérience._

## Conséquences

- ➕ Une **identité** cohérente et calme, reconnaissable, qui vieillit bien.
- ➕ Les modules consomment des champs **déjà accessibles et validés** — zéro
  duplication.
- ➕ `SearchInput` et `Home` deviennent des **signatures** de l'expérience KevinOS.
- ➖ Chaque composant doit respecter un cahier de règles précis (revu dans le
  Design Lab) — c'est le prix de l'identité.

### Conséquences dans plusieurs années

- Ces règles étant **au niveau des composants** (et des tokens), l'identité
  KevinOS peut évoluer **sans réécrire les modules**. « Home » reste pertinent même
  quand les moteurs (Immich, Jellyfin, NAS) changent.
