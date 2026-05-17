import { useState, useEffect } from 'react';

export interface GestureSettings {
  enabled: boolean;
  sensitivity: number;
}

const STORAGE_KEY = 'quiz_gesture_settings';

const defaultSettings: GestureSettings = {
  enabled: true,
  sensitivity: 50,
};

export function useGestureSettings() {
  const [settings, setSettings] = useState<GestureSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load gesture settings:', error);
    }
    return defaultSettings;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save gesture settings:', error);
    }
  }, [settings]);

  const updateSettings = (updates: Partial<GestureSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  return {
    settings,
    updateSettings,
  };
}
