import type { WebDavConfig } from '../types';

export const webDavClient = {
  async saveFile(config: WebDavConfig, filename: string, content: string) {
    // Try Chrome Extension background script first (to bypass CORS)
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        try {
            return await new Promise<void>((resolve, reject) => {
                chrome.runtime.sendMessage({
                    type: 'WEBDAV_SAVE',
                    config,
                    filename,
                    content
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        // Could happen if background script is not active or not an extension context
                        reject(new Error(chrome.runtime.lastError.message));
                        return;
                    }
                    if (response && response.success) {
                        resolve();
                    } else {
                        reject(new Error(response?.error || 'Unknown error via extension'));
                    }
                });
            });
        } catch (e) {
            console.warn('Extension WebDAV failed, falling back to direct fetch:', e);
            // Fallthrough to direct fetch
        }
    }

    const { url, username, password } = config;
    if (!url) throw new Error('WebDAV URL is required');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (username && password) {
      headers['Authorization'] = 'Basic ' + btoa(`${username}:${password}`);
    }

    // Ensure url ends with /
    const baseUrl = url.endsWith('/') ? url : `${url}/`;
    const targetUrl = `${baseUrl}${filename}`;

    const response = await fetch(targetUrl, {
      method: 'PUT',
      headers,
      body: content,
    });

    if (!response.ok) {
      throw new Error(`Failed to save file: ${response.status} ${response.statusText}`);
    }
  },

  async getFile(config: WebDavConfig, filename: string): Promise<string> {
    // Try Chrome Extension background script first
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        try {
            return await new Promise<string>((resolve, reject) => {
                chrome.runtime.sendMessage({
                    type: 'WEBDAV_GET',
                    config,
                    filename
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                        return;
                    }
                    if (response && response.success) {
                        resolve(response.content);
                    } else {
                        reject(new Error(response?.error || 'Unknown error via extension'));
                    }
                });
            });
        } catch (e) {
             console.warn('Extension WebDAV failed, falling back to direct fetch:', e);
             // Fallthrough to direct fetch
        }
    }

    const { url, username, password } = config;
    if (!url) throw new Error('WebDAV URL is required');

    const headers: HeadersInit = {};

    if (username && password) {
      headers['Authorization'] = 'Basic ' + btoa(`${username}:${password}`);
    }

    const baseUrl = url.endsWith('/') ? url : `${url}/`;
    const targetUrl = `${baseUrl}${filename}`;

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to get file: ${response.status} ${response.statusText}`);
    }

    return await response.text();
  }
};
