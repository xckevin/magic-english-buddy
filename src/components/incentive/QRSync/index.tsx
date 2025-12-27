/**
 * QRSync 组件
 * 二维码同步展示
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import { generateQRContent, generateProgressReport } from '@/services/qrSyncService';
import { Button } from '@/components/common';
import styles from './QRSync.module.css';

interface QRSyncProps {
  userId: string;
  userName?: string;
}

export const QRSync: React.FC<QRSyncProps> = ({ userId, userName }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // 生成二维码
  useEffect(() => {
    const generateQR = async () => {
      setLoading(true);
      try {
        const content = await generateQRContent(userId);
        if (content) {
          const dataUrl = await QRCode.toDataURL(content, {
            width: 200,
            margin: 2,
            color: {
              dark: '#6B5CE7',
              light: '#ffffff',
            },
          });
          setQrDataUrl(dataUrl);
        }

        // 生成报告
        const reportText = await generateProgressReport(userId);
        setReport(reportText);
      } catch (error) {
        console.error('Failed to generate QR code:', error);
      } finally {
        setLoading(false);
      }
    };

    generateQR();
  }, [userId]);

  // 复制报告
  const handleCopyReport = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [report]);

  // 保存二维码
  const handleSaveQR = useCallback(() => {
    if (qrDataUrl) {
      const link = document.createElement('a');
      link.download = `magic-buddy-${userName || 'progress'}.png`;
      link.href = qrDataUrl;
      link.click();
    }
  }, [qrDataUrl, userName]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>正在生成同步码...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 二维码 */}
      <motion.div
        className={styles.qrSection}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h3 className={styles.title}>📱 扫码同步进度</h3>
        <p className={styles.description}>
          让家长或老师扫描二维码查看学习进度
        </p>
        
        {qrDataUrl ? (
          <div className={styles.qrWrapper}>
            <img src={qrDataUrl} alt="同步二维码" className={styles.qrImage} />
          </div>
        ) : (
          <div className={styles.qrPlaceholder}>
            <span>无法生成二维码</span>
          </div>
        )}

        <div className={styles.actions}>
          <Button variant="secondary" onClick={handleSaveQR}>
            💾 保存图片
          </Button>
        </div>
      </motion.div>

      {/* 报告预览 */}
      <motion.div
        className={styles.reportSection}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className={styles.title}>📄 学习报告</h3>
        <pre className={styles.reportText}>{report}</pre>
        
        <Button 
          variant="primary" 
          onClick={handleCopyReport}
        >
          {copied ? '✅ 已复制' : '📋 复制报告'}
        </Button>
      </motion.div>
    </div>
  );
};

export default QRSync;

