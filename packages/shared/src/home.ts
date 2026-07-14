import type { ToolDefinition } from './ai-provider.js';

/**
 * Contrat du domaine « maison » — KOS Home (ADR-0005 / ADR-0012), **calqué sur
 * `MediaLibrary` / `DriveLibrary`**. Types **agnostiques du moteur** : aucun
 * détail de Home Assistant, Frigate, ou d'un protocole domotique. KAI, Home,
 * mobile et l'API publique ne connaissent que ce contrat (Règle 3). Remplacer le
 * moteur = réécrire l'adaptateur, pas ce fichier.
 *
 * L'objectif n'est **pas** un clone de Home Assistant : c'est une **expérience
 * KevinOS**. L'utilisateur ne manipule ni entités, ni automatismes, ni
 * dashboards techniques — il parle à KAI, qui orchestre la maison.
 */

export type HomeDeviceKind =
  | 'light'
  | 'plug'
  | 'thermostat'
  | 'temperature'
  | 'camera'
  | 'door'
  | 'cover'
  | 'sensor'
  | 'energy'
  | 'presence';

/** Un appareil de la maison — **agnostique du moteur**. */
export interface HomeDevice {
  id: string;
  name: string;
  /** Pièce (nom lisible ; sert au regroupement et au langage naturel). */
  room: string;
  kind: HomeDeviceKind;
  reachable: boolean;
  /** Allumé/éteint (light, plug). */
  on?: boolean;
  /** Luminosité 0–100 (light). */
  brightness?: number;
  /** Ouverture 0–100, 100 = ouvert (cover / volet). */
  position?: number;
  /** Ouvert/fermé (door / portail). */
  open?: boolean;
  /** Température mesurée °C (temperature / thermostat). */
  temperature?: number;
  /** Consigne °C (thermostat). */
  targetTemperature?: number;
  /** Puissance instantanée W (plug / energy). */
  powerW?: number;
  /** Mouvement détecté (sensor). */
  motion?: boolean;
}

/** Patch d'état d'un appareil (mutation unitaire). */
export interface DeviceCommand {
  on?: boolean;
  brightness?: number;
  position?: number;
  open?: boolean;
  targetTemperature?: number;
}

export type HomeCommandType =
  | 'turn_on'
  | 'turn_off'
  | 'toggle'
  | 'open'
  | 'close'
  | 'set_brightness'
  | 'set_temperature'
  | 'activate_scene';

/**
 * Commande **en langage naturel traduite** — pilote un appareil, une pièce, ou
 * tout un type d'appareils (« éteins toutes les lumières »).
 */
export interface HomeCommand {
  command: HomeCommandType;
  /** Restreindre à un type (light, cover, door…). */
  deviceKind?: HomeDeviceKind;
  /** Restreindre à une pièce (nom lisible). */
  room?: string;
  /** Cibler un appareil précis. */
  deviceId?: string;
  /** Valeur (luminosité %, température °C). */
  value?: number;
}

export interface Room {
  id: string;
  name: string;
  deviceCount: number;
}

/**
 * **Ambiance** (scène) — la notion clé de KOS Home. Pas un simple scénario
 * technique : une intention (« mode cinéma », « bonne nuit ») qui pilote
 * plusieurs appareils d'un coup. `opens` permet la **collaboration entre
 * compétences** (le mode cinéma ouvre KOS Media).
 */
export interface HomeScene {
  id: string;
  name: string;
  icon: string;
  description: string;
  /** Compétence à enchaîner après l'ambiance (ex. `media` pour le cinéma). */
  opens?: 'media' | null;
}

/** Résultat d'activation d'une ambiance : les appareils modifiés (+ enchaînement). */
export interface SceneResult {
  scene: HomeScene;
  changed: HomeDevice[];
  opens?: 'media' | null;
}

export interface HomeCamera {
  id: string;
  name: string;
  room: string;
  /** Instantané servi par le **Core** (jamais l'URL du moteur). */
  snapshotUrl: string;
  online: boolean;
}

export type CameraEventType = 'motion' | 'person' | 'doorbell' | 'vehicle' | 'animal';

/** Événement caméra (préparation Frigate & autres moteurs de détection). */
export interface CameraEvent {
  id: string;
  cameraId: string;
  cameraName: string;
  /** ISO 8601. */
  at: string;
  type: CameraEventType;
  label: string;
  thumbnailUrl: string;
}

/** Consommation d'une pièce. */
export interface RoomEnergy {
  room: string;
  kwhToday: number;
  powerW: number;
}

export interface EnergySummary {
  kwhToday: number;
  powerW: number;
  costTodayEur: number | null;
  byRoom: RoomEnergy[];
  /** Appareils encore allumés (« ai-je laissé un appareil allumé ? »). */
  stillOn: HomeDevice[];
}

export interface PresencePerson {
  id: string;
  name: string;
  home: boolean;
  /** Depuis quand (ISO 8601). */
  since: string | null;
  avatarUrl: string | null;
}

export interface PresenceState {
  anyoneHome: boolean;
  people: PresencePerson[];
}

export interface ClimateSummary {
  /** Température moyenne °C (toutes pièces ou la pièce demandée). */
  averageC: number | null;
  byRoom: Array<{ room: string; temperature: number; targetTemperature: number | null }>;
}

/** Vue d'ensemble — ce que KAI montre quand on ouvre KOS Home. */
export interface HomeOverview {
  rooms: Room[];
  devices: HomeDevice[];
  scenes: HomeScene[];
  presence: PresenceState;
  energy: EnergySummary;
}

/**
 * Port `HomeProvider` : l'interface stable qu'implémente tout moteur domotique.
 * Adaptateur V1 : `InMemoryHomeAdapter implements HomeProvider` (maison simulée,
 * stateful). Demain : `HomeAssistantAdapter`, `FrigateAdapter`… sans toucher à
 * KAI ni à Home.
 */
export interface HomeProvider {
  isAvailable(signal?: AbortSignal): Promise<boolean>;

  overview(signal?: AbortSignal): Promise<HomeOverview>;
  rooms(signal?: AbortSignal): Promise<Room[]>;

  listDevices(
    filter?: { room?: string; kind?: HomeDeviceKind },
    signal?: AbortSignal,
  ): Promise<HomeDevice[]>;
  getDevice(id: string, signal?: AbortSignal): Promise<HomeDevice>;
  setDevice(id: string, patch: DeviceCommand, signal?: AbortSignal): Promise<HomeDevice>;

  /** Commande en masse (« éteins toutes les lumières »). Renvoie les modifiés. */
  runCommand(command: HomeCommand, signal?: AbortSignal): Promise<HomeDevice[]>;

  listScenes(signal?: AbortSignal): Promise<HomeScene[]>;
  activateScene(id: string, signal?: AbortSignal): Promise<SceneResult>;

  cameras(signal?: AbortSignal): Promise<HomeCamera[]>;
  cameraEvents(
    filter?: { cameraId?: string; sinceIso?: string },
    signal?: AbortSignal,
  ): Promise<CameraEvent[]>;

  energy(signal?: AbortSignal): Promise<EnergySummary>;
  presence(signal?: AbortSignal): Promise<PresenceState>;
  climate(room?: string, signal?: AbortSignal): Promise<ClimateSummary>;
}

/**
 * Outils exposés à KAI pour piloter KOS Home en langage naturel. KAI choisit
 * l'outil ; le Core l'exécute via le port. KAI ne parle JAMAIS à Home Assistant
 * directement (Règle 5).
 */
export const homeTools: ToolDefinition[] = [
  {
    name: 'home.command',
    description: 'Piloter la maison (allumer/éteindre, ouvrir/fermer, régler).',
    parameters: {
      type: 'object',
      required: ['command'],
      properties: {
        command: { type: 'string', description: 'turn_on, turn_off, open, close…' },
        deviceKind: { type: 'string', description: 'light, cover, door…' },
        room: { type: 'string' },
      },
    },
  },
  {
    name: 'home.scene',
    description: 'Activer une ambiance (« mode cinéma », « bonne nuit »).',
    parameters: {
      type: 'object',
      required: ['scene'],
      properties: { scene: { type: 'string' } },
    },
  },
  {
    name: 'home.ask',
    description: 'Interroger la maison (température, présence, énergie, caméras).',
    parameters: {
      type: 'object',
      properties: { about: { type: 'string', description: 'temperature, presence, energy…' } },
    },
  },
];
