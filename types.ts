export type DeviceType = 'alexa' | 'google' | 'telegram' | 'sonos';

export interface VolumeProfile {
  morning: number;
  afternoon: number;
  night: number;
}

export interface Device {
  id: string;
  name: string;
  entityId: string; // e.g., media_player.living_room
  chatId?: string; // Optional chat_id for telegram
  type: DeviceType;
  volumes: VolumeProfile; // Telegram will ignore this, but keeps structure consistent
  enabled: boolean;
}

export interface DNDSchedule {
  enabled: boolean;
  startTime: string; // "22:00"
  endTime: string; // "07:00"
}

export interface GlobalConfig {
  devices: Device[];
  dnd: DNDSchedule;
  shutdownTime: string; // New: Auto shutdown time for speakers
  restoreMusic: boolean; // New: Attempt to restore music after TTS
  timeDefinitions: {
    morningStart: string;
    afternoonStart: string;
    nightStart: string;
  };
}