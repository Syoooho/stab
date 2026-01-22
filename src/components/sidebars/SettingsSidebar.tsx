import { Sidebar } from './Sidebar';
import type { SystemConfig, NetworkType, WebDavConfig } from '../../types';
import { useState, useEffect, useRef } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronRight, ArrowLeft, Network, HardDrive, Loader2, Check, AlertCircle, Cloud } from 'lucide-react';

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  config: SystemConfig;
  onChange: (config: SystemConfig) => void;
  onExportSettings?: () => void;
  onImportSettings?: (data: unknown) => void;
  onCloudBackup?: (config: WebDavConfig) => Promise<void>;
  onCloudRestore?: (config: WebDavConfig) => Promise<void>;
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

export const SettingsSidebar = ({ isOpen, onClose, config, onChange, onExportSettings, onImportSettings, onCloudBackup, onCloudRestore }: SettingsSidebarProps) => {
  const [currentView, setCurrentView] = useState<SettingsView>('main');
  const [internalUrl, setInternalUrl] = useState(config.internalCheckUrl);
  const [meshUrl, setMeshUrl] = useState(config.meshCheckUrl);
  const [frpUrl, setFrpUrl] = useState(config.frpCheckUrl || '');
  const [publicUrl, setPublicUrl] = useState(config.publicCheckUrl);
  const [priority, setPriority] = useState<NetworkType[]>(config.urlPriority || ['internal', 'mesh', 'frp', 'public']);
  
  // WebDAV state
  const [webDavUrl, setWebDavUrl] = useState(config.webDav?.url || '');
  const [webDavUsername, setWebDavUsername] = useState(config.webDav?.username || '');
  const [webDavPassword, setWebDavPassword] = useState(config.webDav?.password || '');
  const [backupStatus, setBackupStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

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
        
        setWebDavUrl(config.webDav?.url || '');
        setWebDavUsername(config.webDav?.username || '');
        setWebDavPassword(config.webDav?.password || '');
        setBackupStatus('idle');
        setStatusMessage('');
        
        setCurrentView('main');
    }
  }, [isOpen, config]);

  const handleSave = () => {
    // Auto-fix http -> https for port 5006 (common Synology WebDAV port)
    let finalUrl = webDavUrl;
    if (finalUrl.startsWith('http:') && finalUrl.includes(':5006')) {
        finalUrl = finalUrl.replace('http:', 'https:');
        setWebDavUrl(finalUrl);
    }

    onChange({ 
        ...config, 
        internalCheckUrl: internalUrl,
        meshCheckUrl: meshUrl,
        frpCheckUrl: frpUrl,
        publicCheckUrl: publicUrl,
        urlPriority: priority,
        webDav: {
            url: finalUrl,
            username: webDavUsername,
            password: webDavPassword
        }
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

  const handleBackupToWebDav = async () => {
    if (!webDavUrl) {
        setBackupStatus('error');
        setStatusMessage('请输入 WebDAV 地址');
        return;
    }
    if (!onCloudBackup) return;

    setBackupStatus('loading');
    setStatusMessage('正在备份...');
    try {
        await onCloudBackup({
            url: webDavUrl,
            username: webDavUsername,
            password: webDavPassword
        });
        setBackupStatus('success');
        setStatusMessage('备份成功');
        setTimeout(() => {
            setBackupStatus('idle');
            setStatusMessage('');
        }, 3000);
    } catch (e: any) {
        console.error(e);
        let msg = e.message || '备份失败';
        if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
             msg = '连接失败：请检查网络或证书。如果是自签名证书，请先在浏览器中直接访问该 WebDAV 地址并信任它。';
        } else if (msg.includes('405') || msg.includes('Method Not Allowed')) {
             msg = '405 错误：请检查 WebDAV 路径是否正确。通常需要包含具体的共享文件夹名称（如 /home/ 或 /public/），而不能直接写在根目录下。';
        } else if (msg.includes('403') || msg.includes('Forbidden')) {
             msg = '403 权限拒绝：请检查 1. 该用户是否有目标文件夹的写入权限 2. (群晖)请在“用户账号 -> 应用程序”中确认已允许该用户使用 WebDAV Server。';
        }
        setBackupStatus('error');
        setStatusMessage(msg);
    }
  };

  const handleRestoreFromWebDav = async () => {
    if (!webDavUrl) {
        setBackupStatus('error');
        setStatusMessage('请输入 WebDAV 地址');
        return;
    }
    if (!onCloudRestore) return;

    setBackupStatus('loading');
    setStatusMessage('正在恢复...');
    try {
        await onCloudRestore({
            url: webDavUrl,
            username: webDavUsername,
            password: webDavPassword
        });
        setBackupStatus('success');
        setStatusMessage('恢复成功');
        setTimeout(() => {
            setBackupStatus('idle');
            setStatusMessage('');
        }, 3000);
    } catch (e: any) {
        console.error(e);
        let msg = e.message || '恢复失败';
        if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
             msg = '连接失败：请检查网络或证书。如果是自签名证书，请先在浏览器中直接访问该 WebDAV 地址并信任它。';
        }
        setBackupStatus('error');
        setStatusMessage(msg);
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

          {/* WebDAV Settings */}
          <section>
             <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Cloud className="w-4 h-4" /> WebDAV 远程备份
             </h3>
             <div className="space-y-3 mb-4">
                <div>
                   <label className="block text-xs font-medium text-white/50 mb-1">WebDAV 地址</label>
                   <input 
                      type="text" 
                      value={webDavUrl}
                      onChange={(e) => setWebDavUrl(e.target.value)}
                      onBlur={handleSave}
                      className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/30"
                      placeholder="https://dav.jianguoyun.com/dav/"
                   />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                       <label className="block text-xs font-medium text-white/50 mb-1">用户名</label>
                       <input 
                          type="text" 
                          value={webDavUsername}
                          onChange={(e) => setWebDavUsername(e.target.value)}
                          onBlur={handleSave}
                          className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/30"
                          placeholder="Username"
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-medium text-white/50 mb-1">密码</label>
                       <input 
                          type="password" 
                          value={webDavPassword}
                          onChange={(e) => setWebDavPassword(e.target.value)}
                          onBlur={handleSave}
                          className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/30"
                          placeholder="Password"
                       />
                    </div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                    type="button"
                    onClick={handleBackupToWebDav}
                    disabled={backupStatus === 'loading'}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/20 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    {backupStatus === 'loading' && statusMessage.includes('备份') ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
                    备份到云端
                </button>
                <button
                    type="button"
                    onClick={handleRestoreFromWebDav}
                    disabled={backupStatus === 'loading'}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    {backupStatus === 'loading' && statusMessage.includes('恢复') ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
                    从云端恢复
                </button>
             </div>

             {/* Status Message */}
             {statusMessage && (
                 <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
                     backupStatus === 'error' ? 'bg-red-500/20 text-red-400' : 
                     backupStatus === 'success' ? 'bg-green-500/20 text-green-400' : 
                     'bg-blue-500/20 text-blue-400'
                 }`}>
                     {backupStatus === 'loading' && <Loader2 className="w-3 h-3 animate-spin" />}
                     {backupStatus === 'success' && <Check className="w-3 h-3" />}
                     {backupStatus === 'error' && <AlertCircle className="w-3 h-3" />}
                     {statusMessage}
                 </div>
             )}
          </section>

          <section>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                本地导入 / 导出
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
