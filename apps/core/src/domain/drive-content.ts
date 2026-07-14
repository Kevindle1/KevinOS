/**
 * Port de **contenu documentaire** — le Core relaie les octets d'un fichier
 * pour l'aperçu et le téléchargement, afin que Home ne joigne **jamais** le
 * moteur (Règle 5/6). Gère les requêtes `Range` (aperçu PDF, gros fichiers).
 * Analogue de `MediaStreaming`, côté KOS Drive.
 */
export interface DriveContent {
  fetchRaw(
    id: string,
    range?: string,
    signal?: AbortSignal,
  ): Promise<{
    status: number;
    headers: Record<string, string>;
    /** Nom de fichier (pour `Content-Disposition`). */
    filename: string;
    stream: NodeJS.ReadableStream | null;
  }>;
}
