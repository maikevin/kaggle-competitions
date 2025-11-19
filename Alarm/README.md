# Alarm App

A cross-platform alarm application built with React Native (mobile) and Python FastAPI (backend).

## Features

- ⏰ Create, edit, and delete alarms
- 🔄 Recurring alarms (daily, specific days of the week)
- 🎵 Custom alarm sounds/ringtones
- 😴 Snooze functionality with custom duration
- 🔔 Local notifications even when app is closed
- 📱 Works on both Android and iOS

## Tech Stack

### Backend
- Python 3.8+
- FastAPI
- SQLite database

### Mobile (Android & iOS)
- React Native
- TypeScript
- React Navigation
- Expo (for easier development and building)

## Project Structure

```
Alarm/
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI app entry point
│   │   ├── models.py       # Database models
│   │   ├── schemas.py      # Pydantic schemas
│   │   └── database.py     # Database configuration
│   └── requirements.txt
├── mobile/                  # React Native mobile app
│   ├── src/
│   │   ├── screens/        # App screens
│   │   ├── components/     # Reusable components
│   │   ├── services/       # API and notification services
│   │   └── types/          # TypeScript types
│   └── package.json
└── README.md
```

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

The API will be available at `http://localhost:8000`

### Mobile App Setup

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Run on device/simulator:
   - Press `a` for Android
   - Press `i` for iOS (macOS only)
   - Scan QR code with Expo Go app on your phone

## Building for Production

### Android APK/AAB

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Configure EAS:
   ```bash
   cd mobile
   eas build:configure
   ```

3. Build APK (for testing):
   ```bash
   eas build --platform android --profile preview
   ```

4. Build AAB (for Google Play Store):
   ```bash
   eas build --platform android --profile production
   ```

### iOS IPA

1. Requirements:
   - macOS computer
   - Apple Developer account ($99/year)
   - Xcode installed

2. Build for iOS:
   ```bash
   eas build --platform ios --profile production
   ```

3. Submit to App Store:
   ```bash
   eas submit --platform ios
   ```

## Alternative: Build Locally

### Android (Local Build)

1. Prebuild the app:
   ```bash
   npx expo prebuild --platform android
   ```

2. Build APK:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

### iOS (Local Build - macOS only)

1. Prebuild the app:
   ```bash
   npx expo prebuild --platform ios
   ```

2. Open in Xcode:
   ```bash
   open ios/YourAppName.xcworkspace
   ```

3. Build and archive in Xcode:
   - Select "Any iOS Device" as the target
   - Product → Archive
   - Follow the distribution wizard

## Environment Configuration

Create a `.env` file in the mobile directory:

```
API_URL=http://YOUR_BACKEND_URL:8000
```

For local development, use:
- Android emulator: `http://10.0.2.2:8000`
- iOS simulator: `http://localhost:8000`
- Physical device: `http://YOUR_LOCAL_IP:8000`

## License

MIT
