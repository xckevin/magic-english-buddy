import manifestData from '@/data/audio/manifest.json';

interface ManifestClip {
  file: string;
  duration: number;
  words: unknown[];
  bytes?: number;
  sha256?: string;
}

interface ManifestPack {
  id: string;
  title: string;
  level?: number;
  storyCount: number;
  files: string[];
  bytes: number;
}

interface AudioManifest {
  clips: Record<string, ManifestClip>;
  stories: Record<string, string[]>;
  packs?: ManifestPack[];
}

export interface AudioPackCatalogEntry {
  id: string;
  title: string;
  level?: number;
  storyCount: number;
  files: string[];
  bytes: number;
}

export interface AudioFileCatalogEntry {
  file: string;
  bytes: number;
  sha256: string;
}

// The generated manifest adds download metadata. Keeping those properties optional
// lets an older deployed manifest continue to load while an audio generation is in progress.
const manifest = manifestData as AudioManifest;

export const audioPacks: AudioPackCatalogEntry[] = (manifest.packs ?? []).map(pack => ({
  ...pack,
  files: [...new Set(pack.files)],
}));

const filesByName = new Map<string, AudioFileCatalogEntry>();
for (const clip of Object.values(manifest.clips)) {
  if (
    filesByName.has(clip.file) ||
    !Number.isSafeInteger(clip.bytes) ||
    (clip.bytes ?? 0) <= 0 ||
    !/^[a-f\d]{64}$/i.test(clip.sha256 ?? '')
  ) {
    continue;
  }
  filesByName.set(clip.file, {
    file: clip.file,
    bytes: clip.bytes as number,
    sha256: (clip.sha256 as string).toLowerCase(),
  });
}

export const audioFiles: AudioFileCatalogEntry[] = [...filesByName.values()];
export const audioTotalBytes = audioFiles.reduce((total, file) => total + file.bytes, 0);
