import { useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@/components/common/Modal';
import { useAppStore } from '@/stores/useAppStore';
import {
  exportBackup,
  parseBackup,
  restoreBackup,
  MAX_BACKUP_BYTES,
  type LearningBackup,
} from '@/services/backupService';
import { announceBackupRestore } from '@/services/backupWindowSync';
import styles from './BackupSettings.module.css';

function saveFile(text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `magic-buddy-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export function BackupSettings() {
  const heading = useId();
  const input = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [backup, setBackup] = useState<LearningBackup | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { currentUserId, settings } = useAppStore();
  const run = async (action: () => Promise<void>) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await action();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : '操作没有完成，请重试。');
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };
  const download = () =>
    run(async () => {
      if (!currentUserId) throw new Error('当前还没有学习记录，可以先选择备份文件恢复。');
      saveFile(await exportBackup(currentUserId, settings));
      setMessage('已生成备份，请在下载列表或“文件”中确认保存成功。');
    });
  const choose = (file?: File) =>
    run(async () => {
      setBackup(null);
      setConfirmed(false);
      if (!file) return;
      if (file.size > MAX_BACKUP_BYTES) throw new Error('备份文件超过 20 MB，请选择较小的备份。');
      setBackup(parseBackup(await file.text()));
    });
  const restore = () =>
    run(async () => {
      if (!backup || !confirmed) throw new Error('请先确认要用备份替换当前学习记录。');
      await restoreBackup(backup);
      // DB commit must finish before publishing the restored profile to the UI.
      try {
        useAppStore.setState({
          currentUserId: backup.currentUserId,
          isFirstLaunch: false,
          settings: backup.settings,
          currentStoryId: null,
          currentParagraphIndex: 0,
          activeWordIndex: null,
          currentQuizIndex: 0,
          quizAnswers: {},
        });
      } catch {
        // Records were committed even if localStorage preference persistence is unavailable.
        setBackup(null);
        announceBackupRestore(backup);
        setMessage('学习记录已恢复。浏览器未能保存页面偏好，请重新打开应用查看记录。');
        return;
      }
      setBackup(null);
      announceBackupRestore(backup);
      navigate('/map', { replace: true });
    });
  return (
    <section className={styles.section} aria-labelledby={heading}>
      <h2 id={heading}>学习备份与恢复</h2>
      <p>保存进度、卡牌、成就和未完成练习。在另一台设备或主屏幕版中选择同一文件即可恢复。</p>
      <p className={styles.note}>
        课程音频单独下载，临时跟读录音不随备份迁移。备份保存在你选择的位置，不会上传。
      </p>
      <div className={styles.actions}>
        <button type="button" onClick={() => void download()} disabled={busy || !currentUserId}>
          导出学习备份
        </button>
        <button type="button" onClick={() => input.current?.click()} disabled={busy}>
          选择备份文件
        </button>
      </div>
      <input
        ref={input}
        type="file"
        accept=".json,application/json"
        aria-label="选择学习备份文件"
        className={styles.file}
        onChange={event => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = '';
          void choose(file);
        }}
      />
      {message && <p role="status">{message}</p>}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <Modal
        open={!!backup}
        title="恢复学习备份"
        onClose={() => !busy && setBackup(null)}
        closeOnOverlay={!busy}
        closeOnEsc={!busy}
        showCloseButton={!busy}
      >
        {backup && (
          <form
            onSubmit={event => {
              event.preventDefault();
              void restore();
            }}
            className={styles.preview}
          >
            <p>备份时间：{new Date(backup.createdAt).toLocaleString('zh-CN')}</p>
            <p>学习档案（{backup.users.length} 个）：{backup.users.map(user => user.name).join('、')}</p>
            <p>恢复后打开：{backup.users.find(user => user.id === backup.currentUserId)?.name}</p>
            <p>
              当前档案 {backup.mapStates.filter(node => node.completed).length} 个已完成关卡 ·{' '}
              {backup.userVocabulary.length} 个收藏词 · {backup.quizDrafts.length} 份未完成练习
            </p>
            {backup.version === 1 && <p>旧版共同地图记录会保留在恢复后打开的档案中，其他档案保留各自已有记录。</p>}
            <p>
              恢复会替换本设备当前的学习记录。已下载音频会保留。需要保留当前记录时，请先导出备份。
            </p>
            {currentUserId && (
              <button type="button" onClick={() => void download()} disabled={busy}>
                先导出当前记录
              </button>
            )}
            <label>
              <input
                type="checkbox"
                checked={confirmed}
                onChange={event => setConfirmed(event.target.checked)}
                required
                disabled={busy}
              />
              我确认用这份备份替换当前学习记录
            </label>
            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
            <div className={styles.actions}>
              <button type="button" onClick={() => setBackup(null)} disabled={busy}>
                取消
              </button>
              <button type="submit" disabled={busy}>
                {busy ? '处理中…' : '确认恢复'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </section>
  );
}
