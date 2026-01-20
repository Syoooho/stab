import { useState, useEffect } from 'react';
import { SmartLauncher } from './components/SmartLauncher';
import { SearchBox } from './components/SearchBox';
import { AddAppModal } from './components/AddAppModal';
import { NetworkStatusWidget } from './components/widgets/NetworkStatusWidget';
import { CountdownWidget } from './components/widgets/CountdownWidget';
import { WeatherWidget } from './components/widgets/WeatherWidget';
import { QuickCopyWidget } from './components/widgets/QuickCopyWidget';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { usePersistence } from './hooks/usePersistence';
import type { App as AppType, WallpaperConfig, SystemConfig, WidgetConfig, WidgetType, QuickCopyItem } from './types';
import { ContextMenu, type ContextMenuItem } from './components/ContextMenu';
import { WallpaperSidebar } from './components/sidebars/WallpaperSidebar';
import { SettingsSidebar } from './components/sidebars/SettingsSidebar';
import { WeatherSettingsModal } from './components/WeatherSettingsModal';
import { NetworkSettingsModal } from './components/NetworkSettingsModal';
import { CountdownSettingsModal } from './components/CountdownSettingsModal';
import { QuickCopySettingsModal } from './components/QuickCopySettingsModal';
import { Image as ImageIcon, Settings } from 'lucide-react';

// Default apps - Empty
const DEFAULT_APPS: AppType[] = [];

const DEFAULT_WALLPAPER: WallpaperConfig = {
    type: 'url',
    value: 'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&q=80&w=2070',
    history: []
};

const DEFAULT_QUICK_COPY_ITEMS: QuickCopyItem[] = [
    { id: '1', label: 'My IP', value: '192.168.1.50' },
    { id: '2', label: 'Email', value: 'user@example.com' },
];

const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
    internalCheckUrl: 'http://gitlab.internal',
    meshCheckUrl: 'http://10.0.0.1',
    frpCheckUrl: 'http://frp.example.com',
    publicCheckUrl: 'https://www.google.com',
    urlPriority: ['internal', 'mesh', 'frp', 'public'],
    weatherCity: '北京市',
    countdownTarget: `${new Date().getFullYear() + 1}-01-01T00:00:00.000Z`,
    countdownLabel: '新年倒计时',
    quickCopyItems: DEFAULT_QUICK_COPY_ITEMS
};

const DEFAULT_WIDGETS: WidgetConfig[] = [
    { id: 'w1', type: 'network', visible: true },
    { id: 'w2', type: 'countdown', visible: true },
    { id: 'w3', type: 'weather', visible: true },
    { id: 'w4', type: 'quickCopy', visible: true },
];

function App() {
  const [apps, setApps] = usePersistence<AppType[]>('stab_apps', DEFAULT_APPS);
  const [wallpaper, setWallpaper] = usePersistence<WallpaperConfig>('stab_wallpaper', DEFAULT_WALLPAPER);
  const [systemConfig, setSystemConfig] = usePersistence<SystemConfig>('stab_system_config', DEFAULT_SYSTEM_CONFIG);
  const [widgets, setWidgets] = usePersistence<WidgetConfig[]>('stab_widgets', DEFAULT_WIDGETS);
  
  const networkStatus = useNetworkStatus(systemConfig); // Pass config to hook for URLs
  
  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<AppType | null>(null);
  const [isWallpaperSidebarOpen, setIsWallpaperSidebarOpen] = useState(false);
  const [isSettingsSidebarOpen, setIsSettingsSidebarOpen] = useState(false);
  const [isWeatherSettingsOpen, setIsWeatherSettingsOpen] = useState(false);
  const [isNetworkSettingsOpen, setIsNetworkSettingsOpen] = useState(false);
  const [isCountdownSettingsOpen, setIsCountdownSettingsOpen] = useState(false);
  const [isQuickCopySettingsOpen, setIsQuickCopySettingsOpen] = useState(false);
  
  // Check Bing Daily on startup
  useEffect(() => {
    // Logic moved to WallpaperSidebar or manual trigger
  }, []);

  const handleExportSettings = () => {
      const payload = {
          schema: 'stab-settings-v1',
          exportedAt: new Date().toISOString(),
          data: {
              wallpaper,
              apps,
              systemConfig,
              widgets
          }
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stab-settings-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
  };

  const handleImportSettings = (input: unknown) => {
      if (!input || typeof input !== 'object') return;
      const anyInput = input as any;
      const data = anyInput.data ?? anyInput;

      if (data?.wallpaper) setWallpaper(data.wallpaper);
      if (Array.isArray(data?.apps)) setApps(data.apps);
      if (data?.systemConfig) setSystemConfig(data.systemConfig);
      if (Array.isArray(data?.widgets)) setWidgets(data.widgets);
  };

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
      x: number;
      y: number;
      items: ContextMenuItem[];
  } | null>(null);

  const handleSaveApp = (app: AppType) => {
    if (editingApp) {
        setApps(apps.map(a => a.id === app.id ? app : a));
    } else {
        setApps([...apps, app]);
    }
    setEditingApp(null);
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setEditingApp(null);
  };

  const handleDeleteApp = (id: string) => {
      setApps(apps.filter(a => a.id !== id));
  };

  const handleReorder = (newOrder: AppType[]) => {
    setApps(newOrder);
  };

  const handleRandomWallpaper = () => {
      // Use Bing Daily as the "Random" option now, or keep presets just for this button?
      // Since we removed presets from UI, let's make "Random Wallpaper" fetch a new Bing image or just use the API again.
      // But Bing API is "Daily", so it's always the same image for the day.
      // Let's fallback to Unsplash for "Random" behavior, but keep it hidden from sidebar.
      const PRESETS = [
        'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&q=80&w=2070',
        'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&q=80&w=2070',
        'https://images.unsplash.com/photo-1519681393798-3828fb4090bb?auto=format&fit=crop&q=80&w=2070',
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=2070',
        'https://images.unsplash.com/photo-1534067783865-9eb28f008900?auto=format&fit=crop&q=80&w=2070',
      ];
      const random = PRESETS[Math.floor(Math.random() * PRESETS.length)];
      
      // Update with history
      const newItem = {
          id: crypto.randomUUID(),
          url: random,
          date: new Date().toISOString(),
          source: 'preset' as const
      };
      
      const newHistory = [newItem, ...(wallpaper.history || [])].slice(0, 10);
      
      setWallpaper({ 
          ...wallpaper,
          type: 'url', 
          value: random,
          history: newHistory
      });
  };
  
  const toggleWidget = (id: string, visible: boolean) => {
      setWidgets(widgets.map(w => w.id === id ? { ...w, visible } : w));
  }

  // --- Context Menu Handlers ---

  const handleGlobalContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      setContextMenu({
          x: e.clientX,
          y: e.clientY,
          items: [
              { label: '添加书签', action: () => { setEditingApp(null); setIsModalOpen(true); } },
              // Simple toggle for demo purposes
              { label: '添加组件', action: () => setWidgets(widgets.map(w => ({ ...w, visible: true }))) },
              { label: '随机壁纸', action: handleRandomWallpaper },
              { label: '设置', action: () => setIsSettingsSidebarOpen(true) },
          ]
      });
  };

  const handleAppContextMenu = (e: React.MouseEvent, app: AppType) => {
      // Logic handled in AppIcon, but state set here
      setContextMenu({
          x: e.clientX,
          y: e.clientY,
          items: [
              { label: '编辑', action: () => { setEditingApp(app); setIsModalOpen(true); } },
              { label: '删除', action: () => handleDeleteApp(app.id), danger: true },
          ]
      });
  };

  const handleWidgetContextMenu = (e: React.MouseEvent, widgetId: string, widgetType: WidgetType) => {
      e.preventDefault();
      e.stopPropagation();

      const items: ContextMenuItem[] = [];

      if (widgetType === 'weather') {
          items.push({ label: '编辑', action: () => setIsWeatherSettingsOpen(true) });
      } else if (widgetType === 'network') {
          items.push({ label: '编辑', action: () => setIsNetworkSettingsOpen(true) });
      } else if (widgetType === 'countdown') {
          items.push({ label: '编辑', action: () => setIsCountdownSettingsOpen(true) });
      } else if (widgetType === 'quickCopy') {
          items.push({ label: '编辑', action: () => setIsQuickCopySettingsOpen(true) });
      } else {
          // Placeholder for other widgets
          items.push({ label: '编辑', action: () => alert('该组件暂无设置') });
      }

      items.push({ label: '删除', action: () => toggleWidget(widgetId, false), danger: true });

      setContextMenu({
          x: e.clientX,
          y: e.clientY,
          items
      });
  };

  return (
    <div 
        className="min-h-screen w-full relative overflow-x-hidden bg-[#121212] text-white"
        onContextMenu={handleGlobalContextMenu}
    >
      {/* Background with Overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center z-0 transition-all duration-700"
        style={{ 
            backgroundImage: `url(${wallpaper.value})`,
            filter: `blur(${wallpaper.blur ?? 0}px)`
        }}
      />
      <div 
        className="fixed inset-0 bg-black z-0 transition-opacity duration-300"
        style={{ opacity: wallpaper.opacity ?? 0.6 }} 
      />

      {/* Top Buttons */}
      <button 
        onClick={() => setIsWallpaperSidebarOpen(true)}
        className="fixed top-4 left-4 z-30 p-2 bg-black/20 backdrop-blur-md rounded-full hover:bg-white/10 transition-colors"
        title="壁纸设置"
      >
          <ImageIcon className="w-5 h-5 text-white/70" />
      </button>

      <button 
        onClick={() => setIsSettingsSidebarOpen(true)}
        className="fixed top-4 right-4 z-30 p-2 bg-black/20 backdrop-blur-md rounded-full hover:bg-white/10 transition-colors"
        title="系统设置"
      >
          <Settings className="w-5 h-5 text-white/70" />
      </button>

      <main className="relative z-10 container mx-auto px-4 py-12 min-h-screen flex flex-col items-center pt-40">
        
        <div className="w-full max-w-4xl mb-12" onContextMenu={(e) => e.stopPropagation()}>
             <SearchBox />
        </div>

        <div className="w-full max-w-5xl mb-12 grid grid-cols-2 md:grid-cols-4 gap-4">
             {widgets.map(widget => {
                 if (!widget.visible) return null;
                 return (
                     <div key={widget.id} onContextMenu={(e) => handleWidgetContextMenu(e, widget.id, widget.type)}>
                         {widget.type === 'network' && <NetworkStatusWidget status={networkStatus} />}
                         {widget.type === 'countdown' && (
                             <CountdownWidget 
                                targetDate={systemConfig.countdownTarget} 
                                label={systemConfig.countdownLabel} 
                             />
                         )}
                         {widget.type === 'weather' && <WeatherWidget city={systemConfig.weatherCity} />}
                         {widget.type === 'quickCopy' && <QuickCopyWidget items={systemConfig.quickCopyItems || DEFAULT_QUICK_COPY_ITEMS} />}
                     </div>
                 );
             })}
        </div>

        <SmartLauncher 
            apps={apps} 
            onReorder={handleReorder} 
            networkStatus={networkStatus} 
            systemConfig={systemConfig}
            onAddApp={() => { setEditingApp(null); setIsModalOpen(true); }}
            onContextMenu={handleAppContextMenu}
        />

        <AddAppModal 
            isOpen={isModalOpen} 
            onClose={handleCloseModal} 
            onAdd={handleSaveApp} 
            initialData={editingApp}
            systemConfig={systemConfig}
        />
      </main>

      {/* Sidebars */}
      <WallpaperSidebar 
        isOpen={isWallpaperSidebarOpen} 
        onClose={() => setIsWallpaperSidebarOpen(false)} 
        config={wallpaper}
        onChange={setWallpaper}
      />

      <SettingsSidebar 
        isOpen={isSettingsSidebarOpen} 
        onClose={() => setIsSettingsSidebarOpen(false)} 
        config={systemConfig}
        onChange={setSystemConfig}
        onExportSettings={handleExportSettings}
        onImportSettings={handleImportSettings}
      />
      
      {/* Modals */}
      <WeatherSettingsModal 
        isOpen={isWeatherSettingsOpen} 
        onClose={() => setIsWeatherSettingsOpen(false)} 
        config={systemConfig} 
        onChange={setSystemConfig} 
      />

      <NetworkSettingsModal 
        isOpen={isNetworkSettingsOpen} 
        onClose={() => setIsNetworkSettingsOpen(false)} 
        config={systemConfig} 
        onChange={setSystemConfig} 
      />

      <CountdownSettingsModal 
        isOpen={isCountdownSettingsOpen} 
        onClose={() => setIsCountdownSettingsOpen(false)} 
        config={systemConfig} 
        onChange={setSystemConfig} 
      />

      <QuickCopySettingsModal 
        isOpen={isQuickCopySettingsOpen} 
        onClose={() => setIsQuickCopySettingsOpen(false)} 
        config={systemConfig} 
        onChange={setSystemConfig} 
      />

      {/* Context Menu */}
      {contextMenu && (
          <ContextMenu 
            x={contextMenu.x} 
            y={contextMenu.y} 
            items={contextMenu.items} 
            onClose={() => setContextMenu(null)} 
          />
      )}
    </div>
  );
}

export default App;
