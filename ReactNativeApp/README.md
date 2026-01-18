# HOS Mobile

React Native mobile application for the Hospital Operating System (HOS) / EdTech SaaS Platform built with Expo SDK 54 and React Native 0.82.

## Features

- 🎓 Course browsing and enrollment
- 📝 Interactive exam taking with timer
- 📊 Student dashboard with performance analytics
- 🔐 Secure authentication with JWT
- 🌗 Dark mode support
- 📱 Native mobile experience on iOS and Android

## Tech Stack

- **Framework**: Expo SDK 54 with React Native 0.82
- **UI**: Custom components with glassmorphism effects
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **API Client**: Axios
- **Storage**: Expo Secure Store
- **Animations**: Reanimated 3

## Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- iOS Simulator (Mac) or Android Emulator

## Getting Started

### 1. Install dependencies

```bash
cd ReactNativeApp
npm install
```

### 2. Configure environment

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_API_TIMEOUT=30000
```

For production, update with your actual backend URL.

### 3. Start development server

```bash
npm start
```

This will start the Expo development server. You can then:

- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Scan QR code with Expo Go app (for quick testing)
- Press `w` to open in web browser

### 4. Development with dev client (recommended)

For a more native development experience:

```bash
# Build development client
npm run build:dev

# Start with dev client
npm run dev
```

## Available Scripts

- `npm start` - Start Expo development server
- `npm run dev` - Start with dev client
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser
- `npm run build:dev` - Build development client with EAS
- `npm run build:preview` - Build preview with EAS
- `npm run build:prod` - Build production with EAS
- `npm run update` - Publish OTA update with EAS
- `npm run lint` - Run ESLint
- `npm test` - Run Jest tests

## Project Structure

```
ReactNativeApp/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── dashboard/        # Dashboard widgets
│   ├── courses/          # Course components
│   ├── exams/            # Exam components
│   └── common/           # Common components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and API client
├── store/                # Zustand stores
├── theme/                # Design system
├── types/                # TypeScript types
└── assets/               # Images, fonts, etc.
```

## Backend Connection

The app connects to the FastAPI backend. Make sure the backend is running:

```bash
cd ../backend
uvicorn server:app --reload
```

Key API endpoints used:
- `/api/auth/login` - User login
- `/api/auth/register` - User registration
- `/api/courses` - Get courses
- `/api/exams` - Get exams
- `/api/exams/{id}/start` - Start exam
- `/api/attempts/{id}/sync` - Sync exam answers
- `/api/dashboard/stats` - Get dashboard stats

## Building for Production

### iOS

```bash
eas build --platform ios --profile production
```

### Android

```bash
eas build --platform android --profile production
```

### Publishing Updates (OTA)

```bash
eas update --branch production --message "Bug fixes and improvements"
```

## Design System

The app follows the HOS design guidelines:

- **Colors**: Indigo primary (#4F46E5), Emerald secondary (#10B981)
- **Typography**: Outfit for headings, Plus Jakarta Sans for body
- **Effects**: Glassmorphism with blur and semi-transparent backgrounds
- **Layout**: Bento grid for dashboard, card-based for lists

## Testing

```bash
npm test
```

Run tests in watch mode:

```bash
npm test -- --watch
```

## Troubleshooting

### Metro bundler issues
```bash
npx expo start --clear
```

### iOS build issues
```bash
cd ios && pod install && cd ..
```

### Android build issues
```bash
cd android && ./gradlew clean && cd ..
```

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test on both iOS and Android
4. Submit a pull request

## License

Proprietary - All rights reserved
