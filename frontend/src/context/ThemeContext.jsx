import { createContext, useState, useEffect } from 'react';

/**
 * ThemeContext provides global theme state management
 * Supports multiple themes: light, dark, ocean, sunset, forest
 * Persists theme preference to localStorage
 * Detects and respects system preference
 */
export const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {},
  themes: [],
});

/**
 * ThemeProvider component that wraps the application
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const ThemeProvider = ({ children }) => {
  const themes = ['light', 'dark', 'ocean', 'sunset', 'forest'];
  
  // Initialize theme from localStorage or system preference
  const getInitialTheme = () => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && themes.includes(savedTheme)) {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  };

  const [theme, setThemeState] = useState(getInitialTheme);

  /**
   * Set theme and persist to localStorage
   * @param {string} newTheme - Theme name to apply
   */
  const setTheme = (newTheme) => {
    if (themes.includes(newTheme)) {
      setThemeState(newTheme);
      localStorage.setItem('theme', newTheme);
    }
  };

  // Apply theme class to document root
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    themes.forEach(t => root.classList.remove(t));
    
    // Add current theme class
    root.classList.add(theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Only update if user hasn't set a preference
      if (!localStorage.getItem('theme')) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const value = {
    theme,
    setTheme,
    themes,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
