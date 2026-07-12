# Diagramme de conteneurs (C4 — niveau 2)

Les couches et conteneurs principaux de KevinOS (architecture Option D).

```mermaid
graph TB
    User["👤 Utilisateur<br/>(web / mobile via VPN)"]

    subgraph edge[" Couche Edge "]
        Proxy["Reverse Proxy<br/>(Nginx/Traefik)<br/>TLS · routage · rate-limit"]
        CrowdSec["CrowdSec<br/>(détection/blocage)"]
    end

    subgraph identity[" Couche Identité "]
        SSO["SSO + MFA<br/>(Authelia)"]
    end

    subgraph native[" Couche KevinOS (native) "]
        Core["KevinOS Core<br/>API Gateway · Registry · Event Bus"]
        Dash["Kevin Dashboard<br/>(React)"]
        AI["Kevin AI<br/>orchestrateur · RAG · agents"]
    end

    subgraph modules[" Couche Modules (intégrés, remplaçables) "]
        Nextcloud["Nextcloud"]
        Immich["Immich"]
        Jellyfin["Jellyfin"]
        HA["Home Assistant"]
        Vault["Vaultwarden"]
        More["…autres modules"]
    end

    subgraph data[" Couche Données "]
        PG[("PostgreSQL<br/>+ pgvector")]
        Redis[("Redis")]
        Files[("Stockage fichiers<br/>SSD chaud / HDD froid")]
    end

    subgraph obs[" Observabilité "]
        Prom["Prometheus"]
        Grafana["Grafana"]
        Loki["Loki"]
    end

    subgraph aisvc[" Runtime IA "]
        Ollama["Ollama (LLM local)"]
        CloudAI["API Cloud<br/>(optionnel)"]
    end

    User --> Proxy
    Proxy --- CrowdSec
    Proxy --> SSO
    SSO --> Dash
    SSO --> Core
    SSO --> Nextcloud
    SSO --> Immich
    SSO --> Jellyfin
    SSO --> HA
    SSO --> Vault

    Dash --> Core
    Dash --> AI
    Core -->|adaptateurs / ports| Nextcloud
    Core --> Immich
    Core --> Jellyfin
    Core --> HA
    AI --> Ollama
    AI -.-> CloudAI
    AI --> Core

    Core --> PG
    Core --> Redis
    AI --> PG
    Immich --> Files
    Jellyfin --> Files
    Nextcloud --> Files

    Prom -.-> Core
    Prom -.-> modules
    Loki -.-> Core
    Grafana --> Prom
    Grafana --> Loki

    classDef native fill:#1f6feb,stroke:#0d419d,color:#fff
    classDef mod fill:#238636,stroke:#196c2e,color:#fff
    classDef store fill:#8957e5,stroke:#6e40c9,color:#fff
    class Core,Dash,AI native
    class Nextcloud,Immich,Jellyfin,HA,Vault,More mod
    class PG,Redis,Files store
```

**Règles illustrées**

- Le **proxy** est le seul point d'entrée ; l'**auth** est traversée avant tout module.
- Le **Dashboard/IA** ne parlent aux modules **que via le Core** (ports/adaptateurs)
  → modules **remplaçables**.
- La couche **Données** n'est jamais joignable depuis l'Edge.
- L'**IA** bascule local ↔ Cloud sans changement de code (provider pluggable).
