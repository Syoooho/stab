import { describe, it, expect, vi } from 'vitest'

describe('fetchAndCacheIcon', () => {
  it('returns original URL when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))
    
    const { fetchAndCacheIcon } = await import('../utils/image')
    const result = await fetchAndCacheIcon('https://example.com/icon.png')
    expect(result).toBe('https://example.com/icon.png')
  })

  it('returns original URL when response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    }))
    
    const { fetchAndCacheIcon } = await import('../utils/image')
    const result = await fetchAndCacheIcon('https://example.com/icon.png')
    expect(result).toBe('https://example.com/icon.png')
  })
})