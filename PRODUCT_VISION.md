# Pourquoi KevinOS existe

> Ce document n'est pas technique. C'est la **boussole** du projet.
> Quand une décision est difficile — ajouter une fonctionnalité, choisir une
> techno, faire un compromis — on revient ici. Si l'idée s'éloigne de ce texte,
> c'est probablement une mauvaise idée, même si elle est séduisante.
>
> _Dernière relecture : 2026-07-12._

---

## La question à laquelle KevinOS répond

> **« Pourquoi ma vie numérique appartient-elle à des dizaines d'entreprises, et
> pourquoi aucune d'elles ne me comprend dans son ensemble ? »**

Aujourd'hui, une personne éparpille ses photos chez Google, ses films chez
Netflix, ses fichiers chez Dropbox, sa maison chez une box propriétaire, ses mots
de passe chez un tiers, ses données de santé ailleurs encore. Résultat :

- **Aucune souveraineté** — les données vivent chez d'autres, soumises à leurs
  règles, leurs pannes, leurs changements de prix, leur disparition.
- **Aucune vue d'ensemble** — chaque service ignore les autres. Personne n'a le
  contexte complet d'une vie.
- **Aucune intelligence transverse** — aucun assistant ne voit _tout_ et ne peut
  vraiment aider.

**KevinOS existe pour rapatrier cette vie numérique chez soi, l'unifier derrière
une seule porte, et lui donner un cerveau.**

## Ce qu'est KevinOS

KevinOS est le **système d'exploitation numérique d'un foyer** : un cerveau
personnel, auto-hébergé, qui centralise, comprend et pilote tout ce qui compte —
maison, médias, photos, fichiers, serveurs, sauvegardes — derrière **une seule
interface** et **une seule intelligence : KAI**.

Ce n'est pas un NAS. Ce n'est pas un tableau de bord. C'est un **produit** : pensé,
cohérent, durable, comme s'il devait un jour servir des milliers de foyers.

## Pour qui

- **Aujourd'hui : Kevin.** Une personne qui veut reprendre le contrôle de sa vie
  numérique sans sacrifier le confort des services modernes.
- **Demain, peut-être : d'autres foyers.** Des gens qui veulent la même chose mais
  ne savent pas assembler vingt logiciels. Pour eux, KevinOS doit être **simple**,
  pas un projet d'expert.

Chaque décision est prise pour ces **deux horizons à la fois** : ça marche pour
moi ce soir, et ça tiendrait pour mille personnes dans trois ans.

## Nos principes (non négociables)

1. **Souveraineté.** Les données appartiennent à leur propriétaire. Elles vivent
   chez lui. Personne d'autre n'y accède sans sa décision explicite.
2. **Offline-first.** Tout fonctionne **sans Internet**. Le Cloud est toujours une
   **option**, jamais une dépendance.
3. **Vie privée.** Par défaut, rien ne sort. L'IA est **locale**. Aucune donnée
   n'est monnayée, profilée, ou envoyée « pour améliorer le service ».
4. **Simplicité.** L'expérience prime. Mieux vaut **retirer** une fonctionnalité
   que compliquer l'interface. La complexité vit **sous le capot**, jamais devant
   l'utilisateur.
5. **Modularité.** Tout est **plugin**. On n'ajoute jamais une capacité en
   modifiant le cœur. Chaque module est remplaçable.
6. **Une seule porte.** Une interface, un point d'entrée, un cerveau (KAI).
   L'utilisateur ne sait jamais quel logiciel tourne derrière — et n'a pas à le
   savoir.
7. **Durer.** On construit pour **des années**. La qualité de l'architecture passe
   avant la vitesse. On préfère avancer lentement et proprement.

## À quoi ressemble la réussite

Un matin, Kevin dit : _« KAI, résume-moi la nuit. »_ Et KAI répond : les
sauvegardes ont réussi, la maison a bien baissé le chauffage, trois nouvelles
photos ont été triées, le serveur se porte bien, et il n'y a rien d'urgent. Le
tout **sans Internet**, **sans abonnement**, **sans qu'aucune donnée n'ait quitté
la maison** — et **sans que Kevin ait ouvert dix applications**.

## Ce que KevinOS ne doit **jamais** devenir

- ❌ **Un produit qui espionne.** Jamais de télémétrie cachée, de revente de
  données, de « fonctionnalité » qui exige d'envoyer la vie privée dans le Cloud.
- ❌ **Un otage du Cloud.** Jamais une dépendance obligatoire à un service en
  ligne pour une fonction essentielle.
- ❌ **Une usine à gaz.** Jamais une interface qu'il faut _apprendre_. Si une
  fonctionnalité complique l'usage quotidien, elle dégage.
- ❌ **Un chatbot déguisé.** KAI n'est pas là pour bavarder ; c'est le cerveau qui
  _fait_ des choses. On ne le transforme pas en concurrent de ChatGPT.
- ❌ **Un cœur monolithique.** Jamais de fonctionnalité branchée « en dur » qui
  fige l'architecture. Tout passe par des contrats.
- ❌ **Un empilement sans direction.** Jamais de fonctionnalité ajoutée « parce
  qu'on peut ». Chaque ajout doit servir la vision de ce document.

## Comment se servir de cette boussole

Avant d'ajouter quoi que ce soit à KevinOS, se poser **trois questions** :

1. Est-ce que ça marche **hors ligne** et **respecte la vie privée** ?
2. Est-ce que ça rend l'expérience **plus simple**, ou juste plus riche ?
3. Est-ce que, dans **trois ans**, on sera fier de ce choix ?

Si l'une des réponses est « non », il faut s'arrêter et reconsidérer.

---

_Les règles d'architecture qui découlent de cette vision sont formalisées dans
[`docs/REGLES-ARCHITECTURE.md`](docs/REGLES-ARCHITECTURE.md). Le « comment » vit
dans [`docs/`](docs/) ; le « pourquoi » vit ici._
