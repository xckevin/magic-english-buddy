import {
  audioFiles,
  audioPacks,
  audioTotalBytes,
  type AudioFileCatalogEntry,
  type AudioPackCatalogEntry,
} from '@/services/audioCatalog';

export const AUDIO_CACHE_NAME = 'magic-english-audio-v1';

const LEGACY_AUDIO_CACHE_NAME = 'audio-cache';
const CACHE_SHA_HEADER = 'x-magic-english-sha256';
const CACHE_BYTES_HEADER = 'x-magic-english-bytes';
const LOCK_NAME = `${AUDIO_CACHE_NAME}-mutation`;
const SELECTED_PACKS_KEY = `${AUDIO_CACHE_NAME}:selected-packs`;
const CHANGE_PULSE_KEY = `${AUDIO_CACHE_NAME}:changed`;

export function audioFileUrl(file: string): string {
  const origin = globalThis.location?.origin ?? 'http://localhost';
  const base = new URL(import.meta.env.BASE_URL || '/', origin);
  const safeFile = file.split('/').map(encodeURIComponent).join('/');
  return new URL(`audio/${safeFile}`, base).href;
}

export interface AudioDownloadPackSnapshot {
  id: string;
  title: string;
  level?: number;
  storyCount: number;
  files: string[];
  bytes: number;
  downloadedFiles: number;
  downloadedBytes: number;
  complete: boolean;
  selected: boolean;
}

export interface AudioDownloadSnapshot {
  supported: boolean;
  checking: boolean;
  phase: 'idle' | 'downloading' | 'cancelling' | 'removing';
  activePackId: string | null;
  error: string | null;
  packs: AudioDownloadPackSnapshot[];
  downloadedBytes: number;
  totalBytes: number;
  downloadedFiles: number;
  totalFiles: number;
  hasStoredAudio: boolean;
  storedBytes: number;
  persistent: boolean | null;
}

interface LockManagerLike {
  request<T>(
    name: string,
    options: { mode: 'exclusive'; ifAvailable: true },
    callback: (lock: Lock | null) => Promise<T>
  ): Promise<T>;
}

interface StorageManagerLike {
  persist?: () => Promise<boolean>;
  persisted?: () => Promise<boolean>;
}

interface CacheInventory {
  validFiles: Set<string>;
  storedBytes: number;
  storedEntries: number;
  v1BytesByUrl: Map<string, number>;
}

export interface AudioDownloadServiceOptions {
  packs?: AudioPackCatalogEntry[];
  files?: AudioFileCatalogEntry[];
  cacheStorage?: CacheStorage;
  fetch?: typeof fetch;
  subtle?: SubtleCrypto;
  locks?: LockManagerLike;
  storage?: StorageManagerLike;
  localStorage?: Storage;
  urlForFile?: (file: string) => string;
  document?: Document;
  window?: Window;
  broadcastChannel?: typeof BroadcastChannel;
}

function getGlobalCacheStorage(): CacheStorage | undefined {
  return typeof caches === 'undefined' ? undefined : caches;
}

function getGlobalFetch(): typeof fetch | undefined {
  return typeof fetch === 'undefined' ? undefined : fetch;
}

function getGlobalSubtle(): SubtleCrypto | undefined {
  return globalThis.crypto?.subtle;
}

function getGlobalLocks(): LockManagerLike | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return (navigator as Navigator & { locks?: LockManagerLike }).locks;
}

function getGlobalStorageManager(): StorageManagerLike | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return navigator.storage;
}

function getGlobalLocalStorage(): Storage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

function toErrorMessage(error: unknown): string {
  const errorName = typeof error === 'object' && error && 'name' in error ? error.name : undefined;
  if (errorName === 'QuotaExceededError') {
    return '设备存储空间不足，无法保存离线音频。请清理一些空间后重试。';
  }
  if (error instanceof Error && /^[\u3400-\u9fff]/u.test(error.message)) return error.message;
  return '离线音频操作失败，请检查网络后重试。';
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

function bytesToHex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map(value => value.toString(16).padStart(2, '0')).join('');
}

function emptySnapshot(
  packs: AudioPackCatalogEntry[],
  files: AudioFileCatalogEntry[]
): AudioDownloadSnapshot {
  return {
    supported: false,
    checking: false,
    phase: 'idle',
    activePackId: null,
    error: null,
    packs: packs.map(pack => ({
      ...pack,
      files: [...pack.files],
      downloadedFiles: 0,
      downloadedBytes: 0,
      complete: false,
      selected: false,
    })),
    downloadedBytes: 0,
    totalBytes: files.reduce((total, file) => total + file.bytes, 0),
    downloadedFiles: 0,
    totalFiles: files.length,
    hasStoredAudio: false,
    storedBytes: 0,
    persistent: null,
  };
}

/** Optional, user-triggered offline audio storage backed by a dedicated Cache API cache. */
export class AudioDownloadService {
  private readonly packs: AudioPackCatalogEntry[];
  private readonly files: AudioFileCatalogEntry[];
  private readonly fileByName: Map<string, AudioFileCatalogEntry>;
  private readonly options: AudioDownloadServiceOptions;
  private snapshot: AudioDownloadSnapshot;
  private readonly listeners = new Set<() => void>();
  private controller: AbortController | null = null;
  private downloadSettled: Promise<void> | null = null;
  private operationVersion = 0;
  private refreshVersion = 0;
  private detachEvents: (() => void) | null = null;

  constructor(options: AudioDownloadServiceOptions = {}) {
    this.options = options;
    this.packs = options.packs ?? audioPacks;
    this.files = options.files ?? audioFiles;
    this.fileByName = new Map(this.files.map(file => [file.file, file]));
    this.snapshot = {
      ...emptySnapshot(this.packs, this.files),
      supported: this.isSupported(),
    };
  }

  getSnapshot = (): AudioDownloadSnapshot => this.snapshot;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    if (this.listeners.size === 1) {
      this.attachEventListeners();
      void this.refresh();
    }
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.detachEvents?.();
        this.detachEvents = null;
      }
    };
  };

  async refresh(): Promise<void> {
    if (!this.isSupported()) {
      this.update({ supported: false, checking: false, persistent: null });
      return;
    }
    if (this.snapshot.phase !== 'idle') return;
    const refreshVersion = ++this.refreshVersion;
    const operationVersion = this.operationVersion;
    this.update({ supported: true, checking: true });
    try {
      const [inventory, persistent] = await Promise.all([
        this.scanCachedAudio(),
        this.readPersistentStatus(),
      ]);
      if (
        refreshVersion !== this.refreshVersion ||
        operationVersion !== this.operationVersion ||
        this.snapshot.phase !== 'idle'
      )
        return;
      this.applyInventory(inventory, persistent);
      this.update({ error: null });
    } catch (error) {
      if (refreshVersion === this.refreshVersion && operationVersion === this.operationVersion) {
        this.update({ error: toErrorMessage(error) });
      }
    } finally {
      if (refreshVersion === this.refreshVersion) this.update({ checking: false });
    }
  }

  async download(id: string | 'all'): Promise<void> {
    this.invalidateRefresh();
    const targetPacks = this.resolvePacks(id);
    if (!targetPacks) {
      this.update({ error: '找不到这个音频包，请刷新页面后重试。' });
      return;
    }
    if (!this.isSupported()) {
      this.update({ supported: false, error: '当前浏览器不支持离线音频下载。' });
      return;
    }
    if (this.snapshot.phase !== 'idle') {
      this.update({ error: '正在处理另一项离线音频操作，请稍后重试。' });
      return;
    }

    const controller = new AbortController();
    const version = ++this.operationVersion;
    this.controller = controller;
    this.update({
      supported: true,
      phase: 'downloading',
      activePackId: id,
      error: null,
    });

    const operation = this.runDownload(targetPacks, version, controller);
    this.downloadSettled = operation;
    await operation;
    if (this.downloadSettled === operation) this.downloadSettled = null;
  }

  cancel(): void {
    if (!this.controller || this.snapshot.phase !== 'downloading') return;
    this.invalidateRefresh();
    this.operationVersion += 1;
    this.controller.abort();
    this.update({ phase: 'cancelling', error: null });
  }

  async remove(id: string | 'all'): Promise<void> {
    this.invalidateRefresh();
    const targetPacks = this.resolvePacks(id);
    if (!targetPacks) {
      this.update({ error: '找不到这个音频包，请刷新页面后重试。' });
      return;
    }
    if (!this.isSupported()) {
      this.update({ supported: false, error: '当前浏览器不支持管理离线音频。' });
      return;
    }

    const pendingDownload = this.downloadSettled;
    if (this.controller) {
      this.operationVersion += 1;
      this.controller.abort();
    } else if (this.snapshot.phase !== 'idle') {
      this.update({ error: '正在处理另一项离线音频操作，请稍后重试。' });
      return;
    }

    this.update({ phase: 'removing', activePackId: id, error: null });
    if (pendingDownload) await pendingDownload;
    this.update({ phase: 'removing', activePackId: id, error: null });

    const version = ++this.operationVersion;
    let acquired = false;
    try {
      acquired = await this.withMutationLock(async () => {
        const cacheStorage = this.getCacheStorage();
        const selected = this.readSelectedPacks();
        const removedIds = new Set(targetPacks.map(pack => pack.id));
        const remaining =
          id === 'all'
            ? new Set<string>()
            : new Set([...selected].filter(packId => !removedIds.has(packId)));
        // Verify localStorage is writable before changing any cache. Keeping the
        // current value until deletion succeeds makes a failed removal retryable.
        this.writeSelectedPacks(selected);

        if (id === 'all') {
          await cacheStorage.delete(AUDIO_CACHE_NAME);
          await cacheStorage.delete(LEGACY_AUDIO_CACHE_NAME);
        } else {
          const protectedFiles = new Set(
            this.packs.filter(pack => remaining.has(pack.id)).flatMap(pack => pack.files)
          );
          const cache = await cacheStorage.open(AUDIO_CACHE_NAME);
          const filesToDelete = new Set(
            targetPacks.flatMap(pack => pack.files).filter(file => !protectedFiles.has(file))
          );
          for (const file of filesToDelete) {
            if (version !== this.operationVersion) return;
            await cache.delete(this.urlForFile(file));
          }
        }
        this.writeSelectedPacks(remaining);
      });
      if (!acquired) {
        this.update({ error: '另一个页面正在管理离线音频，请稍后重试。' });
      }
    } catch (error) {
      this.update({ error: toErrorMessage(error) });
    } finally {
      await this.refreshPreservingError();
      this.controller = null;
      this.update({ phase: 'idle', activePackId: null });
      if (acquired) this.announceChange();
    }
  }

  private async runDownload(
    targetPacks: AudioPackCatalogEntry[],
    version: number,
    controller: AbortController
  ): Promise<void> {
    let acquired = false;
    try {
      await this.requestPersistentStorage(version);
      if (version !== this.operationVersion || controller.signal.aborted) {
        throw new DOMException('Audio download was cancelled', 'AbortError');
      }
      acquired = await this.withMutationLock(async () => {
        if (version !== this.operationVersion || controller.signal.aborted) {
          throw new DOMException('Audio download was cancelled', 'AbortError');
        }
        const selected = this.readSelectedPacks();
        for (const pack of targetPacks) selected.add(pack.id);
        this.writeSelectedPacks(selected);
        await this.downloadFiles(targetPacks, version, controller);
      });
      if (!acquired && version === this.operationVersion) {
        this.update({ error: '另一个页面正在管理离线音频，请稍后重试。' });
      }
    } catch (error) {
      if (!isAbortError(error) && version === this.operationVersion) {
        this.update({ error: toErrorMessage(error) });
      }
    } finally {
      await this.refreshPreservingError();
      if (this.controller === controller) this.controller = null;
      this.update({ phase: 'idle', activePackId: null });
      if (acquired) this.announceChange();
    }
  }

  private async downloadFiles(
    targetPacks: AudioPackCatalogEntry[],
    version: number,
    controller: AbortController
  ): Promise<void> {
    const cache = await this.getCacheStorage().open(AUDIO_CACHE_NAME);
    const inventory = await this.scanCachedAudio(cache);
    const validFiles = inventory.validFiles;
    let storedBytes = inventory.storedBytes;
    let storedEntries = inventory.storedEntries;
    const targetNames = [...new Set(targetPacks.flatMap(pack => pack.files))];
    const missing = targetNames.filter(file => !validFiles.has(file));
    let cursor = 0;
    let failure: unknown;

    const worker = async () => {
      while (cursor < missing.length && !failure) {
        const fileName = missing[cursor++];
        const file = this.fileByName.get(fileName);
        if (!file) {
          failure = new Error('音频清单不完整，请刷新页面后重试。');
          controller.abort();
          return;
        }
        try {
          await this.downloadOne(cache, file, version, controller.signal);
          if (version === this.operationVersion && !controller.signal.aborted) {
            validFiles.add(file.file);
            const url = this.urlForFile(file.file);
            const previousBytes = inventory.v1BytesByUrl.get(url);
            if (previousBytes === undefined) storedEntries += 1;
            else storedBytes -= previousBytes;
            storedBytes += file.bytes;
            inventory.v1BytesByUrl.set(url, file.bytes);
            this.applyInventory(
              { ...inventory, validFiles, storedBytes, storedEntries },
              this.snapshot.persistent
            );
          }
        } catch (error) {
          if (version === this.operationVersion && !controller.signal.aborted) {
            failure = error;
            controller.abort();
          }
          return;
        }
      }
    };

    await Promise.all(Array.from({ length: Math.min(3, missing.length) }, () => worker()));
    if (failure) throw failure;
    if (version !== this.operationVersion || controller.signal.aborted) {
      throw new DOMException('Audio download was cancelled', 'AbortError');
    }
  }

  private async downloadOne(
    cache: Cache,
    file: AudioFileCatalogEntry,
    version: number,
    signal: AbortSignal
  ): Promise<void> {
    const url = this.urlForFile(file.file);
    const response = await this.getFetch()(url, { signal, cache: 'no-store' });
    if (version !== this.operationVersion || signal.aborted) {
      throw new DOMException('Audio download was cancelled', 'AbortError');
    }
    if (!response.ok)
      throw new Error(`音频下载失败（服务器返回 ${response.status}），请稍后重试。`);
    const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
    if (!contentType.startsWith('audio/') || contentType.includes('html')) {
      throw new Error('下载内容不是有效音频，请稍后重试。');
    }
    const body = await response.arrayBuffer();
    if (version !== this.operationVersion || signal.aborted) {
      throw new DOMException('Audio download was cancelled', 'AbortError');
    }
    if (body.byteLength !== file.bytes) {
      throw new Error('音频文件校验失败，请重新下载。');
    }
    const digest = bytesToHex(await this.getSubtle().digest('SHA-256', body));
    if (version !== this.operationVersion || signal.aborted) {
      throw new DOMException('Audio download was cancelled', 'AbortError');
    }
    if (digest !== file.sha256.toLowerCase()) {
      throw new Error('音频文件校验失败，请重新下载。');
    }

    const headers = new Headers(response.headers);
    headers.set(CACHE_SHA_HEADER, file.sha256.toLowerCase());
    headers.set(CACHE_BYTES_HEADER, String(file.bytes));
    headers.set('content-length', String(file.bytes));
    const cachedResponse = new Response(body, { status: 200, headers });
    if (version !== this.operationVersion || signal.aborted) {
      throw new DOMException('Audio download was cancelled', 'AbortError');
    }
    await cache.put(url, cachedResponse);
    if (version !== this.operationVersion || signal.aborted) {
      // Cache.put itself cannot be aborted. Compensate for a cancellation that arrived
      // while the write was pending so a late response cannot resurrect deleted data.
      await cache.delete(url);
      throw new DOMException('Audio download was cancelled', 'AbortError');
    }
  }

  private async scanCachedAudio(existingV1Cache?: Cache): Promise<CacheInventory> {
    const cacheStorage = this.getCacheStorage();
    const cacheNames = new Set(await cacheStorage.keys());
    const validFiles = new Set<string>();
    const v1BytesByUrl = new Map<string, number>();
    const filesByUrl = new Map(this.files.map(file => [this.urlForFile(file.file), file]));
    let storedBytes = 0;
    let storedEntries = 0;

    const scan = async (cache: Cache, validateCatalog: boolean) => {
      const keys = await cache.keys();
      const responses = await Promise.all(
        keys.map(async request => ({ request, response: await cache.match(request) }))
      );
      await Promise.all(
        responses.map(async ({ request, response }) => {
          if (!response) return;
          const responseBytes = await this.readStoredResponseBytes(response);
          storedEntries += 1;
          storedBytes += responseBytes;
          if (!validateCatalog) return;
          v1BytesByUrl.set(request.url, responseBytes);
          const file = filesByUrl.get(request.url);
          if (
            file &&
            response.ok &&
            response.headers.get(CACHE_SHA_HEADER)?.toLowerCase() === file.sha256.toLowerCase() &&
            response.headers.get(CACHE_BYTES_HEADER) === String(file.bytes) &&
            response.headers.get('content-type')?.toLowerCase().startsWith('audio/')
          ) {
            validFiles.add(file.file);
          }
        })
      );
    };

    if (existingV1Cache) {
      await scan(existingV1Cache, true);
    } else if (cacheNames.has(AUDIO_CACHE_NAME)) {
      await scan(await cacheStorage.open(AUDIO_CACHE_NAME), true);
    }
    if (cacheNames.has(LEGACY_AUDIO_CACHE_NAME)) {
      await scan(await cacheStorage.open(LEGACY_AUDIO_CACHE_NAME), false);
    }
    return { validFiles, storedBytes, storedEntries, v1BytesByUrl };
  }

  private async readStoredResponseBytes(response: Response): Promise<number> {
    for (const header of [CACHE_BYTES_HEADER, 'content-length']) {
      const rawValue = response.headers.get(header);
      if (rawValue === null) continue;
      const value = Number(rawValue);
      if (Number.isSafeInteger(value) && value >= 0) return value;
    }
    try {
      return (await response.clone().arrayBuffer()).byteLength;
    } catch {
      return 0;
    }
  }

  private applyInventory(inventory: CacheInventory, persistent: boolean | null): void {
    const valid = inventory.validFiles;
    const selectedPacks = this.readSelectedPacks();
    const packs = this.packs.map(pack => {
      const packFiles = pack.files.filter(file => this.fileByName.has(file));
      const downloaded = packFiles.filter(file => valid.has(file));
      return {
        ...pack,
        files: [...pack.files],
        downloadedFiles: downloaded.length,
        downloadedBytes: downloaded.reduce(
          (total, file) => total + (this.fileByName.get(file)?.bytes ?? 0),
          0
        ),
        complete:
          packFiles.length === pack.files.length &&
          packFiles.length > 0 &&
          downloaded.length === packFiles.length,
        selected: selectedPacks.has(pack.id),
      };
    });
    const downloadedFiles = this.files.filter(file => valid.has(file.file));
    this.update({
      supported: true,
      packs,
      downloadedFiles: downloadedFiles.length,
      downloadedBytes: downloadedFiles.reduce((total, file) => total + file.bytes, 0),
      totalFiles: this.files.length,
      totalBytes: this.options.files
        ? this.files.reduce((total, file) => total + file.bytes, 0)
        : audioTotalBytes,
      hasStoredAudio: inventory.storedEntries > 0,
      storedBytes: inventory.storedBytes,
      persistent,
    });
  }

  private async refreshPreservingError(): Promise<void> {
    if (!this.isSupported()) return;
    const error = this.snapshot.error;
    try {
      const [inventory, persistent] = await Promise.all([
        this.scanCachedAudio(),
        this.readPersistentStatus(),
      ]);
      this.applyInventory(inventory, persistent);
    } catch (refreshError) {
      if (!error) this.update({ error: toErrorMessage(refreshError) });
    }
    if (error) this.update({ error });
  }

  private resolvePacks(id: string | 'all'): AudioPackCatalogEntry[] | null {
    if (id === 'all') return this.packs;
    const pack = this.packs.find(item => item.id === id);
    return pack ? [pack] : null;
  }

  private isSupported(): boolean {
    return Boolean(
      this.maybeCacheStorage() && this.maybeFetch() && this.maybeSubtle() && this.maybeLocks()
    );
  }

  private maybeCacheStorage(): CacheStorage | undefined {
    return this.options.cacheStorage ?? getGlobalCacheStorage();
  }

  private getCacheStorage(): CacheStorage {
    const storage = this.maybeCacheStorage();
    if (!storage) throw new Error('当前浏览器无法使用离线存储。');
    return storage;
  }

  private maybeFetch(): typeof fetch | undefined {
    return this.options.fetch ?? getGlobalFetch();
  }

  private getFetch(): typeof fetch {
    const fetcher = this.maybeFetch();
    if (!fetcher) throw new Error('当前浏览器无法下载音频。');
    return fetcher;
  }

  private maybeSubtle(): SubtleCrypto | undefined {
    return this.options.subtle ?? getGlobalSubtle();
  }

  private getSubtle(): SubtleCrypto {
    const subtle = this.maybeSubtle();
    if (!subtle) throw new Error('当前浏览器无法校验音频文件。');
    return subtle;
  }

  private maybeLocks(): LockManagerLike | undefined {
    return this.options.locks ?? getGlobalLocks();
  }

  private async withMutationLock(task: () => Promise<void>): Promise<boolean> {
    const locks = this.maybeLocks();
    if (!locks) return false;
    return locks.request(LOCK_NAME, { mode: 'exclusive', ifAvailable: true }, async lock => {
      if (!lock) return false;
      await task();
      return true;
    });
  }

  private async requestPersistentStorage(version: number): Promise<void> {
    const storage = this.options.storage ?? getGlobalStorageManager();
    if (!storage?.persist) return;
    try {
      const persistent = await storage.persist();
      if (version === this.operationVersion) this.update({ persistent });
    } catch {
      if (version === this.operationVersion) this.update({ persistent: false });
    }
  }

  private async readPersistentStatus(): Promise<boolean | null> {
    const storage = this.options.storage ?? getGlobalStorageManager();
    if (!storage?.persisted) return null;
    try {
      return await storage.persisted();
    } catch {
      return null;
    }
  }

  private readSelectedPacks(): Set<string> {
    const storage = this.options.localStorage ?? getGlobalLocalStorage();
    if (!storage) return new Set();
    try {
      const parsed: unknown = JSON.parse(storage.getItem(SELECTED_PACKS_KEY) ?? '[]');
      if (!Array.isArray(parsed)) return new Set();
      const known = new Set(this.packs.map(pack => pack.id));
      return new Set(parsed.filter((id): id is string => typeof id === 'string' && known.has(id)));
    } catch {
      return new Set();
    }
  }

  private writeSelectedPacks(ids: Set<string>): void {
    const storage = this.options.localStorage ?? getGlobalLocalStorage();
    if (!storage) throw new Error('无法保存离线音频选择，请检查浏览器存储权限后重试。');
    try {
      storage.setItem(SELECTED_PACKS_KEY, JSON.stringify([...ids]));
    } catch {
      throw new Error('无法保存离线音频选择，请检查浏览器存储权限后重试。');
    }
  }

  private urlForFile(file: string): string {
    return (this.options.urlForFile ?? audioFileUrl)(file);
  }

  private attachEventListeners(): void {
    const doc = this.options.document ?? (typeof document === 'undefined' ? undefined : document);
    const win = this.options.window ?? (typeof window === 'undefined' ? undefined : window);
    const Channel = this.options.broadcastChannel ?? globalThis.BroadcastChannel;
    const onVisibility = () => {
      if (!doc?.hidden && this.snapshot.phase === 'idle') void this.refresh();
    };
    const onStorage = (event: StorageEvent) => {
      if (
        (event.key === SELECTED_PACKS_KEY || event.key === CHANGE_PULSE_KEY) &&
        this.snapshot.phase === 'idle'
      ) {
        void this.refresh();
      }
    };
    doc?.addEventListener('visibilitychange', onVisibility);
    win?.addEventListener('storage', onStorage);

    let channel: BroadcastChannel | null = null;
    if (Channel) {
      try {
        channel = new Channel(AUDIO_CACHE_NAME);
        channel.addEventListener('message', onVisibility);
      } catch {
        channel = null;
      }
    }
    this.detachEvents = () => {
      doc?.removeEventListener('visibilitychange', onVisibility);
      win?.removeEventListener('storage', onStorage);
      channel?.close();
    };
  }

  private announceChange(): void {
    const storage = this.options.localStorage ?? getGlobalLocalStorage();
    try {
      storage?.setItem(CHANGE_PULSE_KEY, `${Date.now()}:${Math.random()}`);
    } catch {
      // BroadcastChannel below still covers modern browsers when localStorage is blocked.
    }
    const Channel = this.options.broadcastChannel ?? globalThis.BroadcastChannel;
    if (!Channel) return;
    try {
      const channel = new Channel(AUDIO_CACHE_NAME);
      channel.postMessage('changed');
      channel.close();
    } catch {
      // The storage event above is sufficient when BroadcastChannel is unavailable.
    }
  }

  private update(patch: Partial<AudioDownloadSnapshot>): void {
    const changed = Object.entries(patch).some(
      ([key, value]) => this.snapshot[key as keyof AudioDownloadSnapshot] !== value
    );
    if (!changed) return;
    this.snapshot = { ...this.snapshot, ...patch };
    for (const listener of this.listeners) {
      try {
        listener();
      } catch {
        // One subscriber must not interrupt a cache mutation or other subscribers.
      }
    }
  }

  private invalidateRefresh(): void {
    this.refreshVersion += 1;
    this.update({ checking: false });
  }
}

export const audioDownloadService = new AudioDownloadService();
