import type { ReactNode } from 'react';
import { cx } from '../../cx.js';

/** Nature d'un document (miroir de `DocKind`, sans coupler `@kevinos/ui`). */
export type DocumentPreviewKind =
  | 'pdf'
  | 'image'
  | 'markdown'
  | 'text'
  | 'csv'
  | 'json'
  | 'code'
  | 'word'
  | 'excel'
  | 'powerpoint'
  | 'other';

export type DocumentPreviewMode = 'text' | 'image' | 'pdf' | 'download';

export interface DocumentPreviewProps {
  name: string;
  kind: DocumentPreviewKind;
  mode: DocumentPreviewMode;
  /** URL du Core (jamais du moteur) pour `image` / `pdf` / `download`. */
  url?: string;
  /** Contenu inline pour `text` (markdown, csv, json, code, texte). */
  text?: string;
  /** Déclenche le téléchargement (le parent gère l'URL `?download=1`). */
  onDownload?: () => void;
  header?: ReactNode;
  className?: string;
}

const ICONS: Record<DocumentPreviewKind, string> = {
  pdf: '📕',
  image: '🖼️',
  markdown: '📝',
  text: '📄',
  csv: '📊',
  json: '🧩',
  code: '💻',
  word: '📘',
  excel: '📗',
  powerpoint: '📙',
  other: '📎',
};

/** Icône d'après la nature du document (emoji, cohérent avec Home). */
export function documentIcon(kind: DocumentPreviewKind): string {
  return ICONS[kind] ?? ICONS.other;
}

/**
 * **DocumentPreview** — l'aperçu **officiel** des documents de KevinOS. On
 * **reste dans KevinOS** : PDF, images, texte, markdown, CSV, JSON, code
 * s'affichent directement, sans téléchargement. Les formats bureautiques (Word,
 * Excel, PowerPoint) retombent proprement sur un téléchargement (la conversion
 * serveur est une étape suivante — le contrat la prévoit).
 *
 * Présentational : il ne charge rien lui-même ; le parent fournit `mode`, `url`
 * (route du Core) et/ou `text`. Agnostique du moteur (système de fichiers,
 * Nextcloud) — il ne connaît qu'une URL servie par le Core.
 */
export function DocumentPreview({
  name,
  kind,
  mode,
  url,
  text,
  onDownload,
  header,
  className,
}: DocumentPreviewProps) {
  return (
    <div
      className={cx(
        'flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-surface',
        className,
      )}
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
        <span aria-hidden="true" className="text-lg">
          {documentIcon(kind)}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-text">{name}</span>
        {header}
        {onDownload ? (
          <button
            type="button"
            onClick={onDownload}
            className="rounded-md px-2.5 py-1 text-sm text-text-muted transition duration-fast ease-out hover:bg-hover hover:text-text focus-visible:shadow-focus focus-visible:outline-none"
          >
            Télécharger
          </button>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {mode === 'text' ? (
          <pre className="whitespace-pre-wrap break-words p-4 font-mono text-sm leading-relaxed text-text">
            {text ?? ''}
          </pre>
        ) : mode === 'image' ? (
          <div className="flex h-full items-center justify-center bg-[rgba(0,0,0,0.03)] p-4">
            <img src={url} alt={name} className="mx-auto max-h-full max-w-full object-contain" />
          </div>
        ) : mode === 'pdf' ? (
          <iframe src={url} title={name} className="h-full min-h-[60vh] w-full border-0" />
        ) : (
          <div className="flex h-full min-h-[40vh] flex-col items-center justify-center gap-3 p-8 text-center">
            <span aria-hidden="true" className="text-4xl">
              {documentIcon(kind)}
            </span>
            <p className="text-sm text-text-secondary">
              Ce format s’ouvre bientôt directement dans KevinOS.
            </p>
            {onDownload ? (
              <button
                type="button"
                onClick={onDownload}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-[#fff] transition duration-fast ease-out hover:opacity-90 focus-visible:shadow-focus focus-visible:outline-none"
              >
                Télécharger le document
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
