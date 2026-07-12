# Diagramme de contexte (C4 — niveau 1)

Qui/quoi interagit avec KevinOS, et où sont les frontières de confiance.

```mermaid
graph TB
    subgraph EXT[" Extérieur "]
        Owner["👤 Kevin<br/>(propriétaire / admin)"]
        Family["👥 Foyer<br/>(membres)"]
        Guest["🕶️ Invité<br/>(accès temporaire)"]
        Cloud["☁️ Fournisseurs IA Cloud<br/>(OpenAI / Claude / Gemini)<br/>— optionnels"]
        IoT["🏠 Objets connectés<br/>caméras, capteurs, prises"]
    end

    subgraph KOS[" KevinOS — nœud unique auto-hébergé "]
        System["🧠 KevinOS<br/>Cerveau numérique personnel<br/>(dashboard + IA + modules)"]
    end

    Owner -->|VPN / HTTPS| System
    Family -->|VPN / HTTPS| System
    Guest -->|accès restreint| System
    System -.->|si mode hybride autorisé| Cloud
    IoT -->|LAN local| System

    classDef sys fill:#1f6feb,stroke:#0d419d,color:#fff
    classDef ext fill:#21262d,stroke:#8b949e,color:#c9d1d9
    class System sys
    class Owner,Family,Guest,Cloud,IoT ext
```

**Points clés**

- L'accès humain distant se fait **par VPN** (frontière de confiance nette).
- Le Cloud IA est **optionnel** et **sortant** : aucune donnée n'y va sans
  décision explicite (souveraineté).
- Les objets connectés restent sur le **LAN local** (pas d'exposition externe).
