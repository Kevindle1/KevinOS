/**
 * **Métadonnées documentaires possédées par KevinOS** — favoris, étiquettes,
 * corbeille — jamais par le moteur (même esprit que la reprise de KOS Media).
 * Le système de fichiers n'a pas de notion de « favori » : c'est KevinOS qui la
 * porte. Clé = identifiant d'item ; migrée au renommage/déplacement.
 */
export interface DriveMeta {
  favorite?: boolean;
  tags?: string[];
  /** Chemin d'origine (fil d'Ariane) quand l'item est à la corbeille. */
  trashedFrom?: string | null;
}

export interface DriveMetadataStore {
  get(id: string): DriveMeta | undefined;
  merge(id: string, patch: DriveMeta): DriveMeta;
  /** Suit le fichier lors d'un renommage / déplacement. */
  rename(oldId: string, newId: string): void;
  delete(id: string): void;
  all(): Record<string, DriveMeta>;
}

/** Store en mémoire (tests / mode dégradé). */
export class InMemoryDriveMetadataStore implements DriveMetadataStore {
  private readonly map = new Map<string, DriveMeta>();
  get(id: string): DriveMeta | undefined {
    return this.map.get(id);
  }
  merge(id: string, patch: DriveMeta): DriveMeta {
    const next = { ...this.map.get(id), ...patch };
    this.map.set(id, next);
    return next;
  }
  rename(oldId: string, newId: string): void {
    const meta = this.map.get(oldId);
    if (!meta) return;
    this.map.delete(oldId);
    this.map.set(newId, meta);
  }
  delete(id: string): void {
    this.map.delete(id);
  }
  all(): Record<string, DriveMeta> {
    return Object.fromEntries(this.map);
  }
}
