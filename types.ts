
export type DeviceType = 'alexa' | 'google' | 'telegram' | 'sonos';

export interface VolumeProfile {
  morning: number;
  afternoon: number;
  night: number;
}

export interface Device {
  id: string;
  name: string;
  entityId: string;
  chatId?: string;
  cameraEntities?: string[];
  snapDelay?: number;
  type: DeviceType;
  volumes: VolumeProfile;
  enabled: boolean;
}

export interface DNDSchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface GlobalConfig {
  devices: Device[];
  dnd: DNDSchedule;
  shutdownTime: string;
  restoreMusic: boolean;
  timeDefinitions: {
    morningStart: string;
    afternoonStart: string;
    nightStart: string;
  };
}
