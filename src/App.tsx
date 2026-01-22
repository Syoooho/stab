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
import type { App as AppType, WallpaperConfig, SystemConfig, WidgetConfig, WidgetType, QuickCopyItem, WebDavConfig } from './types';
import { ContextMenu, type ContextMenuItem } from './components/ContextMenu';
import { WallpaperSidebar } from './components/sidebars/WallpaperSidebar';
import { SettingsSidebar } from './components/sidebars/SettingsSidebar';
import { WeatherSettingsModal } from './components/WeatherSettingsModal';
import { NetworkSettingsModal } from './components/NetworkSettingsModal';
import { CountdownSettingsModal } from './components/CountdownSettingsModal';
import { QuickCopySettingsModal } from './components/QuickCopySettingsModal';
import { Image as ImageIcon, Settings } from 'lucide-react';
import { webDavClient } from './utils/webdav';

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
  
  // Folder State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);

  const findFolder = (apps: AppType[], folderId: string | null): AppType | null => {
      if (!folderId) return null;
      for (const app of apps) {
          if (app.id === folderId && app.type === 'folder') return app;
          if (app.children) {
              const found = findFolder(app.children, folderId);
              if (found) return found;
          }
      }
      return null;
  };

  // Computed apps to display
  const displayedApps = currentFolderId 
      ? (findFolder(apps, currentFolderId)?.children || [])
      : apps;

  // Safety check
  useEffect(() => {
      if (currentFolderId && !findFolder(apps, currentFolderId)) {
          setCurrentFolderId(null);
      }
  }, [apps, currentFolderId]);
  
  // Helper to update app tree
  const updateAppTree = (apps: AppType[], folderId: string | null, updater: (list: AppType[]) => AppType[]): AppType[] => {
      if (folderId === null) {
          return updater(apps);
      }
      return apps.map(app => {
          if (app.id === folderId && app.type === 'folder') {
              return { ...app, children: updater(app.children || []) };
          }
          if (app.children) {
              return { ...app, children: updateAppTree(app.children, folderId, updater) };
          }
          return app;
      });
  };

  const removeAppsRecursive = (apps: AppType[], idsToRemove: string[]): AppType[] => {
      return apps
          .filter(app => !idsToRemove.includes(app.id))
          .map(app => {
              if (app.children) {
                  return { ...app, children: removeAppsRecursive(app.children, idsToRemove) };
              }
              return app;
          });
  };
  
  // Check Bing Daily on startup
  useEffect(() => {
    // Logic moved to WallpaperSidebar or manual trigger
  }, []);

  const handleCloudBackup = async (webDavConfig: WebDavConfig) => {
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
      const content = JSON.stringify(payload);
      await webDavClient.saveFile(webDavConfig, 'stab-backup.json', content);
  };

  const handleCloudRestore = async (webDavConfig: WebDavConfig) => {
      const content = await webDavClient.getFile(webDavConfig, 'stab-backup.json');
      const parsed = JSON.parse(content);
      handleImportSettings(parsed);
  };

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

  const updateAppInTree = (apps: AppType[], updatedApp: AppType): AppType[] => {
      return apps.map(app => {
          if (app.id === updatedApp.id) return updatedApp;
          if (app.children) {
              return { ...app, children: updateAppInTree(app.children, updatedApp) };
          }
          return app;
      });
  };

  const handleSaveApp = (app: AppType) => {
    const target = targetFolderId ?? currentFolderId;
    if (editingApp) {
        setApps(prevApps => updateAppInTree(prevApps, app));
    } else {
        setApps(prevApps => updateAppTree(prevApps, target, (list) => [...list, app]));
    }
    setEditingApp(null);
    setTargetFolderId(null);
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setEditingApp(null);
  };

  const handleDeleteApps = (ids: string[]) => {
      setApps(prevApps => removeAppsRecursive(prevApps, ids));
  };

  const handleReorder = (newOrder: AppType[]) => {
    setApps(prevApps => updateAppTree(prevApps, currentFolderId, () => newOrder));
  };
  
  const handleMoveToFolder = (appId: string, folderId: string) => {
    setApps(prevApps => {
        // Find the app and remove it from current level
        let appToMove: AppType | undefined;
        
        // Helper to find and remove app
        const findAndRemove = (list: AppType[]): AppType[] => {
            const index = list.findIndex(a => a.id === appId);
            if (index !== -1) {
                appToMove = list[index];
                return [...list.slice(0, index), ...list.slice(index + 1)];
            }
            return list;
        };

        // First remove from current context
        const appsWithoutMoved = updateAppTree(prevApps, currentFolderId, findAndRemove);
        
        if (!appToMove) return prevApps;

        // Then add to target folder
        return updateAppTree(appsWithoutMoved, folderId, (list) => [...list, appToMove!]);
    });
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
              { 
                  label: '新建文件夹', 
                  action: () => {
                      const name = prompt("请输入文件夹名称", "新建文件夹");
                      if (name) {
                          const newFolder: AppType = {
                              id: crypto.randomUUID(),
                              name,
                              icon: 'folder', // Will be handled by AppIcon
                              type: 'folder',
                              children: [],
                              urls: { internal: '', public: '' }
                          };
                          setApps(prevApps => updateAppTree(prevApps, currentFolderId, (list) => [...list, newFolder]));
                      }
                  } 
              },
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
              { label: '删除', action: () => handleDeleteApps([app.id]), danger: true },
          ]
      });
  };

  const handleUpdateFolder = (folderId: string, newChildren: AppType[]) => {
      setApps(prevApps => updateAppTree(prevApps, folderId, () => newChildren));
  };

  const handlePopupContextMenu = (e: React.MouseEvent, folder: AppType) => {
      e.preventDefault();
      setContextMenu({
          x: e.clientX,
          y: e.clientY,
          items: [
              { 
                  label: '添加书签', 
                  action: () => { 
                      setTargetFolderId(folder.id);
                      setEditingApp(null); 
                      setIsModalOpen(true); 
                  } 
              },
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

      <main className="relative z-10 container mx-auto px-4 py-12 min-h-screen flex flex-col items-center pt-[15vh]">
        
        <div className="w-full max-w-4xl mb-[4vh]" onContextMenu={(e) => e.stopPropagation()}>
             <SearchBox />
        </div>

        <div className="w-full max-w-5xl mb-[4vh] grid grid-cols-2 md:grid-cols-4 gap-4">
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
            apps={displayedApps} 
            onReorder={handleReorder} 
            networkStatus={networkStatus} 
            systemConfig={systemConfig}
            onAddApp={(folderId) => { 
                setTargetFolderId(folderId || null);
                setEditingApp(null); 
                setIsModalOpen(true); 
            }}
            onContextMenu={handleAppContextMenu}
            currentFolderId={currentFolderId}
            onFolderChange={setCurrentFolderId}
            onMoveToFolder={handleMoveToFolder}
            onUpdateFolder={handleUpdateFolder}
            onPopupContextMenu={handlePopupContextMenu}
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
        onCloudBackup={handleCloudBackup}
        onCloudRestore={handleCloudRestore}
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
