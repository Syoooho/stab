import '@testing-library/jest-dom'

// Mock Chrome APIs for extension context
const mockChrome = {
  runtime: {
    id: 'test-extension-id',
    sendMessage: vi.fn(),
    lastError: null,
  },
  storage: {
    local: {
      get: vi.fn((keys, callback) => callback?.({})),
      set: vi.fn((data, callback) => callback?.()),
    },
  },
}

// @ts-ignore
globalThis.chrome = mockChrome