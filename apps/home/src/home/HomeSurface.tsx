import { useCallback, useEffect, useState } from 'react';
import { Switch, Badge, Spinner, Card } from '@kevinos/ui';
import type {
  KaiHomeQuery,
  HomeOverview,
  HomeDevice,
  HomeScene,
  HomeCamera,
  CameraEvent,
  ClimateSummary,
} from '@kevinos/shared';
import { KaiPresence } from '../kai/KaiPresence.js';
import {
  loadOverview,
  loadCameras,
  loadEvents,
  loadClimate,
  executeHome,
  commandDevice,
} from './homeClient.js';

const EVENT_ICON: Record<string, string> = {
  person: '🚶',
  motion: '👁',
  doorbell: '🔔',
  vehicle: '🚗',
  animal: '🐾',
};
function timeOf(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

/** Un appareil avec sa commande adaptée à son type. */
function DeviceControl({
  device,
  onCmd,
}: {
  device: HomeDevice;
  onCmd: (patch: () => void) => void;
}) {
  const d = device;
  if (d.kind === 'light' || d.kind === 'plug') {
    return (
      <Row name={d.name} meta={d.on && d.kind === 'light' ? `${d.brightness ?? 100} %` : undefined}>
        <Switch
          checked={!!d.on}
          onCheckedChange={() =>
            onCmd(() => void commandDevice(d.id, d.on ? 'turn_off' : 'turn_on'))
          }
          ariaLabel={d.name}
        />
      </Row>
    );
  }
  if (d.kind === 'cover') {
    return (
      <Row name={d.name} meta={`${d.position ?? 0} %`}>
        <div className="flex gap-1">
          <Mini
            label="▲"
            title="Ouvrir"
            onClick={() => onCmd(() => void commandDevice(d.id, 'open'))}
          />
          <Mini
            label="▼"
            title="Fermer"
            onClick={() => onCmd(() => void commandDevice(d.id, 'close'))}
          />
        </div>
      </Row>
    );
  }
  if (d.kind === 'door') {
    return (
      <Row name={d.name} meta={d.open ? 'Ouvert' : 'Fermé'}>
        <Mini
          label={d.open ? 'Fermer' : 'Ouvrir'}
          onClick={() => onCmd(() => void commandDevice(d.id, d.open ? 'close' : 'open'))}
        />
      </Row>
    );
  }
  if (d.kind === 'thermostat') {
    return (
      <Row name={d.name} meta={`${d.temperature ?? '–'} °C → ${d.targetTemperature ?? '–'} °C`}>
        <div className="flex gap-1">
          <Mini
            label="−"
            onClick={() =>
              onCmd(
                () => void commandDevice(d.id, 'set_temperature', (d.targetTemperature ?? 20) - 1),
              )
            }
          />
          <Mini
            label="+"
            onClick={() =>
              onCmd(
                () => void commandDevice(d.id, 'set_temperature', (d.targetTemperature ?? 20) + 1),
              )
            }
          />
        </div>
      </Row>
    );
  }
  if (d.kind === 'temperature') {
    return <Row name={d.name} meta={`${d.temperature ?? '–'} °C`} />;
  }
  return <Row name={d.name} />;
}

function Row({
  name,
  meta,
  children,
}: {
  name: string;
  meta?: string | undefined;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="min-w-0 flex-1 truncate text-sm text-text">{name}</span>
      {meta ? <span className="text-xs text-text-muted">{meta}</span> : null}
      {children}
    </div>
  );
}
function Mini({ label, title, onClick }: { label: string; title?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      {...(title ? { title } : {})}
      className="grid h-8 min-w-8 place-items-center rounded-md border border-border px-2 text-sm text-text transition duration-fast ease-out hover:bg-hover focus-visible:shadow-focus focus-visible:outline-none"
    >
      {label}
    </button>
  );
}

/**
 * 🏠 **KOS Home** — la maison, orchestrée par KAI, **dans** Home. On ne manipule
 * ni entités ni automatismes : on active une **Ambiance**, on demande la
 * température, on regarde une caméra. Home ne connaît que le contrat
 * (`/api/v1/home*`) ; le moteur (Home Assistant, Frigate…) reste caché.
 */
export function HomeSurface({
  query,
  onClose,
  onOpenMedia,
}: {
  query: KaiHomeQuery;
  onClose: () => void;
  onOpenMedia: () => void;
}) {
  const [ov, setOv] = useState<HomeOverview | null>(null);
  const [live, setLive] = useState(true);
  const [cameras, setCameras] = useState<HomeCamera[]>([]);
  const [events, setEvents] = useState<CameraEvent[]>([]);
  const [climate, setClimate] = useState<ClimateSummary | null>(null);

  const refresh = useCallback(async () => {
    const r = await loadOverview();
    setOv(r.overview);
    setLive(r.live);
  }, []);

  useEffect(() => {
    void refresh();
    if (query.kind === 'cameras') {
      void loadCameras().then(setCameras);
      void loadEvents().then(setEvents);
    }
    if (query.kind === 'climate') void loadClimate(query.room).then(setClimate);
  }, [query, refresh]);

  const onCmd = useCallback(
    (mutate: () => void) => {
      mutate();
      // Laisse la mutation (mock synchrone / POST) se propager puis rafraîchit.
      window.setTimeout(() => void refresh(), 60);
    },
    [refresh],
  );

  const activate = useCallback(
    async (scene: HomeScene) => {
      const eff = await executeHome({
        type: 'control_home',
        command: 'activate_scene',
        scene: scene.id,
      });
      await refresh();
      if (eff.opens === 'media') onOpenMedia();
    },
    [refresh, onOpenMedia],
  );

  if (!ov) {
    return (
      <div className="flex flex-1 items-center justify-center py-16 text-accent">
        <Spinner size="lg" label="Connexion à la maison" />
      </div>
    );
  }

  const devices = ov.devices;
  const roomsToShow =
    query.kind === 'room' && query.room ? ov.rooms.filter((r) => r.name === query.room) : ov.rooms;
  const homeCount = ov.presence.people.filter((p) => p.home).length;

  return (
    <div className="animate-fade flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-2 pb-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-2.5 py-1.5 text-sm text-text-muted transition duration-fast ease-out hover:bg-hover hover:text-text focus-visible:shadow-focus focus-visible:outline-none"
        >
          <span aria-hidden="true">←</span> Accueil
        </button>
        <span className="flex items-center gap-2 font-medium text-text">
          <KaiPresence size="sm" /> Maison
        </span>
        {!live ? <Badge tone="accent">démo</Badge> : null}
      </div>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto pb-4">
        {/* Statut rapide. */}
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Présence" value={`${homeCount} à la maison`} icon="🏠" />
          <Stat label="Maintenant" value={`${(ov.energy.powerW / 1000).toFixed(2)} kW`} icon="⚡" />
          <Stat label="Aujourd’hui" value={`${ov.energy.kwhToday} kWh`} icon="📊" />
        </div>

        {/* Ambiances — la notion clé. */}
        <section className="space-y-2">
          <h2 className="text-xs font-medium uppercase tracking-wide text-text-muted">Ambiances</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ov.scenes.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => void activate(s)}
                className="flex flex-col items-start gap-1 rounded-xl border border-border bg-surface p-3 text-left transition duration-fast ease-out hover:border-accent hover:bg-hover focus-visible:shadow-focus focus-visible:outline-none"
              >
                <span className="text-2xl" aria-hidden="true">
                  {s.icon}
                </span>
                <span className="text-sm font-medium text-text">{s.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Panneau focalisé selon la question de KAI. */}
        {query.kind === 'presence' ? (
          <Focus title="Présence">
            {ov.presence.people.map((p) => (
              <div key={p.id} className="flex items-center gap-2 py-1.5 text-sm">
                <span aria-hidden="true">{p.home ? '🟢' : '⚪️'}</span>
                <span className="flex-1 text-text">{p.name}</span>
                <span className="text-text-muted">{p.home ? 'À la maison' : 'Absent'}</span>
              </div>
            ))}
          </Focus>
        ) : null}

        {query.kind === 'energy' ? (
          <Focus title="Consommation">
            <p className="pb-2 text-sm text-text">
              {ov.energy.kwhToday} kWh aujourd’hui
              {ov.energy.costTodayEur != null ? ` · ${ov.energy.costTodayEur} €` : ''} ·{' '}
              {ov.energy.powerW} W maintenant
            </p>
            {ov.energy.byRoom.map((r) => (
              <div key={r.room} className="flex items-center gap-2 py-1 text-sm">
                <span className="w-24 truncate text-text-muted">{r.room}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-hover">
                  <span
                    className="block h-full bg-accent"
                    style={{
                      width: `${Math.min(100, (r.powerW / (ov.energy.powerW || 1)) * 100)}%`,
                    }}
                  />
                </span>
                <span className="w-12 text-right text-text-muted">{r.powerW} W</span>
              </div>
            ))}
            {ov.energy.stillOn.length > 0 ? (
              <p className="pt-2 text-sm text-text-muted">
                Encore allumé : {ov.energy.stillOn.map((d) => d.name).join(', ')}.
              </p>
            ) : (
              <p className="pt-2 text-sm text-text-muted">Rien d’oublié : tout est éteint. ✨</p>
            )}
          </Focus>
        ) : null}

        {query.kind === 'lights' ? (
          <Focus title="Lumières">
            {devices
              .filter((d) => d.kind === 'light')
              .map((d) => (
                <DeviceControl key={d.id} device={d} onCmd={onCmd} />
              ))}
          </Focus>
        ) : null}

        {query.kind === 'climate' ? (
          <Focus title={query.room ? `Température · ${query.room}` : 'Températures'}>
            {(climate?.byRoom ?? []).map((r) => (
              <div key={r.room} className="flex items-center gap-2 py-1.5 text-sm">
                <span className="flex-1 text-text">{r.room}</span>
                <span className="text-text">{r.temperature} °C</span>
                {r.targetTemperature != null ? (
                  <span className="text-text-muted">→ {r.targetTemperature} °C</span>
                ) : null}
              </div>
            ))}
          </Focus>
        ) : null}

        {query.kind === 'cameras' ? (
          <Focus title="Caméras">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {cameras
                .filter((c) => !query.room || c.room === query.room)
                .map((c) => (
                  <figure key={c.id} className="overflow-hidden rounded-lg border border-border">
                    <img
                      src={c.snapshotUrl}
                      alt={c.name}
                      className="aspect-video w-full object-cover"
                    />
                    <figcaption className="flex items-center justify-between px-2 py-1 text-xs">
                      <span className="text-text">{c.name}</span>
                      <span className={c.online ? 'text-accent' : 'text-text-muted'}>
                        {c.online ? 'En ligne' : 'Hors ligne'}
                      </span>
                    </figcaption>
                  </figure>
                ))}
            </div>
            {events.length > 0 ? (
              <div className="pt-3">
                <h3 className="pb-1 text-xs font-medium uppercase tracking-wide text-text-muted">
                  Événements
                </h3>
                {events.map((e) => (
                  <div key={e.id} className="flex items-center gap-2 py-1 text-sm">
                    <span aria-hidden="true">{EVENT_ICON[e.type] ?? '•'}</span>
                    <span className="flex-1 text-text">
                      {e.label} · {e.cameraName}
                    </span>
                    <span className="text-text-muted">{timeOf(e.at)}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </Focus>
        ) : null}

        {/* Pièces & appareils. */}
        <section className="space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-wide text-text-muted">Pièces</h2>
          {roomsToShow.map((r) => {
            const roomDevices = devices.filter((d) => d.room === r.name && d.kind !== 'sensor');
            if (roomDevices.length === 0) return null;
            return (
              <Card key={r.id} className="p-3">
                <div className="pb-1 text-sm font-medium text-text">{r.name}</div>
                <div className="divide-y divide-border">
                  {roomDevices.map((d) => (
                    <DeviceControl key={d.id} device={d} onCmd={onCmd} />
                  ))}
                </div>
              </Card>
            );
          })}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-2.5">
      <div className="flex items-center gap-1.5 text-xs text-text-muted">
        <span aria-hidden="true">{icon}</span>
        {label}
      </div>
      <div className="pt-0.5 text-sm font-medium text-text">{value}</div>
    </div>
  );
}
function Focus({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-1 rounded-xl border border-accent/40 bg-surface p-3">
      <h2 className="pb-1 text-xs font-medium uppercase tracking-wide text-accent">{title}</h2>
      {children}
    </section>
  );
}
