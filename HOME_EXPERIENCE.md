# Home — l'expérience

> Document de **réflexion produit**. Aucun code. Il décrit l'**émotion** que Home
> doit provoquer et les **principes psychologiques** qui guideront ses évolutions.
> C'est la boussole que l'on relit **avant chaque itération**.
>
> **Mantra :** _KevinOS ne remplace pas les meilleurs outils. Il les orchestre
> pour offrir une seule expérience._

Home n'est pas la page d'accueil d'un logiciel. C'est le **seuil** d'un assistant
personnel. Quand Kevin ouvre KevinOS, il n'arrive pas devant des données : il est
**accueilli** par quelqu'un — KAI — qui a veillé pendant son absence et qui est
content de le revoir.

Tout ce document tient dans une phrase : **Home doit donner l'impression d'être
attendu.**

---

## 1. L'émotion visée

Une seule émotion domine, et tout le reste en découle : **le calme confiant**.

Pas l'excitation, pas la performance, pas la démonstration technique. Le sentiment
tranquille que **tout va bien**, que **quelqu'un s'en occupe**, et que **je peux
demander n'importe quoi sans effort**.

Quatre ressentis composent ce calme confiant :

| Ressenti         | Ce que Home fait pour le provoquer                                    |
| ---------------- | --------------------------------------------------------------------- |
| **Calme**        | Une seule chose à regarder. Beaucoup de vide. Aucun clignotement.     |
| **Simplicité**   | Une seule action évidente : parler à KAI. Rien à apprendre.           |
| **Intelligence** | KAI sait déjà des choses utiles, sans qu'on ait rien demandé.         |
| **Confiance**    | Rien d'alarmant. Ce qui est montré est vrai, sobre, à sa juste place. |

Si un jour une évolution de Home **augmente** l'une de ces sensations, elle est
probablement juste. Si elle en **diminue** une seule, elle est probablement à revoir
— même si elle ajoute une fonctionnalité utile.

---

## 2. La chronologie du ressenti

L'expérience se juge dans le temps, pas sur une capture d'écran.

### Après 5 secondes — _« Je suis au bon endroit. »_

Le premier souffle. Avant même de lire, Kevin doit **ressentir** l'espace : c'est
apaisant, c'est propre, ça respire. Son regard tombe naturellement sur **une seule
chose** — le salut de KAI et l'invitation à parler.

- Il comprend **immédiatement** quoi faire : parler.
- Il ne voit **aucune** complexité, aucun réglage, aucun jargon.
- Il ressent une présence bienveillante, pas une machine.

> Échec à 5 s : Kevin doit **chercher** par où commencer, ou ressent une **charge**
> (trop d'éléments, trop de couleurs, trop de chiffres).

### Après 30 secondes — _« Il me connaît un peu. »_

Kevin a lu le salut, peut-être posé une question, peut-être parcouru du regard ce
que KAI lui signale. Une petite surprise agréable s'installe : **KAI a remarqué
quelque chose**. De nouvelles photos, une sauvegarde réussie, une soirée tranquille.

- L'information est **offerte**, jamais réclamée : rien à cliquer pour « charger ».
- Ce qui est montré est **pertinent aujourd'hui**, pas un tableau de bord figé.
- Le ton est **humain, sobre, honnête** — jamais commercial, jamais anxiogène.

> Échec à 30 s : Kevin a l'impression de lire un **rapport technique**, ou ressent
> qu'on lui **réclame** de l'attention (badges, notifications, « à faire »).

### Après plusieurs jours — _« J'ouvre KevinOS avec plaisir. »_

C'est ici que se gagne ou se perd le produit. L'habitude est une force redoutable :
soit Home devient un réflexe **agréable**, soit un réflexe **vide**.

- Home n'est **jamais exactement le même** deux fois — il suit la vie de Kevin
  (l'heure, le jour, ce qui s'est passé) sans jamais devenir bavard.
- KAI paraît **avoir vécu la journée avec lui** : il sait ce qui a changé.
- La confiance devient **structurelle** : Kevin sait que si quelque chose n'allait
  pas, Home le lui dirait **calmement**. Le silence de Home = tout va bien.

> Le vrai test, à un an : Kevin ouvre-t-il KevinOS **avec plaisir**, ou seulement
> **par habitude** ? Tout ce document vise le premier.

---

## 3. Les principes psychologiques

Sept principes durables. Ils priment sur toute fonctionnalité particulière.

### P1 — Une seule chose à la fois (charge cognitive minimale)

Le cerveau accueille mal l'abondance. Home ne présente **jamais** dix décisions
simultanées. Il y a **une** action évidente (parler à KAI) ; tout le reste est
**secondaire, calme, et vient après**. La hiérarchie n'est pas décorative : elle
protège l'attention de Kevin.

### P2 — L'assistant vivant (jamais figé)

Un être vivant ne se répète pas à l'identique. Home doit **respirer** : petites
variations de salut, de contenu, de ton selon le moment. Ce n'est pas un gadget —
c'est ce qui transforme un **écran** en une **présence**. (Développé en §4.)

> Ce principe est désormais un **invariant** du projet :
> [**Règle 9**](docs/REGLES-ARCHITECTURE.md) — _« KevinOS doit donner l'impression
> d'être vivant »_. L'utilisateur ne doit jamais avoir l'impression d'ouvrir un
> écran vide ; une intelligence est déjà là, même sans interaction.

### P3 — Le silence est une fonctionnalité

Ne rien dire est une information précieuse : **tout va bien**. Home ne remplit pas
l'espace pour le remplir. Il ne crée pas de fausse urgence, n'invente pas de
notifications, ne réclame pas d'attention. La sérénité naît de ce que Home **choisit
de ne pas montrer** autant que de ce qu'il montre. (Règle 4 — mieux vaut supprimer
que compliquer ; ADR-0017 — le silence.)

### P4 — La confiance par la constance

La confiance se construit par la **prévisibilité émotionnelle**. Home est toujours
au même endroit, toujours calme, toujours honnête. Il ne surprend jamais par une
alerte agressive ni par un changement brutal de mise en page. Les surprises de Home
sont **petites et agréables**, jamais **grandes et anxiogènes**.

### P5 — Le sentiment d'être attendu

La différence entre un outil et un assistant : l'assistant **était là pendant
l'absence**. KAI ne dit pas « voici tes données » ; il dit « pendant que tu dormais,
voici ce qui s'est passé ». Ce léger décalage — KAI comme **gardien** qui rend
compte — est au cœur de l'attachement.

### P6 — Révélation progressive (profondeur sur demande)

Home est simple **en surface** et riche **en profondeur**. La complexité existe,
mais elle se **mérite** : elle n'apparaît que quand Kevin la demande, en parlant à
KAI ou en descendant dans une compétence. On ne montre jamais la puissance ; on la
**rend accessible**.

### P7 — Le respect de l'utilisateur

Un bon assistant personnel n'est ni intrusif, ni manipulateur, ni avide
d'engagement. Home ne cherche pas à **retenir** Kevin (pas de mécaniques
d'addiction, pas de « encore une chose »). Sa réussite se mesure à la **tranquillité**
qu'il procure, pas au temps passé devant lui. C'est un serviteur, pas un capteur
d'attention.

---

## 4. Le salut vivant de KAI

> _« KAI ne devrait jamais dire "Bonjour Kevin" de la même façon deux fois. »_
> — l'intuition du Product Owner, 2026-07-13. **Adoptée comme principe fondateur
> de Home** (incarnation directe de P2, P5, P4).

Le salut est la **première phrase** que KAI adresse à Kevin, chaque jour. C'est le
plus petit détail — et le plus important. Un salut figé fait un écran. Un salut
vivant fait une **présence**.

**Anatomie d'un salut** — deux temps :

1. **La salutation**, accordée au **moment** : _Bonjour · Bonsoir · Bonne nuit ·
   Salut_, avec un signe discret (👋 le jour, 🌙 le soir, ☀️ le matin…).
2. **Une observation**, tirée de ce que KAI **sait vraiment** de l'état du système :

   - « Tout fonctionne parfaitement aujourd'hui. »
   - « Deux sauvegardes ont été effectuées cette nuit. »
   - « J'ai remarqué 58 nouvelles photos. »
   - « Rien de particulier aujourd'hui, tout est en ordre. »

**Ce qui fait la vie** — la variation vient de trois sources, par ordre de priorité :

- **Le moment** : heure de la journée, jour de la semaine, parfois la saison.
- **L'état réel** : ce qui a changé depuis la dernière visite (photos, sauvegardes,
  santé du système, un média laissé en cours…).
- **Une légère variation de formulation**, pour qu'à état égal, la phrase ne soit
  pas mécaniquement identique.

**Les règles d'or du salut** (ce qui empêche le gadget de devenir du bruit) :

- **Honnête** : KAI ne dit **que** ce qui est vrai. Jamais de « 58 nouvelles photos »
  s'il n'y en a pas. Un assistant qui invente perd toute confiance (P4).
- **Sobre** : **une** observation, la plus pertinente. Jamais une liste. Si trois
  choses méritent d'être dites, KAI en dit **une** et garde le reste pour la
  conversation (P1, P6).
- **Calme** : même une mauvaise nouvelle se dit sans alarmer. « J'ai remarqué que
  l'espace disque se remplit — on peut regarder ça quand tu veux » plutôt qu'un
  bandeau rouge (P4, P7).
- **Silencieux quand il le faut** : s'il n'y a **rien** d'intéressant à dire, KAI dit
  simplement que tout est en ordre. « Rien de particulier, tout va bien » est une
  très bonne phrase (P3).
- **Jamais deux fois pareil** à l'identique — mais **jamais bavard** non plus. La
  variation sert la présence, pas la performance.

**L'enjeu, à un an** : ce sont ces micro-attentions qui font qu'on ouvre KevinOS
**avec plaisir** plutôt que par habitude. Le salut vivant n'est pas un détail
cosmétique — c'est **la promesse quotidienne** que derrière l'écran, il y a
quelqu'un qui veille.

_Note d'implémentation (pour plus tard, hors de ce document) : dans l'itération 1,
le salut est fixe et KAI est simulé. Le salut vivant deviendra réel quand KAI sera
relié à l'état du système via ses contrats (Core), sans que Home change de nature._

---

## 5. Ce que Home n'est **pas**

Se définir par la négative protège l'épure.

- **Pas un tableau de bord.** Home n'est pas une grille de widgets, de jauges et de
  KPI. La donnée technique existe (Monitor), mais elle n'est **pas** l'accueil.
- **Pas un centre de notifications.** Home n'accumule pas les pastilles rouges ni
  les « à faire ». Il ne culpabilise pas, ne presse pas.
- **Pas une vitrine.** Home ne cherche pas à impressionner par la densité ou la
  quantité de fonctions. La retenue **est** le raffinement.
- **Pas un piège à attention.** Aucune mécanique d'engagement. Home veut que Kevin
  reparte **serein**, pas qu'il reste.
- **Pas un écran figé.** À l'inverse, Home n'est jamais mort : il vit doucement avec
  la journée de Kevin.

---

## 6. Le filtre produit — avant chaque itération

Adopté le 2026-07-13. **Toute** nouvelle fonctionnalité de Home doit **mériter sa
place** en répondant « oui » à ces quatre questions :

| #   | Question                                                                    |
| --- | --------------------------------------------------------------------------- |
| 1   | Apporte-t-elle une **réelle valeur** à l'utilisateur ?                      |
| 2   | Est-elle **cohérente** avec la philosophie de KevinOS (calme, épure, KAI) ? |
| 3   | Est-elle la **prochaine étape la plus pertinente** ?                        |
| 4   | Existe-t-il une **solution plus simple** (voire : ne rien ajouter) ?        |

Un seul « non » = on ne l'ajoute pas encore. **L'épure n'est pas une contrainte,
c'est le produit.** Chaque élément retiré de Home est une victoire autant qu'un
élément bien ajouté.

---

## 7. Comment ce document guide le développement

- On **relit ce document avant chaque itération** de Home, avec le filtre du §6.
- Les décisions de conception se justifient par un **principe** (P1–P7), pas par un
  goût ou une mode.
- Les composants `@kevinos/ui` créés pour Home doivent **servir l'émotion** décrite
  ici — sinon ils ne servent pas Home.
- Ce document **évoluera** avec les retours de Product Owner (ton de KAI, rythme,
  hiérarchie, simplicité). C'est un texte vivant, comme Home.

_En un mot : Home n'est pas jugé à ce qu'il affiche, mais à ce que Kevin **ressent**
en l'ouvrant. Notre travail n'est pas de remplir un écran — c'est de faire naître
une présence._
