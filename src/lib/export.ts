import type { SavedPrompt } from '@/types';
import { downloadFile } from './utils';

export function exportAsTxt(content: string, filename = 'prompt') {
  downloadFile(content, `${filename}.txt`, 'text/plain;charset=utf-8');
}

export function exportAsMarkdown(content: string, filename = 'prompt') {
  downloadFile(content, `${filename}.md`, 'text/markdown;charset=utf-8');
}

export function exportAsJson(prompt: { title?: string; content: string; meta?: Record<string, unknown> }, filename = 'prompt') {
  const data = {
    title: prompt.title || 'Untitled Prompt',
    content: prompt.content,
    exportedAt: new Date().toISOString(),
    ...prompt.meta,
  };
  downloadFile(JSON.stringify(data, null, 2), `${filename}.json`, 'application/json;charset=utf-8');
}

export function exportSavedPrompt(prompt: SavedPrompt, format: 'txt' | 'md' | 'json') {
  const safeName = prompt.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'prompt';

  switch (format) {
    case 'txt':
      exportAsTxt(prompt.content, safeName);
      break;
    case 'md':
      exportAsMarkdown(`# ${prompt.title}\n\n${prompt.description ? `> ${prompt.description}\n\n` : ''}${prompt.content}`, safeName);
      break;
    case 'json':
      exportAsJson({
        title: prompt.title,
        content: prompt.content,
        meta: {
          description: prompt.description,
          tags: prompt.tags,
          category: prompt.category,
          isFavorite: prompt.isFavorite,
          createdAt: prompt.createdAt,
          updatedAt: prompt.updatedAt,
        },
      }, safeName);
      break;
  }
}