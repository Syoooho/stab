import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { SystemConfig } from '../types';

interface WeatherSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SystemConfig;
  onChange: (config: SystemConfig) => void;
}

export const WeatherSettingsModal = ({ isOpen, onClose, config, onChange }: WeatherSettingsModalProps) => {
  const [city, setCity] = useState(config.weatherCity);

  useEffect(() => {
    if (isOpen) {
        setCity(config.weatherCity);
    }
  }, [isOpen, config.weatherCity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange({ ...config, weatherCity: city });
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
          className="w-full max-w-sm bg-[#242424] border border-white/10 rounded-2xl shadow-2xl p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-xl font-bold mb-6 text-white">天气设置</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
               <label className="block text-xs font-medium text-white/70 mb-1">城市名称</label>
               <input 
                  type="text" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/30"
                  placeholder="北京市"
               />
               <p className="text-xs text-white/40 mt-1">支持中文城市名，如 "北京市", "深圳市"</p>
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-white text-black font-medium py-2 rounded-lg hover:bg-white/90 transition-colors"
            >
              保存
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
