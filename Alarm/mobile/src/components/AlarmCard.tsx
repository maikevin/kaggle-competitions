import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Switch, IconButton } from 'react-native-paper';
import { Alarm } from '../types';
import { formatRepeatDays } from '../services/notificationService';
import { useFontSize } from '../contexts/FontSizeContext';
import { playSound, playSounds, stopSound } from '../services/audioService';

interface AlarmCardProps {
  alarm: Alarm;
  onToggle: (alarm: Alarm) => void;
  onEdit: (alarm: Alarm) => void;
  onDelete: (alarm: Alarm) => void;
  onTest: (alarm: Alarm) => void;
}

export default function AlarmCard({ alarm, onToggle, onEdit, onDelete, onTest }: AlarmCardProps) {
  const { fontScale } = useFontSize();
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  const getMusicDisplay = () => {
    if (!alarm.sound || alarm.sound === 'default') {
      return 'Default sound';
    }
    const songs = alarm.sound.split(',');
    if (songs.length === 1) {
      return songs[0].replace('.mp3', '');
    }
    return `${songs.length} songs`;
  };

  const handlePreviewSound = async () => {
    try {
      if (isPlayingSound) {
        await stopSound();
        setIsPlayingSound(false);
      } else {
        setIsPlayingSound(true);
        if (!alarm.sound || alarm.sound === 'default') {
          await playSound('default');
        } else {
          const songs = alarm.sound.split(',');
          await playSounds(songs);
        }
        // Reset after 3 seconds (assuming preview is short)
        setTimeout(() => setIsPlayingSound(false), 3000);
      }
    } catch (error) {
      console.error('Error previewing sound:', error);
      setIsPlayingSound(false);
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.container}>
          <View style={styles.leftContent}>
            <Text style={[styles.time, { fontSize: 32 * fontScale }]}>{alarm.time}</Text>
            <Text style={[styles.title, { fontSize: 16 * fontScale }]}>{alarm.title}</Text>
            <Text style={[styles.repeat, { fontSize: 14 * fontScale }]}>{formatRepeatDays(alarm.repeat_days)}</Text>
            <Text style={[styles.music, { fontSize: 12 * fontScale }]}>🎵 {getMusicDisplay()}</Text>
            <View style={styles.previewActions}>
              <IconButton
                icon={isPlayingSound ? "stop" : "play"}
                size={16 * fontScale}
                iconColor="#6200ee"
                onPress={handlePreviewSound}
                style={styles.previewButton}
              />
              <IconButton
                icon="alarm-check"
                size={16 * fontScale}
                iconColor="#00a000"
                onPress={() => onTest(alarm)}
                style={styles.testButton}
              />
            </View>
          </View>

          <View style={styles.rightContent}>
            <Switch
              value={alarm.enabled}
              onValueChange={() => onToggle(alarm)}
              color="#6200ee"
            />
            <View style={styles.actions}>
              <IconButton
                icon="pencil"
                size={20 * fontScale}
                onPress={() => onEdit(alarm)}
              />
              <IconButton
                icon="delete"
                size={20 * fontScale}
                onPress={() => onDelete(alarm)}
              />
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContent: {
    flex: 1,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
  },
  title: {
    fontSize: 16,
    marginTop: 4,
    color: '#333333',
  },
  repeat: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  music: {
    fontSize: 12,
    color: '#6200ee',
    marginTop: 4,
  },
  previewActions: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
  },
  previewButton: {
    margin: 0,
    marginRight: 4,
  },
  testButton: {
    margin: 0,
    marginRight: 4,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 8,
  },
});
