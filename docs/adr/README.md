# Architecture Decision Records (ADR)

Journal des décisions d'architecture structurantes. Chaque ADR est immuable une
fois « Acceptée » : si une décision change, on crée un nouvel ADR qui remplace
l'ancien (statut « Remplacée par ADR-xxxx »).

Format : Contexte → Options → Décision → Conséquences.

| ADR                                                 | Titre                                                              | Statut      |
| --------------------------------------------------- | ------------------------------------------------------------------ | ----------- |
| [0001](ADR-0001-monorepo.md)                        | Monorepo (pnpm workspaces)                                         | ✅ Acceptée |
| [0002](ADR-0002-orchestration.md)                   | Docker Compose d'abord, Kubernetes plus tard                       | ✅ Acceptée |
| [0003](ADR-0003-acces-distant-vpn.md)               | Accès distant par VPN (WireGuard) par défaut                       | ✅ Acceptée |
| [0004](ADR-0004-integrer-vs-construire.md)          | Intégrer le best-of-breed plutôt que tout construire               | ✅ Acceptée |
| [0005](ADR-0005-couche-integration-core.md)         | Le Core comme unique couche d'intégration                          | ✅ Acceptée |
| [0006](ADR-0006-kai-ia-locale.md)                   | KAI : moteur IA 100 % local, fournisseur interchangeable           | ✅ Acceptée |
| [0007](ADR-0007-reverse-proxy-traefik.md)           | Reverse proxy : Traefik (découverte + TLS auto)                    | ✅ Acceptée |
| [0008](ADR-0008-versioning-compatibilite.md)        | Versioning des modules & compatibilité (SemVer + Plugin Interface) | ✅ Acceptée |
| [0009](ADR-0009-authelia-sso-mfa.md)                | Authelia pour le SSO + MFA                                         | ✅ Acceptée |
| [0010](ADR-0010-gestion-secrets.md)                 | Gestion des secrets (fichiers `*_FILE`, SOPS plus tard)            | ✅ Acceptée |
| [0011](ADR-0011-sauvegardes-restic.md)              | Sauvegardes avec Restic (3-2-1, chiffrées, testées)                | ✅ Acceptée |
| [0012](ADR-0012-identite-modules-kos.md)            | Identité de marque des modules (préfixe « KOS »)                   | ✅ Acceptée |
| [0013](ADR-0013-design-system-proprietaire.md)      | Design System propriétaire (KDS) sur Tailwind                      | ✅ Acceptée |
| [0014](ADR-0014-ui-platform.md)                     | `@kevinos/ui` est une plateforme UI (pas une collection)           | ✅ Acceptée |
| [0015](ADR-0015-kos-design-lab.md)                  | KOS Design Lab, module officiel & environnement de dev             | ✅ Acceptée |
| [0016](ADR-0016-plateforme-experience.md)           | KevinOS, plateforme d'expérience (KAI comme point d'entrée)        | ✅ Acceptée |
| [0017](ADR-0017-principes-conception-composants.md) | Principes de conception + API formulaires + « Home »               | ✅ Acceptée |

> Statuts possibles : Proposée · Acceptée · Remplacée · Dépréciée.
> **Toutes les ADR ci-dessus ont été validées par le propriétaire.**
