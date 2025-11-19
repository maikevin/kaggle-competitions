import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { FAB, Text, IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Alarm } from '../types';
import AlarmCard from '../components/AlarmCard';
import { alarmAPI } from '../services/apiService';
import { scheduleAlarmNotification, cancelAlarmNotifications, scheduleTestAlarm } from '../services/notificationService';
import { useFontSize } from '../contexts/FontSizeContext';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);
  const { fontScale } = useFontSize();

  const loadAlarms = async () => {
    try {
      const data = await alarmAPI.getAlarms();
      setAlarms(data.sort((a, b) => a.time.localeCompare(b.time)));
    } catch (error) {
      console.error('Error loading alarms:', error);
      Alert.alert('Error', 'Failed to load alarms');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAlarms();
    }, [])
  );

  const handleToggle = async (alarm: Alarm) => {
    try {
      const updatedAlarm = await alarmAPI.toggleAlarm(alarm.id);

      if (updatedAlarm.enabled) {
        await scheduleAlarmNotification(updatedAlarm);
      } else {
        await cancelAlarmNotifications(updatedAlarm.id.toString());
      }

      await loadAlarms();
    } catch (error) {
      console.error('Error toggling alarm:', error);
      Alert.alert('Error', 'Failed to toggle alarm');
    }
  };

  const handleEdit = (alarm: Alarm) => {
    navigation.navigate('AddEditAlarm', { alarm });
  };

  const handleDelete = (alarm: Alarm) => {
    Alert.alert(
      'Delete Alarm',
      'Are you sure you want to delete this alarm?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelAlarmNotifications(alarm.id.toString());
              await alarmAPI.deleteAlarm(alarm.id);
              await loadAlarms();
            } catch (error) {
              console.error('Error deleting alarm:', error);
              Alert.alert('Error', 'Failed to delete alarm');
            }
          },
        },
      ]
    );
  };

  const handleTest = async (alarm: Alarm) => {
    try {
      await scheduleTestAlarm(alarm);
      Alert.alert(
        'Test Alarm Scheduled',
        'Your test alarm will trigger in 5 seconds!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error scheduling test alarm:', error);
      Alert.alert('Error', 'Failed to schedule test alarm');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="cog"
          size={24}
          iconColor="#6200ee"
          onPress={() => navigation.navigate('Settings')}
        />
      </View>
      {alarms.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { fontSize: 20 * fontScale }]}>No alarms yet</Text>
          <Text style={[styles.emptySubtext, { fontSize: 16 * fontScale }]}>Tap the + button to add one</Text>
        </View>
      ) : Platform.OS === 'web' ? (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {alarms.map((item) => (
            <AlarmCard
              key={item.id.toString()}
              alarm={item}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onTest={handleTest}
            />
          ))}
        </ScrollView>
      ) : (
        <FlatList
          data={alarms}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <AlarmCard
              alarm={item}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onTest={handleTest}
            />
          )}
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AddEditAlarm', {})}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
    ...(Platform.OS === 'web' ? {
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
    } : {
      flex: 1,
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    width: '100%',
    ...(Platform.OS === 'web' ? {
      flex: 1,
      overflowY: 'scroll',
      overflowX: 'hidden',
    } : {
      flex: 1,
    }),
  },
  scrollContent: {
    paddingBottom: 80, // Space for FAB
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666666',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});
