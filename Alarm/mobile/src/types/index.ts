export interface Alarm {
  id: number;
  title: string;
  time: string; // Format: "HH:MM"
  enabled: boolean;
  repeat_days: number[]; // 0=Sunday, 1=Monday, etc.
  sound: string;
  snooze_enabled: boolean;
  snooze_duration: number; // Minutes
  vibrate: boolean;
}

export interface AlarmCreate {
  title: string;
  time: string;
  enabled: boolean;
  repeat_days: number[];
  sound: string;
  snooze_enabled: boolean;
  snooze_duration: number;
  vibrate: boolean;
}

export type RootStackParamList = {
  Home: undefined;
  AddEditAlarm: { alarm?: Alarm };
  Settings: undefined;
};
