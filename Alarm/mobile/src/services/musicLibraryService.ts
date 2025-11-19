import { Platform } from 'react-native';
import { Audio } from 'expo-av';

export interface MusicFile {
  filename: string;
  displayName: string;
  duration?: string; // Duration in "MM:SS" format
  durationSeconds?: number;
}

/**
 * Manually list music files available in the sounds directory.
 * Since React Native/Expo cannot dynamically scan asset directories,
 * you need to manually add filenames here when you add new sound files.
 *
 * To add a new sound file:
 * 1. Place the .mp3 or .wav file in mobile/assets/sounds/
 * 2. Add the filename to the array below with approximate duration
 */
const AVAILABLE_SOUNDS: MusicFile[] = [
  {
    filename: 'Valued_Employee.wav',
    displayName: 'Valued Employee',
    duration: '2:28',
    durationSeconds: 148
  },
  // Add more sound files here as you add them to assets/sounds/
  // Example:
  // { filename: 'Gentle Morning.mp3', displayName: 'Gentle Morning', duration: '3:45', durationSeconds: 225 },
  // { filename: 'Piano Sunrise.mp3', displayName: 'Piano Sunrise', duration: '2:30', durationSeconds: 150 },
];

/**
 * Get list of available music files from the sounds directory
 */
export async function getMusicLibrary(): Promise<MusicFile[]> {
  try {
    // Return the list of available sound files
    return AVAILABLE_SOUNDS;
  } catch (error) {
    console.error('Error loading music library:', error);
    return AVAILABLE_SOUNDS;
  }
}

/**
 * Get list of filenames only (for backward compatibility)
 */
export async function getMusicFilenames(): Promise<string[]> {
  const library = await getMusicLibrary();
  return library.map(item => item.filename);
}

/**
 * Get the URI for a music file
 */
export function getMusicFileUri(filename: string): string {
  // For assets bundled with the app
  if (Platform.OS === 'web') {
    return `/assets/sounds/${filename}`;
  }

  // For mobile, files are bundled as assets
  // The actual require will be handled by the audio service
  return `sounds/${filename}`;
}

/**
 * Format the display name for a music file
 */
export function formatMusicName(filename: string): string {
  return filename
    .replace(/\.(mp3|wav|m4a)$/i, '')
    .replace(/_/g, ' ');
}
