import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useState, useRef } from 'react';
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
  onAddApp: (folderId?: string) => void;
  onContextMenu: (e: React.MouseEvent, app: App) => void;
  currentFolderId: string | null;
  onFolderChange: (id: string | null) => void;
  onMoveToFolder: (appId: string, folderId: string) => void;
  onUpdateFolder?: (folderId: string, newChildren: App[]) => void;
  onPopupContextMenu?: (e: React.MouseEvent, folder: App) => void;
}

interface SortableItemProps {
    app: App;
    networkStatus: NetworkStatus;
    systemConfig: SystemConfig;
    onContextMenu: (e: React.MouseEvent, app: App) => void;
    onClick?: (rect: DOMRect) => void;
}

const SortableItem = ({ app, networkStatus, systemConfig, onContextMenu, onClick }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: app.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none w-[120px] flex justify-center relative group">
      <AppIcon 
        app={app} 
        networkStatus={networkStatus} 
        systemConfig={systemConfig} 
        onContextMenu={onContextMenu} 
        onClick={(app.type === 'folder') ? onClick : undefined}
      />
    </div>
  );
};

export const SmartLauncher = ({ apps, onReorder, networkStatus, systemConfig, onAddApp, onContextMenu, currentFolderId, onFolderChange, onMoveToFolder, onUpdateFolder, onPopupContextMenu }: SmartLauncherProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [modalFolder, setModalFolder] = useState<App | null>(null);
  const [modalPos, setModalPos] = useState<{ left: number; top: number } | null>(null);
  
  // Throttle wheel events
  const lastWheelTime = useRef(0);

  const totalPages = Math.ceil((apps.length + 1) / ITEMS_PER_PAGE); 

  useEffect(() => {
      setCurrentPage(prev => Math.max(0, Math.min(totalPages - 1, prev)));
  }, [totalPages]);

  const handlePageChange = (newDir: number) => {
      setDirection(newDir);
      setCurrentPage(prev => Math.max(0, Math.min(totalPages - 1, prev + newDir)));
  };

  const handleWheel = (e: React.WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
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

  const handleAppClick = (app: App, rect: DOMRect) => {
      if (app.type === 'folder') {
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          const width = Math.min(640, vw - 32);
          const heightApprox = 360;
          let left = rect.left;
          let top = rect.top;
          left = Math.max(16, Math.min(left, vw - width - 16));
          top = Math.max(16, Math.min(top, vh - heightApprox - 16));
          setModalPos({ left, top });
          setModalFolder(app);
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

    if (!over) {
        setActiveId(null);
        return;
    }

    if (active.id !== over.id) {
      // Check if dropped ONTO a folder
      const overApp = apps.find(a => a.id === over.id);
      const activeApp = apps.find(a => a.id === active.id);
      
      // If dropping an app onto a folder (and not the folder itself)
      if (overApp?.type === 'folder' && activeApp?.type !== 'folder') {
          onMoveToFolder(active.id, over.id);
      } else {
          // Regular reorder
          const oldIndex = apps.findIndex((app) => app.id === active.id);
          const newIndex = apps.findIndex((app) => app.id === over.id);
          onReorder(arrayMove(apps, oldIndex, newIndex));
      }
    }
    setActiveId(null);
  };

  const handlePopupDragEnd = (event: any) => {
      const { active, over } = event;
      if (!over || active.id === over.id || !modalFolder) {
          setActiveId(null);
          return;
      }

      const children = modalFolder.children || [];
      const oldIndex = children.findIndex((c) => c.id === active.id);
      const newIndex = children.findIndex((c) => c.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
          const newChildren = arrayMove(children, oldIndex, newIndex);
          onUpdateFolder?.(modalFolder.id, newChildren);
          setModalFolder(prev => prev ? { ...prev, children: newChildren } : null);
      }
      setActiveId(null);
  };

  const activeApp = activeId ? apps.find(app => app.id === activeId) : null;

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-2 flex flex-col items-center">
      
      {/* Fixed height container for grid to prevent layout shifts */}
      <div 
        className="w-full h-[36vh] relative overflow-hidden overscroll-contain"
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
                    className="absolute inset-0 w-full h-full"
                >
                    <SortableContext items={pageApps.map(a => a.id)} strategy={rectSortingStrategy}>
                    {/* Using grid layout to enforce alignment */}
                    <div className="grid grid-cols-6 gap-y-[2vh] gap-x-6 content-start justify-items-center w-full px-4">
                        {currentFolderId && currentPage === 0 && (
                            <div 
                                className="flex flex-col items-center justify-center w-[120px]"
                            >
                                <div 
                                    className="flex flex-col items-center justify-center p-[1vh] rounded-xl transition-all duration-200 hover:bg-white/10 cursor-pointer w-full group" 
                                    onClick={() => { onFolderChange(null); setCurrentPage(0); }}
                                >
                                <div className="w-[6vh] h-[6vh] mb-[0.5vh] flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
                                    <ChevronLeft className="w-8 h-8 text-white/70" />
                                </div>
                                <span className="font-medium text-white/50" style={{ fontSize: 'clamp(12px, 1.5vh, 14px)' }}>返回</span>
                                </div>
                            </div>
                        )}
                        {pageApps.map((app) => (
                        <SortableItem 
                            key={app.id} 
                            app={app} 
                            networkStatus={networkStatus} 
                            systemConfig={systemConfig} 
                            onContextMenu={onContextMenu} 
                            onClick={(rect) => handleAppClick(app, rect)}
                        />
                        ))}
                        
                        {/* Add Button - Not draggable */}
                        {isAddButtonOnPage && (
                            <div 
                                className="flex flex-col items-center justify-center w-[120px]"
                            >
                                <div 
                                    className="flex flex-col items-center justify-center p-[1vh] rounded-xl transition-all duration-200 hover:bg-white/10 cursor-pointer w-full" 
                                    onClick={() => onAddApp()}
                                >
                                <div className="w-[6vh] h-[6vh] mb-[0.5vh] flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 border-dashed hover:border-white/30 transition-colors">
                                    <Plus className="w-8 h-8 text-white/50" />
                                </div>
                                <span className="font-medium text-white/50" style={{ fontSize: 'clamp(12px, 1.5vh, 14px)' }}>添加</span>
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

      <AnimatePresence>
        {modalFolder && modalPos && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setModalFolder(null); setModalPos(null); }}
            onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Context menu for the folder background (add new item)
                // We reuse the main context menu handler logic but passing the folder context?
                // Or just custom menu here.
                // The parent's onContextMenu expects (e, app).
                // But here we want a global menu for the folder.
                // Since SmartLauncher doesn't have a "onGlobalContextMenu", we might need to rely on the parent App's global listener?
                // But we stopped propagation.
                // Let's manually trigger onAddApp
                // Actually, let's use a trick: pass a fake "folder" app or just use a dedicated callback?
                // The requirements say "right click create/delete sub-bookmarks".
                // We can't easily invoke the global menu from here without passing it up.
                // But we have onAddApp.
                // Let's implement a simple menu here or pass it up?
                // The user's request: "right-click create/delete sub-bookmarks"
                // "Create" is usually on background. "Delete" is on item.
                // Let's assume onContextMenu is for ITEMS.
                // For background, maybe we can use onAddApp directly?
                // Or we can simulate a context menu event for the "folder" itself?
                // But onContextMenu expects an App.
                // Let's use the modalFolder as the target for context menu?
                // If I right click the popup background, I show menu to "Add to this folder".
                // I'll call onContextMenu(e, modalFolder). 
                // Then in App.tsx, I need to handle if the target is a folder, show "Add Bookmark" option?
                // Currently App.tsx's handleAppContextMenu shows "Edit", "Delete".
                // Maybe I should add "Add Bookmark" there?
                // Or I can just handle it locally here if I had a setContextMenu prop. I don't.
                // I'll just skip background context menu for now or implement a basic one if needed.
                // Actually, the user asked for "right-click create...".
                // I'll add a listener to the popup background.
                // Since I can't easily pop the global menu, I'll invoke onAddApp directly if I could? No, that's left click.
                // Wait, I can pass a special "Add" handler?
                // Let's try to pass the event up to onContextMenu with the modalFolder.
                // But we want "Add", not "Edit/Delete" for the folder.
                // Let's modify App.tsx to handle folder context menu differently?
                // Or just use the global context menu handler of App.tsx?
                // App.tsx has handleGlobalContextMenu.
                // I can't access it here.
                // I'll just leave the background click for now and focus on Item context menu which is critical.
                // Wait, "right-click create" implies background context menu.
                // I can invoke onAddApp(modalFolder.id) directly? No, it needs a menu.
                // I'll implement a custom context menu handler for the popup background if I can.
                // But I don't have setContextMenu here.
                // Okay, I'll pass the context menu event up, but I need to differentiate.
                // Let's stick to "Delete" on items first, and "Create" maybe via the "+" button which I should add to the popup?
                // The prompt says "popup supports... right-click create".
                // I really should support it.
                // I can use `onContextMenu` with a special flag or just use the `modalFolder`.
                // If I pass `modalFolder` to `onContextMenu`, App.tsx will show "Edit/Delete" for the folder itself.
                // I want "Add to folder".
                // Let's just implement the context menu for items first.
            }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              className="absolute glass rounded-2xl shadow-2xl overflow-hidden"
              style={{ left: modalPos.left, top: modalPos.top, width: 'min(80vw, 480px)' }}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPopupContextMenu?.(e, modalFolder);
              }}
            >
              <div className="p-6">
                <div className="text-lg font-bold text-white mb-4">{modalFolder.name}</div>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handlePopupDragEnd}
                >
                    <SortableContext items={(modalFolder.children || []).map(a => a.id)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-3 gap-y-[2vh] gap-x-6 content-start justify-items-center w-full px-2">
                        {(modalFolder.children || []).map((child) => (
                            <SortableItem
                            key={child.id}
                            app={child}
                            networkStatus={networkStatus}
                            systemConfig={systemConfig}
                            onContextMenu={onContextMenu}
                            onClick={child.type === 'folder' ? (rect) => {
                                // Nested folders not fully supported in popup logic yet (would replace current modal)
                                // But let's allow it
                                const vw = window.innerWidth;
                                const vh = window.innerHeight;
                                const width = Math.min(640, vw - 32);
                                const heightApprox = 360;
                                let left = rect.left;
                                let top = rect.top;
                                left = Math.max(16, Math.min(left, vw - width - 16));
                                top = Math.max(16, Math.min(top, vh - heightApprox - 16));
                                setModalPos({ left, top });
                                setModalFolder(child);
                            } : undefined}
                            />
                        ))}
                        {/* Add Button in Popup */}
                        <div 
                            className="flex flex-col items-center justify-center w-[120px]"
                        >
                            <div 
                                className="flex flex-col items-center justify-center p-[1vh] rounded-xl transition-all duration-200 hover:bg-white/10 cursor-pointer w-full" 
                                onClick={() => onAddApp(modalFolder.id)}
                            >
                            <div className="w-[6vh] h-[6vh] mb-[0.5vh] flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 border-dashed hover:border-white/30 transition-colors">
                                <Plus className="w-8 h-8 text-white/50" />
                            </div>
                            <span className="font-medium text-white/50" style={{ fontSize: 'clamp(12px, 1.5vh, 14px)' }}>添加</span>
                            </div>
                        </div>
                        </div>
                    </SortableContext>
                </DndContext>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination Controls - Moved down slightly with mt-2 */}
      <div className="flex items-center gap-4 mt-[1vh] h-[4vh]">
          {totalPages > 1 && (
              <>
                  <button 
                    onClick={() => handlePageChange(-1)}
                    disabled={currentPage === 0}
                    className={`p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer ${currentPage === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-70'}`}
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
                            className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${i === currentPage ? 'bg-white w-4' : 'bg-white/30 hover:bg-white/50'}`}
                          />
                      ))}
                  </div>

                  <button 
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === totalPages - 1}
                    className={`p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer ${currentPage === totalPages - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-70'}`}
                  >
                      <ChevronRight className="w-5 h-5" />
                  </button>
              </>
          )}
      </div>
    </div>
  );
};
