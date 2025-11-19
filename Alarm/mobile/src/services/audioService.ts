import { Audio } from 'expo-av';
import { Platform } from 'react-native';

let currentSound: Audio.Sound | null = null;

/**
 * Initialize audio mode for playback
 */
export async function initAudio(): Promise<void> {
  if (Platform.OS === 'web') {
    return; // Web doesn't need audio mode setup
  }

  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
  } catch (error) {
    console.error('Error setting audio mode:', error);
  }
}

/**
 * Play a sound file from the library
 */
export async function playSound(soundName: string): Promise<void> {
  try {
    // Stop any currently playing sound
    await stopSound();

    if (soundName === 'default' || !soundName) {
      console.log('Playing default system sound');
      // For now, just log - in production you'd play a system sound
      if (Platform.OS === 'web') {
        console.log('🔔 Sound preview: Would play default alarm sound');
      }
      return;
    }

    // For now, we'll just log which sound would play
    // To add actual sound files, place MP3 files in mobile/assets/sounds/
    console.log(`🔔 Sound preview: Would play ${soundName}`);

    if (Platform.OS === 'web') {
      // On web, we can't play local files easily, so just log
      console.log(`Sound preview: ${soundName}`);
    }

    // Uncomment this when you have actual sound files:
    /*
    const { sound } = await Audio.Sound.createAsync(
      // Map sound names to files
      { uri: `../../assets/sounds/${soundName}` },
      { shouldPlay: true }
    );

    currentSound = sound;

    // Stop after playing once
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        stopSound();
      }
    });
    */
  } catch (error) {
    console.error('Error playing sound:', error);
  }
}

/**
 * Play multiple sounds sequentially (one after another)
 */
export async function playSounds(soundNames: string[], loop: boolean = false): Promise<void> {
  if (soundNames.length === 0) {
    await playSound('default');
    return;
  }

  // For preview, just play the first sound
  if (!loop) {
    await playSound(soundNames[0]);
    return;
  }

  // For actual alarm playback, play all sounds sequentially
  await playSequentially(soundNames);
}

/**
 * Play sounds one after another in sequence
 */
async function playSequentially(soundNames: string[], currentIndex: number = 0): Promise<void> {
  if (currentIndex >= soundNames.length) {
    // All sounds played, loop back to start
    currentIndex = 0;
  }

  const soundName = soundNames[currentIndex];

  try {
    await stopSound();

    if (soundName === 'default' || !soundName) {
      console.log('Playing default system sound');
      // Move to next sound after a delay
      setTimeout(() => playSequentially(soundNames, currentIndex + 1), 3000);
      return;
    }

    console.log(`🔔 Playing sound ${currentIndex + 1}/${soundNames.length}: ${soundName}`);

    if (Platform.OS === 'web') {
      console.log(`Would play: ${soundName}`);
      // Simulate playing and move to next
      setTimeout(() => playSequentially(soundNames, currentIndex + 1), 3000);
      return;
    }

    // Uncomment when you have actual sound files:
    /*
    const { sound } = await Audio.Sound.createAsync(
      { uri: `../../assets/sounds/${soundName}` },
      { shouldPlay: true }
    );

    currentSound = sound;

    // When this sound finishes, play the next one
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        playSequentially(soundNames, currentIndex + 1);
      }
    });
    */
  } catch (error) {
    console.error(`Error playing sound ${soundName}:`, error);
    // Continue to next sound even if this one fails
    setTimeout(() => playSequentially(soundNames, currentIndex + 1), 1000);
  }
}

/**
 * Stop currently playing sound
 */
export async function stopSound(): Promise<void> {
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    } catch (error) {
      console.error('Error stopping sound:', error);
    }
  }
}

/**
 * Check if a sound is currently playing
 */
export async function isPlaying(): Promise<boolean> {
  if (!currentSound) return false;

  try {
    const status = await currentSound.getStatusAsync();
    return status.isLoaded && status.isPlaying;
  } catch (error) {
    return false;
  }
}
