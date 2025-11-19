import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Platform, Alert, SafeAreaView, KeyboardAvoidingView } from 'react-native';
import { TextInput, Button, Switch, Text, Chip, List } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, AlarmCreate } from '../types';
import { alarmAPI } from '../services/apiService';
import { scheduleAlarmNotification, getDayName } from '../services/notificationService';
import { useFontSize } from '../contexts/FontSizeContext';
import { getMusicLibrary, formatMusicName, MusicFile } from '../services/musicLibraryService';

type AddEditAlarmScreenRouteProp = RouteProp<RootStackParamList, 'AddEditAlarm'>;
type AddEditAlarmScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddEditAlarm'>;

interface Props {
  route: AddEditAlarmScreenRouteProp;
  navigation: AddEditAlarmScreenNavigationProp;
}

export default function AddEditAlarmScreen({ route, navigation }: Props) {
  const isEdit = !!route.params?.alarm;
  const alarm = route.params?.alarm;
  const { fontScale } = useFontSize();

  const [title, setTitle] = useState(alarm?.title || 'Alarm');
  const [hourTens, setHourTens] = useState(() => {
    if (alarm?.time) {
      const [h] = alarm.time.split(':').map(Number);
      return Math.floor(h / 10);
    }
    return Math.floor(new Date().getHours() / 10);
  });
  const [hourOnes, setHourOnes] = useState(() => {
    if (alarm?.time) {
      const [h] = alarm.time.split(':').map(Number);
      return h % 10;
    }
    return new Date().getHours() % 10;
  });
  const [minuteTens, setMinuteTens] = useState(() => {
    if (alarm?.time) {
      const [, m] = alarm.time.split(':').map(Number);
      return Math.floor(m / 10);
    }
    return 0;
  });
  const [minuteOnes, setMinuteOnes] = useState(() => {
    if (alarm?.time) {
      const [, m] = alarm.time.split(':').map(Number);
      return m % 10;
    }
    return 0;
  });
  const [enabled, setEnabled] = useState(alarm?.enabled ?? true);
  const [repeatDays, setRepeatDays] = useState<number[]>(alarm?.repeat_days || []);
  const [snoozeEnabled, setSnoozeEnabled] = useState(alarm?.snooze_enabled ?? true);
  const [snoozeDuration, setSnoozeDuration] = useState(alarm?.snooze_duration?.toString() || '5');
  const [vibrate, setVibrate] = useState(alarm?.vibrate ?? true);
  const [selectedMusic, setSelectedMusic] = useState<string[]>(
    alarm?.sound && alarm.sound !== 'default' ? alarm.sound.split(',') : []
  );
  const [is24Hour, setIs24Hour] = useState(true);
  const [isPM, setIsPM] = useState(() => {
    if (alarm?.time) {
      const [h] = alarm.time.split(':').map(Number);
      return h >= 12;
    }
    return new Date().getHours() >= 12;
  });

  // Refs for scrolling to sections
  const topRef = React.useRef<View>(null);
  const musicSectionRef = React.useRef<View>(null);
  const snoozeSectionRef = React.useRef<View>(null);

  const scrollToSection = (ref: React.RefObject<View>) => {
    if (ref.current && Platform.OS === 'web') {
      // @ts-ignore - web-specific scrollIntoView
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const days = [
    { num: 0, name: 'Sun' },
    { num: 1, name: 'Mon' },
    { num: 2, name: 'Tue' },
    { num: 3, name: 'Wed' },
    { num: 4, name: 'Thu' },
    { num: 5, name: 'Fri' },
    { num: 6, name: 'Sat' },
  ];

  const toggleDay = (day: number) => {
    if (repeatDays.includes(day)) {
      setRepeatDays(repeatDays.filter(d => d !== day));
    } else {
      setRepeatDays([...repeatDays, day].sort());
    }
  };

  const getHours = () => {
    const displayHours = hourTens * 10 + hourOnes;
    if (is24Hour) {
      return displayHours;
    } else {
      // Convert 12-hour to 24-hour
      if (displayHours === 12) {
        return isPM ? 12 : 0;
      }
      return isPM ? displayHours + 12 : displayHours;
    }
  };

  const getMinutes = () => minuteTens * 10 + minuteOnes;

  const formatTime = (h: number, m: number): string => {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const handleHourTensChange = (value: number) => {
    setHourTens(value);
    // If changing to 2, and hourOnes is greater than 3, reset to 0
    if (value === 2 && hourOnes > 3) {
      setHourOnes(0);
    }
  };

  const handleHourOnesChange = (value: number) => {
    setHourOnes(value);
  };

  // Slot 1: Always 0-2 (for hours 00-23)
  const getSlot1Options = () => {
    return [0, 1, 2];
  };

  // Slot 2: Depends on Slot 1
  // If hourTens is 2, only allow 0-3 (for 20-23)
  // Otherwise allow 0-9
  const getSlot2Options = () => {
    if (hourTens === 2) {
      return [0, 1, 2, 3]; // Max hour is 23
    }
    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  };

  // Slot 3: Minute tens - only allow 0-5 (for minutes 00-59)
  const getSlot3Options = () => {
    return [0, 1, 2, 3, 4, 5];
  };

  // Slot 4: Minute ones - always 0-9
  const getSlot4Options = () => {
    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  };

  const handleFormatToggle = () => {
    const currentHour24 = getHours();
    setIs24Hour(!is24Hour);

    if (!is24Hour) {
      // Switching to 24-hour
      setHourTens(Math.floor(currentHour24 / 10));
      setHourOnes(currentHour24 % 10);
    } else {
      // Switching to 12-hour
      let hour12 = currentHour24 % 12;
      if (hour12 === 0) hour12 = 12;
      setHourTens(Math.floor(hour12 / 10));
      setHourOnes(hour12 % 10);
      setIsPM(currentHour24 >= 12);
    }
  };

  // Load music library dynamically
  const [musicLibrary, setMusicLibrary] = useState<MusicFile[]>([]);

  useEffect(() => {
    // Load available music files when component mounts
    const loadMusicLibrary = async () => {
      const files = await getMusicLibrary();
      setMusicLibrary(files);
    };
    loadMusicLibrary();
  }, []);

  const toggleMusic = (music: string) => {
    if (selectedMusic.includes(music)) {
      setSelectedMusic(selectedMusic.filter(m => m !== music));
    } else {
      setSelectedMusic([...selectedMusic, music]);
    }
  };

  const handleSave = async () => {
    const alarmData: AlarmCreate = {
      title,
      time: formatTime(getHours(), getMinutes()),
      enabled,
      repeat_days: repeatDays,
      sound: selectedMusic.length > 0 ? selectedMusic.join(',') : 'default',
      snooze_enabled: snoozeEnabled,
      snooze_duration: parseInt(snoozeDuration, 10),
      vibrate,
    };

    try {
      let savedAlarm;
      if (isEdit && alarm) {
        savedAlarm = await alarmAPI.updateAlarm(alarm.id, alarmData);
      } else {
        savedAlarm = await alarmAPI.createAlarm(alarmData);
      }

      if (savedAlarm.enabled) {
        await scheduleAlarmNotification(savedAlarm);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving alarm:', error);
      Alert.alert('Error', 'Failed to save alarm');
    }
  };

  const ScrollContainer = Platform.OS === 'web' ? View : ScrollView;

  return (
    <View style={styles.safeArea}>
      <View style={styles.wrapper}>
        <ScrollContainer
          style={styles.container}
          {...(Platform.OS !== 'web' && {
            contentContainerStyle: styles.scrollContent,
            showsVerticalScrollIndicator: true,
          })}
        >
          <View style={styles.innerContainer}>

          {/* Quick Navigation Buttons */}
          {Platform.OS === 'web' && (
            <View style={styles.quickNav} ref={topRef}>
              <Button
                mode="outlined"
                onPress={() => scrollToSection(musicSectionRef)}
                style={styles.navButton}
                compact
                labelStyle={{ fontSize: 12 * fontScale }}
              >
                ⬇️ Music
              </Button>
              <Button
                mode="outlined"
                onPress={() => scrollToSection(snoozeSectionRef)}
                style={styles.navButton}
                compact
                labelStyle={{ fontSize: 12 * fontScale }}
              >
                ⬇️ Snooze
              </Button>
            </View>
          )}

          <View style={styles.section}>
        <Text style={[styles.label, { fontSize: 16 * fontScale }]}>Title</Text>
        <TextInput
          mode="outlined"
          value={title}
          onChangeText={setTitle}
          placeholder="Alarm"
          style={{ fontSize: 16 * fontScale, backgroundColor: '#ffffff' }}
          outlineColor="#6200ee"
          activeOutlineColor="#6200ee"
          textColor="#000000"
          placeholderTextColor="#999999"
          theme={{ colors: { background: '#ffffff' } }}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.timeHeader}>
          <Text style={[styles.label, { fontSize: 16 * fontScale }]}>Time</Text>
          <View style={styles.formatToggleContainer}>
            <Button
              mode={is24Hour ? 'contained' : 'outlined'}
              onPress={handleFormatToggle}
              style={styles.formatButton}
              labelStyle={{ fontSize: 12 * fontScale }}
              compact
            >
              24H
            </Button>
            <Button
              mode={!is24Hour ? 'contained' : 'outlined'}
              onPress={handleFormatToggle}
              style={styles.formatButton}
              labelStyle={{ fontSize: 12 * fontScale }}
              compact
            >
              12H
            </Button>
          </View>
        </View>
        <View style={styles.digitalClockContainer}>
          {/* Slot 1: Hour Tens (0-2) */}
          <View style={styles.digitContainer}>
            <Picker
              selectedValue={hourTens}
              onValueChange={handleHourTensChange}
              style={[styles.digitPicker, { fontSize: 48, color: '#000000', fontWeight: 'bold' }]}
            >
              {getSlot1Options().map((digit) => (
                <Picker.Item
                  key={digit}
                  label={digit.toString()}
                  value={digit}
                  style={{ fontSize: 48 }}
                />
              ))}
            </Picker>
          </View>

          {/* Slot 2: Hour Ones (0-9) */}
          <View style={styles.digitContainer}>
            <Picker
              selectedValue={hourOnes}
              onValueChange={handleHourOnesChange}
              style={[styles.digitPicker, { fontSize: 48, color: '#000000', fontWeight: 'bold' }]}
            >
              {getSlot2Options().map((digit) => (
                <Picker.Item
                  key={digit}
                  label={digit.toString()}
                  value={digit}
                  style={{ fontSize: 48 }}
                />
              ))}
            </Picker>
          </View>

          {/* Colon */}
          <Text style={[styles.clockColon, { fontSize: 48 * fontScale }]}>:</Text>

          {/* Slot 3: Minute Tens (0-9) */}
          <View style={styles.digitContainer}>
            <Picker
              selectedValue={minuteTens}
              onValueChange={setMinuteTens}
              style={[styles.digitPicker, { fontSize: 48, color: '#000000', fontWeight: 'bold' }]}
            >
              {getSlot3Options().map((digit) => (
                <Picker.Item
                  key={digit}
                  label={digit.toString()}
                  value={digit}
                  style={{ fontSize: 48 }}
                />
              ))}
            </Picker>
          </View>

          {/* Slot 4: Minute Ones (0-9) */}
          <View style={styles.digitContainer}>
            <Picker
              selectedValue={minuteOnes}
              onValueChange={setMinuteOnes}
              style={[styles.digitPicker, { fontSize: 48, color: '#000000', fontWeight: 'bold' }]}
            >
              {getSlot4Options().map((digit) => (
                <Picker.Item
                  key={digit}
                  label={digit.toString()}
                  value={digit}
                  style={{ fontSize: 48 }}
                />
              ))}
            </Picker>
          </View>

          {/* AM/PM Toggle for 12-hour */}
          {!is24Hour && (
            <View style={styles.ampmContainer}>
              <Button
                mode={!isPM ? 'contained' : 'outlined'}
                onPress={() => setIsPM(false)}
                style={styles.ampmButton}
                labelStyle={[styles.ampmButtonLabel, { fontSize: 14 * fontScale }]}
                compact
              >
                AM
              </Button>
              <Button
                mode={isPM ? 'contained' : 'outlined'}
                onPress={() => setIsPM(true)}
                style={styles.ampmButton}
                labelStyle={[styles.ampmButtonLabel, { fontSize: 14 * fontScale }]}
                compact
              >
                PM
              </Button>
            </View>
          )}
        </View>
        <Text style={[styles.timeDisplay, { fontSize: 36 * fontScale }]}>
          {formatTime(getHours(), getMinutes())}
          {!is24Hour && <Text style={{ fontSize: 24 * fontScale }}> {isPM ? 'PM' : 'AM'}</Text>}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { fontSize: 16 * fontScale }]}>Repeat</Text>
        <View style={styles.daysContainer}>
          {days.map(day => (
            <Chip
              key={day.num}
              selected={repeatDays.includes(day.num)}
              onPress={() => toggleDay(day.num)}
              style={[
                styles.dayChip,
                repeatDays.includes(day.num) && styles.dayChipSelected
              ]}
              textStyle={[
                styles.dayChipText,
                { fontSize: 12 * fontScale },
                repeatDays.includes(day.num) && styles.dayChipTextSelected
              ]}
              selectedColor="#ffffff"
            >
              {day.name}
            </Chip>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={[styles.rowText, { fontSize: 16 * fontScale }]}>Enabled</Text>
          <Switch value={enabled} onValueChange={setEnabled} color="#6200ee" />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={[styles.rowText, { fontSize: 16 * fontScale }]}>Vibrate</Text>
          <Switch value={vibrate} onValueChange={setVibrate} color="#6200ee" />
        </View>
      </View>

      <View style={styles.section} ref={musicSectionRef}>
        <Text style={[styles.label, { fontSize: 16 * fontScale }]}>Alarm Sound</Text>
        <Text style={[styles.musicSubtext, { fontSize: 14 * fontScale }]}>
          {selectedMusic.length === 0
            ? 'Default alarm sound'
            : selectedMusic.length === 1
            ? '1 song selected'
            : `${selectedMusic.length} songs selected - will play sequentially`}
        </Text>
        {selectedMusic.length > 1 && (
          <Text style={[styles.musicHelpText, { fontSize: 12 * fontScale }]}>
            ℹ️ Multiple songs will play one after another in order
          </Text>
        )}
        <View style={styles.musicList}>
          {musicLibrary.length === 0 ? (
            <Text style={[styles.noMusicText, { fontSize: 14 * fontScale }]}>
              No music files found. Add .mp3 or .wav files to mobile/assets/sounds/
            </Text>
          ) : (
            musicLibrary.map((musicFile) => {
              const isSelected = selectedMusic.includes(musicFile.filename);
              return (
                <View
                  key={musicFile.filename}
                  style={[
                    styles.musicItem,
                    isSelected && styles.musicItemSelected
                  ]}
                >
                  <Switch
                    value={isSelected}
                    onValueChange={() => toggleMusic(musicFile.filename)}
                    color="#6200ee"
                    style={styles.musicSwitch}
                  />
                  <View style={styles.musicInfo}>
                    <View style={styles.musicTitleRow}>
                      <Text style={[styles.musicTitle, { fontSize: 15 * fontScale }]}>
                        {musicFile.displayName}
                      </Text>
                      {musicFile.duration && (
                        <Text style={[styles.musicDuration, { fontSize: 12 * fontScale }]}>
                          {musicFile.duration}
                        </Text>
                      )}
                    </View>
                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <Text style={[styles.selectedBadgeText, { fontSize: 10 * fontScale }]}>
                          ✓ Selected
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </View>

      <View style={styles.section} ref={snoozeSectionRef}>
        <View style={styles.row}>
          <Text style={[styles.rowText, { fontSize: 16 * fontScale }]}>Snooze</Text>
          <Switch value={snoozeEnabled} onValueChange={setSnoozeEnabled} color="#6200ee" />
        </View>
        {snoozeEnabled && (
          <View style={styles.snoozeInput}>
            <Text style={[styles.rowText, { fontSize: 16 * fontScale }]}>Snooze duration (minutes)</Text>
            <TextInput
              mode="outlined"
              value={snoozeDuration}
              onChangeText={setSnoozeDuration}
              keyboardType="numeric"
              style={[styles.durationInput, { fontSize: 16 * fontScale }]}
            />
          </View>
        )}
      </View>

          {/* Back to Top Button (Web only) */}
          {Platform.OS === 'web' && (
            <Button
              mode="outlined"
              onPress={() => scrollToSection(topRef)}
              style={styles.backToTopButton}
              labelStyle={{ fontSize: 14 * fontScale }}
              icon="arrow-up"
            >
              ⬆️ Back to Top
            </Button>
          )}

          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.saveButton}
            labelStyle={{ fontSize: 16 * fontScale, color: '#ffffff', fontWeight: 'bold' }}
            buttonColor="#6200ee"
            contentStyle={{ paddingVertical: 8 }}
          >
            <Text style={{ color: '#ffffff', fontSize: 16 * fontScale, fontWeight: 'bold' }}>
              {isEdit ? 'Update Alarm' : 'Create Alarm'}
            </Text>
          </Button>
        </View>
      </ScrollContainer>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    ...(Platform.OS === 'web' && {
      overflow: 'auto',
      height: '100vh',
    }),
  },
  wrapper: {
    flex: 1,
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      overflow: 'auto',
    }),
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 500,
    ...(Platform.OS === 'web' && {
      overflowY: 'scroll',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
    }),
  },
  scrollContent: {
    paddingBottom: 50,
  },
  innerContainer: {
    backgroundColor: '#ffffff',
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  navButton: {
    borderColor: '#6200ee',
  },
  backToTopButton: {
    margin: 16,
    marginBottom: 8,
    borderColor: '#6200ee',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000000',
  },
  timeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  formatToggleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  formatButton: {
    minWidth: 50,
  },
  digitalClockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  digitContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: '#d0d0d0',
    width: 70,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  digitPicker: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  digitPickerItem: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    height: 90,
  },
  clockColon: {
    color: '#000000',
    fontWeight: 'bold',
    marginHorizontal: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  timeDisplay: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#6200ee',
    marginTop: 16,
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  ampmContainer: {
    flexDirection: 'column',
    marginLeft: 16,
    gap: 8,
  },
  ampmButton: {
    minWidth: 60,
    backgroundColor: '#2d2d2d',
    borderColor: '#00ff00',
    borderWidth: 2,
  },
  ampmButtonLabel: {
    color: '#00ff00',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    marginVertical: 4,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#d0d0d0',
  },
  dayChipSelected: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  dayChipText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '600',
  },
  dayChipTextSelected: {
    color: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowText: {
    fontSize: 16,
    color: '#000000',
  },
  snoozeInput: {
    marginTop: 16,
  },
  durationInput: {
    marginTop: 8,
  },
  saveButton: {
    margin: 16,
    marginBottom: 32,
    backgroundColor: '#6200ee',
    borderRadius: 8,
    elevation: 3,
  },
  musicSubtext: {
    color: '#6200ee',
    marginTop: 4,
    marginBottom: 12,
    fontWeight: '600',
  },
  musicHelpText: {
    color: '#666666',
    marginTop: 4,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  musicList: {
    marginTop: 8,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 8,
  },
  musicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  musicItemSelected: {
    backgroundColor: '#f3e5f5',
    borderColor: '#6200ee',
    borderWidth: 2,
  },
  musicSwitch: {
    marginRight: 12,
  },
  musicInfo: {
    flex: 1,
  },
  musicTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  musicTitle: {
    color: '#000000',
    fontWeight: '600',
    flex: 1,
  },
  musicDuration: {
    color: '#666666',
    fontWeight: '400',
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  selectedBadge: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  selectedBadgeText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 10,
  },
  noMusicText: {
    color: '#666666',
    textAlign: 'center',
    padding: 16,
    fontStyle: 'italic',
  },
});
