import { Button, Badge, Divider } from '@kevinos/ui';
import { channelLabel, type BuildInfo } from '../build-info.js';
import { PREVIEW_HIGHLIGHTS } from './highlights.js';
import { timeAgo } from './relativeTime.js';

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="truncate text-sm font-medium text-text" title={value}>
        {value}
      </span>
    </div>
  );
}

/**
 * Écran d'accueil de la **Preview** — la première chose vue en ouvrant le lien
 * (iPhone compris). Il situe la version consultée (numéro, branche, fraîcheur du
 * déploiement), résume les **nouveautés**, puis laisse entrer dans KevinOS.
 *
 * Calme et lisible (HOME_EXPERIENCE) : une carte, une action évidente.
 */
export function PreviewWelcome({ info, onEnter }: { info: BuildInfo; onEnter: () => void }) {
  const versionLabel = `${info.version}${info.channel === 'production' ? '' : '-dev'}`;

  return (
    <div className="flex min-h-full items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span
            aria-hidden="true"
            className="grid h-14 w-14 place-items-center rounded-full bg-accent-subtle text-2xl text-accent"
          >
            ✦
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold tracking-tight text-text">KevinOS</span>
            <Badge tone="accent">
              {channelLabel(info.channel === 'local' ? 'preview' : info.channel)}
            </Badge>
          </div>
          <p className="text-sm text-text-muted">
            Environnement de démonstration — découvre les dernières évolutions.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <MetaRow label="Version" value={versionLabel} />
          <MetaRow label="Branche" value={info.branch} />
          <MetaRow label="Dernier déploiement" value={timeAgo(info.builtAt)} />

          <Divider className="my-4" />

          <h2 className="mb-1 text-sm font-semibold text-text">
            <span aria-hidden="true">🆕</span> Nouveautés de cette version
          </h2>
          <p className="mb-3 text-xs text-text-muted">{PREVIEW_HIGHLIGHTS.label}</p>
          <ul className="space-y-2">
            {PREVIEW_HIGHLIGHTS.items.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm text-text-secondary">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <Button variant="primary" size="lg" className="w-full" onClick={onEnter}>
            Entrer dans KevinOS
          </Button>
          <p className="mt-3 text-center text-xs text-text-muted">
            Toutes les données sont <strong className="font-medium">simulées</strong> — aucune
            dépendance serveur.
          </p>
        </div>
      </div>
    </div>
  );
}
