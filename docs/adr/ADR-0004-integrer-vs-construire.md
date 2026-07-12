# ADR-0004 — Intégrer le best-of-breed plutôt que tout construire

**Statut** : Acceptée — validée le 2026-07-12 (étape 6)
**Date** : 2026-07-12

## Contexte

Le brief liste 33 modules couvrant photos, médias, domotique, mots de passe,
sauvegardes, etc. Pour chacun, il existe des solutions open-source **matures**
(Immich, Jellyfin, Nextcloud, Home Assistant, Vaultwarden…) représentant des
**années-homme** de développement et de sécurité éprouvée.

Le brief exige aussi une **qualité production**, une **longévité pluriannuelle**,
et est maintenu par **une seule personne**. Il demande de « ne jamais chercher la
facilité » — ce qui, correctement interprété, signifie **viser la meilleure
architecture**, pas réécrire inutilement l'existant.

## Options

1. **Tout construire soi-même** (chaque module = code natif KevinOS).
   - ➕ Cohérence totale, contrôle absolu.
   - ➖ Des années pour égaler l'existant ; maintenance/sécurité colossales ;
     réinvention sans valeur ajoutée ; met en péril la longévité du projet.
2. **Intégrer le best-of-breed** et ne construire que le **liant**.
   - ➕ Time-to-value rapide ; sécurité et fonctionnalités éprouvées ; effort
     concentré sur ce qui différencie KevinOS (dashboard unifié + cerveau IA).
   - ➖ Hétérogénéité des apps (API/styles variés) ; SSO à câbler diversement.

## Décision

**KevinOS ne construit que sa valeur unique — le liant** :

- **Natif** : Core (gateway/registry/event-bus), Dashboard, Kevin AI, API, SDK,
  CLI, intégration SSO.
- **Intégré** : tout le reste, via des applications open-source matures,
  **remplaçables** derrière la couche Core (voir [ADR-0005](ADR-0005-couche-integration-core.md)).

« Ne pas chercher la facilité » s'applique **au liant et à l'architecture** (là où
se joue la valeur), **pas** à la réécriture de moteurs déjà excellents.

## Conséquences

- ➕ Valeur livrée vite ; robustesse héritée d'écosystèmes actifs.
- ➕ Le talent d'ingénierie se concentre sur l'IA et l'intégration — le cœur du
  « Jarvis ».
- ➖ Il faut **maîtriser l'intégration** (SSO hétérogène, adaptateurs, cohérence
  UX) : c'est là que porte l'effort, et c'est assumé.
- Chaque module intégré est **remplaçable** → pas de verrou fournisseur.
