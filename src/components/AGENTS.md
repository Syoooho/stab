# COMPONENTS MODULE

## OVERVIEW

UI layer: widgets, sidebars, modals, context menu, and SmartLauncher grid.

## STRUCTURE

```
components/
├── AppIcon.tsx           # Draggable app/folder icon, network-aware URL selection
├── SmartLauncher.tsx     # Paginated grid (6x3), DndContext, folder popup modal
├── SearchBox.tsx         # Search input
├── ContextMenu.tsx       # Right-click menu overlay
├── AddAppModal.tsx       # App/folder creation/edit form
├── sidebars/
│   ├── WallpaperSidebar.tsx   # Wallpaper config (URL/upload, opacity, blur)
│   └── SettingsSidebar.tsx    # System config, export/import, WebDAV backup
├── widgets/
│   ├── NetworkStatusWidget.tsx  # Shows current network + latency
│   ├── CountdownWidget.tsx      # Date countdown
│   ├── WeatherWidget.tsx        # Fetches from uapis.cn
│   └── QuickCopyWidget.tsx      # One-click copy items
└── [Settings]Modals.tsx  # Per-widget config modals
```

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Add draggable item type | `SmartLauncher.tsx` `SortableItem` + `AppIcon.tsx` |
| Modify pagination | `SmartLauncher.tsx` `ITEMS_PER_PAGE`, `handleWheel` |
| Change folder popup | `SmartLauncher.tsx` `modalFolder` state + `DndContext` |
| Widget visibility toggle | `App.tsx` `toggleWidget` |
| Add widget settings modal | New modal + register in App.tsx state + context menu |

## CONVENTIONS

- **Naming**: PascalCase components, `-Widget.tsx` suffix for widgets
- **Props pattern**: `isOpen`, `onClose`, `config`, `onChange` for settings modals
- **Network-aware**: `AppIcon` receives `networkStatus` + `systemConfig.urlPriority` to pick URL

## ANTI-PATTERNS

- **DO NOT** add widgets directly to App.tsx render — use `WidgetConfig` array
- **DO NOT** bypass SmartLauncher for app grid — pagination + drag logic coupled there