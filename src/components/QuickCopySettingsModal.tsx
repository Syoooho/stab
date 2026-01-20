import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash } from 'lucide-react';
import type { SystemConfig, QuickCopyItem } from '../types';

interface QuickCopySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SystemConfig;
  onChange: (config: SystemConfig) => void;
}

export const QuickCopySettingsModal = ({ isOpen, onClose, config, onChange }: QuickCopySettingsModalProps) => {
  const [items, setItems] = useState<QuickCopyItem[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    if (isOpen) {
        setItems(config.quickCopyItems || []);
    }
  }, [isOpen, config]);

  const handleAdd = () => {
      if (!newLabel || !newValue) return;
      const newItem: QuickCopyItem = {
          id: crypto.randomUUID(),
          label: newLabel,
          value: newValue
      };
      setItems([...items, newItem]);
      setNewLabel('');
      setNewValue('');
  };

  const handleDelete = (id: string) => {
      setItems(items.filter(i => i.id !== id));
  };

  const handleSave = () => {
      onChange({ ...config, quickCopyItems: items });
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
          className="w-full max-w-md bg-[#242424] border border-white/10 rounded-2xl shadow-2xl p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-xl font-bold mb-6 text-white">快速复制设置</h2>
          
          <div className="space-y-4">
              {/* Add New */}
              <div className="flex gap-2 items-end">
                  <div className="flex-1">
                      <label className="block text-xs font-medium text-white/70 mb-1">标签</label>
                      <input 
                          type="text" 
                          value={newLabel}
                          onChange={(e) => setNewLabel(e.target.value)}
                          className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/30"
                          placeholder="例如: 身份证"
                      />
                  </div>
                  <div className="flex-[2]">
                      <label className="block text-xs font-medium text-white/70 mb-1">内容</label>
                      <input 
                          type="text" 
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                          className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/30"
                          placeholder="例如: 1101011990..."
                      />
                  </div>
                  <button 
                      onClick={handleAdd}
                      disabled={!newLabel || !newValue}
                      className="p-2 bg-white text-black rounded-lg hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      <Plus className="w-5 h-5" />
                  </button>
              </div>

              {/* List */}
              <div className="max-h-60 overflow-y-auto custom-scrollbar border border-white/10 rounded-lg bg-black/10">
                  {items.length === 0 ? (
                      <div className="text-center py-8 text-white/30 text-sm">暂无内容</div>
                  ) : (
                      <div className="divide-y divide-white/10">
                          {items.map(item => (
                              <div key={item.id} className="flex items-center justify-between p-3 hover:bg-white/5">
                                  <div className="min-w-0 flex-1 mr-4">
                                      <div className="text-sm font-medium text-white/90">{item.label}</div>
                                      <div className="text-xs text-white/50 truncate">{item.value}</div>
                                  </div>
                                  <button 
                                      onClick={() => handleDelete(item.id)}
                                      className="text-white/30 hover:text-red-400 transition-colors"
                                  >
                                      <Trash className="w-4 h-4" />
                                  </button>
                              </div>
                          ))}
                      </div>
                  )}
              </div>

            <button
              onClick={handleSave}
              className="w-full mt-2 bg-white text-black font-medium py-2 rounded-lg hover:bg-white/90 transition-colors"
            >
              保存更改
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
