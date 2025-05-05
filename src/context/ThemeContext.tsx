
import React, { createContext, useContext, ReactNode } from 'react';
import { ThemeProvider as NextThemeProvider } from "next-themes";
import { ThemeSettings } from '@/types';
import { saveThemeSettings, getThemeSettings } from '@/services/localStorage';

type AccentColor = 'purple' | 'blue' | 'green' | 'pink' | 'orange';

interface ThemeContextProps {
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const AppThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize theme and accent color from localStorage
  const initialSettings = getThemeSettings();
  const [accentColor, setAccentColorState] = React.useState<AccentColor>(
    initialSettings.accentColor as AccentColor
  );

  // Update accent color and save to localStorage
  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
    
    const currentSettings = getThemeSettings();
    const newSettings: ThemeSettings = {
      ...currentSettings,
      accentColor: color
    };
    
    saveThemeSettings(newSettings);
    
    // Apply color to CSS variables
    document.documentElement.style.setProperty(
      '--primary', 
      getAccentColorValue(color)
    );
  };

  // Get CSS variable value for accent color
  const getAccentColorValue = (color: AccentColor): string => {
    switch (color) {
      case 'purple':
        return '260 67% 75%';
      case 'blue':
        return '217 91% 60%';
      case 'green':
        return '142 76% 36%';
      case 'pink':
        return '330 81% 60%';
      case 'orange':
        return '24 95% 53%';
    }
  };

  // Apply initial accent color on mount
  React.useEffect(() => {
    document.documentElement.style.setProperty(
      '--primary', 
      getAccentColorValue(accentColor)
    );
  }, []);

  return (
    <NextThemeProvider attribute="class" defaultTheme={initialSettings.theme}>
      <ThemeContext.Provider value={{ accentColor, setAccentColor }}>
        {children}
      </ThemeContext.Provider>
    </NextThemeProvider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
