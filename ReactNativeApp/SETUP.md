# HOS Mobile - Setup Guide

Complete setup guide for the HOS Mobile React Native application.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** for version control
- **Expo CLI**: Install globally with `npm install -g expo-cli`
- **EAS CLI**: Install globally with `npm install -g eas-cli`

### For iOS Development (Mac only)
- **Xcode** 14 or higher
- **CocoaPods**: Install with `sudo gem install cocoapods`

### For Android Development
- **Android Studio** with Android SDK
- **Java Development Kit (JDK)** 17

## Quick Start

### 1. Install Dependencies

```bash
cd ReactNativeApp
npm install
```

### 2. Configure Environment

Create a `.env` file in the `ReactNativeApp` directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_API_TIMEOUT=30000
```

**Note:** For development on a physical device, replace `localhost` with your computer's IP address:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000
```

To find your IP:
- Mac/Linux: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Windows: `ipconfig` and look for IPv4 Address

### 3. Start the Backend Server

Make sure the FastAPI backend is running:

```bash
cd ../backend
python -m uvicorn server:app --reload --host 0.0.0.0
```

The backend should be accessible at `http://localhost:8000`

### 4. Start the Development Server

```bash
npm start
```

This will open the Expo Dev Tools in your browser. From here, you can:

- Press **`i`** to open iOS Simulator (Mac only)
- Press **`a`** to open Android Emulator
- Scan QR code with **Expo Go** app (iOS/Android) for quick testing
- Press **`w`** to open in web browser

## Development Workflows

### Using Expo Go (Quick Testing)

Fastest way to test on a physical device:

1. Install **Expo Go** from App Store (iOS) or Play Store (Android)
2. Run `npm start`
3. Scan the QR code with:
   - iOS: Camera app
   - Android: Expo Go app

**Limitations:** Some native modules may not work in Expo Go.

### Using Development Build (Recommended)

For full native functionality:

```bash
# Build development client (one-time setup)
npm run build:dev

# Start with dev client
npm run dev
```

### Running on Simulators/Emulators

#### iOS Simulator (Mac only)
```bash
npm run ios
```

#### Android Emulator
```bash
npm run android
```

## Project Structure

```
ReactNativeApp/
├── app/                        # Expo Router pages
│   ├── (auth)/                # Auth screens (login, register)
│   ├── (tabs)/                # Main tab screens
│   ├── _layout.tsx            # Root layout with providers
│   └── index.tsx              # Entry point (redirect logic)
├── components/                 # Reusable components
│   ├── ui/                    # Base UI (Button, Card, Input, Text)
│   ├── common/                # Common (Loading, Error, Empty)
│   ├── dashboard/             # Dashboard widgets
│   ├── courses/               # Course components
│   └── exams/                 # Exam components
├── hooks/                      # Custom React hooks
├── lib/                        # Utilities (API client, storage, utils)
├── store/                      # Zustand state management
├── theme/                      # Design system (colors, typography, spacing)
├── types/                      # TypeScript types
├── assets/                     # Static assets (fonts, images)
├── app.json                    # Expo configuration
├── eas.json                    # EAS Build configuration
└── package.json               # Dependencies
```

## Key Features

### ✅ Implemented Features

- **Authentication**
  - Email/password login and registration
  - JWT token management with auto-refresh
  - Secure token storage with expo-secure-store
  - Protected routes with auto-redirect

- **Dashboard**
  - User stats (XP, Level, Streak, Courses)
  - Recent activity feed
  - Performance chart
  - Quick actions

- **Courses**
  - Browse and search courses
  - Course cards with details
  - Pull-to-refresh

- **Exams**
  - View available exams
  - Start exam with attempt tracking
  - Exam cards with metadata

- **Results**
  - View exam history
  - Result cards with score and status

- **Profile**
  - User information display
  - Theme toggle (light/dark mode)
  - Settings menu
  - Logout functionality

### 🎨 Design System

- **Colors:** Indigo primary, Emerald secondary
- **Typography:** Outfit (headings), Plus Jakarta Sans (body)
- **Effects:** Glassmorphism with blur
- **Dark Mode:** System-based with manual override
- **Haptic Feedback:** On button presses and interactions

## API Integration

The app connects to the FastAPI backend at the URL specified in `.env`.

### Key Endpoints Used

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/courses` - List courses
- `GET /api/exams` - List exams
- `POST /api/exams/{id}/start` - Start an exam
- `GET /api/attempts` - Get exam attempts (results)
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-activity` - Get recent activity

### Data Fetching

- **React Query** for caching and background refetching
- **Axios** for HTTP requests with interceptors
- Automatic token refresh on 401 responses

## Building for Production

### Prerequisites for EAS Build

1. Create an Expo account: https://expo.dev/signup
2. Login to EAS CLI:
   ```bash
   eas login
   ```

### Configure EAS Build

Update `eas.json` with your project details:

```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

### Build Commands

#### iOS
```bash
# Development build
npm run build:dev

# Preview build
eas build --platform ios --profile preview

# Production build
eas build --platform ios --profile production
```

#### Android
```bash
# Development build (APK)
npm run build:dev

# Preview build (APK)
eas build --platform android --profile preview

# Production build (AAB for Play Store)
eas build --platform android --profile production
```

### Publishing Updates (OTA)

After initial build, publish JavaScript updates without rebuilding:

```bash
# Update production
eas update --branch production --message "Bug fixes"

# Update preview
eas update --branch preview --message "New features"
```

## Adding Assets

### Fonts

1. Download fonts:
   - **Outfit**: https://fonts.google.com/specimen/Outfit
   - **Plus Jakarta Sans**: https://fonts.google.com/specimen/Plus+Jakarta+Sans

2. Place font files in `assets/fonts/`

3. Load fonts in `app/_layout.tsx`:
   ```typescript
   import * as Font from 'expo-font';
   
   await Font.loadAsync({
     'Outfit-Regular': require('./assets/fonts/Outfit-Regular.ttf'),
     'Outfit-Bold': require('./assets/fonts/Outfit-Bold.ttf'),
     // ... other fonts
   });
   ```

### Images

Place required images in `assets/images/`:
- `icon.png` (1024x1024) - App icon
- `adaptive-icon.png` (1024x1024) - Android adaptive icon
- `splash.png` (1242x2436) - Splash screen
- `favicon.png` (32x32) - Web favicon

## Testing

### Running Tests

```bash
npm test
```

### Test in Watch Mode

```bash
npm test -- --watch
```

### Test Coverage

```bash
npm test -- --coverage
```

## Troubleshooting

### Metro Bundler Issues

```bash
# Clear Metro cache
npx expo start --clear

# Clear node modules
rm -rf node_modules
npm install
```

### iOS Build Issues

```bash
# Reinstall pods
cd ios
pod install
cd ..

# Clean build
npm run ios -- --clean
```

### Android Build Issues

```bash
# Clean Gradle
cd android
./gradlew clean
cd ..

# Rebuild
npm run android
```

### Common Issues

**Issue:** "Unable to connect to backend"
- Ensure backend is running
- Check `.env` file has correct API URL
- For physical device, use your computer's IP address

**Issue:** "Fonts not loading"
- Make sure font files are in `assets/fonts/`
- Verify font names in theme configuration

**Issue:** "Module not found"
- Clear cache: `npx expo start --clear`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## Environment Variables

Create `.env` file with:

```env
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_API_TIMEOUT=30000

# Optional: Feature Flags
EXPO_PUBLIC_ENABLE_ANALYTICS=false
EXPO_PUBLIC_ENABLE_CRASHLYTICS=false
```

## Performance Optimization

### Tips for Better Performance

1. **Use FlatList** for long lists with proper `keyExtractor`
2. **Memoize callbacks** with `useCallback`
3. **Memoize values** with `useMemo`
4. **Lazy load screens** with dynamic imports
5. **Optimize images** before adding to assets
6. **Use react-native-reanimated** for smooth animations

### Analyze Bundle Size

```bash
npm run analyze
```

## Next Steps

1. ✅ Set up development environment
2. ✅ Install dependencies
3. ✅ Configure backend URL
4. ✅ Add fonts and images to assets
5. ✅ Test on simulator/emulator
6. ✅ Test on physical device
7. 📱 Build development client
8. 🚀 Deploy to app stores

## Support

For issues or questions:
- Check existing GitHub issues
- Create a new issue with detailed description
- Include logs and error messages

## License

Proprietary - All rights reserved
