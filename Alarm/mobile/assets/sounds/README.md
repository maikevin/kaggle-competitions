# Alarm Sounds

This directory contains your alarm sound files.

## How to Add New Sound Files

1. **Add the sound file**: Place your .mp3 or .wav file in this directory
   - Example: `Valued_Employee.wav` (already present)

2. **Register the file**: Open `mobile/src/services/musicLibraryService.ts`
   - Add an entry to the `AVAILABLE_SOUNDS` array with this format:
   ```typescript
   {
     filename: 'YourSong.mp3',
     displayName: 'Your Song',
     duration: '3:45',
     durationSeconds: 225
   },
   ```

3. **Get the duration**:
   - Play the file and note its length
   - Format as "MM:SS" (e.g., "2:28" for 2 minutes 28 seconds)
   - Convert to seconds for durationSeconds (e.g., 148 seconds)

4. **Restart the app**: The new sound will appear in the alarm creation screen with its duration

## Supported Formats

- `.mp3` - MP3 audio files
- `.wav` - WAV audio files
- `.m4a` - M4A audio files

## Current Files

- `Valued_Employee.wav` - Currently available alarm sound

## File Naming

- Use underscores `_` instead of spaces (they will be converted to spaces in the UI)
- Example: `Valued_Employee.wav` displays as "Valued Employee"
- Keep filenames descriptive and concise
