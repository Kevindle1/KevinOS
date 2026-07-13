# 09 — Identité des modules KOS

> Convention d'identité commune à tous les modules KevinOS ([ADR-0012](adr/ADR-0012-identite-modules-kos.md)).
> **KevinOS** est le produit ; **KOS <Nom>** est la famille de modules. Le nom
> **cache toujours** le moteur (Immich, Jellyfin…), qui reste un détail
> d'implémentation remplaçable.

---

## Le principe

```
Produit         : KevinOS
Cerveau         : KAI  (identité de module : 🧠 KOS Brain)
Famille modules : KOS <Nom> + emoji
L'utilisateur voit « KOS Vision », jamais « Immich ».
```

## Catalogue d'identité

| Emoji | Nom affiché     | Domaine              | Moteur (caché)     | `id`          |
| :---: | --------------- | -------------------- | ------------------ | ------------- |
|  📷   | **KOS Vision**  | Photos               | Immich             | `kos-vision`  |
|  🎬   | **KOS Media**   | Films & séries       | Jellyfin           | `kos-media`   |
|  📁   | **KOS Drive**   | Fichiers & stockage  | (à définir)        | `kos-drive`   |
|  🏠   | **KOS Home**    | Domotique            | Home Assistant     | `kos-home`    |
|  🧠   | **KOS Brain**   | Intelligence (KAI)   | Ollama (local)     | `kos-brain`   |
|  📊   | **KOS Monitor** | Monitoring & alertes | Prometheus/Grafana | `kos-monitor` |
|  🌐   | **KOS Network** | Réseau / DNS         | AdGuard/Traefik    | `kos-network` |
|  🔐   | **KOS Vault**   | Mots de passe        | Vaultwarden        | `kos-vault`   |
|  💾   | **KOS Backup**  | Sauvegardes          | Restic             | `kos-backup`  |

_(La liste s'étendra ; toute addition suit les règles de nommage ci-dessous.)_

## Règles de nommage

1. **Affichage** : `KOS <Nom>` + emoji dédié (stable dans le temps).
2. **`id` technique** : `kos-<nom>` (kebab-case) — utilisé dans le manifeste
   ([contrat de module](adr/ADR-0005-couche-integration-core.md)).
3. **Jamais le moteur** dans le nom : on n'écrit pas « Immich », « Jellyfin »…
4. **Stabilité** : changer de moteur ne change **ni** le nom, **ni** l'`id`, **ni**
   le contrat.
5. **KAI** = nom de l'intelligence côté utilisateur ; **KOS Brain** = son identité
   de module côté architecture.

## Pourquoi

- **Cohérence produit** : à 30 modules, une famille `KOS` se lit comme **un
  système**, pas une pile d'outils.
- **Remplaçabilité** : le nom est un **contrat de marque** qui survit au
  remplacement du moteur — cohérent avec l'interface unique (Règle 6) et la
  modularité (Règle 5).

## Charte visuelle (à venir avec le Dashboard)

Le Dashboard appliquera cette identité : chaque module a sa **carte** avec son
emoji, son nom `KOS <Nom>`, une couleur d'accent, et des composants cohérents
(mêmes typographies, mêmes espacements). L'objectif : que l'utilisateur ressente
**un seul produit**, quelle que soit la brique sous le capot.
