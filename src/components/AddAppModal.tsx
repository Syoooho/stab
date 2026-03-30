import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { App, SystemConfig } from '../types';
import { PRESETS, type PresetApp } from '../data/presets';
import { PresetGrid } from './PresetGrid';
import { CustomAppForm } from './CustomAppForm';
import { getPresetIcon } from '../hooks/useIconFetch';

interface AddAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (app: App) => void;
  initialData?: App | null;
  systemConfig?: SystemConfig;
}

export const AddAppModal = ({ isOpen, onClose, onAdd, initialData, systemConfig }: AddAppModalProps) => {
  const [mode, setMode] = useState<'presets' | 'custom'>('presets');
  const isFolder = initialData?.type === 'folder';
  const [folderName, setFolderName] = useState('');

  // 重置或填充数据
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setMode('custom');
        if (isFolder) {
          setFolderName(initialData.name);
        }
      } else {
        setMode('presets');
        setFolderName('');
      }
    }
  }, [isOpen, initialData, isFolder]);

  const handleQuickAdd = (preset: PresetApp) => {
    const newApp: App = {
      id: crypto.randomUUID(),
      name: preset.name,
      icon: getPresetIcon(preset),
      urls: { public: preset.url },
    };
    onAdd(newApp);
    onClose();
  };

  const handleFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName) return;

    const updatedFolder: App = {
      id: initialData!.id,
      name: folderName,
      icon: initialData!.icon || 'folder',
      type: 'folder',
      children: initialData!.children || [],
      urls: initialData!.urls || {},
    };
    onAdd(updatedFolder);
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
          <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white z-10 cursor-pointer">
            <X className="w-5 h-5" />
          </button>

          <div className="p-6">
            <h2 className="text-xl font-bold mb-6 text-white">
              {initialData
                ? (isFolder ? '编辑文件夹' : '编辑应用')
                : (mode === 'presets' ? '添加应用' : '自定义应用')}
            </h2>

            {isFolder ? (
              <form onSubmit={handleFolderSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1">文件夹名称</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                    placeholder="输入文件夹名称"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 transition-colors cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors cursor-pointer"
                  >
                    保存
                  </button>
                </div>
              </form>
            ) : mode === 'presets' ? (
              <PresetGrid
                presets={PRESETS}
                onSelect={handleQuickAdd}
                onSwitchToCustom={() => setMode('custom')}
              />
            ) : (
              <CustomAppForm
                onSubmit={onAdd}
                onClose={onClose}
                initialData={initialData}
                systemConfig={systemConfig}
              />
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};