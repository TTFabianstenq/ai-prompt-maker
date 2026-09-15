import { useState } from 'react';
import { LayoutTemplate, ArrowRight, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PROMPT_TEMPLATES } from '@/lib/templates';
import { copyToClipboard } from '@/lib/utils';
import type { AppSettings, Page, PromptTemplate } from '@/types';

interface Props {
  settings: AppSettings;
  onNavigate: (page: Page) => void;
}

export function TemplatesPage({ onNavigate }: Props) {
  const [selected, setSelected] = useState<PromptTemplate | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [finalPrompt, setFinalPrompt] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSelect = (tpl: PromptTemplate) => {
    setSelected(tpl);
    const initial: Record<string, string> = {};
    tpl.placeholders.forEach((p) => {
      initial[p] = '';
    });
    setValues(initial);
    setFinalPrompt('');
  };

  const handleGenerate = () => {
    if (!selected) return;
    let result = selected.basePrompt;
    selected.placeholders.forEach((ph) => {
      const val = values[ph]?.trim() || `[${ph}]`;
      result = result.replace(new RegExp(`{{${ph}}}`, 'g'), val);
    });
    setFinalPrompt(result);
  };

  const handleCopy = async () => {
    if (!finalPrompt) return;
    const ok = await copyToClipboard(finalPrompt);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const categories = Array.from(new Set(PROMPT_TEMPLATES.map((t) => t.category)));

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-3 sm:space-y-6 sm:p-6">
      <div className="hidden md:block">
        <h2 className="text-2xl font-semibold tracking-tight">Templates</h2>
        <p className="text-sm text-muted-foreground">
          Start from a proven template and customize it.
        </p>
      </div>

      {!selected ? (
        <div className="space-y-6 sm:space-y-8">
          {categories.map((cat) => (
            <div key={cat}>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">{cat}</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {PROMPT_TEMPLATES.filter((t) => t.category === cat).map((tpl) => (
                  <Card
                    key={tpl.id}
                    className="cursor-pointer transition-colors hover:border-primary/50 active:scale-[0.99]"
                    onClick={() => handleSelect(tpl)}
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center gap-2">
                        <LayoutTemplate className="h-4 w-4 shrink-0 text-primary" />
                        <CardTitle className="text-base">{tpl.name}</CardTitle>
                      </div>
                      <CardDescription className="text-xs">{tpl.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <Badge variant="secondary">{tpl.category}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
            ← Back to templates
          </Button>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle>{selected.name}</CardTitle>
              <CardDescription>{selected.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
              {selected.placeholders.map((ph) => (
                <div key={ph} className="space-y-1.5">
                  <label className="text-sm font-medium capitalize">{ph.replace(/_/g, ' ')}</label>
                  <Textarea
                    value={values[ph] || ''}
                    onChange={(e) => setValues((v) => ({ ...v, [ph]: e.target.value }))}
                    placeholder={`Enter ${ph.replace(/_/g, ' ')}...`}
                    className="min-h-[80px]"
                  />
                </div>
              ))}

              <Button onClick={handleGenerate} className="w-full" size="lg">
                Generate from Template
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {finalPrompt && (
            <Card>
              <CardHeader className="flex flex-col gap-2 space-y-0 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <CardTitle className="text-base">Final Prompt</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onNavigate('generator')}
                  >
                    Open in Generator
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                <Textarea
                  value={finalPrompt}
                  onChange={(e) => setFinalPrompt(e.target.value)}
                  className="min-h-[200px] font-mono text-sm sm:min-h-[280px]"
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
