import type {
  HomeProvider,
  HomeDevice,
  HomeDeviceKind,
  DeviceCommand,
  HomeCommand,
  Room,
  HomeScene,
  SceneResult,
  HomeCamera,
  CameraEvent,
  EnergySummary,
  PresenceState,
  ClimateSummary,
  HomeOverview,
} from '@kevinos/shared';

/** Puissance (W) d'un appareil allumé, pour l'estimation d'énergie. */
const POWER_W: Record<string, number> = {
  light: 9,
  plug: 60,
  thermostat: 0,
};

interface SceneDef extends HomeScene {
  apply: (devices: Map<string, HomeDevice>) => void;
}

/**
 * Adaptateur **maison simulée** (stateful) du port `HomeProvider` (ADR-0005 /
 * ADR-0012). Moteur V1 : une maison **en mémoire**, un moteur domotique tout à
 * fait valide et **entièrement démontrable** — allumer une lumière change l'état,
 * l'interroger le reflète. SEUL endroit qui « connaît » ce moteur. Demain,
 * `HomeAssistantAdapter` / `FrigateAdapter` le remplacent **sans toucher** à KAI
 * ni à Home. Les instantanés caméra pointent vers le **Core**
 * (`/api/v1/home/cameras/:id/snapshot`), jamais vers un flux moteur.
 */
export class InMemoryHomeAdapter implements HomeProvider {
  private readonly devices = new Map<string, HomeDevice>();
  private readonly cams: HomeCamera[];
  private readonly events: CameraEvent[];
  private readonly people: PresenceState;
  private kwhToday = 8.4;

  constructor(nowIso: string) {
    for (const d of seedDevices()) this.devices.set(d.id, d);
    this.cams = [
      {
        id: 'cam-entree',
        name: 'Porte d’entrée',
        room: 'Entrée',
        snapshotUrl: snap('cam-entree'),
        online: true,
      },
      {
        id: 'cam-garage',
        name: 'Garage',
        room: 'Garage',
        snapshotUrl: snap('cam-garage'),
        online: true,
      },
      {
        id: 'cam-jardin',
        name: 'Jardin',
        room: 'Jardin',
        snapshotUrl: snap('cam-jardin'),
        online: true,
      },
    ];
    this.events = [
      evt('e1', 'cam-entree', 'Porte d’entrée', nowIso, -540, 'person', 'Personne détectée'),
      evt('e2', 'cam-garage', 'Garage', nowIso, -180, 'motion', 'Mouvement'),
      evt('e3', 'cam-entree', 'Porte d’entrée', nowIso, -60, 'doorbell', 'Sonnette'),
      evt('e4', 'cam-jardin', 'Jardin', nowIso, -30, 'animal', 'Animal détecté'),
    ];
    this.people = {
      anyoneHome: true,
      people: [
        { id: 'kevin', name: 'Kevin', home: true, since: iso(nowIso, -120), avatarUrl: null },
        { id: 'camille', name: 'Camille', home: false, since: iso(nowIso, -300), avatarUrl: null },
      ],
    };
  }

  isAvailable(): Promise<boolean> {
    return Promise.resolve(true);
  }

  private all(): HomeDevice[] {
    return [...this.devices.values()];
  }

  async overview(): Promise<HomeOverview> {
    return {
      rooms: await this.rooms(),
      devices: this.all(),
      scenes: await this.listScenes(),
      presence: await this.presence(),
      energy: await this.energy(),
    };
  }

  rooms(): Promise<Room[]> {
    const byRoom = new Map<string, number>();
    for (const d of this.devices.values()) byRoom.set(d.room, (byRoom.get(d.room) ?? 0) + 1);
    return Promise.resolve(
      [...byRoom.entries()].map(([name, deviceCount]) => ({ id: slug(name), name, deviceCount })),
    );
  }

  listDevices(filter?: { room?: string; kind?: HomeDeviceKind }): Promise<HomeDevice[]> {
    return Promise.resolve(
      this.all().filter(
        (d) =>
          (!filter?.room || sameRoom(d.room, filter.room)) &&
          (!filter?.kind || d.kind === filter.kind),
      ),
    );
  }

  getDevice(id: string): Promise<HomeDevice> {
    const d = this.devices.get(id);
    if (!d) return Promise.reject(new Error(`home: appareil inconnu ${id}`));
    return Promise.resolve(d);
  }

  setDevice(id: string, patch: DeviceCommand): Promise<HomeDevice> {
    const d = this.devices.get(id);
    if (!d) return Promise.reject(new Error(`home: appareil inconnu ${id}`));
    const next = { ...d, ...patch };
    this.devices.set(id, next);
    return Promise.resolve(next);
  }

  runCommand(cmd: HomeCommand): Promise<HomeDevice[]> {
    const targets = this.all().filter(
      (d) =>
        (!cmd.deviceId || d.id === cmd.deviceId) &&
        (!cmd.room || sameRoom(d.room, cmd.room)) &&
        (!cmd.deviceKind || d.kind === cmd.deviceKind),
    );
    const changed: HomeDevice[] = [];
    for (const d of targets) {
      const next = applyCommand(d, cmd);
      if (next) {
        this.devices.set(d.id, next);
        changed.push(next);
      }
    }
    return Promise.resolve(changed);
  }

  listScenes(): Promise<HomeScene[]> {
    return Promise.resolve(SCENES.map(({ apply: _apply, ...s }) => s));
  }

  activateScene(id: string): Promise<SceneResult> {
    const def = SCENES.find((s) => s.id === id);
    if (!def) return Promise.reject(new Error(`home: ambiance inconnue ${id}`));
    const before = new Map(this.all().map((d) => [d.id, JSON.stringify(d)]));
    def.apply(this.devices);
    const changed = this.all().filter((d) => before.get(d.id) !== JSON.stringify(d));
    const { apply: _a, ...scene } = def;
    return Promise.resolve({ scene, changed, ...(def.opens ? { opens: def.opens } : {}) });
  }

  cameras(): Promise<HomeCamera[]> {
    return Promise.resolve(this.cams);
  }

  cameraEvents(filter?: { cameraId?: string; sinceIso?: string }): Promise<CameraEvent[]> {
    return Promise.resolve(
      this.events
        .filter((e) => !filter?.cameraId || e.cameraId === filter.cameraId)
        .filter((e) => !filter?.sinceIso || e.at >= filter.sinceIso)
        .sort((a, b) => b.at.localeCompare(a.at)),
    );
  }

  energy(): Promise<EnergySummary> {
    const byRoom = new Map<string, { kwhToday: number; powerW: number }>();
    let powerW = 0;
    for (const d of this.devices.values()) {
      const p = deviceWatts(d);
      powerW += p;
      const cur = byRoom.get(d.room) ?? { kwhToday: 0, powerW: 0 };
      cur.powerW += p;
      byRoom.set(d.room, cur);
    }
    // Répartit la consommation du jour au prorata de la puissance instantanée.
    const totalP = powerW || 1;
    for (const [, v] of byRoom)
      v.kwhToday = Math.round(((this.kwhToday * v.powerW) / totalP) * 10) / 10;
    const stillOn = this.all().filter((d) => (d.kind === 'light' || d.kind === 'plug') && d.on);
    return Promise.resolve({
      kwhToday: this.kwhToday,
      powerW,
      costTodayEur: Math.round(this.kwhToday * 0.2 * 100) / 100,
      byRoom: [...byRoom.entries()]
        .map(([room, v]) => ({ room, kwhToday: v.kwhToday, powerW: v.powerW }))
        .sort((a, b) => b.powerW - a.powerW),
      stillOn,
    });
  }

  presence(): Promise<PresenceState> {
    return Promise.resolve(this.people);
  }

  climate(room?: string): Promise<ClimateSummary> {
    const temps = this.all().filter(
      (d) =>
        (d.kind === 'temperature' || d.kind === 'thermostat') &&
        typeof d.temperature === 'number' &&
        (!room || sameRoom(d.room, room)),
    );
    const byRoom = temps.map((d) => ({
      room: d.room,
      temperature: d.temperature as number,
      targetTemperature: d.targetTemperature ?? null,
    }));
    const averageC = byRoom.length
      ? Math.round((byRoom.reduce((s, r) => s + r.temperature, 0) / byRoom.length) * 10) / 10
      : null;
    return Promise.resolve({ averageC, byRoom });
  }
}

function deviceWatts(d: HomeDevice): number {
  if (d.kind === 'plug' && d.on) return d.powerW ?? POWER_W.plug ?? 0;
  if (d.kind === 'light' && d.on)
    return Math.round(((d.brightness ?? 100) / 100) * (POWER_W.light ?? 9));
  return 0;
}

function applyCommand(d: HomeDevice, cmd: HomeCommand): HomeDevice | null {
  switch (cmd.command) {
    case 'turn_on':
      if (d.kind !== 'light' && d.kind !== 'plug') return null;
      return { ...d, on: true };
    case 'turn_off':
      if (d.kind !== 'light' && d.kind !== 'plug') return null;
      return { ...d, on: false };
    case 'toggle':
      if (d.kind !== 'light' && d.kind !== 'plug') return null;
      return { ...d, on: !d.on };
    case 'set_brightness':
      if (d.kind !== 'light') return null;
      return { ...d, on: (cmd.value ?? 100) > 0, brightness: clamp(cmd.value ?? 100) };
    case 'open':
      if (d.kind === 'cover') return { ...d, position: 100 };
      if (d.kind === 'door') return { ...d, open: true };
      return null;
    case 'close':
      if (d.kind === 'cover') return { ...d, position: 0 };
      if (d.kind === 'door') return { ...d, open: false };
      return null;
    case 'set_temperature':
      if (d.kind !== 'thermostat') return null;
      return { ...d, targetTemperature: cmd.value ?? (d.targetTemperature ?? 20) + 1 };
    default:
      return null;
  }
}

const clamp = (n: number): number => Math.max(0, Math.min(100, Math.round(n)));
const slug = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
const sameRoom = (a: string, b: string): boolean => slug(a) === slug(b);
const snap = (camId: string): string => `/api/v1/home/cameras/${camId}/snapshot`;

function iso(baseIso: string, deltaMin: number): string {
  return new Date(new Date(baseIso).getTime() + deltaMin * 60_000).toISOString();
}
function evt(
  id: string,
  cameraId: string,
  cameraName: string,
  baseIso: string,
  deltaMin: number,
  type: CameraEvent['type'],
  label: string,
): CameraEvent {
  return {
    id,
    cameraId,
    cameraName,
    at: iso(baseIso, deltaMin),
    type,
    label,
    thumbnailUrl: snap(cameraId),
  };
}

function light(id: string, name: string, room: string, on: boolean, brightness = 100): HomeDevice {
  return { id, name, room, kind: 'light', reachable: true, on, brightness };
}
function seedDevices(): HomeDevice[] {
  return [
    light('l-salon', 'Plafond salon', 'Salon', false),
    light('l-salon-lampe', 'Lampe salon', 'Salon', false, 60),
    {
      id: 'p-tv',
      name: 'Téléviseur',
      room: 'Salon',
      kind: 'plug',
      reachable: true,
      on: false,
      powerW: 0,
    },
    {
      id: 't-salon',
      name: 'Température salon',
      room: 'Salon',
      kind: 'temperature',
      reachable: true,
      temperature: 21,
    },
    {
      id: 'c-salon',
      name: 'Volet salon',
      room: 'Salon',
      kind: 'cover',
      reachable: true,
      position: 100,
    },
    light('l-cuisine', 'Plafond cuisine', 'Cuisine', false),
    {
      id: 't-cuisine',
      name: 'Température cuisine',
      room: 'Cuisine',
      kind: 'temperature',
      reachable: true,
      temperature: 20,
    },
    {
      id: 'c-cuisine',
      name: 'Volet cuisine',
      room: 'Cuisine',
      kind: 'cover',
      reachable: true,
      position: 100,
    },
    light('l-chambre', 'Plafond chambre', 'Chambre', false),
    {
      id: 'th-chambre',
      name: 'Thermostat chambre',
      room: 'Chambre',
      kind: 'thermostat',
      reachable: true,
      temperature: 19,
      targetTemperature: 20,
    },
    {
      id: 'c-chambre',
      name: 'Volet chambre',
      room: 'Chambre',
      kind: 'cover',
      reachable: true,
      position: 100,
    },
    light('l-bureau', 'Plafond bureau', 'Bureau', true),
    {
      id: 'p-bureau',
      name: 'Prise bureau',
      room: 'Bureau',
      kind: 'plug',
      reachable: true,
      on: true,
      powerW: 85,
    },
    {
      id: 'd-portail',
      name: 'Portail',
      room: 'Entrée',
      kind: 'door',
      reachable: true,
      open: false,
    },
    {
      id: 'd-garage',
      name: 'Porte garage',
      room: 'Garage',
      kind: 'door',
      reachable: true,
      open: false,
    },
    {
      id: 's-entree',
      name: 'Détecteur entrée',
      room: 'Entrée',
      kind: 'sensor',
      reachable: true,
      motion: false,
    },
  ];
}

/** Applique une consigne d'ambiance à un appareil s'il correspond. */
function set(devices: Map<string, HomeDevice>, id: string, patch: Partial<HomeDevice>): void {
  const d = devices.get(id);
  if (d) devices.set(id, { ...d, ...patch });
}
function eachLight(devices: Map<string, HomeDevice>, on: boolean): void {
  for (const d of devices.values()) if (d.kind === 'light') devices.set(d.id, { ...d, on });
}
function eachCover(devices: Map<string, HomeDevice>, position: number): void {
  for (const d of devices.values()) if (d.kind === 'cover') devices.set(d.id, { ...d, position });
}

/** Les **Ambiances** — plusieurs appareils d'un coup, une seule intention. */
const SCENES: SceneDef[] = [
  {
    id: 'cinema',
    name: 'Cinéma',
    icon: '🎬',
    description: 'Volets baissés, lumières tamisées, téléviseur allumé — et KOS Media s’ouvre.',
    opens: 'media',
    apply: (d) => {
      set(d, 'c-salon', { position: 0 });
      set(d, 'l-salon', { on: false });
      set(d, 'l-salon-lampe', { on: true, brightness: 15 });
      set(d, 'p-tv', { on: true, powerW: 120 });
    },
  },
  {
    id: 'lecture',
    name: 'Lecture',
    icon: '📖',
    description: 'Une lampe douce, le reste en veille.',
    apply: (d) => {
      set(d, 'l-salon', { on: false });
      set(d, 'l-salon-lampe', { on: true, brightness: 55 });
      set(d, 'p-tv', { on: false, powerW: 0 });
    },
  },
  {
    id: 'bonne_nuit',
    name: 'Bonne nuit',
    icon: '🌙',
    description: 'Tout s’éteint, les volets se ferment, la maison se verrouille.',
    apply: (d) => {
      eachLight(d, false);
      eachCover(d, 0);
      set(d, 'p-tv', { on: false, powerW: 0 });
      set(d, 'd-portail', { open: false });
      set(d, 'd-garage', { open: false });
      set(d, 'th-chambre', { targetTemperature: 18 });
    },
  },
  {
    id: 'bonjour',
    name: 'Bonjour',
    icon: '☀️',
    description: 'Les volets s’ouvrent, la cuisine s’allume, la maison se réveille.',
    apply: (d) => {
      eachCover(d, 100);
      set(d, 'l-cuisine', { on: true });
      set(d, 'th-chambre', { targetTemperature: 20 });
    },
  },
  {
    id: 'je_rentre',
    name: 'Je rentre',
    icon: '🏡',
    description: 'Entrée et salon s’allument, la maison est accueillante.',
    apply: (d) => {
      set(d, 'l-salon', { on: true });
      set(d, 'l-cuisine', { on: true });
      set(d, 'th-chambre', { targetTemperature: 21 });
    },
  },
  {
    id: 'je_pars',
    name: 'Je pars',
    icon: '🚗',
    description: 'Tout s’éteint, les volets se ferment, la maison s’endort.',
    apply: (d) => {
      eachLight(d, false);
      eachCover(d, 0);
      set(d, 'p-tv', { on: false, powerW: 0 });
      set(d, 'p-bureau', { on: false });
      set(d, 'th-chambre', { targetTemperature: 17 });
    },
  },
  {
    id: 'travail',
    name: 'Travail',
    icon: '💻',
    description: 'Le bureau s’allume, prêt à la concentration.',
    apply: (d) => {
      set(d, 'l-bureau', { on: true, brightness: 100 });
      set(d, 'p-bureau', { on: true });
    },
  },
  {
    id: 'diner',
    name: 'Dîner',
    icon: '🍽',
    description: 'Cuisine et salon en lumière douce, téléviseur éteint.',
    apply: (d) => {
      set(d, 'l-cuisine', { on: true, brightness: 80 });
      set(d, 'l-salon', { on: true, brightness: 50 });
      set(d, 'p-tv', { on: false, powerW: 0 });
    },
  },
];
