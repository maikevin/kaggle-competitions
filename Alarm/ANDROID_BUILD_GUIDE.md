# Android Build Guide

Complete guide to building and deploying the Alarm app for Android devices.

## Prerequisites

### 1. Install Required Software

- **Node.js** (v16 or later): [Download here](https://nodejs.org/)
- **Git**: [Download here](https://git-scm.com/)
- **Java JDK 17**: [Download here](https://adoptium.net/)
- **Android Studio**: [Download here](https://developer.android.com/studio)

### 2. Set Up Android Studio

1. Install Android Studio
2. During installation, ensure these components are installed:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device (AVD)

3. Open Android Studio and go to:
   - `Tools` → `SDK Manager` → `SDK Tools`
   - Check and install:
     - Android SDK Build-Tools
     - Android Emulator
     - Android SDK Platform-Tools
     - Android SDK Command-line Tools

### 3. Configure Environment Variables

Add these to your system environment variables:

**Windows:**
```
ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk
JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.x.x-hotspot

Add to PATH:
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
%JAVA_HOME%\bin
```

**macOS/Linux:**
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

Add to `~/.bash_profile`, `~/.zshrc`, or `~/.bashrc`

## Method 1: Build with Expo (Easiest)

### A. Development Build (Testing)

1. Install Expo CLI globally:
```bash
npm install -g expo-cli eas-cli
```

2. Navigate to the mobile directory:
```bash
cd mobile
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npx expo start
```

5. Test on device or emulator:
   - **Physical Device:** Install Expo Go from Play Store, scan QR code
   - **Emulator:** Press `a` to open Android emulator

### B. Production Build with EAS (Cloud Build)

1. Create an Expo account at [expo.dev](https://expo.dev)

2. Login to EAS:
```bash
eas login
```

3. Configure EAS:
```bash
eas build:configure
```

4. Create `eas.json` in the mobile directory (if not created):
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

5. Build APK for testing:
```bash
eas build --platform android --profile preview
```

6. Build AAB for Google Play Store:
```bash
eas build --platform android --profile production
```

7. Download the build when complete (link provided in terminal)

## Method 2: Build Locally (Advanced)

### Step 1: Generate Native Code

1. Navigate to mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Generate Android native code:
```bash
npx expo prebuild --platform android
```

This creates an `android` folder with native Android project files.

### Step 2: Build APK (Debug)

```bash
cd android
./gradlew assembleDebug
```

**Windows:**
```bash
cd android
gradlew.bat assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 3: Build APK (Release - for distribution)

1. Generate a signing key:
```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

Enter a password when prompted (remember this!)

2. Create `android/gradle.properties` (or edit existing):
```properties
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=your_password_here
MYAPP_RELEASE_KEY_PASSWORD=your_password_here
```

3. Edit `android/app/build.gradle`, add this inside the `android` block:
```gradle
signingConfigs {
    release {
        if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
            storeFile file(MYAPP_RELEASE_STORE_FILE)
            storePassword MYAPP_RELEASE_STORE_PASSWORD
            keyAlias MYAPP_RELEASE_KEY_ALIAS
            keyPassword MYAPP_RELEASE_KEY_PASSWORD
        }
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

4. Build release APK:
```bash
cd android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

### Step 4: Build AAB (for Google Play Store)

```bash
cd android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

## Testing the APK

### On Emulator

1. Open Android Studio
2. Go to `Tools` → `AVD Manager`
3. Create a new virtual device or start an existing one
4. Install APK:
```bash
adb install path/to/app-release.apk
```

### On Physical Device

1. Enable Developer Options on your Android device:
   - Go to `Settings` → `About Phone`
   - Tap `Build Number` 7 times

2. Enable USB Debugging:
   - Go to `Settings` → `Developer Options`
   - Enable `USB Debugging`

3. Connect device via USB

4. Verify device is connected:
```bash
adb devices
```

5. Install APK:
```bash
adb install path/to/app-release.apk
```

Or simply transfer the APK to your device and open it to install.

## Publishing to Google Play Store

### 1. Prepare Store Listing

Create the following assets:
- App icon (512x512 px)
- Feature graphic (1024x500 px)
- Screenshots (at least 2, phone and tablet if applicable)
- App description (short and full)
- Privacy policy URL

### 2. Create Developer Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Pay $25 one-time registration fee
3. Complete account setup

### 3. Create App

1. Click "Create app"
2. Fill in app details:
   - App name
   - Default language
   - App or game
   - Free or paid

### 4. Complete Store Listing

Fill in all required information:
- App details
- Graphics
- Categorization
- Contact details
- Privacy policy

### 5. Content Rating

1. Go to "Content rating"
2. Complete the questionnaire
3. Get your content rating

### 6. Set Up Release

1. Go to "Production" → "Create new release"
2. Upload your AAB file (`app-release.aab`)
3. Fill in release notes
4. Review and roll out

### 7. Submit for Review

- Click "Review release"
- Submit for review
- Wait for approval (can take a few hours to a few days)

## Troubleshooting

### Common Issues

**1. Gradle build fails:**
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

**2. "SDK location not found":**
Create `android/local.properties`:
```
sdk.dir=C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
```

**3. Metro bundler issues:**
```bash
npx react-native start --reset-cache
```

**4. ADB not recognized:**
Add Android SDK platform-tools to PATH

**5. Java version issues:**
Ensure Java 17 is installed and JAVA_HOME is set correctly

## Updating the App

1. Update version in `app.json`:
```json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 2
    }
  }
}
```

2. Rebuild and upload new version to Play Store

## Best Practices

1. **Test thoroughly** before releasing
2. **Use ProGuard/R8** for code optimization and obfuscation
3. **Keep signing key secure** - losing it means you can't update your app
4. **Monitor crash reports** in Play Console
5. **Respond to user reviews** promptly
6. **Follow Android best practices** for battery, permissions, etc.

## Additional Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Android Developer Guide](https://developer.android.com/guide)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
