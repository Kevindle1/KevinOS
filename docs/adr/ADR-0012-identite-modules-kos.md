# ADR-0012 — Identité de marque des modules (préfixe « KOS »)

**Statut** : Acceptée — 2026-07-12
**Date** : 2026-07-12
**Lié à** : [Vision KAI](../07-vision-kai.md), [Règle 6 — interface unique](../REGLES-ARCHITECTURE.md).

## Contexte

KevinOS comptera à terme 20-30 modules. Des noms hétérogènes (« Kevin Photos »,
« Kevin Media »…) donnent une impression d'accumulation d'outils, pas d'un
**produit cohérent**. Le propriétaire souhaite une **identité commune** à tous les
modules, qui renforce le côté professionnel et l'idée d'une **interface unique**,
tout en gardant **KevinOS** comme nom du produit.

## Décision

Tous les modules partagent le préfixe d'identité **« KOS »** (KevinOS) + un nom
évocateur + un emoji. Le nom **cache l'implémentation** (Règle 5/6) : l'utilisateur
voit « KOS Vision », jamais « Immich ».

| Emoji | Module          | Domaine            | Moteur (implémentation, cachée) | id technique  |
| :---: | --------------- | ------------------ | ------------------------------- | ------------- |
|  📷   | **KOS Vision**  | Photos             | Immich                          | `kos-vision`  |
|  🎬   | **KOS Media**   | Films & séries     | Jellyfin                        | `kos-media`   |
|  📁   | **KOS Drive**   | Fichiers           | (à définir)                     | `kos-drive`   |
|  🏠   | **KOS Home**    | Domotique          | Home Assistant                  | `kos-home`    |
|  🧠   | **KOS Brain**   | Intelligence (KAI) | Ollama (local)                  | `kos-brain`   |
|  📊   | **KOS Monitor** | Monitoring         | Prometheus/Grafana              | `kos-monitor` |
|  🌐   | **KOS Network** | Réseau / DNS       | AdGuard/Traefik                 | `kos-network` |
|  🔐   | **KOS Vault**   | Mots de passe      | Vaultwarden                     | `kos-vault`   |
|  💾   | **KOS Backup**  | Sauvegardes        | Restic                          | `kos-backup`  |

> **KAI** reste le **nom de l'intelligence** (la voix/le cerveau) ; **KOS Brain**
> est son **identité de module**. On dit « KAI » à l'utilisateur, « KOS Brain »
> dans l'architecture.

### Règles de nommage

1. Identité affichée : `KOS <Nom>` + emoji dédié (stable).
2. `id` technique : `kos-<nom>` en kebab-case (utilisé dans le manifeste, ADR-0005).
3. Le nom **ne mentionne jamais** le moteur sous-jacent (Immich, Jellyfin…).
4. Le moteur est un **détail d'implémentation remplaçable** : changer Immich pour
   un autre moteur **ne change ni le nom, ni l'`id`, ni le contrat** du module.
5. **KevinOS** reste le nom du **produit** ; « KOS » est la **famille de modules**.

## Alternatives rejetées

- **« Kevin <X> »** (Kevin Photos…) : correct mais moins « famille de produits » ;
  le prénom en préfixe vieillit mal si le produit s'ouvre à d'autres foyers.
- **Noms libres par module** (ex. « Lumière » pour les photos) : jolis mais sans
  cohérence systémique ; coût cognitif élevé à 30 modules.
- **Nom = moteur** (afficher « Immich ») : viole la Règle 5/6 (l'utilisateur ne
  doit pas connaître l'implémentation) et empêche le remplacement transparent.

## Conséquences

- ➕ Cohérence visuelle et produit immédiate ; l'utilisateur perçoit **un système**,
  pas une collection d'outils.
- ➕ Renforce l'**interface unique** et la **remplaçabilité** (le nom survit au
  changement de moteur).
- ➖ Discipline de nommage à tenir (revue à l'ajout de chaque module).

### Conséquences dans plusieurs années

- Le jour où un moteur est remplacé (Immich → autre), **aucun renommage** n'est
  nécessaire : l'utilisateur ne voit pas la différence, la doc et l'UI restent
  valides. L'identité `KOS <Nom>` est un **contrat de marque stable**, au même
  titre que le contrat technique du module.
