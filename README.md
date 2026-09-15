# AI Prompt Maker

**Professional-grade prompt engineering tool** that turns natural language ideas into highly structured, optimized prompts for Grok, ChatGPT, Claude, Gemini and other models.

![License](https://img.shields.io/badge/license-MIT-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6)
![Vite](https://img.shields.io/badge/Vite-5-646cff)

## Features

- **Prompt Generator** – Describe what you want in plain language → receive a production-ready structured prompt
- **Prompt Improver** – Paste any existing prompt and strengthen it with one click
- **Prompt Library** – Save, tag, favorite, search, edit, duplicate and export prompts (persisted in localStorage)
- **Templates** – Ready-made templates for Coding, Discord bots, Minecraft plugins, Writing, Research, Image Generation, Business, Study, UI/UX and more
- **Modern dark UI** with light mode support, smooth animations, responsive layout
- **Demo Mode** – High-quality local prompt generation works immediately with zero configuration
- **AI Provider abstraction** – Ready for real API keys (xAI, OpenAI, Anthropic, Google, custom) in future updates
- **Export** – TXT, Markdown, JSON
- **Fully client-side** – No backend required

## Quick Start

```bash
# Clone
git clone https://github.com/TTFabianstenq/ai-prompt-maker.git
cd ai-prompt-maker

# Install
npm install

# Run development server
npm run dev
```

Open http://localhost:5173

## Build for Production

```bash
npm run build
npm run preview
```

The `dist/` folder can be deployed to any static host (Vercel, Netlify, GitHub Pages, Cloudflare Pages, etc.).

## Project Structure

```
src/
├── components/          # UI primitives + Sidebar
│   ├── ui/              # Button, Input, Textarea, Select, Card, Badge
│   └── Sidebar.tsx
├── pages/               # Main views
│   ├── GeneratorPage.tsx
│   ├── ImproverPage.tsx
│   ├── LibraryPage.tsx
│   ├── TemplatesPage.tsx
│   └── SettingsPage.tsx
├── lib/                 # Core logic
│   ├── promptEngine.ts  # Local high-quality prompt builder
│   ├── aiProvider.ts    # AI provider abstraction + Demo Mode
│   ├── storage.ts       # localStorage persistence
│   ├── templates.ts     # Built-in templates
│   ├── export.ts        # TXT / MD / JSON export
│   └── utils.ts
├── types/               # TypeScript definitions
├── App.tsx
├── main.tsx
└── index.css
```

## How Prompt Generation Works

In **Demo Mode** (default) the app uses a carefully designed local engine that:

1. Assigns a clear role/persona based on prompt type and tone
2. States the objective in the user’s own words
3. Injects context (target model, length, technical level, creativity…)
4. Adds requirements, constraints, process steps, output format and quality criteria
5. Optionally requests clarifying questions
6. Avoids filler and keeps everything relevant to the original request

No fake “AI call succeeded” messages. If a real API provider is selected without a key (or when live calls are not yet implemented), the app clearly reports the situation.

## Keyboard & UX Notes

- All major actions are real and functional
- Copy shows a temporary “Copied!” confirmation
- Saved prompts survive page reloads
- Settings and theme persist
- Responsive layout works on desktop and mobile

## License

MIT

---

Built as a complete, working product — not a prototype.
