# 💻 CodeMind Frontend

> **High-Performance React 19 & TypeScript Web Interface for CodeMind**  
> Powered by **Vite 8**, **Tailwind CSS v4**, **Base UI**, **TanStack Query v5**, **React Router v7**, and **PrismJS**.

---

## ✨ Features

- **⚡ Blazing Fast Initial Load**: Route-level code-splitting with `React.lazy` and Vite/Rollup manual vendor chunking reduces the entry bundle by **71%** (from 860 kB down to 252 kB).
- **🌊 W3C-Compliant SSE Stream Consumer**: Dedicated real-time streaming parser (`sse-parser.ts`) handling multi-stage server-sent events (`citations` -> `token` -> `done`), preserving indentation, code fences, and multi-line syntax.
- **🎨 Rich Markdown & Syntax Highlighting**: Powered by `react-markdown`, `remark-gfm`, and `prismjs`. Features custom code blocks with language badges, copy-to-clipboard actions with checkmark feedback, and responsive tables.
- **📍 Line-Exact Interactive Citations**: Direct visual references to indexed codebase files with line numbers (`#L12-L45`), allowing developers to immediately verify AI claims against source code.
- **👤 HoverIntent User Navigation**: Smooth hover-intent card (`hoverintent`) on user avatar displaying identity details and direct logout trigger, while clicks navigate to user settings.
- **🛡️ Resilient Error Boundaries**: Global React `ErrorBoundary` and router-level fallback screens with collapsible stack traces and quick recovery actions ("Try Again", "Reload", "Return to Dashboard").
- **📊 Real-Time Dynamic Dashboard**: Directly integrated with repository indexing hooks to display live progress, chunk counts, files indexed, and repository reset dialogs.

---

## 🏗️ Architecture & Code Splitting

The frontend uses route-level dynamic imports with React Router v7 and React `Suspense` backed by a custom `<PageLoader />` fallback.

### Bundle Split Metrics
| Chunk / Asset | Size (Minified) | Gzip Size | Loading Behavior |
| :--- | :--- | :--- | :--- |
| `index.js` (Entry) | **252 kB** | **80 kB** | Loaded on first visit |
| `chat-page.js` | 225 kB | 70 kB | Loaded on-demand when entering chat |
| `settings-page.js` | 21 kB | 7.2 kB | Loaded on-demand |
| `dashboard-page.js` | 13.5 kB | 4.8 kB | Loaded on-demand |
| `overview-page.js` | 6.0 kB | 2.1 kB | Loaded on-demand |
| `login-page.js` | 4.1 kB | 1.8 kB | Loaded on-demand |

### Vendor Chunking (`vite.config.ts`)
Rollup groups vendor modules into dedicated cacheable bundles:
- `vendor-markdown`: `react-markdown`, `remark-gfm`, `prismjs`, `micromark`, `unist`, `mdast`
- `vendor-react`: `react`, `react-dom`, `react-router`
- `vendor-tanstack`: `@tanstack/react-query`, `@tanstack/react-query-devtools`
- `vendor-ui`: `@base-ui/react`, `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`
- `vendor-charts`: `recharts`

---

## 📁 Directory Structure

```
src/
├── api/                   # Axios API clients (auth, chat, repo)
├── components/
│   ├── chat/              # Chat interface, sessions sidebar, message items
│   │   └── components/    # Code block highlighter, citations badge, chat input
│   ├── dashboard/         # Overview metrics, repository cards, status badges
│   ├── layout/            # App shell, sidebar navigation, user navigation
│   ├── providers/         # RootProvider (QueryClient, Theme, ErrorBoundary, Suspense)
│   └── ui/                # Base UI and Shadcn design primitives (page-loader, button, etc.)
├── hooks/                 # TanStack Query & custom hooks (useRepo, useChatStream, useChatSessions)
├── lib/                   # SSE parser, formatting helpers, and utilities
├── pages/                 # Route page components (LoginPage, DashboardPage, ChatPage, etc.)
├── router/                # React Router v7 configuration with dynamic lazy loaders
└── types/                 # TypeScript interfaces and ambient declarations (prism, chat, repo)
```

---

## 🛠️ Tech Stack & Dependencies

- **Framework**: [React 19](https://react.dev/) + [TypeScript 6](https://www.typescriptlang.org/)
- **Bundler**: [Vite 8](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite`
- **UI Components**: [@base-ui/react](https://base-ui.com/) & [Lucide React](https://lucide.dev/)
- **Data Fetching**: [@tanstack/react-query v5](https://tanstack.com/query/latest)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Markdown & Highlighting**: [react-markdown](https://github.com/remarkjs/react-markdown), [remark-gfm](https://github.com/remarkjs/remark-gfm), [prismjs](https://prismjs.com/)
- **Utilities**: `hoverintent`, `class-variance-authority`, `clsx`, `tailwind-merge`

---

## 🚀 Getting Started

> [!IMPORTANT]
> **Package Manager Rule**: This project strictly uses **PNPM**. Do **not** use `npm` or `yarn` as it will create conflicting lockfiles.

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
Create a `.env` file in the frontend root if needed:
```env
VITE_API_URL=http://localhost:8081
```

### 3. Start Development Server
```bash
pnpm dev
```
The application will launch on `http://localhost:3000`.

### 4. Build for Production
```bash
pnpm build
```
Executes `tsc -b` followed by `vite build` with Rollup code-splitting.

### 5. Preview Production Build
```bash
pnpm preview
```

---

## 🛡️ Best Practices & Quality Standards
- **Component Modularity**: Components are kept focused and under 180 lines of code.
- **Strict Theme Uniformity**: Both dark and light modes use custom styled scrollbars, CSS variables, and cohesive design tokens.
- **Session Continuity**: Unauthenticated sessions are cleanly routed to `/login` without spurious error banners.
