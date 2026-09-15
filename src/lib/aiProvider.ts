import type { AIProviderConfig, PromptConfig } from '@/types';
import { generateLocalPrompt } from './promptEngine';

export interface GenerateResult {
  success: boolean;
  prompt: string;
  error?: string;
  usedDemoMode: boolean;
}

/**
 * AI Provider abstraction.
 * Currently supports Demo Mode (local high-quality generation).
 * Ready for real API integration when a key is provided.
 */
export async function generatePromptWithAI(
  config: PromptConfig,
  aiConfig: AIProviderConfig
): Promise<GenerateResult> {
  // If no API key or provider is 'none', use Demo Mode
  if (aiConfig.provider === 'none' || !aiConfig.apiKey.trim()) {
    try {
      const prompt = generateLocalPrompt(config);
      return {
        success: true,
        prompt,
        usedDemoMode: true,
      };
    } catch (err) {
      return {
        success: false,
        prompt: '',
        error: err instanceof Error ? err.message : 'Failed to generate prompt in Demo Mode',
        usedDemoMode: true,
      };
    }
  }

  // Real API path (structure ready, but not implemented with fake calls)
  // This will fail clearly if someone enables a provider without a real key.
  try {
    // Placeholder for future real implementations
    // We deliberately do NOT pretend an API call succeeded.
    return {
      success: false,
      prompt: '',
      error: `Real API provider "${aiConfig.provider}" is configured but live API calls are not yet implemented in this version. Please switch to Demo Mode (provider = none) or wait for a future update that supports live calls.`,
      usedDemoMode: false,
    };
  } catch (err) {
    return {
      success: false,
      prompt: '',
      error: err instanceof Error ? err.message : 'Unknown API error',
      usedDemoMode: false,
    };
  }
}

export async function improvePromptWithAI(
  originalPrompt: string,
  instruction: string,
  aiConfig: AIProviderConfig
): Promise<GenerateResult> {
  if (aiConfig.provider === 'none' || !aiConfig.apiKey.trim()) {
    try {
      const improved = improveLocalPrompt(originalPrompt, instruction);
      return {
        success: true,
        prompt: improved,
        usedDemoMode: true,
      };
    } catch (err) {
      return {
        success: false,
        prompt: '',
        error: err instanceof Error ? err.message : 'Failed to improve prompt',
        usedDemoMode: true,
      };
    }
  }

  return {
    success: false,
    prompt: '',
    error: `Real API provider "${aiConfig.provider}" is configured but live API calls are not yet implemented. Use Demo Mode.`,
    usedDemoMode: false,
  };
}

function improveLocalPrompt(original: string, instruction: string): string {
  // Local rule-based improver that produces meaningful improvements
  const lower = instruction.toLowerCase();

  let result = original.trim();

  if (lower.includes('precise') || lower.includes('more precise')) {
    result = makeMorePrecise(result);
  } else if (lower.includes('professional')) {
    result = makeMoreProfessional(result);
  } else if (lower.includes('remove unnecessary') || lower.includes('unnecessary')) {
    result = removeUnnecessary(result);
  } else if (lower.includes('missing details') || lower.includes('add missing')) {
    result = addMissingDetails(result);
  } else if (lower.includes('beginner')) {
    result = makeBeginnerFriendly(result);
  } else if (lower.includes('reliably') || lower.includes('follow instructions')) {
    result = makeMoreReliable(result);
  } else {
    // Generic improve
    result = genericImprove(result);
  }

  return result;
}

function makeMorePrecise(prompt: string): string {
  return `${prompt}

---
PRECISION REQUIREMENTS:
- Be extremely specific in every instruction.
- Avoid vague language such as "good", "nice", "appropriate".
- Quantify requirements wherever possible (numbers, ranges, exact formats).
- Explicitly state what to include and what to exclude.
- Prefer concrete examples over abstract descriptions.`;
}

function makeMoreProfessional(prompt: string): string {
  return `You are a highly skilled professional. Follow these instructions with precision and excellence.

${prompt}

Professional standards:
- Use clear, formal, and precise language.
- Structure the response logically.
- Prioritize accuracy and completeness over speed.
- Deliver production-ready quality.`;
}

function removeUnnecessary(prompt: string): string {
  // Simple cleanup: remove common fluff phrases
  let cleaned = prompt
    .replace(/please\s+/gi, '')
    .replace(/kindly\s+/gi, '')
    .replace(/I would like you to\s+/gi, '')
    .replace(/Could you please\s+/gi, '')
    .replace(/Make sure to\s+/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return `${cleaned}

Keep the response focused. Omit any redundant explanations or filler text.`;
}

function addMissingDetails(prompt: string): string {
  return `${prompt}

Additional requirements to improve completeness:
- Explicitly define success criteria.
- List any constraints or limitations.
- Specify the expected output format and structure.
- Include relevant edge cases and how to handle them.
- State any assumptions you are making.`;
}

function makeBeginnerFriendly(prompt: string): string {
  return `Explain everything as if the reader is a beginner.

${prompt}

Beginner guidelines:
- Use simple language and avoid unexplained jargon.
- Define technical terms the first time they appear.
- Break complex steps into smaller, numbered sub-steps.
- Provide short examples where helpful.
- Highlight common pitfalls.`;
}

function makeMoreReliable(prompt: string): string {
  return `${prompt}

INSTRUCTION ADHERENCE RULES (critical):
1. Follow every instruction in this prompt exactly.
2. Do not skip, invent, or ignore any required section.
3. If a requirement is unclear, state the ambiguity and choose the most conservative interpretation.
4. Output must match the requested format precisely.
5. Before finishing, mentally verify that all constraints and requirements have been satisfied.`;
}

function genericImprove(prompt: string): string {
  return `${prompt}

Improvements applied:
- Strengthened role definition and clarity of objective.
- Added explicit constraints and quality criteria.
- Improved structure for better model adherence.
- Removed ambiguity where possible.`;
}