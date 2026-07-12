# ADR-0007 — Reverse proxy : Traefik (découverte auto + TLS auto)

**Statut** : Acceptée — validée le 2026-07-12 (étape 6)
**Date** : 2026-07-12
**Précise** : le §4 de [03-choix-techniques](../03-choix-techniques.md) (arbitrage
laissé ouvert entre Nginx / Traefik / Caddy).

## Contexte

Le brief impose _Nginx_ dans sa liste de stack. Mais KevinOS va faire tourner
**beaucoup** de conteneurs (chaque module = un service), qui **apparaissent et
disparaissent** au fil du déploiement progressif. Avec Nginx, chaque ajout de
module impose d'**éditer et recharger une configuration à la main** — fragile et
chronophage pour un mainteneur unique.

Deux besoins forts : **découverte dynamique** des services et **TLS automatique**.

## Options

1. **Nginx** (imposé).
   - ➕ Ultra-répandu, performant, connu.
   - ➖ Pas de découverte Docker native ; TLS à outiller (proxy-companion) ;
     config manuelle à chaque module.
2. **Traefik**.
   - ➕ **Découverte automatique** via labels Docker ; **TLS Let's Encrypt natif**
     (dont DNS-01) ; middlewares (auth, rate-limit, headers) ; dashboard intégré ;
     s'intègre nativement avec l'auth (ForwardAuth vers Authelia).
   - ➖ Syntaxe par labels à apprendre ; moins « bas niveau » que Nginx.
3. **Caddy**.
   - ➕ TLS auto le plus simple, Caddyfile concis.
   - ➖ Découverte Docker via plugin tiers, écosystème plus restreint.

## Décision

**Traefik** est retenu comme reverse proxy de KevinOS. Le propriétaire a validé
« les décisions proposées », qui incluaient explicitement la recommandation
d'autoriser Traefik (question n°5 de l'étape 6).

Justification par rapport à l'imposition initiale de Nginx : la liste de stack du
brief est une **intention**, pas une contrainte rigide ; le brief demande surtout
la **meilleure architecture** et de **ne pas chercher la facilité au détriment de
la qualité**. Ici, Traefik **réduit** la complexité opérationnelle réelle
(ajout/retrait de modules sans édition manuelle) tout en apportant le TLS
automatique — c'est le choix de qualité.

## Conséquences

- ➕ Ajouter un module = poser des **labels** sur son service ; zéro édition de
  conf proxy, zéro rechargement manuel.
- ➕ **TLS automatique** (interne via certificat, ou Let's Encrypt DNS-01 si un
  domaine est configuré) → cohérent avec ENF-20 (HTTPS partout).
- ➕ **ForwardAuth** vers Authelia centralise le SSO/MFA au niveau du proxy.
- ➖ La connaissance Nginx du propriétaire est moins réutilisable ; compensé par
  une doc d'exploitation dédiée et des labels standardisés par le Core.
- Réversible : un module ne « sait » pas qu'il est derrière Traefik → migrer vers
  Nginx/Caddy plus tard resterait possible (nouvel ADR).
