import type {
  HomeOverview,
  HomeDevice,
  HomeCamera,
  CameraEvent,
  ClimateSummary,
  SceneResult,
  HomeCommandType,
  KaiControlHomeAction,
} from '@kevinos/shared';
import {
  mockOverview,
  mockCameras,
  mockEvents,
  mockClimate,
  mockCommand,
  mockActivateScene,
  mockCommandDevice,
} from './mock.js';

/**
 * Client **KOS Home** — Home ne connaît que le **contrat** (`/api/v1/home*` du
 * Core), jamais Home Assistant. Vrai état quand un Core répond ; sinon repli
 * mock **stateful** (Preview) pour que piloter la maison reste démontrable.
 * **Même patron que `mediaClient` / `driveClient`.**
 */
let backend: boolean | null = null;

async function getJson<T>(url: string): Promise<T | null> {
  if (backend === false) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      backend = false;
      return null;
    }
    backend = true;
    return (await res.json()) as T;
  } catch {
    backend = false;
    return null;
  }
}

async function postJson<T>(url: string, body: unknown): Promise<T | null> {
  if (backend === false) return null;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      backend = false;
      return null;
    }
    backend = true;
    return (await res.json()) as T;
  } catch {
    backend = false;
    return null;
  }
}

export interface OverviewResult {
  overview: HomeOverview;
  live: boolean;
}

export async function loadOverview(): Promise<OverviewResult> {
  const overview = await getJson<HomeOverview>('/api/v1/home');
  return overview ? { overview, live: true } : { overview: mockOverview(), live: false };
}

export async function loadCameras(): Promise<HomeCamera[]> {
  return (await getJson<HomeCamera[]>('/api/v1/home/cameras')) ?? mockCameras();
}
export async function loadEvents(): Promise<CameraEvent[]> {
  return (await getJson<CameraEvent[]>('/api/v1/home/events')) ?? mockEvents();
}
export async function loadClimate(room?: string): Promise<ClimateSummary> {
  const q = room ? `?room=${encodeURIComponent(room)}` : '';
  return (await getJson<ClimateSummary>(`/api/v1/home/climate${q}`)) ?? mockClimate(room);
}

export interface HomeEffect {
  changed: HomeDevice[];
  opens?: 'media' | null;
}

/** Exécute un pilotage KAI (ou un geste UI). Renvoie les appareils modifiés. */
export async function executeHome(a: KaiControlHomeAction): Promise<HomeEffect> {
  if (a.command === 'activate_scene' && a.scene) {
    const r = await postJson<SceneResult>(`/api/v1/home/scenes/${a.scene}/activate`, {});
    if (r) return { changed: r.changed, opens: r.opens ?? null };
    return mockActivateScene(a.scene);
  }
  const body = {
    command: a.command,
    ...(a.deviceKind ? { deviceKind: a.deviceKind } : {}),
    ...(a.room ? { room: a.room } : {}),
    ...(a.value != null ? { value: a.value } : {}),
  };
  const changed = await postJson<HomeDevice[]>('/api/v1/home/command', body);
  return { changed: changed ?? mockCommand(a) };
}

/** Pilote un appareil précis depuis l'interface (bascule, volet, porte…). */
export async function commandDevice(
  deviceId: string,
  command: HomeCommandType,
  value?: number,
): Promise<HomeDevice[]> {
  const body = { command, deviceId, ...(value != null ? { value } : {}) };
  const changed = await postJson<HomeDevice[]>('/api/v1/home/command', body);
  return changed ?? mockCommandDevice(deviceId, command, value);
}
