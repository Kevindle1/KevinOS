# ADR-0002 — Docker Compose d'abord, Kubernetes plus tard

**Statut** : Acceptée — validée le 2026-07-12 (étape 6)
**Date** : 2026-07-12

## Contexte

Le brief impose Docker/Docker Compose et « prévoir Kubernetes dans le futur ». La
cible matérielle v1 est un **nœud unique, 16 Go de RAM**. La vision long terme
évoque « des milliers d'utilisateurs ».

## Options

1. **Kubernetes dès le départ** (k3s/k8s).
   - ➕ Scalabilité, HA, self-healing, standard cloud, autoscaling.
   - ➖ Control-plane consomme de la RAM déjà rare ; complexité d'exploitation
     élevée pour 1 mainteneur ; beaucoup d'apps self-host livrées en Compose.
2. **Docker Compose d'abord** (K8s-ready).
   - ➕ Simple, adapté à 1 nœud, faible surcoût, la plupart des apps fournissent
     un compose officiel.
   - ➖ Pas de HA/autoscaling natif (non requis en v1).

## Décision

**Docker Compose** pour la v1, en gardant la **compatibilité Kubernetes** par
construction :

- services **stateless** côté natif ; état dans volumes/DB externes ;
- config par **variables d'environnement / fichiers montés** ;
- **un processus par conteneur**, healthchecks, logs sur stdout ;
- **images versionnées** publiées en registry (pas de build sur la machine de
  prod).

**Déclencheurs** d'une migration vers Kubernetes (k3s d'abord) :

- besoin réel de **haute disponibilité** (indispo. inacceptable) ;
- passage **multi-nœuds** (2ᵉ machine) ou multi-tenant public ;
- besoin d'**autoscaling** sous charge variable.

Tant qu'aucun déclencheur n'est atteint, **Compose reste le bon choix** (éviter la
sur-ingénierie).

## Conséquences

- ➕ Time-to-value rapide, exploitation simple, RAM préservée.
- ➕ La discipline « stateless + IaC » rend la bascule K8s mécanique, sans réécrire
  l'applicatif.
- ➖ Résilience v1 repose surtout sur `restart: unless-stopped` + sauvegardes
  (pas de self-healing multi-nœud).
