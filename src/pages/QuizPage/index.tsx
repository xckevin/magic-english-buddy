/**
 * Quiz 练习页面
 * P1-6 阶段实现完整功能
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './QuizPage.module.css';

const QuizPage: React.FC = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // 临时：模拟 Quiz 数据
  const mockQuiz = [
    {
      id: 'q1',
      type: 'image_choice',
      question: 'What color is the apple?',
      options: [
        { emoji: '🔴', value: 'red', label: 'Red' },
        { emoji: '🔵', value: 'blue', label: 'Blue' },
        { emoji: '🟢', value: 'green', label: 'Green' },
      ],
      correct: 'red',
    },
    {
      id: 'q2',
      type: 'image_choice',
      question: 'Who found the apple?',
      options: [
        { emoji: '🐰', value: 'rabbit', label: 'Rabbit' },
        { emoji: '🐱', value: 'cat', label: 'Cat' },
        { emoji: '🐶', value: 'dog', label: 'Dog' },
      ],
      correct: 'rabbit',
    },
    {
      id: 'q3',
      type: 'image_choice',
      question: 'How was the apple?',
      options: [
        { emoji: '✨', value: 'shiny', label: 'Shiny' },
        { emoji: '😢', value: 'sad', label: 'Sad' },
        { emoji: '😴', value: 'sleepy', label: 'Sleepy' },
      ],
      correct: 'shiny',
    },
  ];

  const currentQ = mockQuiz[currentQuestion];
  const isLastQuestion = currentQuestion === mockQuiz.length - 1;

  const handleAnswer = (answer: string) => {
    if (answered) return;

    setSelectedAnswer(answer);
    setAnswered(true);

    if (answer === currentQ.correct) {
      setScore(score + 1);
    }

    // 延迟后进入下一题
    setTimeout(() => {
      if (isLastQuestion) {
        // 完成所有题目
        navigate('/map');
      } else {
        setCurrentQuestion(currentQuestion + 1);
        setAnswered(false);
        setSelectedAnswer(null);
      }
    }, 1500);
  };

  const handleBack = () => {
    navigate('/map');
  };

  return (
    <div className={styles.container}>
      {/* 顶部进度 */}
      <header className={styles.header}>
        <button className={styles.closeBtn} onClick={handleBack}>
          ✕
        </button>
        <div className={styles.progressBar}>
          {mockQuiz.map((_, index) => (
            <div
              key={index}
              className={`${styles.progressDot} ${
                index < currentQuestion
                  ? styles.completed
                  : index === currentQuestion
                  ? styles.current
                  : ''
              }`}
            />
          ))}
        </div>
        <div className={styles.scoreDisplay}>
          ⭐ {score}/{mockQuiz.length}
        </div>
      </header>

      {/* 问题区域 */}
      <main className={styles.quizArea}>
        <motion.div
          key={currentQ.id}
          className={styles.questionCard}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <h2 className={styles.question}>{currentQ.question}</h2>

          <div className={styles.options}>
            {currentQ.options.map((option) => {
              const isCorrect = option.value === currentQ.correct;
              const isSelected = option.value === selectedAnswer;

              return (
                <motion.button
                  key={option.value}
                  className={`${styles.optionBtn} ${
                    answered
                      ? isCorrect
                        ? styles.correct
                        : isSelected
                        ? styles.wrong
                        : ''
                      : ''
                  }`}
                  onClick={() => handleAnswer(option.value)}
                  disabled={answered}
                  whileTap={!answered ? { scale: 0.95 } : {}}
                >
                  <span className={styles.optionEmoji}>{option.emoji}</span>
                  <span className={styles.optionLabel}>{option.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </main>

      {/* Buddy 提示 */}
      <footer className={styles.buddyArea}>
        <div className={styles.buddyAvatar}>🐣</div>
        <div className={styles.buddyMessage}>
          {answered
            ? selectedAnswer === currentQ.correct
              ? '太棒了！答对了！🎉'
              : '没关系，继续加油！💪'
            : '仔细想想，选择正确答案吧～'}
        </div>
      </footer>
    </div>
  );
};

export default QuizPage;

