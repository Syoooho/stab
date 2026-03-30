/// <reference types="vitest/globals" />
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
      get: vi.fn(),
      set: vi.fn(),
    },
  },
}

// Setup mock implementations
mockChrome.storage.local.get.mockImplementation((_keys, callback) => callback?.({}));
mockChrome.storage.local.set.mockImplementation((_data, callback) => callback?.());

// @ts-ignore
globalThis.chrome = mockChrome