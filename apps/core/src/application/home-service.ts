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

/**
 * Cas d'usage « maison » (KOS Home). Délègue au port `HomeProvider` — ni Home
 * Assistant, ni un protocole domotique, ni le transport HTTP n'apparaissent ici
 * (même patron que `MediaService` / `DriveService`). Frontière applicative : les
 * routes dépendent de ce service, jamais de l'adaptateur.
 */
export class HomeService {
  constructor(private readonly provider: HomeProvider) {}

  overview(): Promise<HomeOverview> {
    return this.provider.overview();
  }
  rooms(): Promise<Room[]> {
    return this.provider.rooms();
  }
  listDevices(filter?: { room?: string; kind?: HomeDeviceKind }): Promise<HomeDevice[]> {
    return this.provider.listDevices(filter);
  }
  getDevice(id: string): Promise<HomeDevice> {
    return this.provider.getDevice(id);
  }
  setDevice(id: string, patch: DeviceCommand): Promise<HomeDevice> {
    return this.provider.setDevice(id, patch);
  }
  runCommand(command: HomeCommand): Promise<HomeDevice[]> {
    return this.provider.runCommand(command);
  }
  listScenes(): Promise<HomeScene[]> {
    return this.provider.listScenes();
  }
  activateScene(id: string): Promise<SceneResult> {
    return this.provider.activateScene(id);
  }
  cameras(): Promise<HomeCamera[]> {
    return this.provider.cameras();
  }
  cameraEvents(filter?: { cameraId?: string; sinceIso?: string }): Promise<CameraEvent[]> {
    return this.provider.cameraEvents(filter);
  }
  energy(): Promise<EnergySummary> {
    return this.provider.energy();
  }
  presence(): Promise<PresenceState> {
    return this.provider.presence();
  }
  climate(room?: string): Promise<ClimateSummary> {
    return this.provider.climate(room);
  }
}
