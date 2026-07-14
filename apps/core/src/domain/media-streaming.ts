/**
 * Port de **streaming vidéo** — le Core proxifie le flux du moteur (Jellyfin)
 * pour que le lecteur KevinOS ne voie **jamais** l'URL du moteur (Règle 5/6).
 * Gère les requêtes `Range` (seek, reprise) en relayant le statut et les
 * en-têtes du moteur.
 */
export interface MediaStreaming {
  fetchStream(
    itemId: string,
    range: string | undefined,
    signal?: AbortSignal,
  ): Promise<{
    status: number;
    headers: Record<string, string>;
    body: ReadableStream<Uint8Array> | null;
  }>;
}
