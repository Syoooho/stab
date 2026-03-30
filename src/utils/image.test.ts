import { describe, it, expect, vi } from 'vitest'
import { fetchAndCacheIcon } from '../utils/image'

describe('fetchAndCacheIcon', () => {
  it('returns original URL when fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
    
    const result = await fetchAndCacheIcon('https://example.com/icon.png')
    expect(result).toBe('https://example.com/icon.png')
  })

  it('returns original URL when response is not ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    })
    
    const result = await fetchAndCacheIcon('https://example.com/icon.png')
    expect(result).toBe('https://example.com/icon.png')
  })
})