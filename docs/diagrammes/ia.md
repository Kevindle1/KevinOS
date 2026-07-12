# Diagramme — chaîne de traitement Kevin AI

Comment une demande en langage naturel est traitée : chat, RAG, mémoire, agents.

```mermaid
flowchart TB
    U["👤 Demande<br/>(texte ou voix)"]
    STT["Whisper (STT)<br/>voix → texte"]
    Orch["Kevin AI — Orchestrateur"]
    Mem[("Mémoire<br/>Postgres")]
    RAG["RAG<br/>recherche pgvector"]
    Docs[("Documents / notes<br/>du propriétaire")]
    Router{"Routeur<br/>de modèle"}
    Local["Ollama<br/>(LLM local)"]
    CloudLLM["API Cloud<br/>(optionnel, si autorisé)"]
    Tools["Outils / Actions<br/>via KevinOS Core"]
    Mods["Modules<br/>(agenda, maison, fichiers…)"]
    TTS["Piper (TTS)<br/>texte → voix"]
    Out["Réponse"]

    U -->|voix| STT --> Orch
    U -->|texte| Orch
    Orch --> Mem
    Orch --> RAG --> Docs
    Orch --> Router
    Router -->|privé / simple| Local
    Router -.->|lourd, si mode hybride| CloudLLM
    Local --> Orch
    CloudLLM -.-> Orch
    Orch -->|besoin d'agir| Tools --> Mods --> Orch
    Orch --> Out
    Out -.->|si voix| TTS

    classDef ai fill:#1f6feb,stroke:#0d419d,color:#fff
    classDef store fill:#8957e5,stroke:#6e40c9,color:#fff
    class Orch,Router,RAG ai
    class Mem,Docs store
```

**Points clés**

- **Provider pluggable** : le *routeur de modèle* choisit local (Ollama) ou Cloud
  selon la sensibilité, la complexité et le mode autorisé — sans changer le code.
- **RAG** ancre les réponses dans les données réelles du propriétaire (pgvector,
  pas de base vectorielle séparée → économie de RAM).
- **Mémoire** persistante = préférences + contexte long terme.
- **Agents** : l'IA agit sur les modules **via le Core**, avec un **compte de
  service à privilèges limités et traçables** (voir [Sécurité §3.3](../05-securite.md)).
- **Voix** (STT/TTS) est une couche optionnelle branchée aux extrémités.
