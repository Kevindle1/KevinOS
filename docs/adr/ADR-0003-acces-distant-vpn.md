# ADR-0003 — Accès distant par VPN (WireGuard) par défaut

**Statut** : Acceptée (à valider — étape 6)
**Date** : 2026-07-12

## Contexte

Le serveur est derrière un routeur Keenetic, avec une connexion **temporairement
en partage 4G/5G (Samsung S21)** puis Freebox Delta. Cela implique une **IP
publique dynamique** et un **risque de CGNAT** (pas d'IP publique routable en
partage mobile), rendant l'**ouverture de ports entrants peu fiable et risquée**.

Le CDC exige un accès distant sûr (ENF-22) et une surface d'attaque minimale.

## Options

1. **Ouverture de ports + reverse proxy public.**
   - ➕ Accès web direct sans client VPN.
   - ➖ Ne marche pas en CGNAT ; expose des services à internet ; surface
     d'attaque large ; DDNS requis.
2. **VPN d'accès entrant (WireGuard) avec redirection d'un seul port UDP.**
   - ➕ Une seule porte, chiffrée ; accès à tout le LAN comme si on était chez soi.
   - ➖ Nécessite quand même un port ouvert (KO en CGNAT strict) ; DDNS.
3. **Tunnel sortant (Headscale/Tailscale ou WireGuard vers un relais).**
   - ➕ **Fonctionne même en CGNAT** (connexion sortante) ; zéro port entrant.
   - ➖ Dépend d'un coordinateur (auto-hébergeable avec Headscale).

## Décision

**Accès distant par VPN par défaut**, réalisé avec **WireGuard** :

- Tant que la connexion le permet (Freebox), **WireGuard entrant** (un seul port
  UDP) + **DDNS**.
- En situation de **CGNAT** (partage mobile), bascule sur un **tunnel sortant**
  (Headscale/Tailscale ou relais WireGuard) pour ne dépendre d'aucun port entrant.
- **Aucun service applicatif n'est exposé directement à internet** en Phase 0/1.
  Une exposition publique éventuelle (ex. partage photos famille) sera une
  **exception** documentée, derrière proxy + SSO + rate-limit + CrowdSec.

## Conséquences

- ➕ Surface d'attaque minimale ; fonctionne malgré IP dynamique/CGNAT.
- ➕ Accès distant = accès LAN complet et chiffré.
- ➖ Les utilisateurs distants installent un client WireGuard (friction acceptable
  pour un usage familial ; profils QR-code pour simplifier).
- Réévaluer si un besoin d'accès public sans client apparaît (→ nouvel ADR).
