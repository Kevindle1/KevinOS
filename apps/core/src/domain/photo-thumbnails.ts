/**
 * Port de récupération des miniatures (proxifiées par le Core).
 *
 * Séparé de `PhotoLibrary` (données) car c'est une préoccupation de transport
 * binaire. L'adaptateur du moteur (Immich) l'implémente ; le client ne voit
 * jamais l'URL du moteur.
 */
export interface PhotoThumbnails {
  fetchThumbnail(
    assetId: string,
    signal?: AbortSignal,
  ): Promise<{ body: ArrayBuffer; contentType: string }>;
}
