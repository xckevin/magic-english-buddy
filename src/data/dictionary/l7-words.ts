/**
 * L7 词典数据 - 创世之核
 * 包含虚拟语气、修辞手法、批判性思维相关词汇
 */

import type { DictionaryEntry } from '@/db';

export const l7Dictionary: DictionaryEntry[] = [
  // ============ 抽象概念词汇 ============
  { word: 'civilization', phonetic: '/ˌsɪvɪlaɪˈzeɪʃn/', meaningCn: '文明', meaningEn: 'an advanced society', partOfSpeech: 'n.', examples: ['Human civilization.', 'Ancient civilizations.'], emoji: '🏛️', level: 7, frequency: 65 },
  { word: 'foundation', phonetic: '/faʊnˈdeɪʃn/', meaningCn: '基础', meaningEn: 'the base of something', partOfSpeech: 'n.', examples: ['Foundation of thought.', 'Strong foundation.'], emoji: '🏗️', level: 7, frequency: 68 },
  { word: 'communication', phonetic: '/kəˌmjuːnɪˈkeɪʃn/', meaningCn: '交流', meaningEn: 'sharing information', partOfSpeech: 'n.', examples: ['Tool for communication.', 'Clear communication.'], emoji: '💬', level: 7, frequency: 72 },
  { word: 'essence', phonetic: '/ˈesns/', meaningCn: '本质', meaningEn: 'the most important part', partOfSpeech: 'n.', examples: ['The essence of humanity.', 'Capture the essence.'], emoji: '✨', level: 7, frequency: 58 },
  { word: 'fantasy', phonetic: '/ˈfæntəsi/', meaningCn: '幻想', meaningEn: 'imagination', partOfSpeech: 'n.', examples: ['Mere fantasies.', 'A world of fantasy.'], emoji: '🦄', level: 7, frequency: 65 },
  { word: 'reality', phonetic: '/riˈæləti/', meaningCn: '现实', meaningEn: 'what is real', partOfSpeech: 'n.', examples: ["Tomorrow's reality.", 'Face reality.'], emoji: '🌍', level: 7, frequency: 72 },
  { word: 'responsibility', phonetic: '/rɪˌspɒnsəˈbɪləti/', meaningCn: '责任', meaningEn: 'a duty', partOfSpeech: 'n.', examples: ['Knowledge is a responsibility.', 'Take responsibility.'], emoji: '⚖️', level: 7, frequency: 70 },
  { word: 'knowledge', phonetic: '/ˈnɒlɪdʒ/', meaningCn: '知识', meaningEn: 'information and skills', partOfSpeech: 'n.', examples: ['Knowledge is a gift.', 'Seek knowledge.'], emoji: '📚', level: 7, frequency: 78 },
  { word: 'choice', phonetic: '/tʃɔɪs/', meaningCn: '选择', meaningEn: 'a decision', partOfSpeech: 'n.', examples: ['The choices you make.', 'Make a choice.'], emoji: '🔀', level: 7, frequency: 78 },
  { word: 'despair', phonetic: '/dɪˈsper/', meaningCn: '绝望', meaningEn: 'loss of hope', partOfSpeech: 'n.', examples: ['Spread despair.', 'Feel despair.'], emoji: '😢', level: 7, frequency: 58 },

  // ============ 动词（高级）============
  { word: 'develop', phonetic: '/dɪˈveləp/', meaningCn: '发展', meaningEn: 'to grow', partOfSpeech: 'v.', examples: ['Develop language.', 'Develop skills.'], emoji: '📈', level: 7, frequency: 75 },
  { word: 'exist', phonetic: '/ɪɡˈzɪst/', meaningCn: '存在', meaningEn: 'to be real', partOfSpeech: 'v.', examples: ['Would not exist.', 'Does it exist?'], emoji: '✅', level: 7, frequency: 72 },
  { word: 'inspire', phonetic: '/ɪnˈspaɪər/', meaningCn: '激励', meaningEn: 'to encourage', partOfSpeech: 'v.', examples: ['Inspire hope.', 'She inspired me.'], emoji: '💡', level: 7, frequency: 70 },
  { word: 'shape', phonetic: '/ʃeɪp/', meaningCn: '塑造', meaningEn: 'to form', partOfSpeech: 'v.', examples: ['Shape the future.', 'Shape your destiny.'], emoji: '🎨', level: 7, frequency: 72 },
  { word: 'remain', phonetic: '/rɪˈmeɪn/', meaningCn: '保持', meaningEn: 'to stay', partOfSpeech: 'v.', examples: ['One question remains.', 'Remain calm.'], emoji: '⏸️', level: 7, frequency: 72 },

  // ============ 形容词（高级）============
  { word: 'magical', phonetic: '/ˈmædʒɪkl/', meaningCn: '神奇的', meaningEn: 'wonderful', partOfSpeech: 'adj.', examples: ['Magical journey.', 'Magical moment.'], emoji: '✨', level: 7, frequency: 72 },
  { word: 'deepest', phonetic: '/ˈdiːpɪst/', meaningCn: '最深的', meaningEn: 'most deep', partOfSpeech: 'adj.', examples: ['Deepest feelings.', 'Deepest thoughts.'], emoji: '🌊', level: 7, frequency: 65 },
  { word: 'mere', phonetic: '/mɪr/', meaningCn: '仅仅的', meaningEn: 'only', partOfSpeech: 'adj.', examples: ['Mere fantasies.', 'A mere child.'], emoji: '1️⃣', level: 7, frequency: 55 },
  { word: 'carefully', phonetic: '/ˈkerfəli/', meaningCn: '仔细地', meaningEn: 'with care', partOfSpeech: 'adv.', examples: ['Carefully chosen.', 'Listen carefully.'], emoji: '👀', level: 7, frequency: 72 },

  // ============ 修辞/论证词汇 ============
  { word: 'throughout', phonetic: '/θruːˈaʊt/', meaningCn: '遍及', meaningEn: 'in every part', partOfSpeech: 'prep.', examples: ['Throughout history.', 'Throughout the world.'], emoji: '🌐', level: 7, frequency: 68 },
  { word: 'merely', phonetic: '/ˈmɪrli/', meaningCn: '仅仅', meaningEn: 'only', partOfSpeech: 'adv.', examples: ['Not merely a tool.', 'Merely a beginning.'], emoji: '1️⃣', level: 7, frequency: 60 },
  { word: 'truly', phonetic: '/ˈtruːli/', meaningCn: '真正地', meaningEn: 'really', partOfSpeech: 'adv.', examples: ['Never truly end.', 'Truly grateful.'], emoji: '💯', level: 7, frequency: 72 },

  // ============ 连接词/虚拟语气 ============
  { word: 'without', phonetic: '/wɪˈðaʊt/', meaningCn: '没有', meaningEn: 'lacking', partOfSpeech: 'prep.', examples: ['Without words.', 'Without help.'], emoji: '🚫', level: 7, frequency: 80 },
  { word: 'whether', phonetic: '/ˈweðər/', meaningCn: '是否', meaningEn: 'if', partOfSpeech: 'conj.', examples: ['Whether true or not.', 'Ask whether.'], emoji: '❓', level: 7, frequency: 70 },
];

export default l7Dictionary;

