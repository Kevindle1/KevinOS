import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryHomeAdapter } from './in-memory-home-adapter.js';

let home: InMemoryHomeAdapter;

beforeEach(() => {
  home = new InMemoryHomeAdapter('2026-07-14T20:30:00.000Z');
});

describe('InMemoryHomeAdapter — la maison simulée (moteur V1)', () => {
  it('overview : pièces, appareils, ambiances, présence, énergie', async () => {
    const o = await home.overview();
    expect(o.rooms.length).toBeGreaterThan(0);
    expect(o.devices.some((d) => d.kind === 'light')).toBe(true);
    expect(o.scenes.map((s) => s.id)).toContain('cinema');
    expect(o.presence.people.length).toBe(2);
  });

  it('allume les lumières du salon (l’état change)', async () => {
    const changed = await home.runCommand({
      command: 'turn_on',
      deviceKind: 'light',
      room: 'Salon',
    });
    expect(changed.length).toBeGreaterThan(0);
    expect(changed.every((d) => d.on)).toBe(true);
    const lights = await home.listDevices({ room: 'Salon', kind: 'light' });
    expect(lights.every((d) => d.on)).toBe(true);
  });

  it('éteins toutes les lumières → aucune allumée', async () => {
    await home.runCommand({ command: 'turn_on', deviceKind: 'light' });
    await home.runCommand({ command: 'turn_off', deviceKind: 'light' });
    const lights = await home.listDevices({ kind: 'light' });
    expect(lights.some((d) => d.on)).toBe(false);
  });

  it('ferme les volets → position 0', async () => {
    await home.runCommand({ command: 'close', deviceKind: 'cover' });
    const covers = await home.listDevices({ kind: 'cover' });
    expect(covers.every((d) => d.position === 0)).toBe(true);
  });

  it('mode cinéma : volet salon baissé, téléviseur allumé, enchaîne KOS Media', async () => {
    const res = await home.activateScene('cinema');
    expect(res.opens).toBe('media');
    const salonCover = res.changed.find((d) => d.id === 'c-salon');
    expect(salonCover?.position).toBe(0);
    const tv = (await home.listDevices({ room: 'Salon', kind: 'plug' })).find(
      (d) => d.id === 'p-tv',
    );
    expect(tv?.on).toBe(true);
  });

  it('climat : température du salon', async () => {
    const c = await home.climate('Salon');
    expect(c.byRoom[0]?.room).toBe('Salon');
    expect(typeof c.byRoom[0]?.temperature).toBe('number');
  });

  it('énergie : puissance instantanée + appareils encore allumés', async () => {
    await home.runCommand({ command: 'turn_on', deviceKind: 'light', room: 'Salon' });
    const e = await home.energy();
    expect(e.powerW).toBeGreaterThan(0);
    expect(e.stillOn.some((d) => d.room === 'Salon')).toBe(true);
    expect(e.byRoom.length).toBeGreaterThan(0);
  });

  it('présence : qui est à la maison', async () => {
    const p = await home.presence();
    expect(p.anyoneHome).toBe(true);
    expect(p.people.find((x) => x.name === 'Kevin')?.home).toBe(true);
  });

  it('événements caméra : triés du plus récent au plus ancien', async () => {
    const events = await home.cameraEvents();
    expect(events.length).toBeGreaterThan(0);
    for (let i = 1; i < events.length; i++) {
      expect(events[i - 1]!.at >= events[i]!.at).toBe(true);
    }
  });
});
