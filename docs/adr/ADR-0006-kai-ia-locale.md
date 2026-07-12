# ADR-0006 — KAI : moteur IA 100 % local, fournisseur interchangeable

**Statut** : Acceptée — **validée par le propriétaire le 2026-07-12** (étape 6)
**Date** : 2026-07-12
**Remplace** : la partie « mode hybride » évoquée dans [ADR-0004](ADR-0004-integrer-vs-construire.md) et [03-choix-techniques](../03-choix-techniques.md) §5.

## Contexte

Le propriétaire a tranché la question ouverte n°1 de l'[analyse](../00-analyse.md) :

- **KAI** (Kevin Artificial Intelligence) doit fonctionner **100 % en local**,
  **gratuitement**, **hors-ligne**, **sans abonnement ni coût mensuel**.
- **Aucune API payante** (OpenAI, Claude, Gemini…) dans le **cœur** de KevinOS pour
  la V1.
- KAI n'est **pas** un concurrent de ChatGPT : c'est un **assistant système** de
  type Jarvis, dont le rôle est de **piloter KevinOS** (comprendre des commandes
  naturelles, contrôler les services Docker, chercher dans fichiers/photos/médias,
  lancer des automatisations, répondre sur l'infrastructure).
- Contrainte matérielle : **16 Go RAM, sans GPU dédié** → modèle **léger**.
- **Exigence de modularité** : il devra rester possible d'**ajouter plus tard** des
  fournisseurs externes (OpenAI, Claude, Gemini) **sans modifier le cœur**.

## Décision

1. **Moteur par défaut : Ollama**, avec un **modèle léger** sélectionné au banc
   d'essai parmi **Gemma, Qwen, Phi** (quantisé, adapté à 16 Go / CPU only).
2. **KAI parle à une abstraction `AIProvider`** (un _port_, au sens Clean Archi) —
   jamais directement à Ollama. Le cœur ne dépend que de l'interface.
3. **Le fournisseur est interchangeable** via configuration :
   - `local` (Ollama) — **seul actif en V1**, seul packagé par défaut ;
   - `openai` / `anthropic` / `gemini` — **adaptateurs optionnels**, désactivés,
     **non requis** et **non installés** par défaut. Les ajouter plus tard =
     écrire/activer un adaptateur, **sans toucher au domaine ni au reste**.
4. **Aucun appel réseau sortant IA** n'est effectué tant qu'un fournisseur externe
   n'est pas explicitement activé par le propriétaire (souveraineté + hors-ligne).
5. **Zéro dépendance GPU** : tout doit tourner sur CPU. Le GPU est une
   optimisation future (serveur dédié), pas un prérequis.

## Interface (esquisse — sera raffinée en phase KAI)

```ts
// Port : le cœur ne connaît que ceci.
export interface AIProvider {
  readonly id: string; // "local" | "openai" | ...
  readonly capabilities: AICapabilities; // chat, tools, embeddings, vision?
  chat(input: ChatRequest): AsyncIterable<ChatChunk>;
  embed?(input: EmbedRequest): Promise<number[][]>;
}
```

Adaptateur V1 : `OllamaProvider implements AIProvider`. Les adaptateurs Cloud
seront des implémentations sœurs, chargées uniquement si configurées.

## Conséquences

- ➕ **Souveraineté totale** en V1 : rien ne sort, aucun coût, fonctionne hors-ligne.
- ➕ Le **cœur reste stable** : ajouter un fournisseur = un adaptateur, pas une refonte.
- ➕ Cohérent avec [ADR-0005](ADR-0005-couche-integration-core.md) (tout passe par
  des ports/adaptateurs).
- ➖ Qualité/latence bornées par le matériel (CPU, 16 Go) → **modèle léger** et
  attentes calibrées (assistant système, pas chatbot généraliste).
- ➖ Certaines capacités lourdes (vision temps réel) restent **Phase ultérieure /
  matériel dédié**.

## Suivi

- Benchmark Gemma vs Qwen vs Phi sur la cible (latence, RAM, qualité d'intention)
  à réaliser en **phase KAI** ; consigner le résultat dans un ADR de suivi.
