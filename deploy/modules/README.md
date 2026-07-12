# Manifestes de modules

Chaque module intégré (Immich, Jellyfin, Nextcloud, Home Assistant…) est décrit
ici par un manifeste `<nom>/module.yaml`, conforme au **contrat de module**
(`@kevinos/shared` → `moduleManifestSchema`, voir
[ADR-0005](../../docs/adr/ADR-0005-couche-integration-core.md)).

Le **registre de services** du KevinOS Core lit ces manifestes pour :

- découvrir les modules et leurs capacités ;
- router les demandes (Dashboard / KAI) vers le bon adaptateur ;
- surveiller leur santé (mode dégradé — ENF-13).

## Exemple (à venir en phase « Photos »)

```yaml
# deploy/modules/kevin-photos/module.yaml
id: kevin-photos
name: Kevin Photos
version: 1.0.0 # version propre du module (ADR-0008)
compat:
  pluginApi: '^1.0.0' # Plugin Interface de l'hôte supporté (>=1.0.0 <2.0.0)
implementation: immich
capabilities: [photos]
internalUrl: http://immich-server:2283
healthPath: /api/server/ping
requiredAccess: member
enabled: false # activé quand le module est déployé (déploiement progressif)
```

> Le Core **refuse** de monter un module dont `compat.pluginApi` n'inclut pas le
> `pluginInterface` de l'hôte (voir [versioning](../../docs/08-versioning.md)).

> Ajouter un module = déposer son manifeste ici + écrire son **adaptateur** dans
> le Core. Le Dashboard et KAI n'ont pas à changer.
