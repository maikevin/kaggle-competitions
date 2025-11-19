import axios from 'axios';
import { Platform } from 'react-native';
import { Alarm, AlarmCreate } from '../types';

// Change this to your backend URL
// For local development:
// - Web: http://localhost:8000
// - Android emulator: http://10.0.2.2:8000
// - iOS simulator: http://localhost:8000
// - Physical device: http://YOUR_LOCAL_IP:8000
const API_URL = Platform.OS === 'web'
  ? 'http://localhost:8000'
  : Platform.OS === 'ios'
  ? 'http://localhost:8000'
  : 'http://10.0.2.2:8000'; // Default for Android emulator

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const alarmAPI = {
  // Get all alarms
  getAlarms: async (): Promise<Alarm[]> => {
    const response = await api.get<Alarm[]>('/alarms/');
    return response.data;
  },

  // Get a single alarm
  getAlarm: async (id: number): Promise<Alarm> => {
    const response = await api.get<Alarm>(`/alarms/${id}`);
    return response.data;
  },

  // Create a new alarm
  createAlarm: async (alarm: AlarmCreate): Promise<Alarm> => {
    const response = await api.post<Alarm>('/alarms/', alarm);
    return response.data;
  },

  // Update an alarm
  updateAlarm: async (id: number, alarm: Partial<AlarmCreate>): Promise<Alarm> => {
    const response = await api.put<Alarm>(`/alarms/${id}`, alarm);
    return response.data;
  },

  // Delete an alarm
  deleteAlarm: async (id: number): Promise<void> => {
    await api.delete(`/alarms/${id}`);
  },

  // Toggle alarm enabled/disabled
  toggleAlarm: async (id: number): Promise<Alarm> => {
    const response = await api.patch<Alarm>(`/alarms/${id}/toggle`);
    return response.data;
  },
};

export default api;
