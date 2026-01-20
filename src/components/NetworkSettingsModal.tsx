import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GripVertical } from 'lucide-react';
import type { SystemConfig, NetworkType } from '../types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface NetworkSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SystemConfig;
  onChange: (config: SystemConfig) => void;
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

export const NetworkSettingsModal = ({ isOpen, onClose, config, onChange }: NetworkSettingsModalProps) => {
  const [internalUrl, setInternalUrl] = useState(config.internalCheckUrl);
  const [meshUrl, setMeshUrl] = useState(config.meshCheckUrl);
  const [frpUrl, setFrpUrl] = useState(config.frpCheckUrl || '');
  const [publicUrl, setPublicUrl] = useState(config.publicCheckUrl);
  const [priority, setPriority] = useState<NetworkType[]>(config.urlPriority || ['internal', 'mesh', 'frp', 'public']);

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
    }
  }, [isOpen, config]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange({ 
        ...config, 
        internalCheckUrl: internalUrl,
        meshCheckUrl: meshUrl,
        frpCheckUrl: frpUrl,
        publicCheckUrl: publicUrl,
        urlPriority: priority
    });
    onClose();
  };

  const handleDragEnd = (event: any) => {
      const { active, over } = event;
      if (active.id !== over.id) {
          setPriority((items) => {
              const oldIndex = items.indexOf(active.id);
              const newIndex = items.indexOf(over.id);
              return arrayMove(items, oldIndex, newIndex);
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-[#242424] border border-white/10 rounded-2xl shadow-2xl p-6 relative max-h-[80vh] overflow-y-auto custom-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-xl font-bold mb-6 text-white">网络服务设置</h2>
          <p className="text-xs text-white/50 mb-4">
               配置网络服务地址及访问优先级。系统将按照优先级顺序尝试打开应用链接。
           </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="space-y-4">
                <h3 className="text-sm font-medium text-white/90">服务地址</h3>
                <div>
                   <label className="block text-xs font-medium text-white/70 mb-1">内网服务地址</label>
                   <input 
                      type="text" 
                      value={internalUrl}
                      onChange={(e) => setInternalUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/30"
                      placeholder="http://192.168.1.2:8080"
                   />
                </div>

                <div>
                   <label className="block text-xs font-medium text-white/70 mb-1">组网服务地址</label>
                   <input 
                      type="text" 
                      value={meshUrl}
                      onChange={(e) => setMeshUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/30"
                      placeholder="http://100.64.0.2:8080"
                   />
                </div>

                <div>
                   <label className="block text-xs font-medium text-white/70 mb-1">FRP 服务地址</label>
                   <input 
                      type="text" 
                      value={frpUrl}
                      onChange={(e) => setFrpUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/30"
                      placeholder="https://your-domain.com:8080"
                   />
                </div>

                <div>
                   <label className="block text-xs font-medium text-white/70 mb-1">公网服务地址</label>
                   <input 
                      type="text" 
                      value={publicUrl}
                      onChange={(e) => setPublicUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/30"
                      placeholder="https://your-domain.com"
                   />
                </div>
             </div>

             <div className="space-y-2">
                 <h3 className="text-sm font-medium text-white/90">访问优先级 (拖拽排序)</h3>
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
