import { afterEach, describe, expect, it, vi } from 'vitest';
import { installStaleChunkRecovery } from '@/services/staleChunkRecoveryService';

const createBrowser = () => {
  const listeners = new Map<string, (event: Event) => void>();
  const storage = new Map<string, string>();
  const browser = {
    addEventListener: vi.fn((type: string, listener: (event: Event) => void) =>
      listeners.set(type, listener)
    ),
    removeEventListener: vi.fn((type: string) => listeners.delete(type)),
    location: { reload: vi.fn() },
    sessionStorage: {
      getItem: vi.fn((key: string) => storage.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
    },
  } as unknown as Window;
  return { browser, listeners, storage };
};

describe('stale chunk recovery', () => {
  afterEach(() => vi.restoreAllMocks());

  it('suppresses Vite stale-chunk failure and reloads once', () => {
    const { browser, listeners, storage } = createBrowser();
    installStaleChunkRecovery(browser);
    const event = new Event('vite:preloadError', { cancelable: true });

    listeners.get('vite:preloadError')!(event);

    expect(event.defaultPrevented).toBe(true);
    expect(browser.location.reload).toHaveBeenCalledOnce();
    expect(storage.get('magic-buddy:stale-chunk-reload-attempted')).toBe('1');

    const secondEvent = new Event('vite:preloadError', { cancelable: true });
    listeners.get('vite:preloadError')!(secondEvent);
    expect(secondEvent.defaultPrevented).toBe(false);
    expect(browser.location.reload).toHaveBeenCalledOnce();
  });

  it('leaves the existing error UI in control when session storage is unavailable', () => {
    const { browser, listeners } = createBrowser();
    vi.mocked(browser.sessionStorage.getItem).mockImplementation(() => {
      throw new Error('storage disabled');
    });
    installStaleChunkRecovery(browser);
    const event = new Event('vite:preloadError', { cancelable: true });

    listeners.get('vite:preloadError')!(event);

    expect(event.defaultPrevented).toBe(false);
    expect(browser.location.reload).not.toHaveBeenCalled();
  });

  it('registers no general application-error handler', () => {
    const { browser } = createBrowser();

    const dispose = installStaleChunkRecovery(browser);

    expect(browser.addEventListener).toHaveBeenCalledTimes(1);
    expect(browser.addEventListener).toHaveBeenCalledWith(
      'vite:preloadError',
      expect.any(Function)
    );
    dispose();
    expect(browser.removeEventListener).toHaveBeenCalledTimes(1);
    expect(browser.removeEventListener).toHaveBeenCalledWith(
      'vite:preloadError',
      expect.any(Function)
    );
  });
});
