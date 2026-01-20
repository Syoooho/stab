import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import type { App } from '../types';
import { fetchAndCacheIcon } from '../utils/image';

interface AddAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (app: App) => void;
  initialData?: App | null;
}

const PRESETS = [
    { name: 'ChatGPT', url: 'https://chat.openai.com', icon: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg' },
    { name: 'Bilibili', url: 'https://www.bilibili.com', icon: 'https://www.bilibili.com/favicon.ico' },
    { name: 'Vercel', url: 'https://vercel.com', icon: 'https://assets.vercel.com/image/upload/front/favicon/vercel/180x180.png' },
    { name: 'Figma', url: 'https://www.figma.com', icon: 'https://static.figma.com/app/icon/1/icon-192.png' },
    { name: 'Notion', url: 'https://www.notion.so', icon: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png' },
    { name: '淘宝', url: 'https://www.taobao.com', icon: 'https://img.alicdn.com/tps/i3/T1OjaVFl4dXXa.JOZB-114-114.png' },
    { name: '京东', url: 'https://www.jd.com', icon: 'https://www.jd.com/favicon.ico' },
    { name: '知乎', url: 'https://www.zhihu.com', icon: 'https://static.zhihu.com/heifetz/assets/apple-touch-icon-152.6c82272f.png' },
    { name: '微博', url: 'https://weibo.com', icon: 'https://weibo.com/favicon.ico' },
    { name: '百度', url: 'https://www.baidu.com', icon: 'https://www.baidu.com/favicon.ico' },
    { name: '小红书', url: 'https://www.xiaohongshu.com', icon: 'https://www.xiaohongshu.com/favicon.ico' },
    { name: '豆瓣', url: 'https://www.douban.com', icon: 'https://img3.doubanio.com/favicon.ico' },
    { name: '腾讯视频', url: 'https://v.qq.com', icon: 'https://v.qq.com/favicon.ico' },
    { name: '爱奇艺', url: 'https://www.iqiyi.com', icon: 'https://www.iqiyi.com/favicon.ico' },
    { name: '优酷', url: 'https://www.youku.com', icon: 'https://www.youku.com/favicon.ico' },
    { name: 'GitHub', url: 'https://github.com', icon: 'https://github.githubassets.com/favicons/favicon.png' },
    { name: 'GitLab', url: 'https://gitlab.com', icon: 'https://about.gitlab.com/images/press/press-kit-icon.svg' },
    { name: 'Google', url: 'https://google.com', icon: 'https://www.google.com/favicon.ico' },
    { name: 'Twitter', url: 'https://twitter.com', icon: 'https://abs.twimg.com/icons/apple-touch-icon-192x192.png' },
    { name: 'YouTube', url: 'https://youtube.com', icon: 'https://www.youtube.com/s/desktop/10c3b063/img/favicon.ico' },
];

export const AddAppModal = ({ isOpen, onClose, onAdd, initialData }: AddAppModalProps) => {
  const [mode, setMode] = useState<'presets' | 'custom'>('presets');
  
  // Custom mode state
  const [name, setName] = useState('');
  const [publicUrl, setPublicUrl] = useState('');
  const [internalUrl, setInternalUrl] = useState('');
  const [meshUrl, setMeshUrl] = useState('');
  const [frpUrl, setFrpUrl] = useState('');
  const [iconUrl, setIconUrl] = useState('');

  // Reset or fill data when opening
  useEffect(() => {
      if (isOpen) {
          if (initialData) {
              setMode('custom');
              setName(initialData.name);
              setPublicUrl(initialData.urls.public || '');
              setInternalUrl(initialData.urls.internal || '');
              setMeshUrl(initialData.urls.mesh || '');
              setFrpUrl(initialData.urls.frp || '');
              setIconUrl(initialData.icon);
          } else {
              setMode('presets');
              reset();
          }
      }
  }, [isOpen, initialData]);

  const handleIconError = () => {
      // If the current icon fails (e.g., Google service fails or returns default), try fallback
      if (iconUrl.includes('google.com/s2/favicons')) {
           const urlStr = publicUrl.startsWith('http') ? publicUrl : `https://${publicUrl}`; 
           try {
               const url = new URL(urlStr);
               // Fallback to direct favicon.ico
               setIconUrl(`${url.origin}/favicon.ico`);
           } catch (e) {
               // ignore
           }
      }
  };

  const fetchIcon = (strategy: 'google' | 'ico' | 'chrome') => {
      if (!publicUrl) return;

      try {
        let urlStr = publicUrl;
        if (!urlStr.startsWith('http')) {
            const isIP = /^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/.test(publicUrl);
            urlStr = isIP ? `http://${publicUrl}` : `https://${publicUrl}`;
        }
        
        const url = new URL(urlStr);
        const domain = url.hostname;

        if (strategy === 'google') {
             setIconUrl(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
        } else if (strategy === 'ico') {
             setIconUrl(`${url.origin}/favicon.ico`);
        } else if (strategy === 'chrome') {
             // Use Chrome Extension Favicon API (works only if permission granted)
             // This constructs a special chrome://favicon url
             // Note: This only works within the extension context to DISPLAY, 
             // it might not be fetchable via fetch() for caching without extra permissions.
             // But for <img> src it works fine.
             setIconUrl(`chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(urlStr)}&size=64`);
        }
      } catch (e) {
          // ignore
      }
  };

  // ... (keep useEffect for auto fetch but make it use default google strategy)
  useEffect(() => {
    if (!publicUrl || mode !== 'custom' || (initialData && initialData.urls.public === publicUrl)) return;
    
    const timer = setTimeout(() => {
        // Default auto-fetch uses Google
        fetchIcon('google');
        
        // Also auto-fill name
        if (!name) {
             try {
                let urlStr = publicUrl.startsWith('http') ? publicUrl : `https://${publicUrl}`;
                const domain = new URL(urlStr).hostname;
                const autoName = domain.split('.')[0];
                const isIP = /^(\d{1,3}\.){3}\d{1,3}$/.test(domain);
                setName(isIP ? domain : (autoName.charAt(0).toUpperCase() + autoName.slice(1)));
             } catch(e) {}
        }
    }, 500); 
    
    return () => clearTimeout(timer);
  }, [publicUrl, name, mode, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || (!publicUrl && !internalUrl && !meshUrl && !frpUrl)) return;

    // Try to cache icon if it's a remote URL
    let finalIcon = iconUrl;
    if (iconUrl && iconUrl.startsWith('http')) {
        // If it's a normal URL (like /favicon.ico or google service), we try to fetch and convert to base64
        // Google service images are usually cacheable
        finalIcon = await fetchAndCacheIcon(iconUrl);
    }

    const newApp: App = {
      id: initialData?.id || crypto.randomUUID(),
      name,
      icon: finalIcon || `https://ui-avatars.com/api/?name=${name}&background=random`,
      urls: {
        public: publicUrl ? (publicUrl.startsWith('http') ? publicUrl : `https://${publicUrl}`) : undefined,
        internal: internalUrl ? (internalUrl.startsWith('http') ? internalUrl : `http://${internalUrl}`) : undefined,
        mesh: meshUrl ? (meshUrl.startsWith('http') ? meshUrl : `http://${meshUrl}`) : undefined,
        frp: frpUrl ? (frpUrl.startsWith('http') ? frpUrl : `http://${frpUrl}`) : undefined
      }
    };

    onAdd(newApp);
    onClose();
  };
  
  const reset = () => {
      setName('');
      setPublicUrl('');
      setInternalUrl('');
      setMeshUrl('');
      setFrpUrl('');
      setIconUrl('');
  }

  const handleQuickAdd = (preset: { name: string, url: string, icon: string }) => {
      const newApp: App = {
          id: crypto.randomUUID(),
          name: preset.name,
          icon: preset.icon,
          urls: { public: preset.url }
      };
      onAdd(newApp);
      onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl bg-[#242424] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white z-10">
            <X className="w-5 h-5" />
          </button>
          
          <div className="p-6">
              <h2 className="text-xl font-bold mb-6 text-white">
                  {initialData ? '编辑应用' : (mode === 'presets' ? '添加应用' : '自定义应用')}
              </h2>

              {mode === 'presets' ? (
                  <>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 mb-8 max-h-[60vh] overflow-y-auto custom-scrollbar p-1">
                        {PRESETS.map(preset => (
                            <button
                                key={preset.name}
                                onClick={() => handleQuickAdd(preset)}
                                className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all group"
                            >
                                <img src={preset.icon} className="w-10 h-10 mb-2 rounded-lg object-contain group-hover:scale-110 transition-transform" />
                                <span className="text-xs text-white/70">{preset.name}</span>
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-white/10">
                        <button 
                            onClick={() => setMode('custom')}
                            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            自定义添加
                        </button>
                        <div className="text-xs text-white/30">
                            从上方选择或自定义
                        </div>
                    </div>
                  </>
              ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-1">公网地址 (自动获取图标)</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                        placeholder="https://github.com"
                        value={publicUrl}
                        onChange={(e) => setPublicUrl(e.target.value)}
                        autoFocus
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                          <label className="block text-xs font-medium text-white/50 mb-1">内网地址</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                            placeholder="http://192.168.x.x"
                            value={internalUrl}
                            onChange={(e) => setInternalUrl(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-white/50 mb-1">组网地址</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                            placeholder="http://100.x.x.x"
                            value={meshUrl}
                            onChange={(e) => setMeshUrl(e.target.value)}
                          />
                        </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-1">FRP 地址</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                        placeholder="http://frp.example.com"
                        value={frpUrl}
                        onChange={(e) => setFrpUrl(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-white/50 mb-1">名称</label>
                          <input
                            type="text"
                            required
                            className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                            placeholder="GitHub"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                            {iconUrl ? (
                                <img 
                                    src={iconUrl} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover" 
                                    onError={handleIconError}
                                />
                            ) : (
                                <div className="text-white/20 text-xs">图标</div>
                            )}
                        </div>
                    </div>
                    
                     <div>
                      <label className="block text-xs font-medium text-white/50 mb-1">图标 URL (可选)</label>
                      <div className="flex flex-col gap-2">
                          <input
                            type="text"
                            className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                            value={iconUrl}
                            onChange={(e) => setIconUrl(e.target.value)}
                            placeholder="https://..."
                          />
                          <div className="flex gap-2">
                            <button 
                                type="button"
                                onClick={() => fetchIcon('google')}
                                className="flex-1 px-2 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                                title="Google Favicon Service"
                            >
                                Google
                            </button>
                            <button 
                                type="button"
                                onClick={() => fetchIcon('ico')}
                                className="flex-1 px-2 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                                title="Direct /favicon.ico"
                            >
                                /favicon.ico
                            </button>
                            <button 
                                type="button"
                                onClick={() => fetchIcon('chrome')}
                                className="flex-1 px-2 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                                title="Chrome Favicon API (Extension Only)"
                            >
                                Chrome API
                            </button>
                          </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4 border-t border-white/10">
                        {initialData ? (
                            <div /> // Spacer
                        ) : (
                            <button
                              type="button"
                              onClick={() => setMode('presets')}
                              className="text-sm text-white/50 hover:text-white transition-colors"
                            >
                              返回预设
                            </button>
                        )}
                        <button
                          type="submit"
                          className="px-6 py-2 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors"
                        >
                          {initialData ? '保存更改' : '确认添加'}
                        </button>
                    </div>
                  </form>
              )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
