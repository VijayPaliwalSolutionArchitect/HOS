# Modern MEAN Stack Frontend

A stunning, modern frontend application built with React, Vite, Tailwind CSS, and GSAP animations.

## Features

- ⚡ **Vite** - Lightning-fast build tool and dev server
- ⚛️ **React 18** - Latest React features
- 🎨 **Tailwind CSS 3.4** - Utility-first CSS framework
- 🌈 **Multi-theme Support** - Light, Dark, Ocean, Sunset, and Forest themes
- ✨ **GSAP Animations** - Professional-grade animations with ScrollTrigger
- 🎭 **Lottie Support** - Beautiful Lottie animations
- 📱 **Fully Responsive** - Mobile-first design
- ♿ **Accessible** - ARIA labels and semantic HTML
- 🎯 **TypeScript Ready** - Easy to add TypeScript support

## Theme System

The application includes a sophisticated theme system with:

- **5 Built-in Themes**: Light, Dark, Ocean, Sunset, Forest
- **Dynamic Theme Switching**: Instant theme changes with smooth transitions
- **LocalStorage Persistence**: Theme preference is saved
- **System Preference Detection**: Automatically detects user's system theme preference
- **CSS Variables**: Dynamic theming using CSS custom properties

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout/          # Layout components (Header, Footer, etc.)
│   │   ├── common/          # Reusable components (Button, Card, etc.)
│   │   └── animations/      # Animation components
│   ├── pages/
│   │   └── Home/           # Landing page
│   ├── context/            # React contexts (ThemeContext)
│   ├── hooks/              # Custom React hooks (useTheme)
│   ├── utils/              # Utility functions (animations, helpers)
│   ├── styles/             # Global styles
│   ├── assets/             # Static assets
│   ├── App.jsx             # Main app component
│   └── main.jsx            # Entry point
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
└── package.json            # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn/pnpm

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Components

### Layout Components

- **MainLayout** - Desktop layout wrapper
- **MobileLayout** - Mobile-optimized layout
- **Header** - Responsive navigation with theme toggle
- **Footer** - Modern footer with links and social icons

### Common Components

- **Button** - Reusable button with variants (primary, secondary, outline, ghost)
- **Card** - Animated card component with hover effects
- **ThemeToggle** - Theme switcher with smooth transitions

### Animation Components

- **LottieAnimation** - Wrapper for Lottie animations

## Utilities

### Animation Utilities (GSAP)

- `animateTextReveal()` - Staggered text reveal animation
- `animateOnScroll()` - Scroll-triggered animations
- `parallaxEffect()` - Parallax scroll effects
- `fadeIn()` - Fade in animation
- `scaleIn()` - Scale in animation
- `staggerAnimation()` - Stagger animation for multiple elements

### Helper Utilities

- `cn()` - Conditional className joining
- `debounce()` - Debounce function calls
- `throttle()` - Throttle function calls
- `isInViewport()` - Check if element is in viewport
- `scrollToElement()` - Smooth scroll to element
- `formatDate()` - Format dates
- `generateId()` - Generate unique IDs

## Customization

### Adding New Themes

Edit `tailwind.config.js` and `src/styles/globals.css` to add new theme colors.

### Modifying Animations

Edit `src/utils/animations.js` to customize GSAP animations.

### Adding New Components

Follow the existing component structure in `src/components/`.

## Technologies Used

- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - CSS framework
- **GSAP** - Animation library
- **Lottie-react** - Lottie animations
- **React Router DOM** - Routing
- **clsx** - Conditional classNames

## Best Practices

- Clean, modular code structure
- Comprehensive JSDoc comments
- Proper component composition
- Accessibility considerations
- Performance optimizations
- Responsive design principles

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
