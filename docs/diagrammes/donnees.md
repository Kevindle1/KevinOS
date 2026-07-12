# Diagramme de flux de données & stockage

Où vit chaque donnée et comment elle est sauvegardée. Objectif : respecter la
souveraineté (§ souveraineté) et la règle **3-2-1**.

```mermaid
flowchart TB
    subgraph hot[" Chaud — SSD système "]
        OS["OS + Docker"]
        DBv["Volume PostgreSQL"]
        RDv["Volume Redis"]
        Cache["Caches / miniatures"]
    end

    subgraph warm[" Données — HDD SATA 1 To "]
        Photos["Photos (Immich)"]
        Media["Médias (Jellyfin)"]
        Docs["Fichiers (Nextcloud)"]
    end

    subgraph cold[" Sauvegarde — HDD USB "]
        Restic["Dépôt Restic<br/>(chiffré, dédupliqué)"]
    end

    subgraph offsite[" Hors-site (option) "]
        Remote["Copie distante chiffrée"]
    end

    DBv -->|dump + snapshot| Restic
    Photos --> Restic
    Docs --> Restic
    Media -. "gros volume<br/>rétention à décider" .-> Restic
    Restic -->|3-2-1| Remote

    classDef hot fill:#1f6feb,stroke:#0d419d,color:#fff
    classDef warm fill:#238636,stroke:#196c2e,color:#fff
    classDef cold fill:#8957e5,stroke:#6e40c9,color:#fff
    class OS,DBv,RDv,Cache hot
    class Photos,Media,Docs warm
    class Restic cold
```

**Responsabilités de stockage**

| Type | Support | Sauvegarde | Rétention |
|------|---------|-----------|-----------|
| OS / Docker | SSD | Config en Git (IaC) | reconstruit |
| Bases (PostgreSQL) | SSD | **dump + Restic** | longue |
| Redis | SSD | reconstructible (cache) | courte |
| Photos / Documents | HDD SATA | **Restic → USB (+ hors-site)** | longue |
| Médias | HDD SATA/USB | rétention à arbitrer (volume) | à définir |
| Logs / métriques | SSD | rotation | courte–moyenne |

**Règles**

- La donnée **critique** (photos, documents, bases) a toujours **≥ 2 copies sur 2
  supports** ; les HDD USB, moins fiables, ne sont **jamais** l'unique support.
- Sauvegardes **chiffrées** (Restic) ; clé conservée par le propriétaire.
- **Restauration testée** périodiquement (une sauvegarde non testée n'existe pas).
