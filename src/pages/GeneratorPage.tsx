import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Copy,
  RefreshCw,
  Minimize2,
  Maximize2,
  Wrench,
  HelpCircle,
  Save,
  Download,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { generatePromptWithAI } from '@/lib/aiProvider';
import { makeShorter, makeMoreDetailed, fixPrompt } from '@/lib/promptEngine';
import { loadSavedPrompts, savePrompts } from '@/lib/storage';
import { exportAsTxt, exportAsMarkdown, exportAsJson } from '@/lib/export';
import { copyToClipboard, generateId } from '@/lib/utils';
import type {
  AppSettings,
  Page,
  PromptConfig,
  TargetAI,
  PromptType,
  OutputLength,
  Tone,
  TechnicalLevel,
  CreativityLevel,
  SavedPrompt,
} from '@/types';

interface Props {
  settings: AppSettings;
  onNavigate: (page: Page) => void;
}

const TARGET_AIS: TargetAI[] = ['Grok', 'ChatGPT', 'Claude', 'Gemini', 'Other'];
const PROMPT_TYPES: PromptType[] = [
  'Coding',
  'Writing',
  'Research',
  'Image Generation',
  'Business',
  'School',
  'General',
];
const LENGTHS: OutputLength[] = ['Concise', 'Standard', 'Detailed', 'Comprehensive'];
const TONES: Tone[] = ['Professional', 'Casual', 'Technical', 'Creative', 'Friendly', 'Authoritative'];
const TECH_LEVELS: TechnicalLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const CREATIVITY: CreativityLevel[] = ['Low', 'Medium', 'High', 'Maximum'];

export function GeneratorPage({ settings }: Props) {
  const [config, setConfig] = useState<PromptConfig>({
    idea: '',
    targetAI: settings.defaultTargetAI,
    promptType: settings.defaultPromptType,
    outputLength: settings.defaultOutputLength,
    tone: settings.defaultTone,
    technicalLevel: 'Intermediate',
    creativityLevel: 'Medium',
    askClarifyingQuestions: false,
    additionalRequirements: '',
    outputFormat: '',
  });

  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [usedDemoMode, setUsedDemoMode] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const updateConfig = <K extends keyof PromptConfig>(key: K, value: PromptConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = useCallback(async () => {
    if (!config.idea.trim()) {
      setError('Please describe what you want the AI to do.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setCopied(false);

    try {
      const result = await generatePromptWithAI(config, settings.aiConfig);
      if (result.success) {
        setGeneratedPrompt(result.prompt);
        setUsedDemoMode(result.usedDemoMode);
      } else {
        setError(result.error || 'Generation failed');
        setGeneratedPrompt('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setIsGenerating(false);
    }
  }, [config, settings.aiConfig]);

  const handleCopy = async () => {
    if (!generatedPrompt) return;
    const ok = await copyToClipboard(generatedPrompt);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAction = (action: 'shorter' | 'detailed' | 'fix' | 'regenerate') => {
    if (action === 'regenerate') {
      handleGenerate();
      return;
    }
    if (!generatedPrompt) return;

    let next = generatedPrompt;
    if (action === 'shorter') next = makeShorter(generatedPrompt);
    if (action === 'detailed') next = makeMoreDetailed(generatedPrompt);
    if (action === 'fix') next = fixPrompt(generatedPrompt);
    setGeneratedPrompt(next);
  };

  const handleExplain = () => {
    if (!generatedPrompt) return;
    const explanation = `## Prompt Explanation\n\nThis prompt was structured to maximize reliability and quality:\n\n1. **Role** – Gives the model a clear persona so it behaves consistently.\n2. **Objective** – States the core goal in the user’s own words.\n3. **Context** – Injects the selected options (target model, tone, depth, etc.).\n4. **Requirements & Constraints** – Removes ambiguity and sets boundaries.\n5. **Process** – Guides the model through a sensible workflow.\n6. **Output Format** – Tells the model exactly how to shape the answer.\n7. **Quality Criteria** – Reinforces what “good” looks like.\n\nYou can further refine it with the buttons above or by editing the text directly.`;
    setGeneratedPrompt((prev) => `${prev}\n\n---\n\n${explanation}`);
  };

  const handleSave = () => {
    if (!generatedPrompt.trim()) return;
    setSaveTitle(config.idea.slice(0, 60) || 'Untitled Prompt');
    setShowSaveDialog(true);
  };

  const confirmSave = () => {
    const prompts = loadSavedPrompts();
    const newPrompt: SavedPrompt = {
      id: generateId(),
      title: saveTitle.trim() || 'Untitled Prompt',
      description: config.idea.slice(0, 120),
      content: generatedPrompt,
      tags: [config.promptType, config.targetAI],
      category: config.promptType,
      isFavorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    savePrompts([newPrompt, ...prompts]);
    setShowSaveDialog(false);
    setSaveTitle('');
  };

  const handleExport = (format: 'txt' | 'md' | 'json') => {
    if (!generatedPrompt) return;
    const name = (saveTitle || config.idea || 'prompt').slice(0, 40).replace(/[^a-z0-9]/gi, '_');
    if (format === 'txt') exportAsTxt(generatedPrompt, name);
    else if (format === 'md') exportAsMarkdown(generatedPrompt, name);
    else exportAsJson({ title: saveTitle || config.idea, content: generatedPrompt }, name);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-3 sm:space-y-6 sm:p-6">
      {/* Desktop-only header; mobile uses top bar */}
      <div className="hidden items-center justify-between md:flex">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Prompt Generator</h2>
          <p className="text-sm text-muted-foreground">
            Describe what you want. Get a production-ready prompt.
          </p>
        </div>
        {usedDemoMode && generatedPrompt && (
          <Badge variant="secondary">Demo Mode</Badge>
        )}
      </div>

      {usedDemoMode && generatedPrompt && (
        <div className="md:hidden">
          <Badge variant="secondary">Demo Mode</Badge>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-5 lg:gap-6">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-3">
              <CardTitle className="text-base">What do you want the AI to do?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0 sm:space-y-4 sm:p-6 sm:pt-0">
              <Textarea
                placeholder="e.g. Make me a Minecraft Discord moderation bot in Python..."
                value={config.idea}
                onChange={(e) => updateConfig('idea', e.target.value)}
                className="min-h-[100px] text-sm sm:min-h-[140px]"
              />

              <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Target AI</label>
                  <Select
                    value={config.targetAI}
                    onChange={(e) => updateConfig('targetAI', e.target.value as TargetAI)}
                  >
                    {TARGET_AIS.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Prompt Type</label>
                  <Select
                    value={config.promptType}
                    onChange={(e) => updateConfig('promptType', e.target.value as PromptType)}
                  >
                    {PROMPT_TYPES.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Output Length</label>
                  <Select
                    value={config.outputLength}
                    onChange={(e) => updateConfig('outputLength', e.target.value as OutputLength)}
                  >
                    {LENGTHS.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Tone</label>
                  <Select
                    value={config.tone}
                    onChange={(e) => updateConfig('tone', e.target.value as Tone)}
                  >
                    {TONES.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Technical Level</label>
                  <Select
                    value={config.technicalLevel}
                    onChange={(e) => updateConfig('technicalLevel', e.target.value as TechnicalLevel)}
                  >
                    {TECH_LEVELS.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Creativity</label>
                  <Select
                    value={config.creativityLevel}
                    onChange={(e) => updateConfig('creativityLevel', e.target.value as CreativityLevel)}
                  >
                    {CREATIVITY.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Additional Requirements</label>
                <Textarea
                  placeholder="Any extra constraints or must-haves..."
                  value={config.additionalRequirements}
                  onChange={(e) => updateConfig('additionalRequirements', e.target.value)}
                  className="min-h-[60px] text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Output Format (optional)</label>
                <Input
                  placeholder="Markdown, JSON, step-by-step list..."
                  value={config.outputFormat}
                  onChange={(e) => updateConfig('outputFormat', e.target.value)}
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={config.askClarifyingQuestions}
                  onChange={(e) => updateConfig('askClarifyingQuestions', e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
                Ask clarifying questions when needed
              </label>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !config.idea.trim()}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Prompt
                  </>
                )}
              </Button>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-3">
          <Card className="flex flex-col">
            <CardHeader className="flex flex-col gap-2 space-y-0 p-4 pb-2 sm:flex-row sm:items-center sm:justify-between sm:p-6 sm:pb-3">
              <CardTitle className="text-base">Generated Prompt</CardTitle>
              <div className="flex flex-wrap gap-1.5">
                <Button variant="outline" size="sm" onClick={handleCopy} disabled={!generatedPrompt}>
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleAction('regenerate')} disabled={isGenerating}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Regenerate</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3 p-4 pt-0 sm:p-6 sm:pt-0">
              <Textarea
                value={generatedPrompt}
                onChange={(e) => setGeneratedPrompt(e.target.value)}
                placeholder="Your optimized prompt will appear here..."
                className="min-h-[220px] flex-1 font-mono text-sm leading-relaxed sm:min-h-[380px]"
              />

              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => handleAction('shorter')} disabled={!generatedPrompt}>
                  <Minimize2 className="h-3.5 w-3.5" />
                  <span className="hidden xs:inline sm:inline">Shorter</span>
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleAction('detailed')} disabled={!generatedPrompt}>
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Detailed</span>
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleAction('fix')} disabled={!generatedPrompt}>
                  <Wrench className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Fix</span>
                </Button>
                <Button variant="secondary" size="sm" onClick={handleExplain} disabled={!generatedPrompt}>
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Explain</span>
                </Button>
                <Button variant="secondary" size="sm" onClick={handleSave} disabled={!generatedPrompt}>
                  <Save className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Save</span>
                </Button>
                <Button variant="secondary" size="sm" disabled={!generatedPrompt} onClick={() => handleExport(settings.exportFormat)}>
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </div>

              {generatedPrompt && (
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <button type="button" onClick={() => handleExport('txt')} className="min-h-0 py-1 hover:text-foreground">TXT</button>
                  <span>·</span>
                  <button type="button" onClick={() => handleExport('md')} className="min-h-0 py-1 hover:text-foreground">Markdown</button>
                  <span>·</span>
                  <button type="button" onClick={() => handleExport('json')} className="min-h-0 py-1 hover:text-foreground">JSON</button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AnimatePresence>
        {showSaveDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
            onClick={() => setShowSaveDialog(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-2xl border border-border bg-card p-5 shadow-xl sm:rounded-xl sm:p-6"
            >
              <h3 className="mb-4 text-lg font-semibold">Save Prompt</h3>
              <Input
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder="Prompt title"
                className="mb-4"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
                <Button onClick={confirmSave}>Save to Library</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
