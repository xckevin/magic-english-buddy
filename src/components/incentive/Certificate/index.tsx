/**
 * Certificate 组件
 * 可打印的荣誉证书
 */

import React, { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { Button } from '@/components/common';
import styles from './Certificate.module.css';

interface CertificateProps {
  /** 学员姓名 */
  studentName: string;
  /** 伙伴名称 */
  buddyName: string;
  /** 等级 */
  level: number;
  /** 已完成故事数 */
  storiesCompleted: number;
  /** 魔力值 */
  magicPower: number;
  /** 连续学习天数 */
  streakDays: number;
  /** 颁发日期 */
  date?: string;
}

export const Certificate: React.FC<CertificateProps> = ({
  studentName,
  buddyName,
  level,
  storiesCompleted,
  magicPower,
  streakDays,
  date = new Date().toLocaleDateString('zh-CN'),
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  // 保存为图片
  const handleSaveAsImage = useCallback(async () => {
    if (!certificateRef.current) return;

    try {
      const canvas = await html2canvas(certificateRef.current, {
        backgroundColor: '#0d0d1a',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = `${studentName}-魔法证书-${date}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to save certificate:', error);
    }
  }, [studentName, date]);

  // 打印
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className={styles.container}>
      {/* 证书主体 */}
      <div ref={certificateRef} className={styles.certificate}>
        {/* 装饰边框 */}
        <div className={styles.border}>
          <div className={styles.cornerTL}>✨</div>
          <div className={styles.cornerTR}>✨</div>
          <div className={styles.cornerBL}>✨</div>
          <div className={styles.cornerBR}>✨</div>
        </div>

        {/* 标题 */}
        <div className={styles.header}>
          <div className={styles.badge}>🏆</div>
          <h1 className={styles.title}>荣誉证书</h1>
          <h2 className={styles.subtitle}>CERTIFICATE OF ACHIEVEMENT</h2>
        </div>

        {/* 内容 */}
        <div className={styles.content}>
          <p className={styles.hereby}>兹证明</p>
          <p className={styles.name}>{studentName}</p>
          <p className={styles.buddy}>与魔法伙伴 {buddyName}</p>
          <p className={styles.achievement}>
            在魔法英语世界中完成了卓越的学习旅程
          </p>
        </div>

        {/* 成就数据 */}
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>⭐</span>
            <span className={styles.statValue}>L{level}</span>
            <span className={styles.statLabel}>魔法等级</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>📖</span>
            <span className={styles.statValue}>{storiesCompleted}</span>
            <span className={styles.statLabel}>完成故事</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>✨</span>
            <span className={styles.statValue}>{magicPower}</span>
            <span className={styles.statLabel}>魔力值</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>🔥</span>
            <span className={styles.statValue}>{streakDays}</span>
            <span className={styles.statLabel}>连续天数</span>
          </div>
        </div>

        {/* 底部 */}
        <div className={styles.footer}>
          <div className={styles.seal}>
            <span>🌟</span>
            <span className={styles.sealText}>Magic</span>
          </div>
          <div className={styles.dateSection}>
            <p className={styles.date}>颁发日期：{date}</p>
            <p className={styles.app}>Magic English Buddy</p>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <motion.div
        className={styles.actions}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button variant="secondary" onClick={handlePrint}>
          🖨️ 打印证书
        </Button>
        <Button variant="primary" onClick={handleSaveAsImage}>
          💾 保存图片
        </Button>
      </motion.div>
    </div>
  );
};

export default Certificate;

