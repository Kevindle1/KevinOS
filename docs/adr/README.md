# Architecture Decision Records (ADR)

Journal des décisions d'architecture structurantes. Chaque ADR est immuable une
fois « Acceptée » : si une décision change, on crée un nouvel ADR qui remplace
l'ancien (statut « Remplacée par ADR-xxxx »).

Format : Contexte → Options → Décision → Conséquences.

| ADR                                          | Titre                                                              | Statut      |
| -------------------------------------------- | ------------------------------------------------------------------ | ----------- |
| [0001](ADR-0001-monorepo.md)                 | Monorepo (pnpm workspaces)                                         | ✅ Acceptée |
| [0002](ADR-0002-orchestration.md)            | Docker Compose d'abord, Kubernetes plus tard                       | ✅ Acceptée |
| [0003](ADR-0003-acces-distant-vpn.md)        | Accès distant par VPN (WireGuard) par défaut                       | ✅ Acceptée |
| [0004](ADR-0004-integrer-vs-construire.md)   | Intégrer le best-of-breed plutôt que tout construire               | ✅ Acceptée |
| [0005](ADR-0005-couche-integration-core.md)  | Le Core comme unique couche d'intégration                          | ✅ Acceptée |
| [0006](ADR-0006-kai-ia-locale.md)            | KAI : moteur IA 100 % local, fournisseur interchangeable           | ✅ Acceptée |
| [0007](ADR-0007-reverse-proxy-traefik.md)    | Reverse proxy : Traefik (découverte + TLS auto)                    | ✅ Acceptée |
| [0008](ADR-0008-versioning-compatibilite.md) | Versioning des modules & compatibilité (SemVer + Plugin Interface) | ✅ Acceptée |

> Statuts possibles : Proposée · Acceptée · Remplacée · Dépréciée.
> **Toutes les ADR ci-dessus ont été validées par le propriétaire le 2026-07-12
> (étape 6).**
