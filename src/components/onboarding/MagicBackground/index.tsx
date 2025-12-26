/**
 * MagicBackground 组件
 * 引导页魔法背景动画：星空、流星、极光效果
 */

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import styles from './MagicBackground.module.css';

interface MagicBackgroundProps {
  /** 动画强度 (0-1) */
  intensity?: number;
  /** 主题色调 */
  theme?: 'purple' | 'blue' | 'green';
}

export const MagicBackground: React.FC<MagicBackgroundProps> = ({
  intensity = 0.5,
  theme = 'purple',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 星星动画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置 canvas 尺寸
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // 星星数据
    const stars: Array<{
      x: number;
      y: number;
      size: number;
      speed: number;
      alpha: number;
      twinkle: number;
    }> = [];

    // 生成星星
    const starCount = Math.floor(100 * intensity);
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
        alpha: Math.random(),
        twinkle: Math.random() * 0.02,
      });
    }

    // 流星数据
    const meteors: Array<{
      x: number;
      y: number;
      length: number;
      speed: number;
      alpha: number;
      active: boolean;
    }> = [];

    // 添加流星
    const addMeteor = () => {
      if (Math.random() > 0.995 && meteors.length < 3) {
        meteors.push({
          x: Math.random() * canvas.width,
          y: 0,
          length: Math.random() * 80 + 50,
          speed: Math.random() * 8 + 6,
          alpha: 1,
          active: true,
        });
      }
    };

    // 动画循环
    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制星星
      stars.forEach(star => {
        star.alpha += star.twinkle;
        if (star.alpha > 1 || star.alpha < 0.3) {
          star.twinkle = -star.twinkle;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * intensity})`;
        ctx.fill();

        // 缓慢移动
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
      });

      // 添加和更新流星
      addMeteor();
      meteors.forEach((meteor, index) => {
        if (!meteor.active) return;

        const gradient = ctx.createLinearGradient(
          meteor.x, meteor.y,
          meteor.x - meteor.length * 0.7, meteor.y - meteor.length
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${meteor.alpha})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(meteor.x - meteor.length * 0.7, meteor.y - meteor.length);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();

        meteor.x += meteor.speed;
        meteor.y += meteor.speed;
        meteor.alpha -= 0.01;

        if (meteor.alpha <= 0 || meteor.y > canvas.height) {
          meteors.splice(index, 1);
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [intensity]);

  // 主题颜色
  const themeColors = {
    purple: {
      primary: 'rgba(107, 92, 231, 0.3)',
      secondary: 'rgba(147, 51, 234, 0.2)',
      accent: 'rgba(255, 107, 157, 0.15)',
    },
    blue: {
      primary: 'rgba(59, 130, 246, 0.3)',
      secondary: 'rgba(6, 182, 212, 0.2)',
      accent: 'rgba(34, 211, 238, 0.15)',
    },
    green: {
      primary: 'rgba(34, 197, 94, 0.3)',
      secondary: 'rgba(16, 185, 129, 0.2)',
      accent: 'rgba(52, 211, 153, 0.15)',
    },
  };

  const colors = themeColors[theme];

  return (
    <div className={styles.background}>
      {/* 渐变背景 */}
      <div className={styles.gradient} />

      {/* 星星 Canvas */}
      <canvas ref={canvasRef} className={styles.stars} />

      {/* 极光效果 */}
      <motion.div
        className={styles.aurora}
        style={{ background: `linear-gradient(180deg, ${colors.primary} 0%, transparent 100%)` }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scaleX: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className={`${styles.aurora} ${styles.aurora2}`}
        style={{ background: `linear-gradient(180deg, ${colors.secondary} 0%, transparent 100%)` }}
        animate={{
          opacity: [0.2, 0.5, 0.2],
          scaleX: [1.2, 1, 1.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      {/* 漂浮光球 */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className={styles.orb}
          style={{
            left: `${20 + i * 15}%`,
            background: i % 2 === 0 ? colors.primary : colors.accent,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, i % 2 === 0 ? 20 : -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );
};

export default MagicBackground;

