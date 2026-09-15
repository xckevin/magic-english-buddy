import { useEffect, useState, useSyncExternalStore } from 'react';
import { audioDownloadService } from '@/services/audioDownloadService';
import styles from './OfflineAudioSettings.module.css';

const size = (bytes: number) => `${(bytes / 1_000_000).toFixed(1)} MB`;

export function OfflineAudioSettings({ showIOSInstallNote = false }: { showIOSInstallNote?: boolean }) {
  const state = useSyncExternalStore(
    audioDownloadService.subscribe,
    audioDownloadService.getSnapshot
  );
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const updateOnline = () => setOnline(navigator.onLine);
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  }, []);

  const busy = state.phase !== 'idle';
  const complete = state.totalFiles > 0 && state.downloadedFiles === state.totalFiles;
  const disabled = busy || state.checking || !state.supported;

  return (
    <section className={styles.section} aria-labelledby="offline-audio-heading">
      <h2 id="offline-audio-heading">离线音频（可选）</h2>
      <div className={styles.panel}>
        <p className={styles.intro}>
          下载后，故事朗读、听题和查词发音可离线使用。未下载时可联网播放。
        </p>
        {showIOSInstallNote && (
          <p className={styles.intro}>
            <strong>想从主屏幕离线使用？</strong>
            <br />
            建议先通过 Safari 分享菜单添加到主屏幕，再从主屏幕打开并下载音频。
            Safari 与主屏幕版的学习记录、下载音频分别保存，不会自动互通。
          </p>
        )}
        <div className={styles.summary}>
          <div>
            <strong>全部音频 {size(state.totalBytes)}</strong>
            <p>
              本机占用 {size(state.storedBytes)} · {state.downloadedFiles} / {state.totalFiles}{' '}
              个音频可用
            </p>
          </div>
          <div className={styles.actions}>
            {state.phase === 'downloading' || state.phase === 'cancelling' ? (
              <button
                type="button"
                onClick={() => audioDownloadService.cancel()}
                disabled={state.phase === 'cancelling'}
                className={styles.primary}
              >
                {state.phase === 'cancelling' ? '暂停中…' : '暂停下载'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void audioDownloadService.download('all')}
                disabled={disabled || !online || complete || state.totalFiles === 0}
                className={styles.primary}
              >
                {complete ? '已全部下载' : '下载全部音频'}
              </button>
            )}
            <button
              type="button"
              onClick={() => void audioDownloadService.remove('all')}
              disabled={disabled || !state.hasStoredAudio}
            >
              {state.phase === 'removing' ? '删除中…' : '删除全部音频'}
            </button>
          </div>
        </div>
        {state.checking && <p role="status">正在检查本机音频…</p>}
        {!state.supported && (
          <p role="status">当前浏览器不支持离线音频下载，请换用新版浏览器。仍可联网播放。</p>
        )}
        {!online && <p role="status">当前离线，已保存的音频仍可播放。联网后可以继续下载。</p>}
        {state.error && (
          <p role="alert" className={styles.error}>
            {state.error}
          </p>
        )}
        {state.hasStoredAudio &&
          (state.storedBytes > state.downloadedBytes || state.downloadedFiles === 0) && (
            <p className={styles.note}>
              本机还存有旧版或不可用的音频，可用“删除全部音频”释放空间。
            </p>
          )}
        {busy && (
          <p role="status">
            {state.phase === 'removing'
              ? '正在释放音频空间…'
              : state.phase === 'cancelling'
                ? '正在暂停，已完成的部分会保留。'
                : '正在下载音频，请保持页面打开。已完成的部分会保留。'}
          </p>
        )}
        <ul className={styles.packs}>
          {state.packs.map(pack => {
            const label = pack.level ? `L${pack.level} 音频` : '词典发音';
            const active = state.activePackId === pack.id || state.activePackId === 'all';
            return (
              <li key={pack.id} aria-label={`${label}包`} className={styles.pack}>
                <div className={styles.packHeading}>
                  <div>
                    <h3>{pack.title}</h3>
                    <p>
                      {pack.storyCount > 0 ? `${pack.storyCount} 篇课程 · ` : ''}
                      {size(pack.bytes)}
                    </p>
                  </div>
                  <span className={pack.complete ? styles.ready : styles.status}>
                    {pack.complete
                      ? '可离线使用'
                      : pack.downloadedFiles > 0
                        ? '已下载一部分'
                        : '未下载'}
                  </span>
                </div>
                <progress
                  aria-label={`${label}下载进度`}
                  value={pack.downloadedBytes}
                  max={pack.bytes || 1}
                />
                <div className={styles.packFooter}>
                  <small>
                    {pack.downloadedFiles} / {pack.files.length} 个音频
                  </small>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      aria-label={`下载 ${label}`}
                      onClick={() => void audioDownloadService.download(pack.id)}
                      disabled={disabled || !online || (pack.complete && pack.selected)}
                    >
                      {active && state.phase === 'downloading'
                        ? '下载中…'
                        : pack.complete
                          ? pack.selected
                            ? '已下载'
                            : '保留此包'
                          : pack.downloadedFiles > 0
                            ? '继续下载'
                            : '下载'}
                    </button>
                    <button
                      type="button"
                      aria-label={`删除 ${label}`}
                      onClick={() => void audioDownloadService.remove(pack.id)}
                      disabled={disabled || !pack.selected}
                    >
                      删除
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <p className={styles.note}>
          建议连接 Wi-Fi 下载。暂停或关闭页面后，已完成的部分会保留，下次可继续。
        </p>
        <p className={styles.note}>
          共用片段只占一份空间；删除一个包时，其他包需要的片段会保留。学习进度不会受影响。
        </p>
        {state.downloadedFiles > 0 && state.persistent === false && (
          <p className={styles.note}>
            浏览器可能在空间不足时清理音频，出门前可以在这里检查下载状态。
          </p>
        )}
      </div>
    </section>
  );
}
