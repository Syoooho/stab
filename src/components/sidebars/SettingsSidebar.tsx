import { Sidebar } from './Sidebar';
import type { SystemConfig, NetworkType } from '../../types';
import { useState, useEffect, useRef } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronRight, ArrowLeft, Network, HardDrive } from 'lucide-react';

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  config: SystemConfig;
  onChange: (config: SystemConfig) => void;
  onExportSettings?: () => void;
  onImportSettings?: (data: unknown) => void;
}

const SortablePriorityItem = ({ type, label }: { type: NetworkType, label: string }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: type });
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 mb-2 touch-none">
            <span className="text-sm text-white/80">{label}</span>
            <div {...attributes} {...listeners} className="text-white/30 cursor-grab hover:text-white/60">
                <GripVertical className="w-4 h-4" />
            </div>
        </div>
    );
};

type SettingsView = 'main' | 'network' | 'backup';

export const SettingsSidebar = ({ isOpen, onClose, config, onChange, onExportSettings, onImportSettings }: SettingsSidebarProps) => {
  const [currentView, setCurrentView] = useState<SettingsView>('main');
  const [internalUrl, setInternalUrl] = useState(config.internalCheckUrl);
  const [meshUrl, setMeshUrl] = useState(config.meshCheckUrl);
  const [frpUrl, setFrpUrl] = useState(config.frpCheckUrl || '');
  const [publicUrl, setPublicUrl] = useState(config.publicCheckUrl);
  const [priority, setPriority] = useState<NetworkType[]>(config.urlPriority || ['internal', 'mesh', 'frp', 'public']);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (isOpen) {
        setInternalUrl(config.internalCheckUrl);
        setMeshUrl(config.meshCheckUrl);
        setFrpUrl(config.frpCheckUrl || '');
        setPublicUrl(config.publicCheckUrl);
        setPriority(config.urlPriority || ['internal', 'mesh', 'frp', 'public']);
        setCurrentView('main');
    }
  }, [isOpen, config]);

  const handleSave = () => {
    onChange({ 
        ...config, 
        internalCheckUrl: internalUrl,
        meshCheckUrl: meshUrl,
        frpCheckUrl: frpUrl,
        publicCheckUrl: publicUrl,
        urlPriority: priority
    });
  };

  const handleClickImport = () => {
      importInputRef.current?.click();
  };

  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !onImportSettings) return;
      const text = await file.text();
      const parsed = JSON.parse(text);
      onImportSettings(parsed);
      e.target.value = '';
  };

  const handleDragEnd = (event: any) => {
      const { active, over } = event;
      if (active.id !== over.id) {
          const newPriority = arrayMove(priority, priority.indexOf(active.id), priority.indexOf(over.id));
          setPriority(newPriority);
          // Auto save on drag end
          onChange({
              ...config,
              urlPriority: newPriority
          });
      }
  };

  const getTypeLabel = (type: NetworkType) => {
      switch(type) {
          case 'internal': return '内网 (Internal)';
          case 'mesh': return '组网 (Mesh)';
          case 'frp': return 'FRP';
          case 'public': return '公网 (Public)';
          default: return type;
      }
  };

  const renderMainView = () => (
      <div className="space-y-2">
          <button 
            onClick={() => setCurrentView('network')}
            className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group cursor-pointer"
          >
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                      <Network className="w-5 h-5" />
                  </div>
                  <span className="text-white/90 font-medium">网络设置</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60" />
          </button>

          <button 
            onClick={() => setCurrentView('backup')}
            className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group cursor-pointer"
          >
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                      <HardDrive className="w-5 h-5" />
                  </div>
                  <span className="text-white/90 font-medium">备份与恢复</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60" />
          </button>
      </div>
  );

  const renderNetworkView = () => (
      <div className="space-y-8 pb-8 animate-in slide-in-from-right duration-200">
          <button 
            onClick={() => setCurrentView('main')}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-4 text-sm cursor-pointer"
          >
              <ArrowLeft className="w-4 h-4" /> 返回
          </button>

        {/* Network Service Settings */}
        <section>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                网络服务地址
            </h3>
            <div className="space-y-3">
                <div>
                   <label className="block text-xs font-medium text-white/50 mb-1">内网服务地址</label>
                   <input 
                      type="text" 
                      value={internalUrl}
                      onChange={(e) => setInternalUrl(e.target.value)}
                      onBlur={handleSave}
                      className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/30"
                      placeholder="http://192.168.1.2:8080"
                   />
                </div>

                <div>
                   <label className="block text-xs font-medium text-white/50 mb-1">组网服务地址</label>
                   <input 
                      type="text" 
                      value={meshUrl}
                      onChange={(e) => setMeshUrl(e.target.value)}
                      onBlur={handleSave}
                      className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/30"
                      placeholder="http://100.64.0.2:8080"
                   />
                </div>

                <div>
                   <label className="block text-xs font-medium text-white/50 mb-1">FRP 服务地址</label>
                   <input 
                      type="text" 
                      value={frpUrl}
                      onChange={(e) => setFrpUrl(e.target.value)}
                      onBlur={handleSave}
                      className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/30"
                      placeholder="https://your-domain.com:8080"
                   />
                </div>

                <div>
                   <label className="block text-xs font-medium text-white/50 mb-1">公网服务地址</label>
                   <input 
                      type="text" 
                      value={publicUrl}
                      onChange={(e) => setPublicUrl(e.target.value)}
                      onBlur={handleSave}
                      className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/30"
                      placeholder="https://your-domain.com"
                   />
                </div>
            </div>
        </section>

        {/* Priority Settings */}
        <section>
             <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                访问优先级 (拖拽排序)
             </h3>
             <p className="text-xs text-white/40 mb-3">
                 点击应用图标时，系统将按此顺序尝试打开第一个可用的链接。
             </p>
             <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
             >
                 <SortableContext items={priority} strategy={verticalListSortingStrategy}>
                     {priority.map(type => (
                         <SortablePriorityItem key={type} type={type} label={getTypeLabel(type)} />
                     ))}
                 </SortableContext>
             </DndContext>
        </section>
      </div>
  );

  const renderBackupView = () => (
      <div className="space-y-8 pb-8 animate-in slide-in-from-right duration-200">
          <button 
            onClick={() => setCurrentView('main')}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-4 text-sm cursor-pointer"
          >
              <ArrowLeft className="w-4 h-4" /> 返回
          </button>

          <section>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                导入 / 导出
            </h3>
            <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={onExportSettings}
                    disabled={!onExportSettings}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                    导出配置
                </button>
                <button
                    type="button"
                    onClick={handleClickImport}
                    disabled={!onImportSettings}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                    导入配置
                </button>
                <input
                    ref={importInputRef}
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={handleImportFileChange}
                />
            </div>
        </section>
      </div>
  );

  return (
    <Sidebar isOpen={isOpen} onClose={onClose} position="right" title={currentView === 'main' ? "系统设置" : (currentView === 'network' ? "网络设置" : "备份与恢复")}>
        {currentView === 'main' && renderMainView()}
        {currentView === 'network' && renderNetworkView()}
        {currentView === 'backup' && renderBackupView()}
    </Sidebar>
  );
};
