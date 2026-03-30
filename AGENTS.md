# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-30
**Stack:** React 19 + Vite + TypeScript + Tailwind CSS 4 + Chrome Extension (MV3)

## OVERVIEW

Stab — Chrome new tab extension. Minimalist UI with network-aware app launcher, widgets, and WebDAV sync. Uses background service worker for CORS-free network detection.

## STRUCTURE

```
stab/
├── public/
│   ├── manifest.json    # Chrome MV3 config, host_permissions: <all_urls>
│   └── background.js    # Service worker: CHECK_NETWORK, WEBDAV_SAVE/GET handlers
├── src/
│   ├── main.tsx         # Entry point
│   ├── App.tsx          # Root component, state orchestration
│   ├── types.ts         # All type definitions
│   ├── hooks/           # usePersistence (localStorage + chrome.storage sync), useNetworkStatus
│   ├── utils/           # webdav.ts (extension-aware client), network.ts, image.ts
│   └── components/      # UI components (see components/AGENTS.md)
└── dist/                # Chrome extension load target (NOT src/)
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add new widget | `src/components/widgets/` | Register in App.tsx `DEFAULT_WIDGETS` + `widgets.map()` |
| Modify network detection | `public/background.js` + `src/hooks/useNetworkStatus.ts` | Background does actual fetch; hook sends message |
| Add storage-backed state | `src/hooks/usePersistence.ts` | Auto-syncs localStorage + chrome.storage.local |
| Change app/folder logic | `src/App.tsx` `updateAppTree`, `removeAppsRecursive` | Recursive tree operations |
| WebDAV operations | `src/utils/webdav.ts` + `public/background.js` | Client delegates to background for CORS bypass |
| Types/interfaces | `src/types.ts` | Centralized: App, NetworkStatus, SystemConfig, WidgetConfig |

## CONVENTIONS

- **Chrome API dual-mode**: All Chrome API calls check `typeof chrome !== 'undefined'` for web fallback
- **Storage pattern**: `usePersistence` merges default with stored (new fields preserved)
- **Icon fetch strategies**: Google Favicon → Direct /favicon.ico → Chrome Favicon API (fallback chain)
- **Network detection**: Background service worker bypasses CORS; web mode uses `no-cors` HEAD (limited)
- **Tailwind v4**: Uses `@tailwindcss/postcss`, no `tailwind.config.js` content array needed

## ANTI-PATTERNS (THIS PROJECT)

- **DO NOT** use `chrome.storage` directly — use `usePersistence` hook for sync
- **DO NOT** fetch network URLs from frontend — delegate to background.js via `chrome.runtime.sendMessage`
- **DO NOT** add new types scattered — centralize in `src/types.ts`
- **DO NOT** test network features in `npm run dev` — Chrome APIs unavailable in web preview

## UNIQUE STYLES

- **Glassmorphism**: `.glass` class = `bg-black/20 backdrop-blur-md rounded-xl`
- **Responsive sizing**: `clamp()` + `vh` units for widgets (e.g., `h-[14vh]`, `clamp(12px, 1.5vh, 14px)`)
- **Folder popup**: Modal with DndContext for nested drag-sort (SmartLauncher)
- **Pagination**: Wheel-scroll throttled (500ms), spring-animated page transitions

## COMMANDS

```bash
npm run dev      # Web preview (Chrome APIs disabled)
npm run build    # Build to dist/ — load THIS folder as extension
npm run lint     # ESLint (typescript-eslint + react-hooks)
```

## NOTES

- **Extension load**: Chrome → `chrome://extensions/` → Load unpacked → select `dist/` (NOT `src/`)
- **Network detection**: Works only in extension context; web preview falls back to limited `no-cors` checks
- **No tests**: Project has no test framework configured
- **No CI/CD**: Manual build + extension reload required