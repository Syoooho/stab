import { describe, it, expect } from 'vitest'
import { getBestUrl, getNetworkColor } from '../utils/network'
import type { App, NetworkStatus, SystemConfig } from '../types'

describe('getBestUrl', () => {
  const mockApp: App = {
    id: '1',
    name: 'Test App',
    icon: 'test-icon.png',
    urls: {
      internal: 'http://internal.test.com',
      public: 'https://public.test.com',
      mesh: 'http://mesh.test.com',
      frp: 'http://frp.test.com',
    },
  }

  const mockStatus: NetworkStatus = {
    internal: true,
    mesh: false,
    frp: false,
    public: true,
    latencies: { internal: 10, public: 50 },
  }

  it('returns internal URL when internal network is available', () => {
    const result = getBestUrl(mockApp, mockStatus)
    expect(result.url).toBe('http://internal.test.com')
    expect(result.type).toBe('internal')
  })

  it('falls back to public URL when internal is not available', () => {
    const statusWithoutInternal: NetworkStatus = {
      ...mockStatus,
      internal: false,
    }
    const result = getBestUrl(mockApp, statusWithoutInternal)
    expect(result.url).toBe('https://public.test.com')
    expect(result.type).toBe('public')
  })

  it('returns # when no URL is available', () => {
    const appWithoutUrls: App = {
      id: '2',
      name: 'No URL App',
      icon: 'test-icon.png',
      urls: {},
    }
    const result = getBestUrl(appWithoutUrls, mockStatus)
    expect(result.url).toBe('#')
    expect(result.type).toBe('none')
  })

  it('respects custom priority from config', () => {
    const customConfig: SystemConfig = {
      internalCheckUrl: '',
      publicCheckUrl: '',
      meshCheckUrl: '',
      frpCheckUrl: '',
      urlPriority: ['public', 'internal'],
      weatherCity: '',
      countdownTarget: '',
      countdownLabel: '',
      quickCopyItems: [],
    }
    const result = getBestUrl(mockApp, mockStatus, customConfig)
    expect(result.url).toBe('https://public.test.com')
    expect(result.type).toBe('public')
  })
})

describe('getNetworkColor', () => {
  it('returns correct color for internal network', () => {
    expect(getNetworkColor('internal')).toBe('bg-green-500')
  })

  it('returns correct color for mesh network', () => {
    expect(getNetworkColor('mesh')).toBe('bg-blue-500')
  })

  it('returns correct color for frp network', () => {
    expect(getNetworkColor('frp')).toBe('bg-purple-500')
  })

  it('returns correct color for public network', () => {
    expect(getNetworkColor('public')).toBe('bg-orange-500')
  })

  it('returns gray for none/unknown', () => {
    expect(getNetworkColor('none')).toBe('bg-gray-400')
  })
})