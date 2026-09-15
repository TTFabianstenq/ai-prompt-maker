import type { PromptConfig, OutputLength, Tone, TechnicalLevel, CreativityLevel, PromptType } from '@/types';

/**
 * High-quality local prompt generation engine.
 * Produces structured, optimized prompts without calling any external AI.
 */
export function generateLocalPrompt(config: PromptConfig): string {
  if (!config.idea.trim()) {
    throw new Error('Please describe what you want the AI to do.');
  }

  const sections: string[] = [];

  // Role / Persona
  sections.push(buildRole(config));

  // Objective
  sections.push(`## Objective\n${config.idea.trim()}`);

  // Context & Requirements
  const context = buildContext(config);
  if (context) sections.push(context);

  // Detailed Requirements
  sections.push(buildRequirements(config));

  // Constraints
  sections.push(buildConstraints(config));

  // Process / Steps
  sections.push(buildProcess(config));

  // Output format
  sections.push(buildOutputFormat(config));

  // Quality & Verification
  sections.push(buildQuality(config));

  // Clarifying questions (optional)
  if (config.askClarifyingQuestions) {
    sections.push(`## Clarifying Questions\nBefore producing the final output, ask 2-4 concise clarifying questions if any critical information is missing or ambiguous. Wait for answers before continuing.`);
  }

  // Warnings
  sections.push(buildWarnings(config));

  return sections.join('\n\n');
}

function buildRole(config: PromptConfig): string {
  const typeMap: Record<PromptType, string> = {
    Coding: 'an expert software engineer and technical architect',
    Writing: 'a skilled professional writer and editor',
    Research: 'a meticulous research analyst',
    'Image Generation': 'an expert prompt engineer specializing in image generation',
    Business: 'a seasoned business strategist and consultant',
    School: 'an experienced educator and study coach',
    General: 'a highly capable and precise AI assistant',
  };

  const base = typeMap[config.promptType] || typeMap.General;
  const toneAdj = toneAdjective(config.tone);
  const levelAdj = levelAdjective(config.technicalLevel);

  return `## Role\nYou are ${toneAdj} ${levelAdj} ${base}. Your responses are accurate, well-structured, and optimized for the target model (${config.targetAI}).`;
}

function toneAdjective(tone: Tone): string {
  const map: Record<Tone, string> = {
    Professional: 'a professional and precise',
    Casual: 'a friendly and approachable',
    Technical: 'a rigorously technical',
    Creative: 'a highly creative and imaginative',
    Friendly: 'a warm and supportive',
    Authoritative: 'an authoritative and confident',
  };
  return map[tone] || 'a professional';
}

function levelAdjective(level: TechnicalLevel): string {
  const map: Record<TechnicalLevel, string> = {
    Beginner: 'beginner-friendly',
    Intermediate: 'intermediate-level',
    Advanced: 'advanced',
    Expert: 'expert-level',
  };
  return map[level] || '';
}

function buildContext(config: PromptConfig): string {
  const parts: string[] = [];

  parts.push(`Target AI model: ${config.targetAI}`);
  parts.push(`Prompt category: ${config.promptType}`);
  parts.push(`Desired depth: ${config.outputLength}`);
  parts.push(`Tone: ${config.tone}`);
  parts.push(`Technical level: ${config.technicalLevel}`);
  parts.push(`Creativity: ${config.creativityLevel}`);

  if (config.additionalRequirements.trim()) {
    parts.push(`\nAdditional user requirements:\n${config.additionalRequirements.trim()}`);
  }

  return `## Context\n${parts.join('\n')}`;
}

function buildRequirements(config: PromptConfig): string {
  const lines: string[] = [
    '## Requirements',
    '- Fully address the objective stated above.',
    '- Be specific and actionable.',
    '- Prefer concrete details over vague statements.',
  ];

  if (config.promptType === 'Coding') {
    lines.push('- Include complete, runnable code when code is required.');
    lines.push('- Add brief comments only where they improve clarity.');
    lines.push('- Mention important dependencies and how to run the code.');
    lines.push('- Consider edge cases and basic error handling.');
  }

  if (config.promptType === 'Writing') {
    lines.push('- Match the requested tone and style consistently.');
    lines.push('- Structure the text with clear hierarchy (headings, paragraphs, lists as appropriate).');
  }

  if (config.promptType === 'Research') {
    lines.push('- Distinguish facts from analysis or opinion.');
    lines.push('- Highlight uncertainty or conflicting information when present.');
  }

  if (config.promptType === 'Image Generation') {
    lines.push('- Produce a detailed, well-structured image prompt.');
    lines.push('- Include subject, style, lighting, composition, and mood.');
    lines.push('- Avoid banned or unsafe content.');
  }

  return lines.join('\n');
}

function buildConstraints(config: PromptConfig): string {
  const lines: string[] = [
    '## Constraints',
    '- Do not invent information that is not supported by the request or general knowledge.',
    '- Stay focused on the stated objective; avoid unnecessary tangents.',
  ];

  if (config.creativityLevel === 'Low') {
    lines.push('- Prioritize accuracy and conventional solutions over novelty.');
  } else if (config.creativityLevel === 'High' || config.creativityLevel === 'Maximum') {
    lines.push('- Feel free to explore creative and original approaches while remaining useful.');
  }

  if (config.technicalLevel === 'Beginner') {
    lines.push('- Avoid unexplained jargon. Define terms when first used.');
  }

  return lines.join('\n');
}

function buildProcess(config: PromptConfig): string {
  const steps: string[] = [
    '## Recommended Process',
    '1. Carefully analyze the objective and all requirements.',
    '2. Plan the structure of your response before writing.',
    '3. Produce the complete deliverable.',
    '4. Review against the requirements and constraints.',
  ];

  if (config.promptType === 'Coding') {
    steps.push('5. Mentally verify that the code would compile/run and handles basic edge cases.');
  }

  return steps.join('\n');
}

function buildOutputFormat(config: PromptConfig): string {
  let format = config.outputFormat.trim();

  if (!format) {
    switch (config.promptType) {
      case 'Coding':
        format = 'Well-structured response with clear sections. Code blocks with language tags. Brief explanations where needed.';
        break;
      case 'Writing':
        format = 'Clean, readable prose with appropriate headings and paragraphs.';
        break;
      case 'Research':
        format = 'Structured report with sections, bullet points for key findings, and clear conclusions.';
        break;
      case 'Image Generation':
        format = 'A single, detailed image generation prompt ready to paste into an image model.';
        break;
      default:
        format = 'Clear, well-organized response with logical sections.';
    }
  }

  const lengthNote = lengthGuidance(config.outputLength);

  return `## Expected Output Format\n${format}\n\n${lengthNote}`;
}

function lengthGuidance(length: OutputLength): string {
  const map: Record<OutputLength, string> = {
    Concise: 'Keep the response concise and to the point. Prefer brevity.',
    Standard: 'Provide a balanced level of detail — neither too short nor overly long.',
    Detailed: 'Provide thorough coverage. Include important details and explanations.',
    Comprehensive: 'Be exhaustive. Cover edge cases, alternatives, and supporting information where relevant.',
  };
  return map[length];
}

function buildQuality(config: PromptConfig): string {
  return `## Quality Criteria\n- Accuracy and correctness are the highest priority.\n- Clarity of instructions and structure.\n- Relevance to the original request.\n- No filler or unnecessary repetition.\n- The final output should be immediately usable.`;
}

function buildWarnings(config: PromptConfig): string {
  const lines = [
    '## Important',
    '- Follow every section of this prompt carefully.',
    '- If a requirement cannot be fulfilled, explicitly state why and provide the best alternative.',
  ];

  if (config.promptType === 'Coding') {
    lines.push('- Do not leave TODO placeholders for core functionality.');
  }

  return lines.join('\n');
}

/** Utility used by Improver actions */
export function makeShorter(prompt: string): string {
  return `${prompt}

---\nLength constraint: Significantly shorten the response. Remove redundant explanations while preserving all critical instructions and requirements.`;
}

export function makeMoreDetailed(prompt: string): string {
  return `${prompt}

---\nDetail requirement: Expand the prompt with more specific requirements, edge cases, quality criteria, and concrete examples where helpful. Do not add irrelevant filler.`;
}

export function fixPrompt(prompt: string): string {
  return `${prompt}

---\nFix instructions:\n- Resolve any contradictions.\n- Clarify ambiguous statements.\n- Strengthen weak or vague requirements.\n- Ensure the structure is logical and complete.`;
}