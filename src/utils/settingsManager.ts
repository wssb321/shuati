export interface QuizSettings {
  immediateFeedback: boolean;
  autoJump: boolean;
}

const SETTINGS_KEY = 'quiz_settings';

const DEFAULT_SETTINGS: QuizSettings = {
  immediateFeedback: false,
  autoJump: false
};

export function saveQuizSettings(settings: QuizSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('保存设置失败:', error);
  }
}

export function getQuizSettings(): QuizSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) return DEFAULT_SETTINGS;
    
    const settings = JSON.parse(data);
    return {
      immediateFeedback: !!settings.immediateFeedback,
      autoJump: !!settings.autoJump
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function updateQuizSetting<T extends keyof QuizSettings>(
  key: T, 
  value: QuizSettings[T]
) {
  const currentSettings = getQuizSettings();
  const newSettings = { ...currentSettings, [key]: value };
  saveQuizSettings(newSettings);
  return newSettings;
}
