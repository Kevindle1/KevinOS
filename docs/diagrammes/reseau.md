# Diagramme réseau & flux d'accès

Segmentation en réseaux Docker isolés et cheminement d'une requête.

```mermaid
flowchart LR
    Internet(("🌐 Internet"))
    Phone["📱 Appareil distant"]
    LAN["🏠 Appareil LAN"]

    subgraph host[" Serveur ASUS TUF (Docker) "]
        WG["WireGuard<br/>(VPN)"]
        subgraph net_edge["réseau: edge"]
            Proxy["Reverse Proxy + TLS"]
            SSO["SSO/MFA"]
        end
        subgraph net_apps["réseau: apps"]
            Core["KevinOS Core"]
            Mods["Modules<br/>(Immich, Jellyfin…)"]
        end
        subgraph net_data["réseau: data (isolé)"]
            DB[("PostgreSQL")]
            RD[("Redis")]
        end
        subgraph net_obs["réseau: observability"]
            Mon["Prometheus/Grafana/Loki"]
        end
    end

    Phone -->|tunnel chiffré| WG
    Internet -. "aucun port entrant<br/>ouvert par défaut" .-> host
    LAN -->|HTTPS| Proxy
    WG --> Proxy
    Proxy --> SSO --> Core
    Core --> Mods
    Core --> DB
    Core --> RD
    Mods --> DB
    Mon -. scrape .-> Core
    Mon -. scrape .-> Mods

    net_data -. "jamais joignable<br/>depuis edge" .- net_edge

    classDef isolated fill:#3d1d1d,stroke:#f85149,color:#fff
    class net_data isolated
```

**Principes**

1. **Aucun port entrant ouvert** par défaut : l'accès distant passe par le tunnel
   **WireGuard** (résiste au CGNAT / IP dynamique du partage S21).
2. **Segmentation** : `edge` ne peut pas atteindre `data`. Un module compromis
   n'accède qu'à ce que son réseau autorise.
3. **TLS** de bout en bout, y compris sur le LAN.
4. L'**observabilité** scrute les services mais reste sur son propre réseau.
