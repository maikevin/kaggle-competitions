# iOS Build Guide

Complete guide to building and deploying the Alarm app for iOS devices.

## Prerequisites

### Required

- **macOS computer** (iOS apps can only be built on macOS)
- **Xcode 14 or later**: [Download from Mac App Store](https://apps.apple.com/app/xcode/id497799835)
- **Node.js** (v16 or later): [Download here](https://nodejs.org/)
- **CocoaPods**: Install via terminal:
  ```bash
  sudo gem install cocoapods
  ```
- **Apple Developer Account**: [$99/year](https://developer.apple.com/programs/)

### Optional (for testing)

- **iOS device** (iPhone or iPad)
- **iOS Simulator** (included with Xcode)

## Method 1: Build with Expo (Easiest)

### A. Development Build (Testing)

1. Install Expo CLI:
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

5. Test on device or simulator:
   - **iOS Simulator:** Press `i` to open iOS simulator
   - **Physical Device:** Install Expo Go from App Store, scan QR code

### B. Production Build with EAS (Cloud Build)

EAS Build allows you to build iOS apps in the cloud without needing a Mac (though you still need a Mac for final testing).

1. Create an Expo account at [expo.dev](https://expo.dev)

2. Login to EAS:
```bash
eas login
```

3. Configure EAS:
```bash
eas build:configure
```

4. Create/Update `eas.json` in the mobile directory:
```json
{
  "build": {
    "development": {
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "ios": {
        "simulator": false,
        "distribution": "internal"
      }
    },
    "production": {
      "ios": {
        "distribution": "store"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "your-app-store-connect-app-id"
      }
    }
  }
}
```

5. Build for different purposes:

**Build for Simulator (testing):**
```bash
eas build --platform ios --profile development
```

**Build for TestFlight (beta testing):**
```bash
eas build --platform ios --profile preview
```

**Build for App Store (production):**
```bash
eas build --platform ios --profile production
```

6. Submit to App Store:
```bash
eas submit --platform ios
```

## Method 2: Build Locally (Advanced)

### Step 1: Set Up Xcode

1. Install Xcode from Mac App Store
2. Open Xcode and accept license agreements
3. Install command line tools:
```bash
xcode-select --install
```

### Step 2: Generate Native Code

1. Navigate to mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Generate iOS native code:
```bash
npx expo prebuild --platform ios
```

This creates an `ios` folder with native iOS project files.

4. Install iOS dependencies:
```bash
cd ios
pod install
cd ..
```

### Step 3: Configure Signing

1. Open the project in Xcode:
```bash
open ios/YourAppName.xcworkspace
```

⚠️ **Important:** Open `.xcworkspace`, NOT `.xcodeproj`

2. In Xcode, select your project in the navigator
3. Select your app target
4. Go to "Signing & Capabilities" tab
5. Configure:
   - **Team:** Select your Apple Developer team
   - **Bundle Identifier:** Change to unique identifier (e.g., `com.yourcompany.alarmapp`)
   - Enable "Automatically manage signing"

### Step 4: Build for Simulator

1. In Xcode, select a simulator as the target device (top left)
2. Click the Play button (▶) or press `Cmd + R`

Or use command line:
```bash
cd ios
xcodebuild -workspace YourAppName.xcworkspace \
  -scheme YourAppName \
  -configuration Debug \
  -sdk iphonesimulator \
  -derivedDataPath build
```

### Step 5: Build for Physical Device (Development)

1. Connect your iOS device via USB
2. In Xcode:
   - Trust the device if prompted
   - Select your device as the target
   - Click Play (▶) or press `Cmd + R`

3. On your device:
   - Go to `Settings` → `General` → `VPN & Device Management`
   - Trust your developer certificate

### Step 6: Build for Distribution (App Store)

1. In Xcode, select "Any iOS Device" as the target

2. Go to `Product` → `Archive`

3. Once archiving completes, the Organizer window opens

4. Select your archive and click "Distribute App"

5. Choose distribution method:
   - **App Store Connect:** For App Store or TestFlight
   - **Ad Hoc:** For testing on specific devices
   - **Enterprise:** For internal distribution (requires Enterprise account)
   - **Development:** For testing during development

6. Follow the wizard:
   - Select destination
   - Choose distribution options
   - Re-sign if needed
   - Review summary
   - Upload/Export

## Publishing to App Store

### 1. Set Up App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Click "My Apps"
3. Click "+" → "New App"
4. Fill in:
   - Platform: iOS
   - Name: Your app name
   - Primary Language
   - Bundle ID: (created earlier)
   - SKU: Unique identifier (e.g., `ALARMAPP001`)

### 2. Prepare App Information

Complete all required fields:

**App Information:**
- Privacy Policy URL
- Category (Utilities)
- Age Rating

**Pricing and Availability:**
- Price (Free or Paid)
- Availability (Countries)

**App Privacy:**
- Answer questions about data collection
- Create privacy labels

### 3. Prepare Store Assets

Create and upload:
- **App Icon:** 1024x1024 px (PNG, no transparency)
- **Screenshots:**
  - iPhone (6.5" display): 1242x2688 px or 1284x2778 px
  - iPhone (5.5" display): 1242x2208 px
  - iPad Pro (12.9"): 2048x2732 px (if supporting iPad)
- **App Preview Video:** (Optional) Up to 30 seconds

**Tips for Screenshots:**
- Show key features
- Use captions to highlight functionality
- Keep text readable
- Show the app in different states

### 4. Write App Description

**App Name:** 30 characters max, appears under icon

**Subtitle:** 30 characters max, brief description

**Description:** Up to 4000 characters
```
Example:
Wake up on time with our intuitive alarm app!

FEATURES:
• Set unlimited alarms
• Customize with your favorite sounds
• Snooze functionality
• Recurring alarms for daily routines
• Beautiful, easy-to-use interface
• Works even when app is closed

Perfect for heavy sleepers and anyone who needs reliable wake-up calls!
```

**Keywords:** 100 characters, comma-separated (for App Store search)

**Promotional Text:** 170 characters, can be updated without new version

### 5. Upload Build

1. Archive your app in Xcode (as described in Step 6 above)
2. Distribute to App Store Connect
3. Wait for processing (can take several minutes to an hour)
4. Once processed, go to your app in App Store Connect
5. Under "Build", click "+" and select your build

### 6. Complete Review Information

**Contact Information:**
- First Name
- Last Name
- Phone Number
- Email

**Notes for Review:**
Provide test account credentials if needed, or explain how to test features

**Attachment:**
Upload any supporting documentation

### 7. Submit for Review

1. Click "Add for Review"
2. Choose manual or automatic release after approval
3. Click "Submit for Review"

**Review Timeline:**
- Usually takes 24-48 hours
- Can take up to a week
- 90% of apps reviewed within 24 hours

### 8. Handle Review Feedback

If rejected:
1. Read rejection reason carefully
2. Make required changes
3. Submit new build
4. Respond to reviewer if clarification needed

## TestFlight (Beta Testing)

Before submitting to App Store, test with real users:

### 1. Upload Build to TestFlight

1. Archive and distribute to App Store Connect
2. Build automatically appears in TestFlight

### 2. Internal Testing

- Add up to 100 internal testers (must have App Store Connect access)
- No review required
- Instant access

### 3. External Testing

- Add up to 10,000 external testers
- Requires beta review (usually faster than App Store review)
- Send invitations via email or public link

### 4. Collect Feedback

- Users can submit feedback through TestFlight
- Monitor crash reports
- Iterate based on feedback

## Updating the App

1. Update version in `app.json`:
```json
{
  "expo": {
    "version": "1.1.0",
    "ios": {
      "buildNumber": "2"
    }
  }
}
```

2. Build new version

3. Upload to App Store Connect

4. Create new version in App Store Connect

5. Select new build

6. Update "What's New" section

7. Submit for review

## Troubleshooting

### Common Issues

**1. Code signing errors:**
- Ensure you're logged into Xcode with Apple ID
- Check that certificates are valid in developer account
- Try "Automatically manage signing"

**2. Pod install fails:**
```bash
cd ios
pod deintegrate
pod install
```

**3. Build fails after updating:**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
rm -rf node_modules
npm install
```

**4. "Unable to install" on device:**
- Check Bundle ID matches provisioning profile
- Ensure device is registered in developer account
- Trust certificate on device

**5. App crashes on launch:**
- Check Xcode console for errors
- Verify all permissions in Info.plist
- Check that all assets are included

**6. Archive fails:**
- Clean build folder: `Product` → `Clean Build Folder` (Cmd+Shift+K)
- Update provisioning profiles
- Check for code signing issues

### Get Logs from Device

```bash
# Install ios-deploy
npm install -g ios-deploy

# View device logs
ios-deploy --debug
```

## Best Practices

1. **Test on multiple devices** and iOS versions
2. **Follow Apple Human Interface Guidelines**
3. **Handle background states properly**
4. **Request permissions with clear explanations**
5. **Optimize app size** (under 200MB for cellular downloads)
6. **Respond to crashes** reported in App Store Connect
7. **Keep app updated** with new iOS features
8. **Monitor reviews** and ratings
9. **Use TestFlight extensively** before production release
10. **Prepare for App Review** - read guidelines carefully

## Required Permissions

Add these to `app.json` or `Info.plist`:

```json
{
  "ios": {
    "infoPlist": {
      "NSMicrophoneUsageDescription": "Allow access to use custom alarm sounds",
      "NSNotificationsUsageDescription": "We need notification access to trigger alarms"
    }
  }
}
```

## Resources

- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [TestFlight Documentation](https://developer.apple.com/testflight/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Expo iOS Documentation](https://docs.expo.dev/workflow/ios/)

## Cost Summary

- **Apple Developer Program:** $99/year (required)
- **App Store listing:** Free
- **Updates:** Free (unlimited)
- **EAS Build:** Free tier available, paid plans for more builds

## Next Steps After Publishing

1. Monitor app analytics in App Store Connect
2. Respond to user reviews
3. Fix reported bugs promptly
4. Add new features based on feedback
5. Keep up with iOS updates
6. Market your app to increase downloads
