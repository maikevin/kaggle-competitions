import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Alarm } from '../types';

// Configure notification behavior (skip on web)
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Request notification permissions and setup
 */
export async function setupNotifications() {
  // Notifications are not supported on web
  if (Platform.OS === 'web') {
    console.log('Notifications are not supported on web platform');
    return true;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push notification permissions!');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('alarms', {
        name: 'Alarms',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
        enableVibrate: true,
      });
    }

    return true;
  } catch (error) {
    console.error('Error setting up notifications:', error);
    return false;
  }
}

/**
 * Schedule a notification for an alarm
 */
export async function scheduleAlarmNotification(alarm: Alarm): Promise<string[]> {
  // Skip on web platform
  if (Platform.OS === 'web') {
    console.log('Notification scheduling skipped on web platform');
    return [];
  }

  const [hours, minutes] = alarm.time.split(':').map(Number);

  // Cancel existing notifications for this alarm
  await cancelAlarmNotifications(alarm.id.toString());

  const notificationIds: string[] = [];

  if (alarm.repeat_days.length === 0) {
    // One-time alarm
    const trigger = new Date();
    trigger.setHours(hours, minutes, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (trigger <= new Date()) {
      trigger.setDate(trigger.getDate() + 1);
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: alarm.title,
        body: `Alarm: ${alarm.time}`,
        sound: alarm.sound !== 'default' ? alarm.sound : 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        vibrate: alarm.vibrate ? [0, 250, 250, 250] : undefined,
        data: { alarmId: alarm.id, snoozeEnabled: alarm.snooze_enabled },
      },
      trigger,
    });

    notificationIds.push(id);
  } else {
    // Recurring alarm - schedule for each selected day
    for (const day of alarm.repeat_days) {
      const trigger: Notifications.CalendarNotificationTrigger = {
        weekday: day === 0 ? 1 : day + 1, // Expo uses 1=Sunday, so convert from 0=Sunday
        hour: hours,
        minute: minutes,
        repeats: true,
      };

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: alarm.title,
          body: `Alarm: ${alarm.time}`,
          sound: alarm.sound !== 'default' ? alarm.sound : 'default',
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: alarm.vibrate ? [0, 250, 250, 250] : undefined,
          data: { alarmId: alarm.id, snoozeEnabled: alarm.snooze_enabled },
        },
        trigger,
      });

      notificationIds.push(id);
    }
  }

  // Store notification IDs for this alarm
  await storeNotificationIds(alarm.id.toString(), notificationIds);

  return notificationIds;
}

/**
 * Cancel all notifications for a specific alarm
 */
export async function cancelAlarmNotifications(alarmId: string): Promise<void> {
  // Skip on web platform
  if (Platform.OS === 'web') {
    console.log('Notification cancellation skipped on web platform');
    return;
  }

  const notificationIds = await getNotificationIds(alarmId);
  if (notificationIds) {
    await Notifications.cancelScheduledNotificationAsync(notificationIds);
  }
}

/**
 * Snooze an alarm notification
 */
export async function snoozeAlarm(alarmId: number, snoozeDuration: number, alarmTitle: string, alarmTime: string): Promise<void> {
  const trigger = new Date();
  trigger.setMinutes(trigger.getMinutes() + snoozeDuration);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${alarmTitle} (Snoozed)`,
      body: `Alarm snoozed for ${snoozeDuration} minutes`,
      sound: 'default',
      priority: Notifications.AndroidNotificationPriority.MAX,
      data: { alarmId, snoozeEnabled: true },
    },
    trigger,
  });
}

// Helper functions for storing notification IDs
async function storeNotificationIds(alarmId: string, ids: string[]): Promise<void> {
  // In a real app, you might want to use AsyncStorage or a database
  // For simplicity, we're using a simple object (note: this won't persist across app restarts)
  (global as any).notificationIds = (global as any).notificationIds || {};
  (global as any).notificationIds[alarmId] = ids;
}

async function getNotificationIds(alarmId: string): Promise<string[] | null> {
  const ids = (global as any).notificationIds?.[alarmId];
  return ids || null;
}

/**
 * Get day name from day number
 */
export function getDayName(day: number): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[day];
}

/**
 * Format repeat days for display
 */
export function formatRepeatDays(days: number[]): string {
  if (days.length === 0) return 'Once';
  if (days.length === 7) return 'Every day';

  const weekdays = [1, 2, 3, 4, 5];
  const weekend = [0, 6];

  if (days.length === 5 && weekdays.every(d => days.includes(d))) {
    return 'Weekdays';
  }

  if (days.length === 2 && weekend.every(d => days.includes(d))) {
    return 'Weekends';
  }

  return days.map(getDayName).join(', ');
}

/**
 * Schedule a test alarm notification in 5 seconds
 */
export async function scheduleTestAlarm(alarm: Alarm): Promise<string | null> {
  // Skip on web platform
  if (Platform.OS === 'web') {
    console.log('Test alarm: This would trigger in 5 seconds on mobile');
    // For web, we'll just show an alert after 5 seconds
    setTimeout(() => {
      alert(`Test Alarm: ${alarm.title}\nTime: ${alarm.time}\n\nThis is how your alarm will appear!`);
    }, 5000);
    return null;
  }

  try {
    const trigger = new Date();
    trigger.setSeconds(trigger.getSeconds() + 5);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `🧪 TEST: ${alarm.title}`,
        body: `This is a test of your alarm set for ${alarm.time}`,
        sound: alarm.sound !== 'default' ? alarm.sound : 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        vibrate: alarm.vibrate ? [0, 250, 250, 250] : undefined,
        data: { alarmId: alarm.id, isTest: true },
      },
      trigger,
    });

    return id;
  } catch (error) {
    console.error('Error scheduling test alarm:', error);
    return null;
  }
}
