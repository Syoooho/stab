import type { App, NetworkStatus, SystemConfig } from '../types';
import { getBestUrl } from '../utils/network';

interface AppIconProps {
  app: App;
  networkStatus: NetworkStatus;
  systemConfig?: SystemConfig;
  onClick?: (rect: DOMRect) => void;
  onContextMenu?: (e: React.MouseEvent, app: App) => void;
}

export const AppIcon = ({ app, networkStatus, systemConfig, onClick, onContextMenu }: AppIconProps) => {
  const { url } = getBestUrl(app, networkStatus, systemConfig);
  const isFolder = app.type === 'folder';
  const isDisabled = !isFolder && url === '#';

  const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      if (isFolder) {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          if (onClick) onClick(rect);
          return;
      }
      if (isDisabled) return;
      if (onClick) {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          onClick(rect);
      } else {
          window.open(url, '_blank', 'noopener,noreferrer');
      }
  };


  const handleContextMenu = (e: React.MouseEvent) => {
      if (onContextMenu) {
          e.preventDefault();
          e.stopPropagation(); // Stop bubbling to container
          onContextMenu(e, app);
      }
  };

  if (app.type === 'folder') {
      const children = app.children || [];
      const previewIcons = children.slice(0, 4);
      
      return (
        <div
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          className="flex flex-col items-center justify-center p-[1vh] rounded-xl transition-all duration-200 hover:bg-white/10 cursor-pointer"
        >
          <div className="relative w-[6vh] h-[6vh] mb-[0.5vh] bg-white/10 rounded-2xl p-[0.5vh] grid grid-cols-2 gap-[2px] overflow-hidden backdrop-blur-sm border border-white/5">
             {previewIcons.map((child, idx) => (
                 <img 
                    key={child.id || idx}
                    src={child.icon}
                    className="w-full h-full object-cover rounded-[2px]"
                    onError={(e) => (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${child.name}&background=random`}
                 />
             ))}
          </div>
          <span className="font-medium text-white/90 text-center truncate w-24 pointer-events-none" style={{ fontSize: 'clamp(12px, 1.5vh, 14px)' }}>
            {app.name}
          </span>
        </div>
      );
  }

  return (
    <div
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className={`flex flex-col items-center justify-center p-[1vh] rounded-xl transition-all duration-200 hover:bg-white/10 cursor-pointer ${isDisabled ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
    >
      <div className="relative w-[6vh] h-[6vh] mb-[0.5vh]">
        <img
          src={app.icon}
          alt={app.name}
          className="w-full h-full rounded-2xl object-cover shadow-md bg-white/5 pointer-events-none"
          draggable={false}
          onError={(e) => {
              // Fallback if image fails
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${app.name}&background=random`;
          }}
        />
        {/* Status Dot Removed per requirement */}
      </div>
      <span className="font-medium text-white/90 text-center truncate w-24 pointer-events-none" style={{ fontSize: 'clamp(12px, 1.5vh, 14px)' }}>
        {app.name}
      </span>
    </div>
  );
};
