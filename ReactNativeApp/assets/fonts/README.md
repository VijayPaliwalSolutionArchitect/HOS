# Place custom fonts here

## Required Fonts

1. **Outfit** (Google Fonts)
   - Download from: https://fonts.google.com/specimen/Outfit
   - Weights needed: 400, 500, 600, 700
   - Files: Outfit-Regular.ttf, Outfit-Medium.ttf, Outfit-SemiBold.ttf, Outfit-Bold.ttf

2. **Plus Jakarta Sans** (Google Fonts)
   - Download from: https://fonts.google.com/specimen/Plus+Jakarta+Sans
   - Weights needed: 400, 500, 600, 700
   - Files: PlusJakartaSans-Regular.ttf, PlusJakartaSans-Medium.ttf, PlusJakartaSans-SemiBold.ttf, PlusJakartaSans-Bold.ttf

3. **JetBrains Mono** (Optional, for code blocks)
   - Download from: https://www.jetbrains.com/lp/mono/
   - Weight: 400
   - File: JetBrainsMono-Regular.ttf

## Loading Fonts

Fonts are loaded in `app/_layout.tsx` using `expo-font`:

```typescript
import * as Font from 'expo-font';

await Font.loadAsync({
  'Outfit-Regular': require('./assets/fonts/Outfit-Regular.ttf'),
  'Outfit-Medium': require('./assets/fonts/Outfit-Medium.ttf'),
  'Outfit-SemiBold': require('./assets/fonts/Outfit-SemiBold.ttf'),
  'Outfit-Bold': require('./assets/fonts/Outfit-Bold.ttf'),
  // ... other fonts
});
```
