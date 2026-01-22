// Background Service Worker for Stab

chrome.runtime.onInstalled.addListener(() => {
  console.log('Stab Extension Installed');
});

// Listener for messages from the frontend
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Return true to indicate we will respond asynchronously
    const handleAsync = async () => {
        try {
            if (message.type === 'CHECK_NETWORK') {
                const status = await checkAllNetworks(message.config);
                sendResponse(status);
            } else if (message.type === 'WEBDAV_SAVE') {
                const result = await handleWebDavSave(message.config, message.filename, message.content);
                sendResponse(result);
            } else if (message.type === 'WEBDAV_GET') {
                const result = await handleWebDavGet(message.config, message.filename);
                sendResponse(result);
            }
        } catch (e) {
            console.error('Background error:', e);
            sendResponse({ success: false, error: e.message });
        }
    };

    handleAsync();
    return true; // Keep channel open
});

async function handleWebDavSave(config, filename, content) {
    try {
        const { url, username, password } = config;
        const headers = {
            'Content-Type': 'application/json', // Or text/plain if preferred
        };

        if (username && password) {
            // Use utf8 safe encoding for basic auth
            const auth = btoa(unescape(encodeURIComponent(`${username}:${password}`)));
            headers['Authorization'] = 'Basic ' + auth;
        }

        const baseUrl = url.endsWith('/') ? url : `${url}/`;
        const targetUrl = `${baseUrl}${filename}`;

        const response = await fetch(targetUrl, {
            method: 'PUT',
            headers,
            body: content,
            keepalive: true
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            return { success: false, error: `Status ${response.status}: ${response.statusText} ${errorText}` };
        }
        return { success: true };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

async function handleWebDavGet(config, filename) {
    try {
        const { url, username, password } = config;
        const headers = {};

        if (username && password) {
            // Use utf8 safe encoding for basic auth
            const auth = btoa(unescape(encodeURIComponent(`${username}:${password}`)));
            headers['Authorization'] = 'Basic ' + auth;
        }

        const baseUrl = url.endsWith('/') ? url : `${url}/`;
        const targetUrl = `${baseUrl}${filename}`;

        const response = await fetch(targetUrl, {
            method: 'GET',
            headers,
            cache: 'no-store',
            keepalive: true
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            return { success: false, error: `Status ${response.status}: ${response.statusText} ${errorText}` };
        }
        
        const text = await response.text();
        return { success: true, content: text };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

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
