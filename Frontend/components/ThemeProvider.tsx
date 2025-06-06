import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { Appearance } from 'react-native';

const lightColors = {
  background: '#F3F4F6',
  card: '#FFFFFF',
  cardAlt: '#F8FAFC',
  border: '#E2E8F0',
  primary: '#4682B4',
  primaryLight: '#B0C4DE',
  secondary: '#A78BFA',
  accent: '#FF69B4',
  text: '#0F172A',
  textSecondary: '#64748B',
  error: '#EF4444',
  success: '#22C55E',
  warning: '#FFD93D',
  button: '#4682B4',
  buttonText: '#fff',
  tabInactive: '#64748B',
  tabActive: '#4682B4',
};

const darkColors = {
  background: '#181A20',
  card: '#23262F',
  cardAlt: '#23262F',
  border: '#3A3C43',
  primary: '#7AB8F5',
  primaryLight: '#B0C4DE',
  secondary: '#A78BFA',
  accent: '#FF69B4',
  text: '#F3F4F6',
  textSecondary: '#B0C4DE',
  error: '#F87171',
  success: '#22C55E',
  warning: '#FFD93D',
  button: '#7AB8F5',
  buttonText: '#181A20',
  tabInactive: '#B0C4DE',
  tabActive: '#7AB8F5',
};

const ThemeContext = createContext({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const colorScheme = Appearance.getColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === 'dark');

  const toggleTheme = () => setIsDark((d) => !d);

  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
} 