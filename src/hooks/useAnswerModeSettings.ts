import { useState, useEffect } from 'react';

export type AnswerMode = 'classic' | 'card';

export interface AnswerModeSettings {
  mode: AnswerMode;
  isFirstVisit: boolean;
}

const STORAGE_KEY = 'quiz_answer_mode';

const defaultSettings: AnswerModeSettings = {
  mode: 'classic',
  isFirstVisit: true,
};

export function useAnswerModeSettings() {
  const [settings, setSettings] = useState<AnswerModeSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load answer mode settings:', error);
    }
    return defaultSettings;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save answer mode settings:', error);
    }
  }, [settings]);

  const updateSettings = (updates: Partial<AnswerModeSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const setMode = (mode: AnswerMode) => {
    updateSettings({ mode, isFirstVisit: false });
  };

  const markVisited = () => {
    updateSettings({ isFirstVisit: false });
  };

  const isCardMode = settings.mode === 'card' && window.innerWidth < 768;

  return {
    settings,
    updateSettings,
    setMode,
    markVisited,
    isCardMode,
    isFirstVisit: settings.isFirstVisit,
  };
}
