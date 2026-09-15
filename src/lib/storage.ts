import type { SavedPrompt, AppSettings, AIProviderConfig } from '@/types';

const STORAGE_KEYS = {
  prompts: 'apm_saved_prompts',
  settings: 'apm_settings',
  theme: 'apm_theme',
} as const;

const DEFAULT_AI_CONFIG: AIProviderConfig = {
  provider: 'none',
  apiKey: '',
  model: '',
  temperature: 0.7,
  maxTokens: 4096,
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  defaultTargetAI: 'Grok',
  defaultPromptType: 'General',
  defaultOutputLength: 'Detailed',
  defaultTone: 'Professional',
  aiConfig: DEFAULT_AI_CONFIG,
  exportFormat: 'md',
};

export function loadSavedPrompts(): SavedPrompt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.prompts);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function savePrompts(prompts: SavedPrompt[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.prompts, JSON.stringify(prompts));
  } catch (e) {
    console.error('Failed to save prompts:', e);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.settings);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      aiConfig: {
        ...DEFAULT_AI_CONFIG,
        ...(parsed.aiConfig || {}),
      },
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    // Never store API key in a way that could be accidentally exposed in logs, but localStorage is fine for client-side
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function clearAllPrompts(): void {
  localStorage.removeItem(STORAGE_KEYS.prompts);
}

export function resetSettings(): AppSettings {
  localStorage.removeItem(STORAGE_KEYS.settings);
  return { ...DEFAULT_SETTINGS };
}