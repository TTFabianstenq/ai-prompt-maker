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
  Filter,
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

  // Persist whenever prompts change
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
      return b.createdAt - a.createdAt; // newest
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
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Prompt Library</h2>
          <p className="text-sm text-muted-foreground">
            {prompts.length} saved prompt{prompts.length !== 1 ? 's' : ''} · stored locally
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompts..."
            className="pl-9"
          />
        </div>
        <Select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full sm:w-44">
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="w-full sm:w-40">
          <option value="newest">Newest</option>
          <option value="favorite">Favorites</option>
          <option value="name">Name</option>
        </Select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent>
            <p className="text-muted-foreground">
              {prompts.length === 0
                ? 'No saved prompts yet. Generate one and click Save.'
                : 'No prompts match your filters.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((prompt) => (
            <Card key={prompt.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-1 text-base">{prompt.title}</CardTitle>
                  <button
                    onClick={() => toggleFavorite(prompt.id)}
                    className="shrink-0 text-muted-foreground hover:text-yellow-400"
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
              <CardContent className="mt-auto space-y-3">
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

      {/* Edit modal */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setEditing(null)}
        >
          <div
            className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-xl"
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
                className="min-h-[200px] font-mono text-sm"
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