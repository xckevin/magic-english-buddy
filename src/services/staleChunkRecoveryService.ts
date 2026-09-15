const STALE_CHUNK_RELOAD_KEY = 'magic-buddy:stale-chunk-reload-attempted';

interface BrowserWindow {
  addEventListener: (type: string, listener: (event: Event) => void) => void;
  removeEventListener: (type: string, listener: (event: Event) => void) => void;
  location: { reload: () => void };
  sessionStorage: Storage;
}

/**
 * Reload once when Vite reports that an old deployment's lazy chunk is gone.
 *
 * The session marker is written before the reload. If storage is unavailable,
 * or a reload has already been attempted in this tab session, leave the Vite
 * error untouched so the route error UI can explain the failure instead of
 * creating a reload loop.
 */
export const installStaleChunkRecovery = (
  browser: BrowserWindow = window
): (() => void) => {
  const recover = (event: Event) => {
    try {
      if (browser.sessionStorage.getItem(STALE_CHUNK_RELOAD_KEY)) return;
      browser.sessionStorage.setItem(STALE_CHUNK_RELOAD_KEY, '1');
    } catch {
      return;
    }

    event.preventDefault();
    browser.location.reload();
  };

  // Vite emits this event only for failed dynamic-import preloads. Do not
  // attach a general error handler: ordinary application failures belong in
  // the route error boundary.
  browser.addEventListener('vite:preloadError', recover);
  return () => browser.removeEventListener('vite:preloadError', recover);
};

export default installStaleChunkRecovery;
