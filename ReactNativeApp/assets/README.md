# Assets Directory

This directory contains static assets for the HOS Mobile application.

## Structure

- `fonts/` - Custom fonts (Outfit, Plus Jakarta Sans, JetBrains Mono)
- `images/` - Images, icons, and graphics

## Required Assets

### Fonts
Download and place the following fonts in the `fonts/` directory:
- Outfit (Variable or weights: 400, 500, 600, 700)
- Plus Jakarta Sans (Variable or weights: 400, 500, 600, 700)
- JetBrains Mono (Optional, for code blocks)

### Images
Place the following images in the `images/` directory:
- `icon.png` - App icon (1024x1024)
- `adaptive-icon.png` - Android adaptive icon (1024x1024)
- `splash.png` - Splash screen image (1242x2436 for best compatibility)
- `favicon.png` - Web favicon (32x32)

## Usage

Assets are loaded automatically by Expo. Reference them in your code:

```typescript
import { Image } from 'expo-image';

<Image
  source={require('@/assets/images/logo.png')}
  style={{ width: 100, height: 100 }}
/>
```

For fonts, use `expo-font` to load them in `app/_layout.tsx`.
