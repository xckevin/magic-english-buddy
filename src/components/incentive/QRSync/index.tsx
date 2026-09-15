/** 本设备共同学习记录的导出组件。 */

import { useCallback, useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { generateQRContent, generateProgressReport } from '@/services/qrSyncService';
import styles from './QRSync.module.css';

interface QRSyncProps {
  userId: string;
  userName?: string;
}

export const QRSync: React.FC<QRSyncProps> = ({ userId, userName }) => {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [report, setReport] = useState('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const generationRef = useRef(0);
  const copiedTimerRef = useRef<number | null>(null);

  const clearCopyMessage = useCallback(() => {
    if (copiedTimerRef.current !== null) window.clearTimeout(copiedTimerRef.current);
    copiedTimerRef.current = null;
    setCopyMessage(null);
  }, []);

  const generateExport = useCallback(async () => {
    const generation = ++generationRef.current;
    setIsGenerating(true);
    setGenerationError(null);
    setQrDataUrl('');
    setReport('');
    clearCopyMessage();

    try {
      const [content, reportText] = await Promise.all([
        generateQRContent(userId),
        generateProgressReport(userId),
      ]);
      if (!content) throw new Error('No exportable progress found');
      const dataUrl = await QRCode.toDataURL(content, {
        width: 200,
        margin: 2,
        color: { dark: '#4c347c', light: '#ffffff' },
      });

      if (generation !== generationRef.current) return;
      setQrDataUrl(dataUrl);
      setReport(reportText);
    } catch {
      if (generation !== generationRef.current) return;
      setGenerationError('暂时无法生成导出记录，请稍后重试。');
    } finally {
      if (generation === generationRef.current) setIsGenerating(false);
    }
  }, [clearCopyMessage, userId]);

  useEffect(() => {
    void generateExport();
    return () => {
      generationRef.current += 1;
    };
  }, [generateExport]);

  useEffect(
    () => () => {
      if (copiedTimerRef.current !== null) window.clearTimeout(copiedTimerRef.current);
    },
    []
  );

  const handleCopyReport = useCallback(async () => {
    if (!report) return;
    const generation = generationRef.current;
    clearCopyMessage();
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(report);
      if (generation !== generationRef.current) return;
      setCopyMessage('学习摘要已复制。');
      copiedTimerRef.current = window.setTimeout(() => setCopyMessage(null), 2200);
    } catch {
      if (generation !== generationRef.current) return;
      setCopyMessage('无法自动复制。请选中下方文字后手动复制。');
    }
  }, [clearCopyMessage, report]);

  const handleSaveQR = useCallback(() => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `magic-buddy-${userName || 'progress'}-export.png`;
    link.href = qrDataUrl;
    link.click();
  }, [qrDataUrl, userName]);

  return (
    <div className={styles.container}>
      <p className={styles.sharedNote}>
        这台共用设备上的学习记录会保存在这里，大家可以一起查看和积累。
      </p>

      <section className={styles.card} aria-labelledby="export-code-title">
        <div className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>本地导出</p>
            <h3 id="export-code-title">导出记录二维码</h3>
          </div>
        </div>
        <p className={styles.description}>
          可保存当前记录的二维码快照。当前版本尚不支持扫码查看或恢复；给别人查看时，请复制下方的学习摘要。
        </p>

        {isGenerating ? (
          <div className={styles.loading} role="status">
            <span className={styles.spinner} aria-hidden="true" />
            正在整理导出记录…
          </div>
        ) : generationError ? (
          <div className={styles.errorState} role="alert">
            <p>{generationError}</p>
            <button
              className={styles.secondaryAction}
              type="button"
              onClick={() => void generateExport()}
            >
              重新生成
            </button>
          </div>
        ) : (
          <>
            <div className={styles.qrWrapper}>
              <img
                src={qrDataUrl}
                alt="本设备学习记录的导出二维码，普通扫码无法直接查看"
                className={styles.qrImage}
              />
            </div>
            <button
              className={styles.secondaryAction}
              type="button"
              onClick={handleSaveQR}
              disabled={!qrDataUrl}
            >
              保存导出码图片
            </button>
          </>
        )}
      </section>

      <section className={styles.card} aria-labelledby="report-title">
        <div className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>可分享文本</p>
            <h3 id="report-title">学习摘要</h3>
          </div>
        </div>
        <p className={styles.description}>
          需要告诉老师或家长学习情况时，可以复制或手动选中这段文字。
        </p>
        <textarea
          className={styles.reportText}
          value={report}
          readOnly
          aria-label="可复制的学习摘要"
          placeholder={isGenerating ? '正在生成学习摘要…' : '学习摘要暂不可用'}
        />
        <div className={styles.reportActions}>
          <button
            className={styles.primaryAction}
            type="button"
            onClick={() => void handleCopyReport()}
            disabled={!report || isGenerating}
          >
            {copyMessage === '学习摘要已复制。' ? '已复制' : '复制学习摘要'}
          </button>
        </div>
        {copyMessage && (
          <p className={styles.copyMessage} role="status">
            {copyMessage}
          </p>
        )}
      </section>
    </div>
  );
};

export default QRSync;
