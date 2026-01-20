import type { App, NetworkStatus, NetworkType, SystemConfig } from '../types';

export const getBestUrl = (app: App, status: NetworkStatus, config?: SystemConfig): { url: string; type: NetworkType } => {
  // Default priority if config is not provided
  const priority: NetworkType[] = config?.urlPriority || ['internal', 'mesh', 'frp', 'public'];

  // 1. Try to find a reachable URL based on priority
  for (const type of priority) {
      if (type === 'none') continue;
      // Check if network is up AND app has this URL
      if (status[type] && app.urls[type]) {
          return { url: app.urls[type]!, type };
      }
  }
  
  // 2. Fallback: return the first available URL based on priority, even if network is down
  for (const type of priority) {
      if (type === 'none') continue;
      if (app.urls[type]) {
          return { url: app.urls[type]!, type: 'none' };
      }
  }
  
  return { url: '#', type: 'none' };
};

export const getNetworkColor = (type: NetworkType): string => {
  switch (type) {
    case 'internal': return 'bg-green-500';
    case 'mesh': return 'bg-blue-500';
    case 'frp': return 'bg-purple-500';
    case 'public': return 'bg-orange-500';
    default: return 'bg-gray-400';
  }
};
