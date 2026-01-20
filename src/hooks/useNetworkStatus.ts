import { useState, useEffect } from 'react';
import type { NetworkStatus, SystemConfig } from '../types';

export const useNetworkStatus = (config?: SystemConfig) => {
  const [status, setStatus] = useState<NetworkStatus>({
    internal: false,
    mesh: false,
    frp: false,
    public: false, 
    latencies: {}
  });
  const [isChecking, setIsChecking] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refresh = () => setRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    // If running as extension - Delegate to Background Script
    // This is the "Better Scheme" that bypasses CORS and Mixed Content issues
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        const checkExtension = () => {
             setIsChecking(true);
             chrome.runtime.sendMessage({ type: 'CHECK_NETWORK', config }, (response) => {
                 if (chrome.runtime.lastError) {
                     // Fallback or log error
                     console.warn('Extension background check failed:', chrome.runtime.lastError);
                     setIsChecking(false);
                     return;
                 }
                 if (response) {
                     setStatus(response);
                 }
                 setIsChecking(false);
             });
        };

        checkExtension();
        const interval = setInterval(checkExtension, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }
    
    // Polling logic for web environment (Fallback)
    if (!config) return;

    const checkUrl = async (url: string): Promise<number | null> => {
        if (!url) return null;
        const start = performance.now();
        try {
            // Using HEAD request with no-cors to check reachability
            // Added timestamp to prevent caching
            const cacheBuster = `?t=${Date.now()}`;
            const targetUrl = url.includes('?') ? `${url}&t=${Date.now()}` : `${url}${cacheBuster}`;
            
            await fetch(targetUrl, { 
                method: 'HEAD', 
                mode: 'no-cors', 
                cache: 'no-store',
                // Add a short timeout
                signal: AbortSignal.timeout(5000)
            });
            return performance.now() - start;
        } catch (e) {
            return null;
        }
    };

    const checkAll = async () => {
        setIsChecking(true);
        const [internal, mesh, frp, publicNet] = await Promise.all([
            checkUrl(config.internalCheckUrl),
            checkUrl(config.meshCheckUrl),
            checkUrl(config.frpCheckUrl),
            checkUrl(config.publicCheckUrl)
        ]);

        setStatus({
            internal: internal !== null,
            mesh: mesh !== null,
            frp: frp !== null,
            public: publicNet !== null,
            latencies: {
                internal: internal ?? undefined,
                mesh: mesh ?? undefined,
                frp: frp ?? undefined,
                public: publicNet ?? undefined
            }
        });
        setIsChecking(false);
    };

    checkAll();
    const interval = setInterval(checkAll, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [config, refreshTrigger]);

  return { ...status, refresh, isChecking };
};
