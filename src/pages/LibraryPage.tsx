import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Star,
  StarOff,
  Copy,
  Trash2,
  Edit2,
  Download,
  Check,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { loadSavedPrompts, savePrompts } from '@/lib/storage';
import { exportSavedPrompt } from '@/lib/export';
import { copyToClipboard, formatDate, generateId } from '@/lib/utils';
import type { AppSettings, SavedPrompt } from '@/types';

interface Props {
  settings: AppSettings;
}

type SortKey = 'newest' | 'favorite' | 'name';

const CATEGORIES = [
  'All',
  'Coding',
  'Minecraft',
  'Discord',
  'Writing',
  'Business',
  'AI',
  'Research',
  'Image Generation',
  'Other',
];

export function LibraryPage({ settings }: Props) {
  const [prompts, setPrompts] = useState<SavedPrompt[]>(() => loadSavedPrompts());
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState<SortKey>('newest');
  const [editing, setEditing] = useState<SavedPrompt | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    savePrompts(prompts);
  }, [prompts]);

  const filtered = useMemo(() => {
    let list = [...prompts];

    if (category !== 'All') {
      list = list.filter((p) => p.category === category || p.tags.includes(category));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      if (sort === 'favorite') {
        if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
        return b.updatedAt - a.updatedAt;
      }
      if (sort === 'name') return a.title.localeCompare(b.title);
      return b.createdAt - a.createdAt;
    });

    return list;
  }, [prompts, search, category, sort]);

  const toggleFavorite = (id: string) => {
    setPrompts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, isFavorite: !p.isFavorite, updatedAt: Date.now() } : p
      )
    );
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this prompt permanently?')) return;
    setPrompts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDuplicate = (prompt: SavedPrompt) => {
    const copy: SavedPrompt = {
      ...prompt,
      id: generateId(),
      title: `${prompt.title} (copy)`,
      isFavorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setPrompts((prev) => [copy, ...prev]);
  };

  const handleCopy = async (prompt: SavedPrompt) => {
    const ok = await copyToClipboard(prompt.content);
    if (ok) {
      setCopiedId(prompt.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleSaveEdit = () => {
    if (!editing) return;
    setPrompts((prev) =>
      prev.map((p) =>
        p.id === editing.id
          ? { ...editing, updatedAt: Date.now() }
          : p
      )
    );
    setEditing(null);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-3 sm:space-y-6 sm:p-6">
      <div className="hidden md:block">
        <h2 className="text-2xl font-semibold tracking-tight">Prompt Library</h2>
        <p className="text-sm text-muted-foreground">
          {prompts.length} saved prompt{prompts.length !== 1 ? 's' : ''} · stored locally
        </p>
      </div>

      <p className="text-xs text-muted-foreground md:hidden">
        {prompts.length} saved · stored locally
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompts..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={category} onChange={(e) => setCategory(e.target.value)} className="flex-1 sm:w-40">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="flex-1 sm:w-36">
            <option value="newest">Newest</option>
            <option value="favorite">Favorites</option>
            <option value="name">Name</option>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="py-12 text-center sm:py-16">
          <CardContent>
            <p className="text-muted-foreground">
              {prompts.length === 0
                ? 'No saved prompts yet. Generate one and tap Save.'
                : 'No prompts match your filters.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {filtered.map((prompt) => (
            <Card key={prompt.id} className="flex flex-col">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-1 text-base">{prompt.title}</CardTitle>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(prompt.id)}
                    className="min-h-0 shrink-0 p-1 text-muted-foreground hover:text-yellow-400"
                  >
                    {prompt.isFavorite ? (
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <CardDescription className="line-clamp-2 text-xs">
                  {prompt.description || 'No description'}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto space-y-3 p-4 pt-0">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary">{prompt.category}</Badge>
                  {prompt.tags.slice(0, 2).map((t) => (
                    <Badge key={t} variant="outline">{t}</Badge>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">{formatDate(prompt.updatedAt)}</p>
                <div className="flex flex-wrap gap-1.5">
                  <Button variant="outline" size="sm" onClick={() => handleCopy(prompt)}>
                    {copiedId === prompt.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditing(prompt)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDuplicate(prompt)}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportSavedPrompt(prompt, settings.exportFormat)}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(prompt.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4"
          onClick={() => setEditing(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-border bg-card p-4 shadow-xl sm:rounded-xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-semibold">Edit Prompt</h3>
            <div className="space-y-3">
              <Input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="Title"
              />
              <Input
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                placeholder="Description"
              />
              <Input
                value={editing.tags.join(', ')}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                  })
                }
                placeholder="Tags (comma separated)"
              />
              <Select
                value={editing.category}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
              >
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
              <Textarea
                value={editing.content}
                onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                className="min-h-[160px] font-mono text-sm"
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
