import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import type { App, SystemConfig } from '../types';
import { fetchAndCacheIcon } from '../utils/image';

interface AddAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (app: App) => void;
  initialData?: App | null;
  systemConfig?: SystemConfig;
}

const PRESETS = [
    // 一、工具效率类
    { name: 'Canva 可画', url: 'https://www.canva.cn/', icon: 'https://www.google.com/s2/favicons?domain=canva.cn&sz=128' },
    { name: 'ProcessOn', url: 'https://www.processon.com/', icon: 'https://www.google.com/s2/favicons?domain=processon.com&sz=128' },
    { name: '石墨文档', url: 'https://shimo.im/', icon: 'https://www.google.com/s2/favicons?domain=shimo.im&sz=128' },
    { name: '天若 OCR', url: 'https://tianruoocr.cn/', icon: 'https://www.google.com/s2/favicons?domain=tianruoocr.cn&sz=128' },
    { name: '小恐龙办公', url: 'https://www.kokojia.com/', icon: 'https://www.google.com/s2/favicons?domain=kokojia.com&sz=128' },
    { name: '在线时钟', url: 'https://www.onlineclock.net/', icon: 'https://www.google.com/s2/favicons?domain=onlineclock.net&sz=128' },
    { name: '草料二维码', url: 'https://cli.im/', icon: 'https://www.google.com/s2/favicons?domain=cli.im&sz=128' },
    { name: 'iLovePDF', url: 'https://www.ilovepdf.com/', icon: 'https://www.google.com/s2/favicons?domain=ilovepdf.com&sz=128' },

    // 二、学习资讯类
    { name: '知乎', url: 'https://www.zhihu.com/', icon: 'https://www.google.com/s2/favicons?domain=zhihu.com&sz=128' },
    { name: '哔哩哔哩', url: 'https://www.bilibili.com/', icon: 'https://www.google.com/s2/favicons?domain=bilibili.com&sz=128' },
    { name: '慕课网', url: 'https://www.imooc.com/', icon: 'https://www.google.com/s2/favicons?domain=imooc.com&sz=128' },
    { name: '网易云课堂', url: 'https://study.163.com/', icon: 'https://www.google.com/s2/favicons?domain=study.163.com&sz=128' },
    { name: '36 氪', url: 'https://36kr.com/', icon: 'https://www.google.com/s2/favicons?domain=36kr.com&sz=128' },
    { name: '虎嗅网', url: 'https://www.huxiu.com/', icon: 'https://www.google.com/s2/favicons?domain=huxiu.com&sz=128' },
    { name: '得到', url: 'https://www.dedao.cn/', icon: 'https://www.google.com/s2/favicons?domain=dedao.cn&sz=128' },
    { name: '豆瓣读书', url: 'https://book.douban.com/', icon: 'https://www.google.com/s2/favicons?domain=book.douban.com&sz=128' },

    // 三、设计创作类
    { name: '站酷', url: 'https://www.zcool.com.cn/', icon: 'https://www.google.com/s2/favicons?domain=zcool.com.cn&sz=128' },
    { name: '花瓣网', url: 'https://huaban.com/', icon: 'https://www.google.com/s2/favicons?domain=huaban.com&sz=128' },
    { name: '千库网', url: 'https://www.588ku.com/', icon: 'https://www.google.com/s2/favicons?domain=588ku.com&sz=128' },
    { name: 'Freepik', url: 'https://www.freepik.com/', icon: 'https://www.google.com/s2/favicons?domain=freepik.com&sz=128' },
    { name: 'Behance', url: 'https://www.behance.net/', icon: 'https://www.google.com/s2/favicons?domain=behance.net&sz=128' },
    { name: 'Dribbble', url: 'https://dribbble.com/', icon: 'https://www.google.com/s2/favicons?domain=dribbble.com&sz=128' },
    { name: '字魂网', url: 'https://www.izihun.com/', icon: 'https://www.google.com/s2/favicons?domain=izihun.com&sz=128' },
    { name: '创客贴', url: 'https://www.chuangkit.com/', icon: 'https://www.google.com/s2/favicons?domain=chuangkit.com&sz=128' },

    // 四、开发技术类
    { name: 'GitHub', url: 'https://github.com/', icon: 'https://www.google.com/s2/favicons?domain=github.com&sz=128' },
    { name: 'StackOverflow', url: 'https://stackoverflow.com/', icon: 'https://www.google.com/s2/favicons?domain=stackoverflow.com&sz=128' },
    { name: '菜鸟教程', url: 'https://www.runoob.com/', icon: 'https://www.google.com/s2/favicons?domain=runoob.com&sz=128' },
    { name: 'MDN', url: 'https://developer.mozilla.org/zh-CN/', icon: 'https://www.google.com/s2/favicons?domain=developer.mozilla.org&sz=128' },
    { name: '掘金', url: 'https://juejin.cn/', icon: 'https://www.google.com/s2/favicons?domain=juejin.cn&sz=128' },
    { name: 'LeetCode', url: 'https://leetcode.cn/', icon: 'https://www.google.com/s2/favicons?domain=leetcode.cn&sz=128' },
    { name: 'DockerHub', url: 'https://hub.docker.com/', icon: 'https://www.google.com/s2/favicons?domain=hub.docker.com&sz=128' },
    { name: '阿里云开发者', url: 'https://developer.aliyun.com/', icon: 'https://www.google.com/s2/favicons?domain=developer.aliyun.com&sz=128' },

    // 五、办公协作类
    { name: '钉钉', url: 'https://www.dingtalk.com/', icon: 'https://www.google.com/s2/favicons?domain=dingtalk.com&sz=128' },
    { name: '企业微信', url: 'https://work.weixin.qq.com/', icon: 'https://www.google.com/s2/favicons?domain=work.weixin.qq.com&sz=128' },
    { name: '飞书', url: 'https://www.larksuite.com/', icon: 'https://www.google.com/s2/favicons?domain=larksuite.com&sz=128' },
    { name: '腾讯会议', url: 'https://meeting.tencent.com/', icon: 'https://www.google.com/s2/favicons?domain=meeting.tencent.com&sz=128' },
    { name: '金山文档', url: 'https://kdocs.cn/', icon: 'https://www.google.com/s2/favicons?domain=kdocs.cn&sz=128' },
    { name: 'Trello', url: 'https://trello.com/', icon: 'https://www.google.com/s2/favicons?domain=trello.com&sz=128' },
    { name: 'Notion', url: 'https://www.notion.so/', icon: 'https://www.google.com/s2/favicons?domain=notion.so&sz=128' },

    // 六、视频类
    { name: '腾讯视频', url: 'https://v.qq.com/', icon: 'https://www.google.com/s2/favicons?domain=v.qq.com&sz=128' },
    { name: '爱奇艺', url: 'https://www.iqiyi.com/', icon: 'https://www.google.com/s2/favicons?domain=iqiyi.com&sz=128' },
    { name: '优酷', url: 'https://youku.com/', icon: 'https://www.google.com/s2/favicons?domain=youku.com&sz=128' },
    { name: 'YouTube', url: 'https://www.youtube.com/', icon: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128' },
    { name: '西瓜视频', url: 'https://www.ixigua.com/', icon: 'https://www.google.com/s2/favicons?domain=ixigua.com&sz=128' },
    { name: '央视网', url: 'https://tv.cctv.com/', icon: 'https://www.google.com/s2/favicons?domain=tv.cctv.com&sz=128' },

    // 七、音乐类
    { name: '网易云音乐', url: 'https://music.163.com/', icon: 'https://www.google.com/s2/favicons?domain=music.163.com&sz=128' },
    { name: 'QQ 音乐', url: 'https://y.qq.com/', icon: 'https://www.google.com/s2/favicons?domain=y.qq.com&sz=128' },
    { name: '酷狗音乐', url: 'https://www.kugou.com/', icon: 'https://www.google.com/s2/favicons?domain=kugou.com&sz=128' },
    { name: 'Spotify', url: 'https://www.spotify.com/', icon: 'https://www.google.com/s2/favicons?domain=spotify.com&sz=128' },
    { name: '喜马拉雅', url: 'https://www.ximalaya.com/', icon: 'https://www.google.com/s2/favicons?domain=ximalaya.com&sz=128' },
];

export const AddAppModal = ({ isOpen, onClose, onAdd, initialData, systemConfig }: AddAppModalProps) => {
  const [mode, setMode] = useState<'presets' | 'custom'>('presets');
  
  // Custom mode state
  const [name, setName] = useState('');
  const [publicUrl, setPublicUrl] = useState('');
  const [internalUrl, setInternalUrl] = useState('');
  const [meshUrl, setMeshUrl] = useState('');
  const [frpUrl, setFrpUrl] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [useInternalService, setUseInternalService] = useState(false);
  const [useMeshService, setUseMeshService] = useState(false);
  const [useFrpService, setUseFrpService] = useState(false);
  const [internalPort, setInternalPort] = useState('');
  const [meshPort, setMeshPort] = useState('');
  const [frpPort, setFrpPort] = useState('');

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
              setUseInternalService(false);
              setUseMeshService(false);
              setUseFrpService(false);
              setInternalPort('');
              setMeshPort('');
              setFrpPort('');
          } else {
              setMode('presets');
              reset();
          }
      }
  }, [isOpen, initialData]);

  const getServiceBase = (serviceUrl?: string) => {
      if (!serviceUrl) return null;
      try {
          const normalized = serviceUrl.startsWith('http') ? serviceUrl : `http://${serviceUrl}`;
          const u = new URL(normalized);
          return { protocol: u.protocol, hostname: u.hostname };
      } catch {
          return null;
      }
  };

  const getPortFromUrl = (urlStr: string) => {
      if (!urlStr) return '';
      try {
          const normalized = urlStr.startsWith('http') ? urlStr : `http://${urlStr}`;
          const u = new URL(normalized);
          return u.port || '';
      } catch {
          return '';
      }
  };

  const buildUrlFromService = (serviceUrl: string | undefined, port: string) => {
      const base = getServiceBase(serviceUrl);
      if (!base) return '';
      const p = port.trim();
      if (!p) return `${base.protocol}//${base.hostname}`;
      return `${base.protocol}//${base.hostname}:${p}`;
  };

  const getServiceDisplay = (serviceUrl?: string) => {
      const base = getServiceBase(serviceUrl);
      if (!base) return '';
      return `${base.protocol}//${base.hostname}`;
  };

  const getPrimaryUrlForAutoFill = () => {
      if (publicUrl) return publicUrl;
      if (internalUrl) return internalUrl;
      if (meshUrl) return meshUrl;
      if (frpUrl) return frpUrl;
      if (useInternalService) return systemConfig?.internalCheckUrl || '';
      if (useMeshService) return systemConfig?.meshCheckUrl || '';
      if (useFrpService) return systemConfig?.frpCheckUrl || '';
      return '';
  };

  const handleIconError = () => {
      // If the current icon fails (e.g., Google service fails or returns default), try fallback
      if (iconUrl.includes('google.com/s2/favicons')) {
           const primary = getPrimaryUrlForAutoFill();
           if (!primary) return;
           const urlStr = primary.startsWith('http') ? primary : `https://${primary}`; 
           try {
               const url = new URL(urlStr);
               // Fallback to direct favicon.ico
               setIconUrl(`${url.origin}/favicon.ico`);
           } catch (e) {
               // ignore
           }
      }
  };

  const fetchIcon = (strategy: 'google' | 'ico' | 'chrome', urlOverride?: string) => {
      const targetInput = urlOverride || getPrimaryUrlForAutoFill();
      if (!targetInput) return;

      try {
        let urlStr = targetInput;
        if (!urlStr.startsWith('http')) {
            const isIP = /^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/.test(targetInput);
            urlStr = isIP ? `http://${targetInput}` : `https://${targetInput}`;
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
    const primaryUrl = getPrimaryUrlForAutoFill();
    if (!primaryUrl || mode !== 'custom') return;
    if (initialData && initialData.urls.public === publicUrl && publicUrl) return;
    
    const timer = setTimeout(() => {
        // Default auto-fetch uses Google
        fetchIcon('google', primaryUrl);
        
        // Also auto-fill name
        if (!name) {
             try {
                let urlStr = primaryUrl.startsWith('http') ? primaryUrl : `https://${primaryUrl}`;
                const domain = new URL(urlStr).hostname;
                const autoName = domain.split('.')[0];
                const isIP = /^(\d{1,3}\.){3}\d{1,3}$/.test(domain);
                setName(isIP ? domain : (autoName.charAt(0).toUpperCase() + autoName.slice(1)));
             } catch(e) {}
        }
    }, 500); 
    
    return () => clearTimeout(timer);
  }, [publicUrl, internalUrl, meshUrl, frpUrl, useInternalService, useMeshService, useFrpService, systemConfig, name, mode, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasAnyUrl = Boolean(
        publicUrl ||
        internalUrl ||
        meshUrl ||
        frpUrl ||
        (useInternalService && systemConfig?.internalCheckUrl) ||
        (useMeshService && systemConfig?.meshCheckUrl) ||
        (useFrpService && systemConfig?.frpCheckUrl)
    );
    if (!name || !hasAnyUrl) return;

    // Try to cache icon if it's a remote URL
    let finalIcon = iconUrl;
    if (iconUrl && iconUrl.startsWith('http')) {
        // If it's a normal URL (like /favicon.ico or google service), we try to fetch and convert to base64
        // Google service images are usually cacheable
        finalIcon = await fetchAndCacheIcon(iconUrl);
    }

    const resolvedInternalUrl = useInternalService
        ? buildUrlFromService(systemConfig?.internalCheckUrl, internalPort || getPortFromUrl(internalUrl))
        : (internalUrl ? (internalUrl.startsWith('http') ? internalUrl : `http://${internalUrl}`) : undefined);

    const resolvedMeshUrl = useMeshService
        ? buildUrlFromService(systemConfig?.meshCheckUrl, meshPort || getPortFromUrl(meshUrl))
        : (meshUrl ? (meshUrl.startsWith('http') ? meshUrl : `http://${meshUrl}`) : undefined);

    const resolvedFrpUrl = useFrpService
        ? buildUrlFromService(systemConfig?.frpCheckUrl, frpPort || getPortFromUrl(frpUrl))
        : (frpUrl ? (frpUrl.startsWith('http') ? frpUrl : `http://${frpUrl}`) : undefined);

    const newApp: App = {
      id: initialData?.id || crypto.randomUUID(),
      name,
      icon: finalIcon || `https://ui-avatars.com/api/?name=${name}&background=random`,
      urls: {
        public: publicUrl ? (publicUrl.startsWith('http') ? publicUrl : `https://${publicUrl}`) : undefined,
        internal: resolvedInternalUrl,
        mesh: resolvedMeshUrl,
        frp: resolvedFrpUrl
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
      setUseInternalService(false);
      setUseMeshService(false);
      setUseFrpService(false);
      setInternalPort('');
      setMeshPort('');
      setFrpPort('');
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
                      <label className="block text-xs font-medium text-white/50 mb-1">公网地址（可选，用于自动获取图标）</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                        placeholder="https://example.com"
                        value={publicUrl}
                        onChange={(e) => setPublicUrl(e.target.value)}
                        autoFocus
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-medium text-white/50">内网地址</label>
                            <button
                              type="button"
                              disabled={!systemConfig?.internalCheckUrl}
                              onClick={() => {
                                setUseInternalService(v => {
                                  const next = !v;
                                  if (next) setInternalPort(getPortFromUrl(internalUrl));
                                  return next;
                                });
                              }}
                              className={`text-xs px-2 py-1 rounded border ${useInternalService ? 'bg-white text-black border-white' : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'} ${!systemConfig?.internalCheckUrl ? 'opacity-30 cursor-not-allowed' : ''}`}
                            >
                              跟随服务地址
                            </button>
                          </div>
                          {useInternalService ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                readOnly
                                value={getServiceDisplay(systemConfig?.internalCheckUrl)}
                                className="flex-1 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white/50 focus:outline-none"
                              />
                              <input
                                type="text"
                                value={internalPort}
                                onChange={(e) => setInternalPort(e.target.value)}
                                className="w-24 px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                                placeholder="端口"
                              />
                            </div>
                          ) : (
                            <input
                              type="text"
                              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                              placeholder="http://192.168.1.2:8080"
                              value={internalUrl}
                              onChange={(e) => setInternalUrl(e.target.value)}
                            />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-medium text-white/50">组网地址</label>
                            <button
                              type="button"
                              disabled={!systemConfig?.meshCheckUrl}
                              onClick={() => {
                                setUseMeshService(v => {
                                  const next = !v;
                                  if (next) setMeshPort(getPortFromUrl(meshUrl));
                                  return next;
                                });
                              }}
                              className={`text-xs px-2 py-1 rounded border ${useMeshService ? 'bg-white text-black border-white' : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'} ${!systemConfig?.meshCheckUrl ? 'opacity-30 cursor-not-allowed' : ''}`}
                            >
                              跟随服务地址
                            </button>
                          </div>
                          {useMeshService ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                readOnly
                                value={getServiceDisplay(systemConfig?.meshCheckUrl)}
                                className="flex-1 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white/50 focus:outline-none"
                              />
                              <input
                                type="text"
                                value={meshPort}
                                onChange={(e) => setMeshPort(e.target.value)}
                                className="w-24 px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                                placeholder="端口"
                              />
                            </div>
                          ) : (
                            <input
                              type="text"
                              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                              placeholder="http://100.64.0.2:8080"
                              value={meshUrl}
                              onChange={(e) => setMeshUrl(e.target.value)}
                            />
                          )}
                        </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-medium text-white/50">FRP 地址</label>
                        <button
                          type="button"
                          disabled={!systemConfig?.frpCheckUrl}
                          onClick={() => {
                            setUseFrpService(v => {
                              const next = !v;
                              if (next) setFrpPort(getPortFromUrl(frpUrl));
                              return next;
                            });
                          }}
                          className={`text-xs px-2 py-1 rounded border ${useFrpService ? 'bg-white text-black border-white' : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'} ${!systemConfig?.frpCheckUrl ? 'opacity-30 cursor-not-allowed' : ''}`}
                        >
                          跟随服务地址
                        </button>
                      </div>
                      {useFrpService ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value={getServiceDisplay(systemConfig?.frpCheckUrl)}
                            className="flex-1 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white/50 focus:outline-none"
                          />
                          <input
                            type="text"
                            value={frpPort}
                            onChange={(e) => setFrpPort(e.target.value)}
                            className="w-24 px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                            placeholder="端口"
                          />
                        </div>
                      ) : (
                        <input
                          type="text"
                          className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                          placeholder="https://your-domain.com:8080"
                          value={frpUrl}
                          onChange={(e) => setFrpUrl(e.target.value)}
                        />
                      )}
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
