import { Sidebar } from './Sidebar';
import type { SystemConfig, NetworkType } from '../../types';
import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SettingsSidebarProps {
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

export const SettingsSidebar = ({ isOpen, onClose, config, onChange }: SettingsSidebarProps) => {
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

  return (
    <Sidebar isOpen={isOpen} onClose={onClose} position="right" title="系统设置">
      <div className="space-y-8 pb-8">
        
        {/* Network Check Settings */}
        <section>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                网络检测地址
            </h3>
            <div className="space-y-3">
                <div>
                   <label className="block text-xs font-medium text-white/50 mb-1">内网检测 URL</label>
                   <input 
                      type="text" 
                      value={internalUrl}
                      onChange={(e) => setInternalUrl(e.target.value)}
                      onBlur={handleSave}
                      className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/30"
                      placeholder="http://gitlab.internal"
                   />
                </div>

                <div>
                   <label className="block text-xs font-medium text-white/50 mb-1">组网检测 URL</label>
                   <input 
                      type="text" 
                      value={meshUrl}
                      onChange={(e) => setMeshUrl(e.target.value)}
                      onBlur={handleSave}
                      className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/30"
                      placeholder="http://10.x.x.x"
                   />
                </div>

                <div>
                   <label className="block text-xs font-medium text-white/50 mb-1">FRP 检测 URL</label>
                   <input 
                      type="text" 
                      value={frpUrl}
                      onChange={(e) => setFrpUrl(e.target.value)}
                      onBlur={handleSave}
                      className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/30"
                      placeholder="http://frp.example.com"
                   />
                </div>

                <div>
                   <label className="block text-xs font-medium text-white/50 mb-1">公网检测 URL</label>
                   <input 
                      type="text" 
                      value={publicUrl}
                      onChange={(e) => setPublicUrl(e.target.value)}
                      onBlur={handleSave}
                      className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/30"
                      placeholder="https://www.google.com"
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
    </Sidebar>
  );
};
