import type {
  HomeOverview,
  HomeDevice,
  HomeCamera,
  CameraEvent,
  ClimateSummary,
  HomeScene,
  Room,
  EnergySummary,
  PresenceState,
  HomeCommandType,
  KaiControlHomeAction,
} from '@kevinos/shared';
import type { HomeEffect } from './homeClient.js';

/**
 * Maison **simulée** côté Home — uniquement quand aucun Core n'est joignable
 * (Preview). Le vrai état vient du Core (contrat `HomeProvider`, moteur caché).
 * **Mutable & stateful** : allumer une lumière change l'état, l'interroger le
 * reflète — comme le vrai moteur. Rien ne prétend piloter une vraie maison.
 */
function snap(label: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180">` +
    `<rect width="320" height="180" fill="#0f1113"/>` +
    `<circle cx="160" cy="80" r="26" fill="none" stroke="#2FBEB4" stroke-width="2"/>` +
    `<circle cx="160" cy="80" r="5" fill="#2FBEB4"/>` +
    `<text x="12" y="168" font-family="monospace" font-size="13" fill="#e5e7eb">${label}</text>` +
    `<text x="308" y="24" text-anchor="end" font-family="monospace" font-size="12" fill="#ef6f6f">● REC</text>` +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function light(id: string, name: string, room: string, on: boolean, brightness = 100): HomeDevice {
  return { id, name, room, kind: 'light', reachable: true, on, brightness };
}

let DEVICES: HomeDevice[] = [
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
  { id: 'd-portail', name: 'Portail', room: 'Entrée', kind: 'door', reachable: true, open: false },
  {
    id: 'd-garage',
    name: 'Porte garage',
    room: 'Garage',
    kind: 'door',
    reachable: true,
    open: false,
  },
];

const slug = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
const sameRoom = (a: string, b: string): boolean => slug(a) === slug(b);

function apply(d: HomeDevice, command: HomeCommandType, value?: number): HomeDevice | null {
  switch (command) {
    case 'turn_on':
      return d.kind === 'light' || d.kind === 'plug' ? { ...d, on: true } : null;
    case 'turn_off':
      return d.kind === 'light' || d.kind === 'plug' ? { ...d, on: false } : null;
    case 'toggle':
      return d.kind === 'light' || d.kind === 'plug' ? { ...d, on: !d.on } : null;
    case 'set_brightness':
      return d.kind === 'light' ? { ...d, on: (value ?? 100) > 0, brightness: value ?? 100 } : null;
    case 'open':
      if (d.kind === 'cover') return { ...d, position: 100 };
      if (d.kind === 'door') return { ...d, open: true };
      return null;
    case 'close':
      if (d.kind === 'cover') return { ...d, position: 0 };
      if (d.kind === 'door') return { ...d, open: false };
      return null;
    case 'set_temperature':
      return d.kind === 'thermostat'
        ? { ...d, targetTemperature: value ?? (d.targetTemperature ?? 20) + 1 }
        : null;
    default:
      return null;
  }
}

export function mockCommand(a: KaiControlHomeAction): HomeDevice[] {
  const changed: HomeDevice[] = [];
  DEVICES = DEVICES.map((d) => {
    if (a.room && !sameRoom(d.room, a.room)) return d;
    if (a.deviceKind && d.kind !== a.deviceKind) return d;
    const next = apply(d, a.command, a.value);
    if (next) changed.push(next);
    return next ?? d;
  });
  return changed;
}

export function mockCommandDevice(
  id: string,
  command: HomeCommandType,
  value?: number,
): HomeDevice[] {
  const changed: HomeDevice[] = [];
  DEVICES = DEVICES.map((d) => {
    if (d.id !== id) return d;
    const next = apply(d, command, value);
    if (next) changed.push(next);
    return next ?? d;
  });
  return changed;
}

const set = (id: string, patch: Partial<HomeDevice>): void => {
  DEVICES = DEVICES.map((d) => (d.id === id ? { ...d, ...patch } : d));
};
const eachLight = (on: boolean): void => {
  DEVICES = DEVICES.map((d) => (d.kind === 'light' ? { ...d, on } : d));
};
const eachCover = (position: number): void => {
  DEVICES = DEVICES.map((d) => (d.kind === 'cover' ? { ...d, position } : d));
};

interface SceneDef extends HomeScene {
  apply: () => void;
}
const SCENES: SceneDef[] = [
  {
    id: 'cinema',
    name: 'Cinéma',
    icon: '🎬',
    description: 'Volets baissés, lumières tamisées, téléviseur allumé — KOS Media s’ouvre.',
    opens: 'media',
    apply: () => {
      set('c-salon', { position: 0 });
      set('l-salon', { on: false });
      set('l-salon-lampe', { on: true, brightness: 15 });
      set('p-tv', { on: true, powerW: 120 });
    },
  },
  {
    id: 'lecture',
    name: 'Lecture',
    icon: '📖',
    description: 'Une lampe douce, le reste en veille.',
    apply: () => {
      set('l-salon', { on: false });
      set('l-salon-lampe', { on: true, brightness: 55 });
      set('p-tv', { on: false, powerW: 0 });
    },
  },
  {
    id: 'bonne_nuit',
    name: 'Bonne nuit',
    icon: '🌙',
    description: 'Tout s’éteint, les volets se ferment, la maison se verrouille.',
    apply: () => {
      eachLight(false);
      eachCover(0);
      set('p-tv', { on: false, powerW: 0 });
      set('d-portail', { open: false });
      set('th-chambre', { targetTemperature: 18 });
    },
  },
  {
    id: 'bonjour',
    name: 'Bonjour',
    icon: '☀️',
    description: 'Les volets s’ouvrent, la cuisine s’allume.',
    apply: () => {
      eachCover(100);
      set('l-cuisine', { on: true });
      set('th-chambre', { targetTemperature: 20 });
    },
  },
  {
    id: 'je_rentre',
    name: 'Je rentre',
    icon: '🏡',
    description: 'Entrée et salon s’allument.',
    apply: () => {
      set('l-salon', { on: true });
      set('l-cuisine', { on: true });
      set('th-chambre', { targetTemperature: 21 });
    },
  },
  {
    id: 'je_pars',
    name: 'Je pars',
    icon: '🚗',
    description: 'Tout s’éteint, les volets se ferment.',
    apply: () => {
      eachLight(false);
      eachCover(0);
      set('p-tv', { on: false, powerW: 0 });
      set('p-bureau', { on: false });
    },
  },
  {
    id: 'travail',
    name: 'Travail',
    icon: '💻',
    description: 'Le bureau s’allume, prêt à la concentration.',
    apply: () => {
      set('l-bureau', { on: true, brightness: 100 });
      set('p-bureau', { on: true });
    },
  },
  {
    id: 'diner',
    name: 'Dîner',
    icon: '🍽',
    description: 'Cuisine et salon en lumière douce.',
    apply: () => {
      set('l-cuisine', { on: true, brightness: 80 });
      set('l-salon', { on: true, brightness: 50 });
      set('p-tv', { on: false, powerW: 0 });
    },
  },
];

export function scenesList(): HomeScene[] {
  return SCENES.map(({ apply: _a, ...s }) => s);
}

export function mockActivateScene(id: string): HomeEffect {
  const def = SCENES.find((s) => s.id === id);
  if (!def) return { changed: [] };
  const before = new Map(DEVICES.map((d) => [d.id, JSON.stringify(d)]));
  def.apply();
  const changed = DEVICES.filter((d) => before.get(d.id) !== JSON.stringify(d));
  return { changed, opens: def.opens ?? null };
}

function deviceWatts(d: HomeDevice): number {
  if (d.kind === 'plug' && d.on) return d.powerW ?? 60;
  if (d.kind === 'light' && d.on) return Math.round(((d.brightness ?? 100) / 100) * 9);
  return 0;
}

function energy(): EnergySummary {
  const kwhToday = 8.4;
  const byRoom = new Map<string, { kwhToday: number; powerW: number }>();
  let powerW = 0;
  for (const d of DEVICES) {
    const p = deviceWatts(d);
    powerW += p;
    const cur = byRoom.get(d.room) ?? { kwhToday: 0, powerW: 0 };
    cur.powerW += p;
    byRoom.set(d.room, cur);
  }
  const totalP = powerW || 1;
  for (const [, v] of byRoom) v.kwhToday = Math.round(((kwhToday * v.powerW) / totalP) * 10) / 10;
  return {
    kwhToday,
    powerW,
    costTodayEur: Math.round(kwhToday * 0.2 * 100) / 100,
    byRoom: [...byRoom.entries()]
      .map(([room, v]) => ({ room, kwhToday: v.kwhToday, powerW: v.powerW }))
      .sort((a, b) => b.powerW - a.powerW),
    stillOn: DEVICES.filter((d) => (d.kind === 'light' || d.kind === 'plug') && d.on),
  };
}

function rooms(): Room[] {
  const counts = new Map<string, number>();
  for (const d of DEVICES) counts.set(d.room, (counts.get(d.room) ?? 0) + 1);
  return [...counts.entries()].map(([name, deviceCount]) => ({
    id: slug(name),
    name,
    deviceCount,
  }));
}

const PRESENCE: PresenceState = {
  anyoneHome: true,
  people: [
    { id: 'kevin', name: 'Kevin', home: true, since: '2026-07-14T18:30:00Z', avatarUrl: null },
    { id: 'camille', name: 'Camille', home: false, since: '2026-07-14T15:30:00Z', avatarUrl: null },
  ],
};

export function mockOverview(): HomeOverview {
  return {
    rooms: rooms(),
    devices: [...DEVICES],
    scenes: scenesList(),
    presence: PRESENCE,
    energy: energy(),
  };
}

export function mockCameras(): HomeCamera[] {
  return [
    {
      id: 'cam-entree',
      name: 'Porte d’entrée',
      room: 'Entrée',
      snapshotUrl: snap('Porte d’entrée'),
      online: true,
    },
    { id: 'cam-garage', name: 'Garage', room: 'Garage', snapshotUrl: snap('Garage'), online: true },
    { id: 'cam-jardin', name: 'Jardin', room: 'Jardin', snapshotUrl: snap('Jardin'), online: true },
  ];
}

export function mockEvents(): CameraEvent[] {
  const cams = mockCameras();
  const thumb = (i: number) => cams[i]!.snapshotUrl;
  return [
    {
      id: 'e3',
      cameraId: 'cam-entree',
      cameraName: 'Porte d’entrée',
      at: '2026-07-14T19:30:00Z',
      type: 'doorbell',
      label: 'Sonnette',
      thumbnailUrl: thumb(0),
    },
    {
      id: 'e2',
      cameraId: 'cam-garage',
      cameraName: 'Garage',
      at: '2026-07-14T17:30:00Z',
      type: 'motion',
      label: 'Mouvement',
      thumbnailUrl: thumb(1),
    },
    {
      id: 'e1',
      cameraId: 'cam-entree',
      cameraName: 'Porte d’entrée',
      at: '2026-07-14T11:30:00Z',
      type: 'person',
      label: 'Personne détectée',
      thumbnailUrl: thumb(0),
    },
  ];
}

export function mockClimate(room?: string): ClimateSummary {
  const temps = DEVICES.filter(
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
  return { averageC, byRoom };
}
