import { useState } from 'react';
import { Wand2, Copy, Check, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { improvePromptWithAI } from '@/lib/aiProvider';
import { copyToClipboard } from '@/lib/utils';
import type { AppSettings } from '@/types';

interface Props {
  settings: AppSettings;
}

const IMPROVE_ACTIONS = [
  { id: 'improve', label: 'Improve Prompt', instruction: 'Improve this prompt for clarity, structure and reliability.' },
  { id: 'precise', label: 'Make More Precise', instruction: 'Make this prompt more precise and specific.' },
  { id: 'professional', label: 'Make More Professional', instruction: 'Make this prompt more professional.' },
  { id: 'remove', label: 'Remove Unnecessary', instruction: 'Remove unnecessary instructions and filler.' },
  { id: 'details', label: 'Add Missing Details', instruction: 'Add missing details and strengthen the prompt.' },
  { id: 'beginner', label: 'Make Beginner-Friendly', instruction: 'Make this prompt beginner-friendly.' },
  { id: 'reliable', label: 'Follow Instructions Reliably', instruction: 'Make the AI follow instructions more reliably.' },
] as const;

export function ImproverPage({ settings }: Props) {
  const [original, setOriginal] = useState('');
  const [improved, setImproved] = useState('');
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [usedDemo, setUsedDemo] = useState(false);

  const runAction = async (instruction: string) => {
    if (!original.trim()) {
      setError('Paste a prompt first.');
      return;
    }

    setIsWorking(true);
    setError(null);

    try {
      const result = await improvePromptWithAI(original, instruction, settings.aiConfig);
      if (result.success) {
        setImproved(result.prompt);
        setUsedDemo(result.usedDemoMode);
      } else {
        setError(result.error || 'Improvement failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setIsWorking(false);
    }
  };

  const handleCopy = async () => {
    if (!improved) return;
    const ok = await copyToClipboard(improved);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Prompt Improver</h2>
          <p className="text-sm text-muted-foreground">
            Paste any existing prompt and strengthen it.
          </p>
        </div>
        {usedDemo && improved && <Badge variant="secondary">Demo Mode</Badge>}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {IMPROVE_ACTIONS.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            disabled={isWorking || !original.trim()}
            onClick={() => runAction(action.instruction)}
          >
            {isWorking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
            {action.label}
          </Button>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Original Prompt</CardTitle>
            <CardDescription>Paste the prompt you want to improve</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              placeholder="Paste your existing prompt here..."
              className="min-h-[420px] font-mono text-sm"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base">Improved Prompt</CardTitle>
              <CardDescription>Result after applying improvements</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={!improved}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </CardHeader>
          <CardContent>
            <Textarea
              value={improved}
              onChange={(e) => setImproved(e.target.value)}
              placeholder="Improved version will appear here..."
              className="min-h-[420px] font-mono text-sm"
            />
          </CardContent>
        </Card>
      </div>

      {original && improved && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Original</span>
          <ArrowRight className="h-4 w-4" />
          <span>Improved</span>
        </div>
      )}
    </div>
  );
}