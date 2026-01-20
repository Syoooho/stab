import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useRef } from 'react';
import type { App, NetworkStatus, SystemConfig } from '../types';
import { AppIcon } from './AppIcon';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ITEMS_PER_ROW = 6;
const ROWS_PER_PAGE = 3;
const ITEMS_PER_PAGE = ITEMS_PER_ROW * ROWS_PER_PAGE; // 18 items per page

interface SmartLauncherProps {
  apps: App[];
  onReorder: (apps: App[]) => void;
  networkStatus: NetworkStatus;
  systemConfig: SystemConfig;
  onAddApp: () => void;
  onContextMenu: (e: React.MouseEvent, app: App) => void;
}

const SortableItem = ({ app, networkStatus, systemConfig, onContextMenu }: { app: App; networkStatus: NetworkStatus; systemConfig: SystemConfig; onContextMenu: (e: React.MouseEvent, app: App) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: app.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none w-[120px] flex justify-center">
      <AppIcon app={app} networkStatus={networkStatus} systemConfig={systemConfig} onContextMenu={onContextMenu} />
    </div>
  );
};

export const SmartLauncher = ({ apps, onReorder, networkStatus, systemConfig, onAddApp, onContextMenu }: SmartLauncherProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  
  // Throttle wheel events
  const lastWheelTime = useRef(0);

  const totalPages = Math.ceil((apps.length + 1) / ITEMS_PER_PAGE); 
  
  if (currentPage >= totalPages && currentPage > 0) {
      setCurrentPage(totalPages - 1);
  }

  const handlePageChange = (newDir: number) => {
      setDirection(newDir);
      setCurrentPage(prev => Math.max(0, Math.min(totalPages - 1, prev + newDir)));
  };

  const handleWheel = (e: React.WheelEvent) => {
      const now = Date.now();
      if (now - lastWheelTime.current < 500) return; // 500ms throttle
      
      if (Math.abs(e.deltaY) > 20) {
          if (e.deltaY > 0 && currentPage < totalPages - 1) {
              handlePageChange(1);
              lastWheelTime.current = now;
          } else if (e.deltaY < 0 && currentPage > 0) {
              handlePageChange(-1);
              lastWheelTime.current = now;
          }
      }
  };

  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const pageApps = apps.slice(startIndex, endIndex);
  
  const isAddButtonOnPage = apps.length >= startIndex && apps.length < endIndex;

  // ... sensors and drag handlers ...
  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8, 
        }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = apps.findIndex((app) => app.id === active.id);
      const newIndex = apps.findIndex((app) => app.id === over.id);
      onReorder(arrayMove(apps, oldIndex, newIndex));
    }
    setActiveId(null);
  };

  const activeApp = activeId ? apps.find(app => app.id === activeId) : null;

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-2 flex flex-col items-center">
      {/* Fixed height container for grid to prevent layout shifts */}
      <div 
        className="w-full h-[380px] relative overflow-hidden"
        onWheel={handleWheel}
      >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={currentPage}
                    custom={direction}
                    initial={{ x: direction > 0 ? 1000 : -1000, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: direction > 0 ? -1000 : 1000, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute inset-0"
                >
                    <SortableContext items={pageApps.map(a => a.id)} strategy={rectSortingStrategy}>
                    {/* Using grid layout to enforce alignment */}
                    <div className="grid grid-cols-6 gap-y-6 gap-x-6 content-start justify-items-center">
                        {pageApps.map((app) => (
                        <SortableItem key={app.id} app={app} networkStatus={networkStatus} systemConfig={systemConfig} onContextMenu={onContextMenu} />
                        ))}
                        
                        {/* Add Button - Not draggable */}
                        {isAddButtonOnPage && (
                            <div 
                                className="flex flex-col items-center justify-center w-[120px]"
                            >
                                <div 
                                    className="flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 hover:bg-white/10 cursor-pointer w-full" 
                                    onClick={onAddApp}
                                >
                                <div className="w-16 h-16 mb-2 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 border-dashed hover:border-white/30 transition-colors">
                                    <Plus className="w-8 h-8 text-white/50" />
                                </div>
                                <span className="text-sm font-medium text-white/50">添加</span>
                                </div>
                            </div>
                        )}
                    </div>
                    </SortableContext>
                </motion.div>
            </AnimatePresence>

            <DragOverlay>
                {activeApp ? (
                    <div className="scale-110 cursor-grabbing w-[120px] flex justify-center">
                         <AppIcon app={activeApp} networkStatus={networkStatus} systemConfig={systemConfig} />
                    </div>
                ) : null}
            </DragOverlay>
          </DndContext>
      </div>

      {/* Pagination Controls - Moved down slightly with mt-8 */}
      <div className="flex items-center gap-4 mt-8 h-10">
          {totalPages > 1 && (
              <>
                  <button 
                    onClick={() => handlePageChange(-1)}
                    disabled={currentPage === 0}
                    className={`p-2 rounded-full hover:bg-white/10 transition-colors ${currentPage === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-70'}`}
                  >
                      <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="flex gap-2">
                      {Array.from({ length: totalPages }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => {
                                setDirection(i > currentPage ? 1 : -1);
                                setCurrentPage(i);
                            }}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentPage ? 'bg-white w-4' : 'bg-white/30 hover:bg-white/50'}`}
                          />
                      ))}
                  </div>

                  <button 
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === totalPages - 1}
                    className={`p-2 rounded-full hover:bg-white/10 transition-colors ${currentPage === totalPages - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-70'}`}
                  >
                      <ChevronRight className="w-5 h-5" />
                  </button>
              </>
          )}
      </div>
    </div>
  );
};
