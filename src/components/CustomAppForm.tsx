import { useState, useEffect } from 'react';
import type { App, SystemConfig } from '../types';
import { useIconFetch } from '../hooks/useIconFetch';
import { fetchAndCacheIcon } from '../utils/image';

interface CustomAppFormProps {
  onSubmit: (app: App) => void;
  onClose: () => void;
  initialData?: App | null;
  systemConfig?: SystemConfig;
}

export function CustomAppForm({ onSubmit, onClose, initialData, systemConfig }: CustomAppFormProps) {
  // 表单状态
  const [name, setName] = useState('');
  const [publicUrl, setPublicUrl] = useState('');
  const [internalUrl, setInternalUrl] = useState('');
  const [meshUrl, setMeshUrl] = useState('');
  const [frpUrl, setFrpUrl] = useState('');
  const [useInternalService, setUseInternalService] = useState(false);
  const [useMeshService, setUseMeshService] = useState(false);
  const [useFrpService, setUseFrpService] = useState(false);
  const [internalPort, setInternalPort] = useState('');
  const [meshPort, setMeshPort] = useState('');
  const [frpPort, setFrpPort] = useState('');

  const {
    iconUrl,
    setIconUrl,
    fetchIcon,
    handleIconError,
  } = useIconFetch(
    publicUrl,
    internalUrl,
    meshUrl,
    frpUrl,
    useInternalService,
    useMeshService,
    useFrpService,
    systemConfig,
    initialData?.icon
  );
  useEffect(() => {
    if (initialData) {
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
      reset();
    }
  }, [initialData, setIconUrl]);

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
  };

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

    // 缓存图标
    let finalIcon = iconUrl;
    if (iconUrl && iconUrl.startsWith('http')) {
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
        frp: resolvedFrpUrl,
      },
    };

    onSubmit(newApp);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 公网地址 */}
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

      {/* 内网和组网地址 */}
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

      {/* FRP 地址 */}
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

      {/* 名称和图标 */}
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

      {/* 图标 URL */}
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
              onClick={() => fetchIcon('iowen')}
              className="flex-1 px-2 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              Domestic
            </button>
            <button
              type="button"
              onClick={() => fetchIcon('ico')}
              className="flex-1 px-2 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              /favicon.ico
            </button>
            <button
              type="button"
              onClick={() => fetchIcon('chrome')}
              className="flex-1 px-2 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              Chrome API
            </button>
          </div>
        </div>
      </div>

      {/* 提交按钮 */}
      <div className="flex justify-between pt-4 border-t border-white/10">
        {initialData ? (
          <div />
        ) : (
          <button
            type="button"
            onClick={reset}
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            重置
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
  );
}