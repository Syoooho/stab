// Background Service Worker for Stab

chrome.runtime.onInstalled.addListener(() => {
  console.log('Stab Extension Installed');
});

// Listener for messages from the frontend
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'CHECK_NETWORK') {
        checkAllNetworks(message.config).then(status => {
            sendResponse(status);
        });
        return true; // Keep channel open for async response
    }
});

async function checkUrl(url) {
    if (!url) return null;
    const start = performance.now();
    try {
        // In background script, we can use standard fetch with full CORS access
        // thanks to host_permissions: ["<all_urls>"]
        const response = await fetch(url, { 
            method: 'HEAD',
            cache: 'no-store',
            signal: AbortSignal.timeout(5000)
        });
        
        // We can actually check status codes now!
        if (response.ok || response.status === 405) { // 405 Method Not Allowed is also "reachable"
            return performance.now() - start;
        }
        // If 404/500, it is technically reachable, but maybe service is down.
        // For "Network Switcher", we usually count this as reachable (green but maybe warn).
        // For simplicity, let's treat any response as "Reachable" (latency > 0).
        return performance.now() - start;
    } catch (e) {
        // Network error (DNS, Timeout, Connection Refused)
        return null;
    }
}

async function checkAllNetworks(config) {
    if (!config) return {};

    const [internal, mesh, frp, publicNet] = await Promise.all([
        checkUrl(config.internalCheckUrl),
        checkUrl(config.meshCheckUrl),
        checkUrl(config.frpCheckUrl),
        checkUrl(config.publicCheckUrl)
    ]);

    return {
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
    };
}
