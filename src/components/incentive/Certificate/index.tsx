/** A shareable learning-milestone certificate. */

import { useCallback, useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import styles from './Certificate.module.css';

export interface CertificateProps {
  studentName: string;
  buddyName: string;
  level: number;
  storiesCompleted: number;
  magicPower: number;
  streakDays: number;
  date: string;
  onError?: (message: string) => void;
}

const filenameDate = (date: string) => date.replace(/[^\d]+/gu, '-').replace(/^-|-$/gu, '') || 'today';

const createImage = async (element: HTMLElement) => {
  const scale = Math.min(3, Math.max(2, window.devicePixelRatio || 1));
  return html2canvas(element, {
    backgroundColor: '#fffdf6',
    scale,
    useCORS: true,
    onclone: document => {
      document.documentElement.classList.add('certificateExport');
    },
  });
};

export const Certificate: React.FC<CertificateProps> = ({
  studentName,
  buddyName,
  level,
  storiesCompleted,
  magicPower,
  streakDays,
  date,
  onError,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const savingRef = useRef(false);
  const captureRef = useRef(0);
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    captureRef.current += 1;
    setPreviewUrl(null);
    return () => {
      captureRef.current += 1;
      savingRef.current = false;
      document.body.classList.remove('certificatePrintActive');
    };
  }, [studentName]);

  const handleSaveAsImage = useCallback(async () => {
    if (!certificateRef.current || savingRef.current) return;
    savingRef.current = true;
    const capture = ++captureRef.current;
    setIsSaving(true);
    onError?.('');
    try {
      const canvas = await createImage(certificateRef.current);
      const imageUrl = canvas.toDataURL('image/png');
      if (capture !== captureRef.current) return;
      setPreviewUrl(imageUrl);

      const link = document.createElement('a');
      link.download = `magic-english-buddy-certificate-${filenameDate(date)}.png`;
      link.href = imageUrl;
      link.click();
    } catch {
      if (capture === captureRef.current) onError?.('图片没有生成成功，请稍后重试。');
    } finally {
      if (capture === captureRef.current) setIsSaving(false);
      savingRef.current = false;
    }
  }, [date, onError]);

  const handlePrint = useCallback(() => {
    const media = window.matchMedia?.('print');
    const clearPrintMode = () => {
      document.body.classList.remove('certificatePrintActive');
      window.removeEventListener('afterprint', clearPrintMode);
      media?.removeEventListener?.('change', onMediaChange);
    };
    const onMediaChange = (event: MediaQueryListEvent) => {
      if (!event.matches) clearPrintMode();
    };
    document.body.classList.add('certificatePrintActive');
    window.addEventListener('afterprint', clearPrintMode);
    media?.addEventListener?.('change', onMediaChange);
    window.print();
  }, []);

  return (
    <div className={styles.container}>
      <div ref={certificateRef} className={styles.certificate} aria-label={`${studentName}的学习里程碑证书`}>
        <div className={styles.border} aria-hidden="true">
          <span className={styles.cornerTL}>✦</span><span className={styles.cornerTR}>✦</span>
          <span className={styles.cornerBL}>✦</span><span className={styles.cornerBR}>✦</span>
        </div>
        <header className={styles.header}>
          <span className={styles.badge} aria-hidden="true">📚</span>
          <p className={styles.kicker}>MAGIC ENGLISH BUDDY</p>
          <h1 className={styles.title}>学习里程碑证书</h1>
          <p className={styles.subtitle}>LEARNING MILESTONE</p>
        </header>
        <div className={styles.content}>
          <p className={styles.hereby}>这份记录属于</p>
          <p className={styles.name}>{studentName}</p>
          <p className={styles.buddy}>和学习伙伴 {buddyName}</p>
          <p className={styles.achievement}>已完成 {storiesCompleted} 节课程，留下了认真学习的足迹。</p>
        </div>
        <div className={styles.stats} aria-label="本档案学习统计">
          <div className={styles.statItem}><span aria-hidden="true">⭐</span><strong>L{level}</strong><small>当前等级</small></div>
          <div className={styles.statItem}><span aria-hidden="true">📖</span><strong>{storiesCompleted}</strong><small>完成课程</small></div>
          <div className={styles.statItem}><span aria-hidden="true">✨</span><strong>{magicPower}</strong><small>魔力值</small></div>
          <div className={styles.statItem}><span aria-hidden="true">🔥</span><strong>{streakDays}</strong><small>连续学习天数</small></div>
        </div>
        <footer className={styles.footer}>
          <div className={styles.seal} aria-hidden="true"><span>✦</span><small>LEARN</small></div>
          <div className={styles.dateSection}><p>记录日期：{date}</p><small>本地学习记录</small></div>
        </footer>
      </div>
      <div className={styles.actions}>
        <button className={styles.secondaryAction} type="button" onClick={handlePrint} disabled={isSaving}>🖨️ 打印证书</button>
        <button className={styles.primaryAction} type="button" onClick={() => void handleSaveAsImage()} disabled={isSaving}>
          {isSaving ? '正在生成图片…' : '💾 保存 PNG'}
        </button>
      </div>
      {previewUrl && (
        <section className={styles.preview} aria-labelledby="certificate-preview-title">
          <h2 id="certificate-preview-title">已生成图片</h2>
          <p>在 iPhone 上可长按下方图片保存到照片。</p>
          <img src={previewUrl} alt={`${studentName}的学习里程碑证书图片预览`} />
        </section>
      )}
    </div>
  );
};

export default Certificate;
