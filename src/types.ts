export interface AppUrls {
  internal?: string;
  mesh?: string;
  frp?: string;
  public?: string;
}

export interface App {
  id: string;
  name: string;
  icon: string;
  urls: AppUrls;
}

export interface NetworkStatus {
  internal: boolean;
  mesh: boolean;
  frp: boolean;
  public: boolean;
  latencies: {
    internal?: number;
    mesh?: number;
    frp?: number;
    public?: number;
  };
}

export type NetworkType = 'internal' | 'mesh' | 'frp' | 'public' | 'none';

export interface WallpaperHistoryItem {
  id: string;
  url: string; // Base64 or Blob URL
  date: string; // ISO string
  source: 'bing' | 'upload' | 'preset';
}

export interface WallpaperConfig {
  type: 'url' | 'upload';
  value: string; // URL or base64
  opacity?: number; // 0 to 1, default 0.6 (overlay opacity)
  blur?: number; // px, default 0
  history: WallpaperHistoryItem[];
  lastBingFetch?: string; // Date string YYYY-MM-DD
}

export interface QuickCopyItem {
    id: string;
    label: string;
    value: string;
}

export interface SystemConfig {
  internalCheckUrl: string;
  publicCheckUrl: string;
  meshCheckUrl: string;
  frpCheckUrl: string;
  urlPriority: NetworkType[]; // Order of preference, e.g. ['internal', 'mesh', 'frp', 'public']
  weatherCity: string;
  countdownTarget: string; // ISO Date string
  countdownLabel: string;
  quickCopyItems: QuickCopyItem[];
}

export type WidgetType = 'network' | 'countdown' | 'weather' | 'quickCopy';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  visible: boolean;
}
