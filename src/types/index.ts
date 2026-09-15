export type TargetAI = 'Grok' | 'ChatGPT' | 'Claude' | 'Gemini' | 'Other';

export type PromptType =
  | 'Coding'
  | 'Writing'
  | 'Research'
  | 'Image Generation'
  | 'Business'
  | 'School'
  | 'General';

export type OutputLength = 'Concise' | 'Standard' | 'Detailed' | 'Comprehensive';
export type Tone = 'Professional' | 'Casual' | 'Technical' | 'Creative' | 'Friendly' | 'Authoritative';
export type TechnicalLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type CreativityLevel = 'Low' | 'Medium' | 'High' | 'Maximum';

export interface PromptConfig {
  idea: string;
  targetAI: TargetAI;
  promptType: PromptType;
  outputLength: OutputLength;
  tone: Tone;
  technicalLevel: TechnicalLevel;
  creativityLevel: CreativityLevel;
  askClarifyingQuestions: boolean;
  additionalRequirements: string;
  outputFormat: string;
}

export interface SavedPrompt {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  category: string;
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrompt: string;
  placeholders: string[];
}

export interface AIProviderConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'xai' | 'custom' | 'none';
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  baseUrl?: string;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  defaultTargetAI: TargetAI;
  defaultPromptType: PromptType;
  defaultOutputLength: OutputLength;
  defaultTone: Tone;
  aiConfig: AIProviderConfig;
  exportFormat: 'txt' | 'md' | 'json';
}

export type Page =
  | 'generator'
  | 'improver'
  | 'library'
  | 'templates'
  | 'settings';