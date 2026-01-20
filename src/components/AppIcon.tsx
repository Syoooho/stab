import type { App, NetworkStatus, SystemConfig } from '../types';
import { getBestUrl } from '../utils/network';

interface AppIconProps {
  app: App;
  networkStatus: NetworkStatus;
  systemConfig?: SystemConfig;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent, app: App) => void;
}

export const AppIcon = ({ app, networkStatus, systemConfig, onClick, onContextMenu }: AppIconProps) => {
  const { url } = getBestUrl(app, networkStatus, systemConfig);
  // Only gray out if no URL is found at all
  const isDisabled = url === '#';

  const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      if (isDisabled) return;
      
      if (onClick) {
          onClick();
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

  return (
    <div
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 hover:bg-white/10 cursor-pointer ${isDisabled ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
    >
      <div className="relative w-16 h-16 mb-2">
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
      <span className="text-sm font-medium text-white/90 text-center truncate w-24 pointer-events-none">
        {app.name}
      </span>
    </div>
  );
};
