'use client';

import React, { createContext, useContext, useState } from 'react';
import { ThemeMode, ThemeConfig, HardwareSpec } from '@/types/setup';
import { THEMES, HARDWARE_SPECS } from '@/lib/setup/specsData';

interface ThemeContextType {
  themeMode: ThemeMode;
  theme: ThemeConfig;
  setThemeMode: (mode: ThemeMode) => void;
  activeSpecId: string;
  activeSpec: HardwareSpec;
  setActiveSpecId: (id: string) => void;
  hoveredSpecId: string | null;
  setHoveredSpecId: (id: string | null) => void;
  resetView: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('neon-noir');
  const [activeSpecId, setActiveSpecId] = useState<string>('overview');
  const [hoveredSpecId, setHoveredSpecId] = useState<string | null>(null);

  const theme = THEMES[themeMode];
  const activeSpec = HARDWARE_SPECS[activeSpecId] || HARDWARE_SPECS.overview;

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  const resetView = () => {
    setActiveSpecId('overview');
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        theme,
        setThemeMode,
        activeSpecId,
        activeSpec,
        setActiveSpecId,
        hoveredSpecId,
        setHoveredSpecId,
        resetView,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};
