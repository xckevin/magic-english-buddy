import { createHash, webcrypto } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import { AUDIO_CACHE_NAME, AudioDownloadService } from '@/services/audioDownloadService';
import {
  audioFiles,
  audioPacks,
  audioTotalBytes,
  type AudioFileCatalogEntry,
  type AudioPackCatalogEntry,
} from '@/services/audioCatalog';

type Deferred<T> = { promise: Promise<T>; resolve: (value: T) => void };

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => {
    resolve = done;
  });
  return { promise, resolve };
}

function hash(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

function catalogFile(file: string, body: Uint8Array): AudioFileCatalogEntry {
  return { file, bytes: body.byteLength, sha256: hash(body) };
}

function pack(id: string, files: AudioFileCatalogEntry[]): AudioPackCatalogEntry {
  return {
    id,
    title: id.toUpperCase(),
    storyCount: 1,
    files: files.map(file => file.file),
    bytes: files.reduce((total, file) => total + file.bytes, 0),
  };
}

function cacheResponse(file: AudioFileCatalogEntry, body = new Uint8Array(file.bytes)): Response {
  return new Response(body, {
    status: 200,
    headers: {
      'content-type': 'audio/mpeg',
      'content-length': String(file.bytes),
      'x-magic-english-bytes': String(file.bytes),
      'x-magic-english-sha256': file.sha256,
    },
  });
}

class MemoryCache {
  entries = new Map<string, Response>();
  private key(request: RequestInfo | URL): string {
    return request instanceof Request ? request.url : String(request);
  }
  keys = vi.fn(async () => [...this.entries.keys()].map(url => new Request(url)));
  match = vi.fn(async (request: RequestInfo | URL) => this.entries.get(this.key(request))?.clone());
  put = vi.fn(async (request: RequestInfo | URL, response: Response) => {
    this.entries.set(this.key(request), response.clone());
  });
  delete = vi.fn(async (request: RequestInfo | URL) => this.entries.delete(this.key(request)));
}

class MemoryCacheStorage {
  readonly caches = new Map<string, MemoryCache>([[AUDIO_CACHE_NAME, new MemoryCache()]]);
  readonly cache = this.caches.get(AUDIO_CACHE_NAME) as MemoryCache;
  keys = vi.fn(async () => [...this.caches.keys()]);
  open = vi.fn(async (name: string) => {
    let cache = this.caches.get(name);
    if (!cache) {
      cache = new MemoryCache();
      this.caches.set(name, cache);
    }
    return cache as unknown as Cache;
  });
  delete = vi.fn(async (name: string) => {
    const cache = this.caches.get(name);
    if (!cache) return false;
    cache.entries.clear();
    this.caches.delete(name);
    return true;
  });
}

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() {
    return this.values.size;
  }
  clear() {
    this.values.clear();
  }
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

class FailingStorage extends MemoryStorage {
  override setItem(): void {
    throw new DOMException('Blocked', 'SecurityError');
  }
}

const locks = {
  request: async <T>(
    _name: string,
    _options: { mode: 'exclusive'; ifAvailable: true },
    callback: (lock: Lock | null) => Promise<T>
  ) => callback({} as Lock),
};

function makeService(
  packs: AudioPackCatalogEntry[],
  files: AudioFileCatalogEntry[],
  cacheStorage: MemoryCacheStorage,
  fetcher: typeof fetch,
  local = new MemoryStorage()
) {
  return new AudioDownloadService({
    packs,
    files,
    cacheStorage: cacheStorage as unknown as CacheStorage,
    fetch: fetcher,
    subtle: webcrypto.subtle as unknown as SubtleCrypto,
    locks,
    localStorage: local,
    urlForFile: file => `https://example.test/audio/${file}`,
  });
}

function audioResponse(body: Uint8Array, type = 'audio/mpeg'): Response {
  return new Response(body, { status: 200, headers: { 'content-type': type } });
}

describe('audioCatalog', () => {
  it('exposes every generated pack with deduplicated, verifiable file metadata', () => {
    expect(audioPacks.map(item => item.id)).toEqual([
      'l1',
      'l2',
      'l3',
      'l4',
      'l5',
      'l6',
      'l7',
      'dictionary',
    ]);
    expect(new Set(audioFiles.map(file => file.file))).toHaveLength(audioFiles.length);
    expect(audioFiles.every(file => file.bytes > 0 && /^[a-f\d]{64}$/.test(file.sha256))).toBe(
      true
    );
    const catalogNames = new Set(audioFiles.map(file => file.file));
    expect(audioPacks.flatMap(item => item.files).every(file => catalogNames.has(file))).toBe(true);
    expect(audioTotalBytes).toBe(audioFiles.reduce((total, file) => total + file.bytes, 0));
  });
});

describe('AudioDownloadService', () => {
  it('resumes with only missing files and notices a cache entry disappearing', async () => {
    const aBody = new Uint8Array([1, 2]);
    const bBody = new Uint8Array([3, 4, 5]);
    const a = catalogFile('a.mp3', aBody);
    const b = catalogFile('b.mp3', bBody);
    const cacheStorage = new MemoryCacheStorage();
    cacheStorage.cache.entries.set('https://example.test/audio/a.mp3', cacheResponse(a, aBody));
    const fetcher = vi.fn(async (url: RequestInfo | URL) =>
      audioResponse(String(url).endsWith('a.mp3') ? aBody : bBody)
    ) as unknown as typeof fetch;
    const service = makeService([pack('l1', [a, b])], [a, b], cacheStorage, fetcher);

    await service.download('l1');
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith(
      'https://example.test/audio/b.mp3',
      expect.objectContaining({ cache: 'no-store' })
    );
    expect(service.getSnapshot().packs[0]).toMatchObject({
      complete: true,
      downloadedFiles: 2,
      selected: true,
    });

    cacheStorage.cache.entries.delete('https://example.test/audio/a.mp3');
    await service.refresh();
    expect(service.getSnapshot().packs[0]).toMatchObject({ complete: false, downloadedFiles: 1 });

    await service.download('l1');
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(String(fetcher.mock.calls[1][0])).toContain('a.mp3');
    expect(service.getSnapshot().packs[0].complete).toBe(true);
  });

  it('ignores a fetch response that arrives after cancellation', async () => {
    const body = new Uint8Array([7, 8, 9]);
    const file = catalogFile('late.mp3', body);
    const response = deferred<Response>();
    const cacheStorage = new MemoryCacheStorage();
    const fetcher = vi.fn(() => response.promise) as unknown as typeof fetch;
    const service = makeService([pack('l1', [file])], [file], cacheStorage, fetcher);

    const download = service.download('l1');
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    service.cancel();
    response.resolve(audioResponse(body));
    await download;

    expect(cacheStorage.cache.put).not.toHaveBeenCalled();
    expect(service.getSnapshot()).toMatchObject({ phase: 'idle', downloadedFiles: 0, error: null });
  });

  it('removes a late Cache.put after cancellation', async () => {
    const body = new Uint8Array([10, 11, 12]);
    const file = catalogFile('put.mp3', body);
    const putStarted = deferred<void>();
    const finishPut = deferred<void>();
    const cacheStorage = new MemoryCacheStorage();
    cacheStorage.cache.put.mockImplementation(async (request, response) => {
      putStarted.resolve();
      await finishPut.promise;
      cacheStorage.cache.entries.set(String(request), response.clone());
    });
    const service = makeService(
      [pack('l1', [file])],
      [file],
      cacheStorage,
      vi.fn(async () => audioResponse(body)) as unknown as typeof fetch
    );

    const download = service.download('l1');
    await putStarted.promise;
    service.cancel();
    finishPut.resolve();
    await download;

    expect(cacheStorage.cache.delete).toHaveBeenCalledWith('https://example.test/audio/put.mp3');
    expect(cacheStorage.cache.entries).toHaveLength(0);
  });

  it('does not let an in-flight write restore audio while its pack is being removed', async () => {
    const body = new Uint8Array([20, 21, 22]);
    const file = catalogFile('remove-late.mp3', body);
    const putStarted = deferred<void>();
    const finishPut = deferred<void>();
    const cacheStorage = new MemoryCacheStorage();
    cacheStorage.cache.put.mockImplementation(async (request, response) => {
      putStarted.resolve();
      await finishPut.promise;
      cacheStorage.cache.entries.set(String(request), response.clone());
    });
    const service = makeService(
      [pack('l1', [file])],
      [file],
      cacheStorage,
      vi.fn(async () => audioResponse(body)) as unknown as typeof fetch
    );

    const download = service.download('l1');
    await putStarted.promise;
    const removal = service.remove('l1');
    finishPut.resolve();
    await Promise.all([download, removal]);

    expect(cacheStorage.cache.entries).toHaveLength(0);
    expect(service.getSnapshot().packs[0]).toMatchObject({ selected: false, complete: false });
  });

  it('keeps shared files referenced by another selected pack when one pack is removed', async () => {
    const sharedBody = new Uint8Array([1]);
    const aBody = new Uint8Array([2]);
    const bBody = new Uint8Array([3]);
    const shared = catalogFile('shared.mp3', sharedBody);
    const a = catalogFile('a.mp3', aBody);
    const b = catalogFile('b.mp3', bBody);
    const bodies = new Map([
      [shared.file, sharedBody],
      [a.file, aBody],
      [b.file, bBody],
    ]);
    const cacheStorage = new MemoryCacheStorage();
    const fetcher = vi.fn(async (url: RequestInfo | URL) => {
      const name = String(url).split('/').at(-1) as string;
      return audioResponse(bodies.get(name) as Uint8Array);
    }) as unknown as typeof fetch;
    const service = makeService(
      [pack('l1', [shared, a]), pack('l2', [shared, b])],
      [shared, a, b],
      cacheStorage,
      fetcher
    );

    await service.download('l1');
    await service.download('l2');
    expect(fetcher).toHaveBeenCalledTimes(3);
    await service.remove('l1');

    expect(cacheStorage.cache.entries.has('https://example.test/audio/shared.mp3')).toBe(true);
    expect(cacheStorage.cache.entries.has('https://example.test/audio/a.mp3')).toBe(false);
    expect(service.getSnapshot().packs.find(item => item.id === 'l2')?.complete).toBe(true);
    expect(service.getSnapshot().packs.find(item => item.id === 'l1')?.selected).toBe(false);
  });

  it('rejects HTML and a wrong SHA-256 without caching either response', async () => {
    const htmlBody = new Uint8Array([60, 104, 116, 109, 108, 62]);
    const expectedBody = new Uint8Array([4, 5, 6]);
    const file = catalogFile('bad.mp3', expectedBody);
    const cacheStorage = new MemoryCacheStorage();
    const htmlService = makeService(
      [pack('l1', [file])],
      [file],
      cacheStorage,
      vi.fn(async () => audioResponse(htmlBody, 'text/html')) as unknown as typeof fetch
    );

    await htmlService.download('l1');
    expect(htmlService.getSnapshot().error).toContain('不是有效音频');
    expect(cacheStorage.cache.put).not.toHaveBeenCalled();

    const shaService = makeService(
      [pack('l1', [file])],
      [file],
      cacheStorage,
      vi.fn(async () => audioResponse(new Uint8Array([9, 9, 9]))) as unknown as typeof fetch
    );
    await shaService.download('l1');
    expect(shaService.getSnapshot().error).toContain('校验失败');
    expect(cacheStorage.cache.put).not.toHaveBeenCalled();
  });

  it('surfaces QuotaExceededError and leaves the partial cache retryable', async () => {
    const body = new Uint8Array([1, 3, 5]);
    const file = catalogFile('quota.mp3', body);
    const cacheStorage = new MemoryCacheStorage();
    cacheStorage.cache.put.mockRejectedValueOnce(
      new DOMException('The quota has been exceeded.', 'QuotaExceededError')
    );
    const fetcher = vi.fn(async () => audioResponse(body)) as unknown as typeof fetch;
    const service = makeService([pack('l1', [file])], [file], cacheStorage, fetcher);

    await service.download('l1');
    expect(service.getSnapshot().error).toContain('存储空间不足');
    expect(service.getSnapshot().downloadedFiles).toBe(0);

    await service.download('l1');
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(service.getSnapshot().packs[0].complete).toBe(true);
  });

  it('does not let a stale refresh clear a newer user-visible error', async () => {
    const body = new Uint8Array([42]);
    const file = catalogFile('refresh.mp3', body);
    const cacheStorage = new MemoryCacheStorage();
    const match = deferred<Response | undefined>();
    cacheStorage.cache.match.mockImplementationOnce(() => match.promise);
    const service = makeService(
      [pack('l1', [file])],
      [file],
      cacheStorage,
      vi.fn(async () => audioResponse(body)) as unknown as typeof fetch
    );

    const refresh = service.refresh();
    expect(service.getSnapshot().checking).toBe(true);
    await service.download('missing');
    match.resolve(undefined);
    await refresh;

    expect(service.getSnapshot()).toMatchObject({
      checking: false,
      error: '找不到这个音频包，请刷新页面后重试。',
    });
  });

  it('does not fetch or delete when pack ownership cannot be persisted', async () => {
    const body = new Uint8Array([50, 51]);
    const file = catalogFile('storage.mp3', body);
    const cacheStorage = new MemoryCacheStorage();
    const fetcher = vi.fn(async () => audioResponse(body)) as unknown as typeof fetch;
    const service = makeService(
      [pack('l1', [file])],
      [file],
      cacheStorage,
      fetcher,
      new FailingStorage()
    );

    await service.download('l1');
    expect(fetcher).not.toHaveBeenCalled();
    expect(service.getSnapshot().error).toContain('无法保存离线音频选择');

    cacheStorage.cache.entries.set(
      'https://example.test/audio/storage.mp3',
      cacheResponse(file, body)
    );
    await service.remove('l1');
    expect(cacheStorage.cache.delete).not.toHaveBeenCalled();
    expect(cacheStorage.cache.entries).toHaveLength(1);
  });

  it('reports orphaned v1 and legacy audio storage and removes only those caches', async () => {
    const cacheStorage = new MemoryCacheStorage();
    cacheStorage.cache.entries.set(
      'https://example.test/audio/orphan.mp3',
      new Response(new Uint8Array([1, 2, 3, 4]), {
        headers: { 'content-type': 'audio/mpeg' },
      })
    );
    const legacy = new MemoryCache();
    legacy.entries.set(
      'https://example.test/audio/legacy.mp3',
      new Response(new Uint8Array(10), {
        headers: { 'content-type': 'audio/mpeg', 'content-length': '10' },
      })
    );
    cacheStorage.caches.set('audio-cache', legacy);
    cacheStorage.caches.set('unrelated-cache', new MemoryCache());
    const service = makeService([], [], cacheStorage, vi.fn() as unknown as typeof fetch);

    await service.refresh();
    expect(service.getSnapshot()).toMatchObject({
      hasStoredAudio: true,
      storedBytes: 14,
      downloadedFiles: 0,
    });

    await service.remove('all');
    expect(cacheStorage.delete).toHaveBeenCalledWith(AUDIO_CACHE_NAME);
    expect(cacheStorage.delete).toHaveBeenCalledWith('audio-cache');
    expect(cacheStorage.caches.has('unrelated-cache')).toBe(true);
    expect(service.getSnapshot()).toMatchObject({ hasStoredAudio: false, storedBytes: 0 });
  });

  it('keeps a pack selected when deletion fails partway so removal can be retried', async () => {
    const aBody = new Uint8Array([61]);
    const bBody = new Uint8Array([62]);
    const a = catalogFile('delete-a.mp3', aBody);
    const b = catalogFile('delete-b.mp3', bBody);
    const cacheStorage = new MemoryCacheStorage();
    const bodies = new Map([
      [a.file, aBody],
      [b.file, bBody],
    ]);
    const service = makeService(
      [pack('l1', [a, b])],
      [a, b],
      cacheStorage,
      vi.fn(async (url: RequestInfo | URL) => {
        const name = String(url).split('/').at(-1) as string;
        return audioResponse(bodies.get(name) as Uint8Array);
      }) as unknown as typeof fetch
    );
    await service.download('l1');

    let deletion = 0;
    cacheStorage.cache.delete.mockImplementation(async request => {
      deletion += 1;
      if (deletion === 2) throw new Error('disk error');
      return cacheStorage.cache.entries.delete(
        request instanceof Request ? request.url : String(request)
      );
    });
    await service.remove('l1');
    expect(service.getSnapshot().packs[0]).toMatchObject({ selected: true, complete: false });
    expect(service.getSnapshot().error).toBeTruthy();

    cacheStorage.cache.delete.mockImplementation(async request =>
      cacheStorage.cache.entries.delete(request instanceof Request ? request.url : String(request))
    );
    await service.remove('l1');
    expect(service.getSnapshot().packs[0]).toMatchObject({ selected: false, complete: false });
    expect(service.getSnapshot().hasStoredAudio).toBe(false);
  });
});
