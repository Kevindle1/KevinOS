# ADR-0009 — Authelia pour le SSO + MFA

**Statut** : Acceptée — 2026-07-12
**Date** : 2026-07-12
**Lié à** : [ADR-0007](ADR-0007-reverse-proxy-traefik.md) (Traefik / ForwardAuth),
[Sécurité](../05-securite.md).

## Contexte

KevinOS placera de nombreux modules derrière une **interface unique** (Règle 6) et
une **identité unique** (EF-02/03/04) : une seule connexion, un second facteur
obligatoire pour l'admin, et une gestion de rôles (admin / membre / invité). Le
tout doit rester **offline-first** (Règle 2) : aucune dépendance à un fournisseur
d'identité en ligne (Google, Auth0…).

## Options

1. **Authentik** — IdP complet (OIDC/SAML), UI riche.
   - ➕ Très puissant, fédération, flows personnalisables.
   - ➖ Lourd (plusieurs conteneurs : serveur, worker, DB) → coûteux en RAM sur
     16 Go ; complexité supérieure au besoin actuel.
2. **Keycloak** — référence entreprise.
   - ➕ Standard, très complet.
   - ➖ Gourmand (JVM), surdimensionné pour un foyer.
3. **Authelia** — portail d'auth léger + ForwardAuth.
   - ➕ **Léger** (un conteneur), pensé pour le reverse-proxy (ForwardAuth Traefik),
     **MFA** (TOTP/WebAuthn), base d'utilisateurs **fichier** 100 % locale,
     notifier **fichier** (offline), anti-bruteforce intégré.
   - ➖ Pas un IdP OIDC complet par défaut (OIDC dispo mais secondaire) ; UI plus
     sobre.
4. **Auth maison** dans le Core.
   - ➖ Réinventer l'authentification/MFA = surface de sécurité à maintenir soi-même,
     contraire à [ADR-0004](ADR-0004-integrer-vs-construire.md). Rejeté.

## Décision

**Authelia** (épinglé `4.38`) comme portail **SSO + MFA**, intégré à Traefik en
**ForwardAuth** : le proxy délègue à Authelia la décision d'accès avant d'atteindre
un module. Configuration retenue, cohérente avec les règles :

- **Base d'utilisateurs fichier** (`users_database.yml`) → hors-ligne, pas de DB
  supplémentaire.
- **Sessions dans Redis** (déjà présent) → pas de composant en plus.
- **Stockage chiffré** (SQLite sur volume) ; **notifier fichier** → aucun SMTP
  requis (offline-first).
- **`default_policy: deny`** ; le domaine KevinOS exige **`two_factor`**.
- **Secrets par fichier** (`*_FILE`) → voir [ADR-0010](ADR-0010-gestion-secrets.md).
- Le middleware `authelia@docker` protège d'abord le **Core** et **Grafana** ;
  chaque futur module l'ajoute par un simple label.

## Conséquences

- ➕ Une **seule connexion** + **MFA** devant tous les modules, sans coupler les
  modules à l'auth (ils ne savent même pas qu'Authelia existe → Règle 3/5).
- ➕ **Offline-first** respecté : identité, MFA et notifications fonctionnent sans
  Internet.
- ➕ Empreinte mémoire faible (~192 Mo) compatible 16 Go.
- ➖ RBAC fin (par module/chemin) devra être décrit dans `access_control` au fil
  des modules — discipline de configuration.
- ➖ La base utilisateurs fichier convient à un foyer ; au-delà, migrer vers le
  backend LDAP/DB d'Authelia (prévu, sans changer l'intégration proxy).

### Conséquences dans plusieurs années

- Le jour où KevinOS servira plusieurs foyers, Authelia peut activer **OIDC** et
  devenir le fournisseur d'identité des modules qui le supportent nativement —
  **sans** changer l'architecture (le ForwardAuth reste le filet pour les autres).
- Parce que l'auth est **au niveau du proxy** et non dans les modules, remplacer
  Authelia par Authentik/Keycloak plus tard = reconfigurer une couche, **sans
  toucher aux modules ni au Core**. La décision n'est donc pas un cul-de-sac.
