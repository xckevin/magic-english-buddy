/**
 * QuizPage 练习页面
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db, type QuizItem } from '@/db';
import { QuizContainer, type QuizResultData } from '@/components/quiz';
import { Loading } from '@/components/common';
import { useAppStore } from '@/stores/useAppStore';
import styles from './QuizPage.module.css';

// 示例题目数据
const sampleQuestions: QuizItem[] = [
  {
    id: 'q1',
    type: 'image_choice',
    question: 'apple',
    audioQuestion: '🍎',
    options: [
      { image: '🍎', value: 'apple' },
      { image: '🍌', value: 'banana' },
      { image: '🍊', value: 'orange' },
      { image: '🍇', value: 'grape' },
    ],
    correctAnswer: 'apple',
  },
  {
    id: 'q2',
    type: 'word_builder',
    question: '拼出这个单词',
    audioQuestion: '🐱',
    shuffledWords: ['c', 'a', 't'],
    correctAnswer: 'cat',
  },
  {
    id: 'q3',
    type: 'image_choice',
    question: 'dog',
    audioQuestion: '🐶',
    options: [
      { image: '🐱', value: 'cat' },
      { image: '🐶', value: 'dog' },
      { image: '🐰', value: 'rabbit' },
      { image: '🐸', value: 'frog' },
    ],
    correctAnswer: 'dog',
  },
  {
    id: 'q4',
    type: 'sentence_order',
    question: '排列成正确的句子',
    shuffledWords: ['is', 'This', 'apple', 'an'],
    correctOrder: ['This', 'is', 'an', 'apple'],
    correctAnswer: 'This is an apple',
  },
  {
    id: 'q5',
    type: 'word_builder',
    question: '拼出这个单词',
    audioQuestion: '🌙',
    shuffledWords: ['m', 'o', 'o', 'n'],
    correctAnswer: 'moon',
  },
];

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const { storyId } = useParams<{ storyId: string }>();
  const { currentUser } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizItem[]>([]);

  // 加载题目
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        // 尝试从数据库加载题目
        if (storyId) {
          const story = await db.stories.get(storyId);
          if (story?.quiz && story.quiz.length > 0) {
            setQuestions(story.quiz);
          } else {
            // 使用示例题目
            setQuestions(sampleQuestions);
          }
        } else {
          setQuestions(sampleQuestions);
        }
      } catch (error) {
        console.error('Failed to load questions:', error);
        setQuestions(sampleQuestions);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [storyId]);

  // 完成 Quiz
  const handleComplete = useCallback(async (result: QuizResultData) => {
    try {
      // 保存结果到数据库
      if (currentUser && storyId) {
        await db.quizHistory.add({
          id: crypto.randomUUID(),
          userId: currentUser.id,
          storyId,
          quizType: 'story_quiz',
          questions: result.answers.map(a => ({
            questionId: a.questionId,
            userAnswer: a.userAnswer,
            correctAnswer: '',
            isCorrect: a.isCorrect,
            timeSpent: 0,
          })),
          score: result.score,
          earnedMagicPower: result.earnedMagicPower,
          completedAt: Date.now(),
        });

        // 更新用户进度
        const progress = await db.userProgress.get(currentUser.id);
        if (progress) {
          await db.userProgress.update(currentUser.id, {
            magicPower: progress.magicPower + result.earnedMagicPower,
          });
        }

        // 如果通过，解锁下一个节点
        if (result.score >= 60) {
          // 标记当前故事为完成
          const currentNode = await db.mapNodes.where('storyId').equals(storyId).first();
          if (currentNode) {
            await db.mapNodes.update(currentNode.id, { completed: true });
            
            // 解锁下一个节点
            const nextNode = await db.mapNodes
              .filter(n => n.prerequisites?.includes(currentNode.id) && !n.unlocked)
              .first();
            if (nextNode) {
              await db.mapNodes.update(nextNode.id, { unlocked: true });
            }
          }
        }
      }

      // 返回地图
      navigate('/map');
    } catch (error) {
      console.error('Failed to save quiz result:', error);
      navigate('/map');
    }
  }, [currentUser, storyId, navigate]);

  // 退出
  const handleExit = useCallback(() => {
    if (confirm('确定要退出吗？当前进度将不会保存。')) {
      navigate('/map');
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <QuizContainer
        questions={questions}
        storyId={storyId || 'unknown'}
        onComplete={handleComplete}
        onExit={handleExit}
      />
    </div>
  );
};

export default QuizPage;
