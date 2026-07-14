/**
 * Port de récupération des **affiches** média (proxifiées par le Core). Séparé de
 * `MediaLibrary` (données) : c'est du transport binaire. L'adaptateur du moteur
 * (Jellyfin) l'implémente ; le client ne voit jamais l'URL du moteur.
 */
export interface MediaImages {
  fetchPoster(
    itemId: string,
    signal?: AbortSignal,
  ): Promise<{ body: ArrayBuffer; contentType: string }>;
}
