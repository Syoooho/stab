import type { NetworkStatus } from '../../types';
import { Wifi, Globe, Server, Link, RotateCw } from 'lucide-react';

interface ExtendedNetworkStatus extends NetworkStatus {
    refresh?: () => void;
    isChecking?: boolean;
}

const LoadingDots = () => (
  <span className="inline-flex items-center gap-1">
    <span className="w-1 h-1 rounded-full bg-white/30 animate-pulse" style={{ animationDelay: '0ms' }} />
    <span className="w-1 h-1 rounded-full bg-white/30 animate-pulse" style={{ animationDelay: '120ms' }} />
    <span className="w-1 h-1 rounded-full bg-white/30 animate-pulse" style={{ animationDelay: '240ms' }} />
  </span>
);

export const NetworkStatusWidget = ({ status }: { status: ExtendedNetworkStatus }) => {
  const getStatusColor = (isConnected: boolean, latency?: number) => {
      if (!isConnected) return 'bg-red-500';
      if (!latency) return 'bg-green-500';
      if (latency < 100) return 'bg-green-500';
      if (latency < 500) return 'bg-yellow-500';
      return 'bg-orange-500';
  };

  const getLatencyText = (latency?: number) => {
      if (!latency) return '';
      return `${Math.round(latency)}ms`;
  };

  return (
    <div className="glass p-[1.5vh] rounded-xl h-[14vh] flex flex-col justify-between relative group">
      <div className={`flex flex-col h-full ${status.isChecking ? 'opacity-70' : ''}`}>
        <div className="flex items-center justify-between flex-1">
           <div className="flex items-center gap-2" style={{ fontSize: 'clamp(10px, 1.2vh, 12px)' }}>
             <Server className="w-3 h-3" /> 内网
           </div>
           <div className="flex items-center gap-2">
               <span className="text-white/30 tabular-nums" style={{ fontSize: 'clamp(8px, 1vh, 10px)' }}>
                 {status.isChecking ? <LoadingDots /> : getLatencyText(status.latencies?.internal)}
               </span>
               <div className={`w-2 h-2 rounded-full ${getStatusColor(status.internal, status.latencies?.internal)} ${status.isChecking ? 'animate-pulse' : ''}`} />
           </div>
        </div>
        <div className="flex items-center justify-between flex-1">
           <div className="flex items-center gap-2" style={{ fontSize: 'clamp(10px, 1.2vh, 12px)' }}>
             <Wifi className="w-3 h-3" /> 组网
           </div>
           <div className="flex items-center gap-2">
               <span className="text-white/30 tabular-nums" style={{ fontSize: 'clamp(8px, 1vh, 10px)' }}>
                 {status.isChecking ? <LoadingDots /> : getLatencyText(status.latencies?.mesh)}
               </span>
               <div className={`w-2 h-2 rounded-full ${getStatusColor(status.mesh, status.latencies?.mesh)} ${status.isChecking ? 'animate-pulse' : ''}`} />
           </div>
        </div>
        <div className="flex items-center justify-between flex-1">
           <div className="flex items-center gap-2" style={{ fontSize: 'clamp(10px, 1.2vh, 12px)' }}>
             <Link className="w-3 h-3" /> FRP
           </div>
           <div className="flex items-center gap-2">
               <span className="text-white/30 tabular-nums" style={{ fontSize: 'clamp(8px, 1vh, 10px)' }}>
                 {status.isChecking ? <LoadingDots /> : getLatencyText(status.latencies?.frp)}
               </span>
               <div className={`w-2 h-2 rounded-full ${getStatusColor(status.frp, status.latencies?.frp)} ${status.isChecking ? 'animate-pulse' : ''}`} />
           </div>
        </div>
        <div className="flex items-center justify-between flex-1">
           <div className="flex items-center gap-2" style={{ fontSize: 'clamp(10px, 1.2vh, 12px)' }}>
             <Globe className="w-3 h-3" /> 公网
           </div>
           <div className="flex items-center gap-2">
               <span className="text-white/30 tabular-nums" style={{ fontSize: 'clamp(8px, 1vh, 10px)' }}>
                 {status.isChecking ? <LoadingDots /> : getLatencyText(status.latencies?.public)}
               </span>
               <div className={`w-2 h-2 rounded-full ${getStatusColor(status.public, status.latencies?.public)} ${status.isChecking ? 'animate-pulse' : ''}`} />
           </div>
        </div>
      </div>

      {status.refresh && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity">
          <button
            type="button"
            onClick={status.refresh}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-white/90 text-sm font-medium hover:bg-white/15 hover:border-white/25 transition-colors backdrop-blur-md"
          >
            <RotateCw className={`w-4 h-4 ${status.isChecking ? 'animate-spin' : ''}`} />
            立即检测
          </button>
        </div>
      )}
    </div>
  );
};
