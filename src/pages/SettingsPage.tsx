import { useState } from 'react';
import { Trash2, RotateCcw, AlertTriangle, Key, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { clearAllPrompts, resetSettings } from '@/lib/storage';
import type {
  AppSettings,
  TargetAI,
  PromptType,
  OutputLength,
  Tone,
  AIProviderConfig,
} from '@/types';

interface Props {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

export function SettingsPage({ settings, onSettingsChange }: Props) {
  const [showKey, setShowKey] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const updateAI = <K extends keyof AIProviderConfig>(key: K, value: AIProviderConfig[K]) => {
    onSettingsChange({
      ...settings,
      aiConfig: { ...settings.aiConfig, [key]: value },
    });
  };

  const handleClearPrompts = () => {
    clearAllPrompts();
    setConfirmClear(false);
    alert('All saved prompts have been cleared.');
  };

  const handleReset = () => {
    if (!confirm('Reset all settings to defaults? This will not delete your saved prompts.')) return;
    const defaults = resetSettings();
    onSettingsChange(defaults);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground">Configure defaults and API options.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Theme</label>
            <Select
              value={settings.theme}
              onChange={(e) => update('theme', e.target.value as AppSettings['theme'])}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Default Prompt Options</CardTitle>
          <CardDescription>Used when you open the Generator</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Default Target AI</label>
            <Select
              value={settings.defaultTargetAI}
              onChange={(e) => update('defaultTargetAI', e.target.value as TargetAI)}
            >
              {['Grok', 'ChatGPT', 'Claude', 'Gemini', 'Other'].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Default Prompt Type</label>
            <Select
              value={settings.defaultPromptType}
              onChange={(e) => update('defaultPromptType', e.target.value as PromptType)}
            >
              {['Coding', 'Writing', 'Research', 'Image Generation', 'Business', 'School', 'General'].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Default Output Length</label>
            <Select
              value={settings.defaultOutputLength}
              onChange={(e) => update('defaultOutputLength', e.target.value as OutputLength)}
            >
              {['Concise', 'Standard', 'Detailed', 'Comprehensive'].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Default Tone</label>
            <Select
              value={settings.defaultTone}
              onChange={(e) => update('defaultTone', e.target.value as Tone)}
            >
              {['Professional', 'Casual', 'Technical', 'Creative', 'Friendly', 'Authoritative'].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Default Export Format</label>
            <Select
              value={settings.exportFormat}
              onChange={(e) => update('exportFormat', e.target.value as AppSettings['exportFormat'])}
            >
              <option value="txt">TXT</option>
              <option value="md">Markdown</option>
              <option value="json">JSON</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <CardTitle className="text-base">AI Provider (Optional)</CardTitle>
          </div>
          <CardDescription>
            Leave as "none" to use high-quality Demo Mode (recommended). Live API calls are prepared but not yet active in this version.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
            <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
              <Shield className="h-4 w-4" />
              Security note
            </div>
            API keys are stored only in your browser’s localStorage. They never leave your device in this app. Do not share your screen while the key is visible.
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Provider</label>
            <Select
              value={settings.aiConfig.provider}
              onChange={(e) => updateAI('provider', e.target.value as AIProviderConfig['provider'])}
            >
              <option value="none">None (Demo Mode)</option>
              <option value="xai">xAI (Grok)</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="google">Google</option>
              <option value="custom">Custom</option>
            </Select>
          </div>

          {settings.aiConfig.provider !== 'none' && (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">API Key</label>
                <div className="flex gap-2">
                  <Input
                    type={showKey ? 'text' : 'password'}
                    value={settings.aiConfig.apiKey}
                    onChange={(e) => updateAI('apiKey', e.target.value)}
                    placeholder="sk-... or equivalent"
                    className="font-mono text-sm"
                  />
                  <Button variant="outline" onClick={() => setShowKey(!showKey)}>
                    {showKey ? 'Hide' : 'Show'}
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Model</label>
                <Input
                  value={settings.aiConfig.model}
                  onChange={(e) => updateAI('model', e.target.value)}
                  placeholder="e.g. grok-2, gpt-4o, claude-3-5-sonnet..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Temperature</label>
                  <Input
                    type="number"
                    min={0}
                    max={2}
                    step={0.1}
                    value={settings.aiConfig.temperature}
                    onChange={(e) => updateAI('temperature', parseFloat(e.target.value) || 0.7)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Max Tokens</label>
                  <Input
                    type="number"
                    min={256}
                    max={128000}
                    value={settings.aiConfig.maxTokens}
                    onChange={(e) => updateAI('maxTokens', parseInt(e.target.value) || 4096)}
                  />
                </div>
              </div>
              {settings.aiConfig.provider === 'custom' && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Base URL</label>
                  <Input
                    value={settings.aiConfig.baseUrl || ''}
                    onChange={(e) => updateAI('baseUrl', e.target.value)}
                    placeholder="https://api.example.com/v1"
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <CardTitle className="text-base">Danger Zone</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Clear all saved prompts</p>
              <p className="text-xs text-muted-foreground">This cannot be undone.</p>
            </div>
            {!confirmClear ? (
              <Button variant="destructive" size="sm" onClick={() => setConfirmClear(true)}>
                <Trash2 className="h-3.5 w-3.5" />
                Clear Prompts
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setConfirmClear(false)}>Cancel</Button>
                <Button variant="destructive" size="sm" onClick={handleClearPrompts}>Confirm Clear</Button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Reset settings</p>
              <p className="text-xs text-muted-foreground">Restore default configuration (prompts are kept).</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
