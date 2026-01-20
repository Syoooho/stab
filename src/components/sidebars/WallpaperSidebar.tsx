import { Sidebar } from './Sidebar';
import type { WallpaperConfig, WallpaperHistoryItem } from '../../types';
import { Upload, Download, Trash, RefreshCw, Clock, Sliders } from 'lucide-react';
import { useState } from 'react';

interface WallpaperSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  config: WallpaperConfig;
  onChange: (config: WallpaperConfig) => void;
}

const BING_API = 'https://uapis.cn/api/v1/image/bing-daily';

import { compressImage } from '../../utils/image';

// ...

export const WallpaperSidebar = ({ isOpen, onClose, config, onChange }: WallpaperSidebarProps) => {
  const [loadingBing, setLoadingBing] = useState(false);

  const addToHistory = (url: string, source: 'bing' | 'upload' | 'preset') => {
      const newItem: WallpaperHistoryItem = {
          id: crypto.randomUUID(),
          url,
          date: new Date().toISOString(),
          source
      };
      
      const newHistory = [newItem, ...(config.history || [])].slice(0, 10); // Keep last 10
      return newHistory;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          compressImage(file).then(url => {
              onChange({ 
                  ...config,
                  type: 'upload', 
                  value: url,
                  history: addToHistory(url, 'upload')
              });
          }).catch(err => {
              console.error('Image compression failed:', err);
              alert('图片处理失败，请重试');
          });
      }
  };

  const fetchBingWallpaper = async () => {
      // Check if already fetched today
      const today = new Date().toISOString().split('T')[0];
      if (config.lastBingFetch === today) {
          // If the current wallpaper IS the bing wallpaper (or from bing), just show toast/alert
          // But to be safe, let's find the latest bing image from history if available?
          // Actually, if lastBingFetch is today, it means we already have it.
          // Let's just find it in history or check current value.
          
          const todaysBing = config.history?.find(h => h.source === 'bing' && h.date.startsWith(today));
          if (todaysBing) {
              if (config.value !== todaysBing.url) {
                   handleSetWallpaper(todaysBing.url, 'bing');
              } else {
                   alert('已是今日最新壁纸');
              }
              return;
          }
          // If not found in history but flag is set, maybe history was deleted? Allow fetch again.
      }

      setLoadingBing(true);
      try {
          const response = await fetch(BING_API);
          if (!response.ok) throw new Error('Failed to fetch Bing wallpaper');
          
          const blob = await response.blob();
          
          // Compress before saving
          const url = await compressImage(blob);
          
          onChange({
              ...config,
              type: 'url',
              value: url,
              lastBingFetch: today,
              history: addToHistory(url, 'bing')
          });

      } catch (error) {
          console.error('Bing wallpaper fetch failed:', error);
          alert('获取必应壁纸失败，请稍后重试');
      } finally {
          setLoadingBing(false);
      }
  };

  const handleSetWallpaper = (url: string, source: 'preset' | 'bing' | 'upload') => {
      // If setting from history, just update value. If new preset, add to history.
      const isHistory = config.history?.some(h => h.url === url);
      
      onChange({
          ...config,
          type: 'url',
          value: url,
          history: isHistory ? config.history : addToHistory(url, source)
      });
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const newHistory = config.history.filter(h => h.id !== id);
      onChange({ ...config, history: newHistory });
  };

  const handleDownload = (url: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const link = document.createElement('a');
      link.href = url;
      link.download = `wallpaper-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <Sidebar isOpen={isOpen} onClose={onClose} position="left" title="壁纸设置">
      <div className="space-y-8 pb-10">
        
        {/* Bing Daily */}
        <div>
            <label className="block text-sm font-medium text-white/70 mb-3">每日一图</label>
            <button 
                onClick={fetchBingWallpaper}
                disabled={loadingBing}
                className="w-full h-24 rounded-xl overflow-hidden relative group border border-white/10 hover:border-white/30 transition-all"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center flex-col text-white">
                    {loadingBing ? (
                        <RefreshCw className="w-6 h-6 animate-spin mb-2" />
                    ) : (
                        <RefreshCw className="w-6 h-6 mb-2" />
                    )}
                    <span className="text-sm font-medium">获取必应今日壁纸</span>
                </div>
            </button>
        </div>

        {/* Display Settings */}
        <div>
            <label className="block text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                显示设置
            </label>
            <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                    <div className="flex justify-between text-xs mb-2">
                        <span className="text-white/50">遮罩浓度</span>
                        <span className="text-white/70">{Math.round((config.opacity ?? 0.6) * 100)}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="0.9" 
                        step="0.05"
                        value={config.opacity ?? 0.6}
                        onChange={(e) => onChange({ ...config, opacity: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                    />
                </div>
                
                <div>
                    <div className="flex justify-between text-xs mb-2">
                        <span className="text-white/50">模糊程度</span>
                        <span className="text-white/70">{config.blur ?? 0}px</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="20" 
                        step="1"
                        value={config.blur ?? 0}
                        onChange={(e) => onChange({ ...config, blur: parseInt(e.target.value) })}
                        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                    />
                </div>
            </div>
        </div>

        {/* Upload Section */}
        <div>
           <label className="block text-sm font-medium text-white/70 mb-3">自定义壁纸</label>
           <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-white/10 border-dashed rounded-xl cursor-pointer hover:bg-white/5 hover:border-white/30 transition-all">
                <div className="flex flex-col items-center justify-center">
                    <Upload className="w-6 h-6 text-white/40 mb-2" />
                    <p className="text-xs text-white/50">点击上传图片</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
        </div>

        {/* History */}
        {config.history && config.history.length > 0 && (
            <div>
                <label className="block text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    历史记录 (最近10张)
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {config.history.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleSetWallpaper(item.url, item.source)}
                            className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all group cursor-pointer ${config.value === item.url ? 'border-white' : 'border-transparent'}`}
                        >
                            <img src={item.url} className="w-full h-full object-cover" />
                            
                            {/* Overlay Actions */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button 
                                    onClick={(e) => handleDownload(item.url, e)}
                                    className="p-1.5 bg-white/10 rounded-full hover:bg-white/30 text-white"
                                    title="下载"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={(e) => handleDeleteHistory(item.id, e)}
                                    className="p-1.5 bg-white/10 rounded-full hover:bg-red-500/50 text-white"
                                    title="删除"
                                >
                                    <Trash className="w-4 h-4" />
                                </button>
                            </div>
                            
                            {config.value === item.url && (
                                <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full shadow-lg" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}

      </div>
    </Sidebar>
  );
};
