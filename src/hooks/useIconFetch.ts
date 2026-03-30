import { useState, useEffect, useCallback } from 'react';
import type { SystemConfig } from '../types';

type IconStrategy = 'google' | 'duckduckgo' | 'iowen' | 'ico' | 'chrome';

export function useIconFetch(
  publicUrl: string,
  internalUrl: string,
  meshUrl: string,
  frpUrl: string,
  useInternalService: boolean,
  useMeshService: boolean,
  useFrpService: boolean,
  systemConfig?: SystemConfig,
  initialIcon?: string
) {
  const [iconUrl, setIconUrl] = useState(initialIcon || '');

  const getPrimaryUrl = useCallback(() => {
    if (publicUrl) return publicUrl;
    if (internalUrl) return internalUrl;
    if (meshUrl) return meshUrl;
    if (frpUrl) return frpUrl;
    if (useInternalService) return systemConfig?.internalCheckUrl || '';
    if (useMeshService) return systemConfig?.meshCheckUrl || '';
    if (useFrpService) return systemConfig?.frpCheckUrl || '';
    return '';
  }, [publicUrl, internalUrl, meshUrl, frpUrl, useInternalService, useMeshService, useFrpService, systemConfig]);

  const fetchIcon = useCallback((strategy: IconStrategy, urlOverride?: string) => {
    const targetInput = urlOverride || getPrimaryUrl();
    if (!targetInput) return;

    try {
      let urlStr = targetInput;
      if (!urlStr.startsWith('http')) {
        const isIP = /^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/.test(targetInput);
        urlStr = isIP ? `http://${targetInput}` : `https://${targetInput}`;
      }

      const url = new URL(urlStr);
      const domain = url.hostname;

      switch (strategy) {
        case 'google':
          setIconUrl(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
          break;
        case 'duckduckgo':
          setIconUrl(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
          break;
        case 'iowen':
          setIconUrl(`https://api.iowen.cn/favicon/${domain}.png`);
          break;
        case 'ico':
          setIconUrl(`${url.origin}/favicon.ico`);
          break;
        case 'chrome':
          if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
            setIconUrl(`chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(urlStr)}&size=64`);
          } else {
            fetchIcon('iowen', urlOverride);
          }
          break;
      }
    } catch {
      // ignore
    }
  }, [getPrimaryUrl]);

  const handleIconError = useCallback(() => {
    if (iconUrl.includes('google.com/s2/favicons') || iconUrl.includes('duckduckgo.com') || iconUrl.includes('iowen.cn')) {
      const primary = getPrimaryUrl();
      if (!primary) return;
      const urlStr = primary.startsWith('http') ? primary : `https://${primary}`;
      try {
        const url = new URL(urlStr);
        setIconUrl(`${url.origin}/favicon.ico`);
      } catch {
        // ignore
      }
    }
  }, [iconUrl, getPrimaryUrl]);

  // Auto fetch icon when URL changes
  useEffect(() => {
    const primaryUrl = getPrimaryUrl();
    if (!primaryUrl) return;

    const timer = setTimeout(() => {
      const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
      fetchIcon(isExtension ? 'chrome' : 'iowen', primaryUrl);
    }, 500);

    return () => clearTimeout(timer);
  }, [getPrimaryUrl, fetchIcon]);

  return {
    iconUrl,
    setIconUrl,
    fetchIcon,
    handleIconError,
    getPrimaryUrl,
  };
}

// 获取预设图标 URL
export function getPresetIcon(preset: { url: string; icon: string }): string {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
    return `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(preset.url)}&size=64`;
  }
  return preset.icon;
}