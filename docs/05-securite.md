# 05 — Sécurité

> Le brief exige : HTTPS, reverse proxy, authentification, MFA, gestion des
> rôles, journalisation, sauvegardes, chiffrement. Ce document en fait un
> **modèle de sécurité** cohérent (défense en profondeur) plutôt qu'une liste.

---

## 1. Principes

1. **Défense en profondeur** — plusieurs couches ; la chute d'une seule ne
   compromet pas le système.
2. **Moindre privilège** — chaque conteneur, utilisateur, réseau n'a que le strict
   nécessaire.
3. **Zéro confiance par défaut à l'extérieur** — l'accès distant passe par VPN ;
   rien n'est exposé publiquement sans raison explicite et maîtrisée.
4. **Souveraineté** — chiffrement au repos et en transit ; les clés restent chez
   le propriétaire.
5. **Auditabilité** — tout accès et action sensible est journalisé.

## 2. Modèle de menace (synthèse STRIDE)

| Menace | Exemple | Contre-mesure |
|--------|---------|---------------|
| **S**poofing (usurpation) | Vol de session/identité | SSO + MFA, cookies sécurisés, courte durée de session |
| **T**ampering (altération) | Modification de données en transit | TLS partout, intégrité des sauvegardes |
| **R**epudiation | Action non traçable | Journalisation centralisée (Loki), audit log |
| **I**nfo disclosure (fuite) | Secrets, données perso exposées | Chiffrement au repos, secrets hors Git, segmentation réseau |
| **D**oS | Saturation d'un service exposé | Rate-limit proxy, CrowdSec, VPN (surface réduite) |
| **E**levation (élévation) | Conteneur compromis → hôte | Conteneurs non-root, capabilities réduites, réseaux isolés |

**Surfaces d'attaque principales** : le point d'entrée internet (proxy/VPN), les
apps tierces (CVE upstream), les secrets (clés API IA, mots de passe), les
sauvegardes (si non chiffrées).

## 3. Couches de défense

### 3.1 Périmètre & accès distant

- **VPN par défaut** (WireGuard) pour tout accès hors domicile ([ADR-0003](adr/ADR-0003-acces-distant-vpn.md)).
- **Pas d'ouverture de ports entrants** tant que non nécessaire ; en cas de CGNAT,
  tunnel sortant (Headscale/Tailscale) plutôt que redirection de port.
- Exposition publique éventuelle (ex. partage photos famille) = **exception
  documentée**, derrière proxy + SSO + rate-limit + CrowdSec.

### 3.2 Frontal & TLS

- **Reverse proxy unique** : seul composant joignable depuis `edge`.
- **HTTPS/TLS partout**, y compris en interne (certificats internes ou
  Let's Encrypt via DNS-01 si domaine).
- **En-têtes de sécurité** : HSTS, CSP, X-Frame-Options, etc.
- **Rate limiting** et **CrowdSec** (détection comportementale + bans).

### 3.3 Identité & accès

- **SSO** (Authelia/Authentik) devant les modules (ForwardAuth / OIDC).
- **MFA obligatoire** pour les administrateurs (EF-03).
- **RBAC** : rôles admin / membre / invité ; accès par module selon rôle (EF-04).
- **Sessions** : durée limitée, révocables, cookies `HttpOnly`/`Secure`/`SameSite`.
- **Kevin AI en tant qu'acteur** : l'IA agit avec un **compte de service à
  privilèges limités et traçables** — jamais avec les droits admin bruts.

### 3.4 Réseau interne (segmentation)

Réseaux Docker cloisonnés — le principe : **la donnée n'est jamais joignable
depuis le bord**.

```
edge          → proxy, SSO            (exposé au VPN/internet contrôlé)
apps          → modules applicatifs   (joignables via proxy uniquement)
data          → PostgreSQL, Redis     (JAMAIS depuis edge ; seulement apps autorisées)
observability → Prometheus, Loki…     (isolé)
```

### 3.5 Conteneurs (durcissement)

- Images **officielles/vérifiées**, **épinglées** par version (pas `latest` en prod).
- **Non-root** quand possible, `no-new-privileges`, capabilities minimales.
- **Read-only rootfs** là où faisable ; volumes explicites.
- **Mises à jour** suivies (veille CVE) — process documenté.

### 3.6 Secrets

- **Jamais** dans Git : `.env` ignoré, exemples via `.env.example`.
- Coffre : **Vaultwarden** pour l'humain ; secrets d'infra via fichiers montés /
  Docker secrets (et un vrai gestionnaire type SOPS/Vault en Phase ultérieure).
- **Rotation** des clés API IA et mots de passe documentée.

### 3.7 Données & sauvegardes

- **Chiffrement au repos** des sauvegardes (Restic chiffré) et des volumes
  sensibles.
- **Règle 3-2-1** : 3 copies, 2 supports, 1 hors-site (option).
- **Tests de restauration** périodiques — une sauvegarde non testée n'existe pas.
- **Rétention** définie par type de donnée (photos vs logs vs médias).

### 3.8 Journalisation & audit

- Logs centralisés (**Loki**), corrélés aux métriques (**Grafana**).
- **Audit log** applicatif dans le Core pour les actions sensibles (connexion,
  changement de rôle, action IA, accès admin).
- **Alertes** : service down, pic RAM/disque, échec de sauvegarde, tentative
  d'intrusion (CrowdSec).

## 4. Conformité aux exigences du CDC

| Exigence CDC | Couverture |
|--------------|-----------|
| ENF-20 HTTPS partout | §3.2 |
| ENF-21 Reverse proxy unique | §3.2 |
| ENF-22 VPN par défaut | §3.1 + ADR-0003 |
| ENF-23 Secrets hors Git | §3.6 |
| ENF-24 Chiffrement au repos | §3.7 |
| ENF-25 Journalisation auditable | §3.8 |
| ENF-26 Moindre privilège / segmentation | §3.4, §3.5 |
| EF-02/03/04 SSO/MFA/RBAC | §3.3 |

## 5. Backlog sécurité (au-delà de la v1)

- Gestionnaire de secrets d'infra dédié (SOPS + age, ou Vault).
- Scan d'images (Trivy) intégré à la CI.
- Détection d'anomalies IA (garde-fous sur les actions d'agents).
- Politique de mises à jour automatisée avec fenêtre de maintenance.
- Revue de sécurité périodique + tests de restauration planifiés.
