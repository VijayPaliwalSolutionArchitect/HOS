# Mobile App Local Setup & Deployment Guide

Complete guide for viewing, editing, running, configuring the HOS Mobile app locally, and deploying to Android Studio.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Project Structure Overview](#project-structure-overview)
4. [Local Development](#local-development)
5. [Editing the App](#editing-the-app)
6. [Configuration](#configuration)
7. [Running the App](#running-the-app)
8. [Android Studio Setup](#android-studio-setup)
9. [Building for Android](#building-for-android)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

1. **Node.js and npm**
   - Version: Node.js 18 or higher
   - Download from: https://nodejs.org/
   - Verify installation:
     ```bash
     node --version  # Should be v18.x.x or higher
     npm --version   # Should be 9.x.x or higher
     ```

2. **Git**
   - Download from: https://git-scm.com/
   - Verify installation:
     ```bash
     git --version
     ```

3. **Android Studio** (for Android development)
   - Download from: https://developer.android.com/studio
   - Version: Arctic Fox (2020.3.1) or newer
   - Components needed:
     - Android SDK Platform 34
     - Android SDK Build-Tools 34.0.0
     - Android Emulator
     - Android SDK Platform-Tools

4. **Java Development Kit (JDK)**
   - Version: JDK 17 (recommended)
   - Download from: https://www.oracle.com/java/technologies/downloads/
   - Verify installation:
     ```bash
     java -version  # Should be 17.x.x
     ```

5. **Expo CLI** (optional but recommended)
   ```bash
   npm install -g expo-cli
   ```

6. **EAS CLI** (for building)
   ```bash
   npm install -g eas-cli
   ```

### Optional Tools

- **Visual Studio Code** - Recommended code editor
  - Extensions: React Native Tools, ES7+ React/Redux/React-Native snippets, Prettier
- **Android Debug Bridge (ADB)** - Comes with Android Studio
- **Watchman** - For better file watching (Mac/Linux)
  ```bash
  # macOS (via Homebrew)
  brew install watchman
  ```

---

## Initial Setup

### 1. Clone the Repository

```bash
# Clone the HOS repository
git clone https://github.com/VijayPaliwalSolutionArchitect/HOS.git

# Navigate to the React Native app directory
cd HOS/ReactNativeApp
```

### 2. Install Dependencies

```bash
# Install all npm dependencies
npm install

# This will install:
# - React Native and Expo packages
# - Navigation libraries
# - State management (Zustand, React Query)
# - UI libraries (Expo Blur, Linear Gradient, etc.)
# - Development tools
```

**Expected output:**
```
added 1500+ packages in 2-3 minutes
```

### 3. Configure Environment

Create a `.env` file in the `ReactNativeApp` directory:

```bash
# Copy the example file
cp .env.example .env

# Edit the file with your settings
nano .env  # or use your preferred editor
```

**Required environment variables:**
```env
# Backend API URL
# For local development on emulator
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000

# For local development on physical device (replace with your computer's IP)
# EXPO_PUBLIC_API_URL=http://192.168.1.100:8000

# API timeout
EXPO_PUBLIC_API_TIMEOUT=30000
```

**Finding Your Computer's IP Address:**

**Windows:**
```bash
ipconfig
# Look for IPv4 Address under your active network adapter
```

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# Or use: ip addr show (Linux)
```

### 4. Set Up Backend

The mobile app requires the FastAPI backend to be running:

```bash
# In a separate terminal, navigate to backend directory
cd ../backend

# Install Python dependencies
pip install -r requirements.txt

# Run the backend server
# Use 0.0.0.0 to make it accessible from mobile devices
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

Verify backend is running by visiting: http://localhost:8000/docs

---

## Project Structure Overview

Understanding the folder structure:

```
ReactNativeApp/
├── app/                          # Screens (Expo Router)
│   ├── (auth)/                  # Authentication screens
│   │   ├── _layout.tsx          # Auth stack layout
│   │   ├── login.tsx            # Login screen
│   │   └── register.tsx         # Register screen
│   ├── (tabs)/                  # Main app tabs
│   │   ├── _layout.tsx          # Tab navigator
│   │   ├── index.tsx            # Dashboard
│   │   ├── courses.tsx          # Courses list
│   │   ├── exams.tsx            # Exams list
│   │   ├── results.tsx          # Results history
│   │   └── profile.tsx          # User profile
│   ├── _layout.tsx              # Root layout
│   └── index.tsx                # Entry/splash screen
│
├── components/                   # Reusable components
│   ├── ui/                      # Base UI (Button, Card, Input, etc.)
│   ├── common/                  # Utilities (Loading, Error, Empty)
│   ├── dashboard/               # Dashboard widgets
│   ├── courses/                 # Course components
│   └── exams/                   # Exam components
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts               # Authentication hook
│   ├── useApi.ts                # API data fetching
│   ├── useCourses.ts            # Course operations
│   ├── useExams.ts              # Exam operations
│   └── useTheme.ts              # Theme management
│
├── lib/                          # Utilities
│   ├── api.ts                   # Axios client
│   ├── storage.ts               # Secure storage helpers
│   ├── constants.ts             # App constants
│   └── utils.ts                 # Helper functions
│
├── store/                        # Zustand stores
│   ├── authStore.ts             # Auth state
│   ├── examStore.ts             # Exam state
│   └── themeStore.ts            # Theme state
│
├── theme/                        # Design system
│   ├── colors.ts                # Color palette
│   ├── typography.ts            # Font styles
│   ├── spacing.ts               # Spacing scale
│   └── index.ts                 # Exports
│
├── types/                        # TypeScript types
│   ├── auth.ts                  # Auth types
│   ├── course.ts                # Course types
│   ├── exam.ts                  # Exam types
│   └── api.ts                   # API types
│
├── assets/                       # Static assets
│   ├── fonts/                   # Custom fonts
│   └── images/                  # Images and icons
│
├── app.json                      # Expo configuration
├── eas.json                      # EAS Build config
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── babel.config.js               # Babel config
└── metro.config.js               # Metro bundler config
```

---

## Local Development

### Starting the Development Server

```bash
# Navigate to ReactNativeApp directory
cd HOS/ReactNativeApp

# Start Expo development server
npm start

# Alternative: Start with cache cleared
npm start -- --clear
```

**What happens:**
1. Metro bundler starts
2. Expo Dev Tools open in browser
3. QR code appears in terminal
4. Development server runs on port 8081

**Development Server Options:**

From the terminal, press:
- **`a`** - Open on Android emulator
- **`i`** - Open on iOS simulator (macOS only)
- **`w`** - Open in web browser
- **`r`** - Reload app
- **`m`** - Toggle menu
- **`d`** - Toggle developer menu
- **`j`** - Open debugger
- **`c`** - Clear cache

### Using Expo Go App (Quick Testing)

1. **Install Expo Go:**
   - iOS: Download from App Store
   - Android: Download from Play Store

2. **Connect to Development Server:**
   - iOS: Scan QR code with Camera app
   - Android: Scan QR code with Expo Go app

3. **Test the App:**
   - App loads on your device
   - Live reload on file changes
   - Shake device for developer menu

**Note:** Expo Go has limitations with custom native modules. For full functionality, use a development build (see Android Studio section).

### Hot Reloading

The app automatically reloads when you save changes:

- **Fast Refresh:** Updates components instantly
- **Full Reload:** Restart app (press `r`)
- **Clear Cache:** `npm start -- --clear`

---

## Editing the App

### Opening the Project

**Visual Studio Code:**
```bash
code .
```

**Android Studio:**
1. Open Android Studio
2. File → Open
3. Navigate to `HOS/ReactNativeApp/android`
4. Click "Open"

### Making Changes

#### 1. Editing Screens

**Example: Modify Dashboard Screen**

```bash
# Open the dashboard screen
nano app/(tabs)/index.tsx
# Or use VS Code: code app/(tabs)/index.tsx
```

**Common edits:**
- Change text content
- Modify layouts
- Add new components
- Update styling

**Example change:**
```typescript
// Before
<Text variant="h2" weight="bold">
  {user?.full_name || 'Student'}
</Text>

// After
<Text variant="h2" weight="bold">
  Welcome, {user?.full_name || 'Student'}!
</Text>
```

**Save the file** → App automatically reloads with changes

#### 2. Adding New Components

**Create a new component:**

```bash
# Create new file
touch components/dashboard/NewWidget.tsx
```

**Component template:**
```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';
import { theme } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

interface NewWidgetProps {
  title: string;
}

export const NewWidget: React.FC<NewWidgetProps> = ({ title }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text variant="h4" weight="semibold">
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
  },
});
```

**Import and use:**
```typescript
import { NewWidget } from '@/components/dashboard/NewWidget';

// In your screen
<NewWidget title="My New Widget" />
```

#### 3. Modifying Styles

**Update theme colors:**
```typescript
// Edit: theme/colors.ts
export const colors = {
  primary: {
    DEFAULT: '#4F46E5', // Change this color
    // ... rest of colors
  },
};
```

**Update component styles:**
```typescript
const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,  // Change spacing
    borderRadius: theme.borderRadius['2xl'],  // Change radius
  },
});
```

#### 4. Adding New Screens

**Create new screen:**
```bash
# Create file in app directory
touch app/(tabs)/newscreen.tsx
```

**Screen template:**
```typescript
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { theme } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

export default function NewScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <Text variant="h2" weight="bold">
          New Screen
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

**Add to tab navigator:**
```typescript
// Edit: app/(tabs)/_layout.tsx
<Tabs.Screen
  name="newscreen"
  options={{
    title: 'New Screen',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="add-circle" size={size} color={color} />
    ),
  }}
/>
```

### Testing Changes

1. **Save your files**
2. **App auto-reloads** (Fast Refresh)
3. **Check for errors** in Metro bundler terminal
4. **Test functionality** in app

**Debug errors:**
- Red screen: JavaScript error (check console)
- Yellow warning: Non-critical issue
- Check Metro bundler logs for details

---

## Configuration

### App Configuration (app.json)

**Key settings to customize:**

```json
{
  "expo": {
    "name": "HOS Mobile",              // App display name
    "slug": "hos-mobile",              // URL slug
    "version": "1.0.0",                // App version
    "orientation": "portrait",          // Lock orientation
    "icon": "./assets/images/icon.png", // App icon
    "splash": {
      "image": "./assets/images/splash.png",
      "backgroundColor": "#4F46E5"     // Splash color
    },
    "ios": {
      "bundleIdentifier": "com.hos.mobile"  // iOS bundle ID
    },
    "android": {
      "package": "com.hos.mobile",     // Android package name
      "versionCode": 1                 // Build number
    }
  }
}
```

**When to update:**
- Changing app name
- Updating version for release
- Modifying permissions
- Changing bundle identifiers

### TypeScript Configuration (tsconfig.json)

**Already configured with:**
- Strict mode enabled
- Path aliases (@/ for root)
- Expo type definitions

**No changes needed** unless adding new path aliases

### Backend URL Configuration

**Development (.env):**
```env
# Android Emulator (10.0.2.2 maps to localhost)
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000

# iOS Simulator
EXPO_PUBLIC_API_URL=http://localhost:8000

# Physical Device (use your computer's IP)
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000
```

**Production:**
```env
EXPO_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## Running the App

### Option 1: Expo Go (Fastest for Testing)

**Pros:**
- Quick setup (no build required)
- Instant testing on device
- Good for UI development

**Cons:**
- Limited native module support
- Some features may not work

**Steps:**
1. Start server: `npm start`
2. Scan QR code with Expo Go
3. App loads and runs

### Option 2: Development Build (Recommended)

**Pros:**
- Full native module support
- Closest to production
- All features work

**Cons:**
- Requires initial build (~10-20 min)
- Need EAS account

**Steps:**
1. Login to EAS: `eas login`
2. Build dev client: `npm run build:dev`
3. Download and install APK/IPA
4. Start server: `npm run dev`
5. App connects automatically

### Option 3: Android Studio (Full Native)

See [Android Studio Setup](#android-studio-setup) section below.

---

## Android Studio Setup

### Initial Configuration

#### 1. Install Android Studio

1. **Download Android Studio**
   - Visit: https://developer.android.com/studio
   - Download installer for your OS

2. **Install Android Studio**
   - Run installer
   - Choose "Standard" installation
   - Let it download Android SDK

3. **Configure SDK**
   - Open Android Studio
   - Go to: Settings → Appearance & Behavior → System Settings → Android SDK
   - Check "Android 14.0 (API 34)" (or latest)
   - Check "Android SDK Build-Tools 34"
   - Click "Apply" to install

#### 2. Set Up Environment Variables

**Windows:**
```bash
# Add to System Environment Variables
ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk
Path=%Path%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools
```

**macOS/Linux:**
```bash
# Add to ~/.bashrc or ~/.zshrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# Reload shell
source ~/.bashrc  # or source ~/.zshrc
```

**Verify:**
```bash
adb --version  # Should show Android Debug Bridge version
```

#### 3. Create Virtual Device (Emulator)

1. **Open Android Studio**
2. **Go to:** Tools → Device Manager (or AVD Manager)
3. **Click:** "Create Device"
4. **Select:** Phone → Pixel 5 (or your preference)
5. **Click:** Next
6. **Select:** System Image → API 34 (Android 14)
7. **Download** if needed
8. **Click:** Next → Finish

**Recommended Settings:**
- RAM: 2048 MB or higher
- Internal Storage: 2048 MB
- Enable Graphics: Hardware - GLES 2.0

#### 4. Open Project in Android Studio

**Option A: Open Existing Project**
```bash
# From ReactNativeApp directory
npx expo run:android

# This will:
# 1. Generate android folder if missing
# 2. Open Android Studio automatically
# 3. Build and run the app
```

**Option B: Manual Open**
1. Open Android Studio
2. File → Open
3. Navigate to `HOS/ReactNativeApp/android`
4. Click "Open"
5. Wait for Gradle sync to complete

#### 5. Generate Android Project (First Time)

If `android` folder doesn't exist:

```bash
cd HOS/ReactNativeApp

# Generate Android project
npx expo prebuild --platform android

# This creates:
# - android/ folder with native project
# - All necessary configuration files
# - Gradle build files
```

---

## Building for Android

### Method 1: Using Expo CLI (Recommended for Development)

**Build and run on emulator:**
```bash
# Make sure emulator is running
npm run android

# Or with cleared cache
npx expo run:android --clear
```

**What happens:**
1. Gradle builds the app (~5-10 min first time)
2. App installs on emulator
3. Metro bundler starts
4. App opens automatically

**Faster subsequent builds:**
- Build cache is used
- Only changed code rebuilt
- Takes ~30-60 seconds

### Method 2: Using Android Studio

**Build from Android Studio:**

1. **Open Project** (see Android Studio Setup section)

2. **Sync Gradle:**
   - File → Sync Project with Gradle Files
   - Wait for sync to complete

3. **Select Build Variant:**
   - View → Tool Windows → Build Variants
   - Select "debug" for development

4. **Run App:**
   - Click green "Run" button (or press Shift+F10)
   - Select target device (emulator or physical)
   - Wait for build and install

5. **Monitor Output:**
   - Check "Run" tab for build logs
   - Check "Logcat" tab for runtime logs

**Build Output:**
- Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release APK: `android/app/build/outputs/apk/release/app-release.apk`

### Method 3: Manual Gradle Build

**Build APK manually:**

```bash
cd HOS/ReactNativeApp/android

# Debug build
./gradlew assembleDebug

# Release build (requires signing)
./gradlew assembleRelease

# Clean build
./gradlew clean assembleDebug
```

**Install APK:**
```bash
# Install on connected device/emulator
adb install app/build/outputs/apk/debug/app-debug.apk

# Or use gradle
./gradlew installDebug
```

### Building Release APK

**1. Generate Keystore (First Time Only):**

```bash
cd HOS/ReactNativeApp/android/app

# Generate keystore
keytool -genkeypair -v -storetype PKCS12 \
  -keystore hos-release-key.keystore \
  -alias hos-key-alias \
  -keyalg RSA -keysize 2048 -validity 10000

# You'll be prompted for:
# - Keystore password (remember this!)
# - Key password (can be same as keystore)
# - Your name, organization, etc.
```

**2. Configure Signing:**

Create `android/gradle.properties`:
```properties
MYAPP_RELEASE_STORE_FILE=hos-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=hos-key-alias
MYAPP_RELEASE_STORE_PASSWORD=your-keystore-password
MYAPP_RELEASE_KEY_PASSWORD=your-key-password
```

**Add to `android/app/build.gradle`:**
```gradle
android {
    ...
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
            ...
            signingConfig signingConfigs.release
        }
    }
}
```

**3. Build Release APK:**

```bash
cd android
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

**4. Test Release Build:**

```bash
# Install on device
adb install app/build/outputs/apk/release/app-release.apk

# Run and test thoroughly
```

---

## Deployment

### Deploy to Physical Device (Testing)

#### Via USB (ADB)

**1. Enable Developer Options on Phone:**
- Go to Settings → About Phone
- Tap "Build Number" 7 times
- Go back → Developer Options
- Enable "USB Debugging"

**2. Connect Phone:**
```bash
# Connect phone via USB

# Check if detected
adb devices

# Should show:
# List of devices attached
# ABCD1234    device
```

**3. Run App:**
```bash
npm run android

# Or install APK directly
adb install -r app-debug.apk
```

#### Via WiFi (Wireless ADB)

**1. Connect via USB first (one-time setup)**

**2. Enable TCP/IP:**
```bash
adb tcpip 5555
```

**3. Find Phone IP:**
- Settings → About Phone → Status → IP Address

**4. Connect Wirelessly:**
```bash
# Disconnect USB cable

# Connect via IP
adb connect 192.168.1.100:5555

# Verify connection
adb devices
```

**5. Run App:**
```bash
npm run android
```

### Deploy to Google Play Store

#### 1. Prepare for Release

**Update version:**
```json
// app.json
{
  "expo": {
    "version": "1.0.0",
    "android": {
      "versionCode": 1  // Increment for each release
    }
  }
}
```

**Build AAB (Android App Bundle):**
```bash
# Use EAS Build for Play Store
eas build --platform android --profile production

# Or local build:
cd android
./gradlew bundleRelease

# AAB location:
# android/app/build/outputs/bundle/release/app-release.aab
```

#### 2. Create Google Play Console Account

1. Visit: https://play.google.com/console
2. Sign in with Google account
3. Pay one-time $25 registration fee
4. Complete account setup

#### 3. Create App in Console

1. Click "Create App"
2. Fill in app details:
   - App name: HOS Mobile
   - Default language: English
   - App type: App
   - Free or paid: Free

3. Complete required sections:
   - Privacy Policy URL
   - App content rating
   - Target audience
   - Store listing (description, screenshots, icon)

#### 4. Upload APK/AAB

1. Go to: Production → Releases
2. Click "Create new release"
3. Upload app-release.aab
4. Add release notes
5. Review and roll out

#### 5. Submit for Review

- Google typically reviews within 1-3 days
- You'll receive email when approved
- App goes live automatically after approval

### Continuous Deployment with EAS

**Setup EAS:**
```bash
# Login
eas login

# Configure project
eas build:configure

# Build for production
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

**Automate with GitHub Actions:**
Create `.github/workflows/eas-build.yml`:
```yaml
name: EAS Build
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npx eas-cli build --platform android --non-interactive
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Metro Bundler Errors

**Error: "Unable to resolve module"**

**Solution:**
```bash
# Clear Metro cache
npx expo start --clear

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules
npm install
```

#### 2. Android Build Errors

**Error: "SDK location not found"**

**Solution:**
```bash
# Create local.properties file
cd android
echo "sdk.dir=/path/to/Android/Sdk" > local.properties

# On Windows:
echo sdk.dir=C:\\Users\\YourName\\AppData\\Local\\Android\\Sdk > local.properties

# On macOS:
echo "sdk.dir=$HOME/Library/Android/sdk" > local.properties
```

**Error: "Gradle build failed"**

**Solution:**
```bash
# Clean Gradle
cd android
./gradlew clean

# Clear Gradle cache
rm -rf ~/.gradle/caches/

# Rebuild
./gradlew assembleDebug
```

#### 3. Emulator Issues

**Error: "Emulator won't start"**

**Solutions:**
1. **Check virtualization** is enabled in BIOS
2. **Free up RAM** (close other apps)
3. **Recreate emulator** in AVD Manager
4. **Update Android Studio** to latest version

**Error: "App crashes on emulator"**

**Solutions:**
1. **Check Logcat** for error messages
2. **Wipe emulator data:** AVD Manager → Wipe Data
3. **Use physical device** instead

#### 4. Connection Issues

**Error: "Unable to connect to dev server"**

**Solutions:**
1. **Check backend** is running: `curl http://localhost:8000/api/health`
2. **Verify .env** has correct URL
3. **For device:** Use computer's IP, not localhost
4. **Check firewall** allows port 8000 and 8081

**Error: "Network request failed"**

**Solutions:**
1. **Check backend logs** for errors
2. **Test API** with Postman/curl
3. **Verify CORS** is configured in backend
4. **Check device network** connection

#### 5. Build Performance

**Slow builds?**

**Optimizations:**
1. **Increase Gradle memory:**
   ```
   # android/gradle.properties
   org.gradle.jvmargs=-Xmx4096m
   ```

2. **Enable parallel builds:**
   ```
   org.gradle.parallel=true
   org.gradle.configureondemand=true
   ```

3. **Use Gradle daemon:**
   ```
   org.gradle.daemon=true
   ```

#### 6. Package Installation Errors

**Error: "INSTALL_FAILED_INSUFFICIENT_STORAGE"**

**Solution:**
- Free up space on device/emulator
- Wipe emulator data
- Increase emulator storage in AVD settings

**Error: "INSTALL_FAILED_UPDATE_INCOMPATIBLE"**

**Solution:**
```bash
# Uninstall existing app
adb uninstall com.hos.mobile

# Reinstall
npm run android
```

### Getting Help

**Check Documentation:**
- README.md - Project overview
- SETUP.md - Detailed setup guide
- IMPLEMENTATION_SUMMARY.md - Technical details

**Debug Tools:**
- **React Native Debugger:** Press `Ctrl+M` in emulator
- **Logcat:** Filter by "ReactNativeJS" tag
- **Metro Logs:** Check terminal where `npm start` is running
- **Chrome DevTools:** Press `j` in Metro bundler

**Community Resources:**
- Expo Discord: https://chat.expo.dev/
- React Native Docs: https://reactnative.dev/
- Stack Overflow: Tag with [react-native] [expo]

---

## Quick Reference

### Essential Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS (Mac only)
npm run ios

# Clear cache and start
npm start -- --clear

# Build development client
npm run build:dev

# Build production APK
cd android && ./gradlew assembleRelease

# Install APK on device
adb install path/to/app.apk

# Check connected devices
adb devices

# View logs
adb logcat *:E  # Errors only

# Generate Android project
npx expo prebuild --platform android
```

### File Locations

```
Source Code:        ReactNativeApp/app/
Components:         ReactNativeApp/components/
Configuration:      ReactNativeApp/.env
Android Project:    ReactNativeApp/android/
Debug APK:          android/app/build/outputs/apk/debug/
Release APK:        android/app/build/outputs/apk/release/
Keystore:           android/app/hos-release-key.keystore
```

### Environment URLs

```env
# Android Emulator
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000

# iOS Simulator
EXPO_PUBLIC_API_URL=http://localhost:8000

# Physical Device (replace with your IP)
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000

# Production
EXPO_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## Next Steps

1. ✅ **Complete Initial Setup** (Prerequisites → Install Dependencies)
2. ✅ **Configure Environment** (Create .env file)
3. ✅ **Start Backend** (Run FastAPI server)
4. ✅ **Run Development Server** (`npm start`)
5. ✅ **Test on Emulator/Device**
6. ✅ **Make Your First Edit** (Try changing dashboard text)
7. ✅ **Build Release Version** (When ready to deploy)
8. ✅ **Deploy to Play Store** (When ready for production)

---

**Need Help?**
- Check [Troubleshooting](#troubleshooting) section
- Review existing documentation (README.md, SETUP.md)
- Check GitHub Issues
- Contact development team

**Happy Coding! 🚀**
