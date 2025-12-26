/**
 * 阅读器页面
 * P0-3 阶段实现核心功能
 */

import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './ReaderPage.module.css';

const ReaderPage: React.FC = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();

  // 临时：模拟故事数据
  const mockStory = {
    id: storyId,
    title: 'The Magic Apple',
    titleCn: '魔法苹果',
    content: [
      {
        text: 'Once upon a time, there was a red apple.',
        translation: '从前，有一个红苹果。',
      },
      {
        text: 'The apple was very big and shiny.',
        translation: '这个苹果非常大，非常闪亮。',
      },
      {
        text: 'A little rabbit found the apple.',
        translation: '一只小兔子发现了这个苹果。',
      },
    ],
  };

  const handleBack = () => {
    navigate('/map');
  };

  const handleFinish = () => {
    navigate(`/quiz/${storyId}`);
  };

  return (
    <div className={styles.container}>
      {/* 顶部栏 */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={handleBack}>
          ← 返回
        </button>
        <h1 className={styles.title}>{mockStory.title}</h1>
        <button className={styles.speedBtn}>1.0x</button>
      </header>

      {/* 故事内容区 */}
      <main className={styles.content}>
        {/* 插图区域 - 占位 */}
        <div className={styles.illustration}>
          <span className={styles.illustrationEmoji}>🍎</span>
        </div>

        {/* 文本区域 */}
        <div className={styles.textArea}>
          {mockStory.content.map((paragraph, index) => (
            <motion.div
              key={index}
              className={styles.paragraph}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <p className={styles.englishText}>
                {paragraph.text.split(' ').map((word, wordIndex) => (
                  <span
                    key={wordIndex}
                    className={styles.word}
                    onClick={() => {
                      // TODO: 实现点击发音和查词
                      console.log('Clicked word:', word);
                    }}
                  >
                    {word}{' '}
                  </span>
                ))}
              </p>
              <p className={styles.translation}>{paragraph.translation}</p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* 控制栏 */}
      <footer className={styles.controls}>
        <button className={styles.controlBtn}>
          <span>▶️</span>
          <span>播放</span>
        </button>
        <button className={styles.controlBtn}>
          <span>🎤</span>
          <span>跟读</span>
        </button>
        <button className={styles.controlBtn}>
          <span>📖</span>
          <span>翻译</span>
        </button>
        <button className={styles.finishBtn} onClick={handleFinish}>
          完成阅读 →
        </button>
      </footer>
    </div>
  );
};

export default ReaderPage;

