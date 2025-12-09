import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/helpers';

/**
 * ThemeToggle component for switching between themes
 * Displays all available themes with visual preview
 * Includes smooth transitions and animations
 */
const ThemeToggle = () => {
  const { theme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Theme display names and colors
  const themeConfig = {
    light: { name: 'Light', icon: '☀️', color: '#3b82f6' },
    dark: { name: 'Dark', icon: '🌙', color: '#60a5fa' },
    ocean: { name: 'Ocean', icon: '🌊', color: '#0284c7' },
    sunset: { name: 'Sunset', icon: '🌅', color: '#f59e0b' },
    forest: { name: 'Forest', icon: '🌲', color: '#16a34a' },
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Current theme button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--color-primary)] transition-all duration-300 hover:scale-105"
        aria-label="Toggle theme menu"
      >
        <span className="text-xl">{themeConfig[theme]?.icon}</span>
        <span className="hidden sm:inline font-medium text-[var(--text-primary)]">
          {themeConfig[theme]?.name}
        </span>
        <svg
          className={cn(
            'w-4 h-4 transition-transform duration-300',
            isOpen && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Theme dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-2xl z-50 animate-slide-down overflow-hidden">
            {themes.map((themeName) => (
              <button
                key={themeName}
                onClick={() => handleThemeChange(themeName)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200',
                  'hover:bg-[var(--bg-primary)] hover:pl-6',
                  theme === themeName && 'bg-[var(--bg-primary)] font-semibold'
                )}
                aria-label={`Switch to ${themeConfig[themeName]?.name} theme`}
              >
                <span className="text-xl">{themeConfig[themeName]?.icon}</span>
                <span className="text-[var(--text-primary)]">
                  {themeConfig[themeName]?.name}
                </span>
                {theme === themeName && (
                  <svg
                    className="w-5 h-5 ml-auto text-[var(--color-primary)]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeToggle;
