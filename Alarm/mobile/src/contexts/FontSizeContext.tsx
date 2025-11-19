import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FontSize = 'small' | 'medium' | 'large' | 'extra-large' | 'extra-extra-large';

interface FontSizeContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => Promise<void>;
  fontScale: number;
}

const fontScaleMap: Record<FontSize, number> = {
  'small': 0.85,
  'medium': 1.0,
  'large': 1.15,
  'extra-large': 1.3,
  'extra-extra-large': 1.5,
};

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

const FONT_SIZE_STORAGE_KEY = '@alarm_app_font_size';

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>('medium');
  const [fontScale, setFontScale] = useState<number>(1.0);

  useEffect(() => {
    loadFontSize();
  }, []);

  const loadFontSize = async () => {
    try {
      const savedSize = await AsyncStorage.getItem(FONT_SIZE_STORAGE_KEY);
      if (savedSize && savedSize in fontScaleMap) {
        const size = savedSize as FontSize;
        setFontSizeState(size);
        setFontScale(fontScaleMap[size]);
      }
    } catch (error) {
      console.error('Error loading font size:', error);
    }
  };

  const setFontSize = async (size: FontSize) => {
    try {
      await AsyncStorage.setItem(FONT_SIZE_STORAGE_KEY, size);
      setFontSizeState(size);
      setFontScale(fontScaleMap[size]);
    } catch (error) {
      console.error('Error saving font size:', error);
    }
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize, fontScale }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  const context = useContext(FontSizeContext);
  if (context === undefined) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
}

export function getFontSizeLabel(size: FontSize): string {
  const labels: Record<FontSize, string> = {
    'small': 'Small',
    'medium': 'Medium',
    'large': 'Large',
    'extra-large': 'Extra Large',
    'extra-extra-large': 'Extra Extra Large',
  };
  return labels[size];
}
