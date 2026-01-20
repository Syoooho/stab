import type { NetworkStatus } from '../../types';
import { Wifi, Globe, Server, Link, RotateCw } from 'lucide-react';

interface ExtendedNetworkStatus extends NetworkStatus {
    refresh?: () => void;
}

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
    <div className="glass p-4 rounded-xl h-32 flex flex-col justify-between relative group">
      <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-white/70">网络状态</h3>
          {status.refresh && (
              <button 
                onClick={status.refresh}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded-full"
                title="立即检测"
              >
                  <RotateCw className="w-3 h-3 text-white/50" />
              </button>
          )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2 text-xs">
             <Server className="w-3 h-3" /> 内网
           </div>
           <div className="flex items-center gap-2">
               <span className="text-[10px] text-white/30">{getLatencyText(status.latencies?.internal)}</span>
               <div className={`w-2 h-2 rounded-full ${getStatusColor(status.internal, status.latencies?.internal)}`} />
           </div>
        </div>
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2 text-xs">
             <Wifi className="w-3 h-3" /> 组网
           </div>
           <div className="flex items-center gap-2">
               <span className="text-[10px] text-white/30">{getLatencyText(status.latencies?.mesh)}</span>
               <div className={`w-2 h-2 rounded-full ${getStatusColor(status.mesh, status.latencies?.mesh)}`} />
           </div>
        </div>
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2 text-xs">
             <Link className="w-3 h-3" /> FRP
           </div>
           <div className="flex items-center gap-2">
               <span className="text-[10px] text-white/30">{getLatencyText(status.latencies?.frp)}</span>
               <div className={`w-2 h-2 rounded-full ${getStatusColor(status.frp, status.latencies?.frp)}`} />
           </div>
        </div>
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2 text-xs">
             <Globe className="w-3 h-3" /> 公网
           </div>
           <div className="flex items-center gap-2">
               <span className="text-[10px] text-white/30">{getLatencyText(status.latencies?.public)}</span>
               <div className={`w-2 h-2 rounded-full ${getStatusColor(status.public, status.latencies?.public)}`} />
           </div>
        </div>
      </div>
    </div>
  );
};
