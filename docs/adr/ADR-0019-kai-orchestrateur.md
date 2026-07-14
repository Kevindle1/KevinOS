# ADR-0019 — Orchestrateur KAI : capacités locales + fournisseurs IA interchangeables

**Statut** : Acceptée — 2026-07-14
**Date** : 2026-07-14
**Lié à** : [ADR-0006](ADR-0006-kai-ia-locale.md) (IA locale), [ADR-0005](ADR-0005-couche-integration-core.md)
(couche d'intégration Core), [Règle 5](../REGLES-ARCHITECTURE.md) (KAI, point d'entrée
unique), [Règle 2](../REGLES-ARCHITECTURE.md) (offline-first).

## Contexte

KAI doit devenir **réel**, en commençant petit, sans trahir les invariants : IA
**locale**, fournisseurs **interchangeables**, KAI = **unique point d'entrée**, et
**mode dégradé** si l'IA est absente (ENF-13). Un modèle de langage seul est à la
fois **trop** (latence, non-déterminisme pour « quelle heure est-il ? ») et **pas
assez** (il ne sait pas agir sur les modules).

## Décision

Un **orchestrateur** (`KaiOrchestrator`, dans le Core) tranche à chaque tour :

1. **Capacités déterministes** d'abord — pures, **locales, hors ligne, sans
   modèle** : bonjour, heure, date, état système, **ouvrir un module** (action
   structurée `open_module`). Rapides et fiables.
2. Sinon, **délégation au fournisseur IA** via le port `AIProvider` (streaming).
3. Si le fournisseur est **injoignable** ou échoue → **repli honnête**. KAI ne
   plante jamais.

Le **système de fournisseurs** est une fabrique (`createAIProvider(config)`) :
`local` = **Ollama** (packagé), les autres (OpenAI, Claude, Gemini) sont des
adaptateurs futurs renvoyant un fournisseur « indisponible » tant qu'ils ne sont
pas ajoutés. KAI ne connaît **que** le port ; changer de fournisseur est une
affaire de **configuration** (`KEVINOS_AI_PROVIDER`).

**Contrat public** (`@kevinos/shared`) : `POST /api/v1/kai/message` → `KaiReply`
(`text`, `source: capability|model|fallback`, `actions?`). Home, mobile ou une API
publique consomment le **même** contrat (API-first). Home appelle ce point
d'entrée et **retombe** sur un KAI simulé si aucun Core n'est joignable (Preview
statique) — l'expérience ne casse jamais.

Le **modèle léger** par défaut est `qwen2.5:3b` (16 Go, sans GPU — ADR-0006).

## Alternatives rejetées

- **Tout confier au modèle** : non-déterministe et lent pour des intentions
  triviales, incapable d'agir, exigeant un modèle en permanence. Contraire à
  l'offline-first et au mode dégradé.
- **Coupler KAI à Ollama** : violerait Règle 5 et la remplaçabilité. Le port
  `AIProvider` existait déjà (ADR-0006) — on l'implémente, on ne le contourne pas.
- **Router les intentions par un modèle (function-calling)** dès la V1 : utile
  plus tard, mais superflu pour 5 capacités ; ajoute une dépendance modèle pour
  des cas que du code résout en 1 ms.

## Conséquences

- ➕ Une **vraie IA dès aujourd'hui**, **100 % locale et hors ligne** pour les
  capacités de base — sans même qu'Ollama tourne.
- ➕ Fournisseur **remplaçable** sans toucher à KAI ni aux modules.
- ➕ Testable : capacités et orchestrateur sont **purs / injectés** (fournisseur
  simulé en test), sans réseau.
- ➖ Les capacités déterministes sont, pour l'instant, des **règles** (regex) : à
  faire évoluer vers de l'analyse d'intention quand le besoin le justifiera.

### Conséquences dans plusieurs années

- L'**orchestrateur** devient le lieu naturel où brancher : appel d'outils
  (agents pilotant les modules via leurs contrats), RAG (embeddings + pgvector),
  mémoire persistante — **sans** changer le contrat `POST /kai/message`.
- Le **port `AIProvider`** protège des ruptures d'écosystème : un meilleur runtime
  local (ou une API) s'ajoute en un adaptateur, la config bascule, le reste ne
  bouge pas. KAI reste le cerveau ; les moteurs restent des détails.
