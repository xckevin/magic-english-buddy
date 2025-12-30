/**
 * L5 词典数据 - 永恒星空
 * 包含知识类、寓言故事、文化背景相关词汇
 */

import type { DictionaryEntry } from '@/db';

export const l5Dictionary: DictionaryEntry[] = [
  // ============ 知识类词汇 ============
  { word: 'collect', phonetic: '/kəˈlekt/', meaningCn: '收集', meaningEn: 'to gather things', partOfSpeech: 'v.', examples: ['Collect fallen stars.', 'She collects stamps.'], emoji: '🗃️', level: 5, frequency: 75 },
  { word: 'contain', phonetic: '/kənˈteɪn/', meaningCn: '包含', meaningEn: 'to hold inside', partOfSpeech: 'v.', examples: ['The box contains gifts.', 'Each star contained a wish.'], emoji: '📦', level: 5, frequency: 70 },
  { word: 'solve', phonetic: '/sɒlv/', meaningCn: '解决', meaningEn: 'to find an answer', partOfSpeech: 'v.', examples: ['Solve the problem.', 'He solved the puzzle.'], emoji: '🧩', level: 5, frequency: 75 },
  { word: 'offer', phonetic: '/ˈɒfər/', meaningCn: '提供', meaningEn: 'to give', partOfSpeech: 'v.', examples: ['Offer help.', 'He offered no solution.'], emoji: '🤲', level: 5, frequency: 72 },
  { word: 'roar', phonetic: '/rɔːr/', meaningCn: '吼叫', meaningEn: 'to make loud sound', partOfSpeech: 'v.', examples: ['The lion roared.', 'Thunder roars.'], emoji: '🦁', level: 5, frequency: 65 },
  { word: 'lie', phonetic: '/laɪ/', meaningCn: '位于', meaningEn: 'to be located', partOfSpeech: 'v.', examples: ['The answer lies here.', 'The city lies east.'], emoji: '📍', level: 5, frequency: 70 },
  { word: 'rotate', phonetic: '/roʊˈteɪt/', meaningCn: '旋转', meaningEn: 'to turn around', partOfSpeech: 'v.', examples: ['The Earth rotates.', 'Rotating sky.'], emoji: '🔄', level: 5, frequency: 62 },
  { word: 'notice', phonetic: '/ˈnoʊtɪs/', meaningCn: '注意到', meaningEn: 'to see', partOfSpeech: 'v.', examples: ['Notice the grapes.', 'He noticed her.'], emoji: '👀', level: 5, frequency: 75 },
  { word: 'hang', phonetic: '/hæŋ/', meaningCn: '悬挂', meaningEn: 'to be suspended', partOfSpeech: 'v.', examples: ['Grapes hung high.', 'Hang the picture.'], emoji: '🖼️', level: 5, frequency: 72 },
  { word: 'pretend', phonetic: '/prɪˈtend/', meaningCn: '假装', meaningEn: 'to act as if', partOfSpeech: 'v.', examples: ['Pretend to be happy.', "Don't pretend."], emoji: '🎭', level: 5, frequency: 72 },
  { word: 'admire', phonetic: '/ədˈmaɪər/', meaningCn: '欣赏', meaningEn: 'to look at with pleasure', partOfSpeech: 'v.', examples: ['Admire the moon.', 'I admire you.'], emoji: '😍', level: 5, frequency: 68 },
  { word: 'challenge', phonetic: '/ˈtʃælɪndʒ/', meaningCn: '挑战', meaningEn: 'to invite to compete', partOfSpeech: 'v.', examples: ['Challenge him to a race.', 'A big challenge.'], emoji: '⚔️', level: 5, frequency: 72 },

  // ============ 寓言/故事词汇 ============
  { word: 'fable', phonetic: '/ˈfeɪbl/', meaningCn: '寓言', meaningEn: 'a short story with a lesson', partOfSpeech: 'n.', examples: ['A famous fable.', 'This fable teaches us.'], emoji: '📖', level: 5, frequency: 58 },
  { word: 'myth', phonetic: '/mɪθ/', meaningCn: '神话', meaningEn: 'an ancient story', partOfSpeech: 'n.', examples: ['Greek myths.', 'A famous myth.'], emoji: '🏛️', level: 5, frequency: 62 },
  { word: 'legend', phonetic: '/ˈledʒənd/', meaningCn: '传说', meaningEn: 'a traditional story', partOfSpeech: 'n.', examples: ['An old legend.', 'The legend says.'], emoji: '📜', level: 5, frequency: 68 },
  { word: 'moral', phonetic: '/ˈmɒrəl/', meaningCn: '寓意', meaningEn: 'a lesson from a story', partOfSpeech: 'n.', examples: ['The moral of the story.', 'A good moral.'], emoji: '💡', level: 5, frequency: 60 },
  { word: 'tortoise', phonetic: '/ˈtɔːrtəs/', meaningCn: '乌龟', meaningEn: 'a slow reptile', partOfSpeech: 'n.', examples: ['A wise tortoise.', 'Slow tortoise.'], emoji: '🐢', level: 5, frequency: 65 },
  { word: 'hare', phonetic: '/her/', meaningCn: '野兔', meaningEn: 'a fast rabbit', partOfSpeech: 'n.', examples: ['The hare was proud.', 'Fast hare.'], emoji: '🐰', level: 5, frequency: 60 },
  { word: 'fox', phonetic: '/fɒks/', meaningCn: '狐狸', meaningEn: 'a clever animal', partOfSpeech: 'n.', examples: ['A hungry fox.', 'Clever fox.'], emoji: '🦊', level: 5, frequency: 70 },
  { word: 'grape', phonetic: '/ɡreɪp/', meaningCn: '葡萄', meaningEn: 'a fruit', partOfSpeech: 'n.', examples: ['Sour grapes.', 'Eat grapes.'], emoji: '🍇', level: 5, frequency: 72 },
  { word: 'vineyard', phonetic: '/ˈvɪnjərd/', meaningCn: '葡萄园', meaningEn: 'grape farm', partOfSpeech: 'n.', examples: ['Walking through a vineyard.', 'Large vineyard.'], emoji: '🍇', level: 5, frequency: 52 },
  { word: 'vine', phonetic: '/vaɪn/', meaningCn: '藤蔓', meaningEn: 'climbing plant', partOfSpeech: 'n.', examples: ['Grapes on the vine.', 'Grape vine.'], emoji: '🌿', level: 5, frequency: 58 },

  // ============ 天文词汇 ============
  { word: 'star', phonetic: '/stɑːr/', meaningCn: '星星', meaningEn: 'a light in the sky', partOfSpeech: 'n.', examples: ['Fallen stars.', 'Bright star.'], emoji: '⭐', level: 5, frequency: 85 },
  { word: 'constellation', phonetic: '/ˌkɒnstəˈleɪʃn/', meaningCn: '星座', meaningEn: 'star pattern', partOfSpeech: 'n.', examples: ['Name the constellations.', 'Famous constellation.'], emoji: '✨', level: 5, frequency: 55 },
  { word: 'pattern', phonetic: '/ˈpætərn/', meaningCn: '图案', meaningEn: 'a design', partOfSpeech: 'n.', examples: ['Star patterns.', 'A beautiful pattern.'], emoji: '🔷', level: 5, frequency: 72 },
  { word: 'pole', phonetic: '/poʊl/', meaningCn: '极点', meaningEn: 'the end of an axis', partOfSpeech: 'n.', examples: ['North Pole.', 'South Pole.'], emoji: '🧭', level: 5, frequency: 65 },
  { word: 'traveler', phonetic: '/ˈtrævələr/', meaningCn: '旅行者', meaningEn: 'one who travels', partOfSpeech: 'n.', examples: ['Travelers used stars.', 'A lost traveler.'], emoji: '🧳', level: 5, frequency: 70 },
  { word: 'galaxy', phonetic: '/ˈɡæləksi/', meaningCn: '银河', meaningEn: 'a system of stars', partOfSpeech: 'n.', examples: ['The Milky Way galaxy.', 'Distant galaxy.'], emoji: '🌌', level: 5, frequency: 62 },

  // ============ 文化词汇 ============
  { word: 'culture', phonetic: '/ˈkʌltʃər/', meaningCn: '文化', meaningEn: 'customs of a society', partOfSpeech: 'n.', examples: ['Chinese culture.', 'Learn about culture.'], emoji: '🎭', level: 5, frequency: 72 },
  { word: 'festival', phonetic: '/ˈfestɪvl/', meaningCn: '节日', meaningEn: 'a celebration', partOfSpeech: 'n.', examples: ['Moon Festival.', 'Celebrate the festival.'], emoji: '🎊', level: 5, frequency: 75 },
  { word: 'goddess', phonetic: '/ˈɡɒdes/', meaningCn: '女神', meaningEn: 'a female god', partOfSpeech: 'n.', examples: ["Chang'e is a goddess.", 'Moon goddess.'], emoji: '👸', level: 5, frequency: 62 },
  { word: 'potion', phonetic: '/ˈpoʊʃn/', meaningCn: '药水', meaningEn: 'a magic drink', partOfSpeech: 'n.', examples: ['Magic potion.', 'Drink the potion.'], emoji: '🧪', level: 5, frequency: 58 },
  { word: 'lunar', phonetic: '/ˈluːnər/', meaningCn: '农历的', meaningEn: 'related to the moon', partOfSpeech: 'adj.', examples: ['Lunar month.', 'Lunar calendar.'], emoji: '🌙', level: 5, frequency: 60 },
  { word: 'mooncake', phonetic: '/ˈmuːnkeɪk/', meaningCn: '月饼', meaningEn: 'a festival pastry', partOfSpeech: 'n.', examples: ['Eat mooncakes.', 'Delicious mooncake.'], emoji: '🥮', level: 5, frequency: 55 },
  { word: 'generation', phonetic: '/ˌdʒenəˈreɪʃn/', meaningCn: '世代', meaningEn: 'people born at similar time', partOfSpeech: 'n.', examples: ['For generations.', 'The next generation.'], emoji: '👨‍👩‍👧', level: 5, frequency: 68 },

  // ============ 形容词 ============
  { word: 'proud', phonetic: '/praʊd/', meaningCn: '骄傲的', meaningEn: 'feeling self-important', partOfSpeech: 'adj.', examples: ['A proud hare.', 'Feel proud.'], emoji: '😤', level: 5, frequency: 75 },
  { word: 'confident', phonetic: '/ˈkɒnfɪdənt/', meaningCn: '自信的', meaningEn: 'sure of oneself', partOfSpeech: 'adj.', examples: ['He became confident.', 'Stay confident.'], emoji: '💪', level: 5, frequency: 72 },
  { word: 'steady', phonetic: '/ˈstedi/', meaningCn: '稳定的', meaningEn: 'regular and even', partOfSpeech: 'adj.', examples: ['Slow and steady.', 'Steady progress.'], emoji: '⚖️', level: 5, frequency: 70 },
  { word: 'wise', phonetic: '/waɪz/', meaningCn: '明智的', meaningEn: 'having wisdom', partOfSpeech: 'adj.', examples: ['A wise owl.', 'Wise advice.'], emoji: '🦉', level: 5, frequency: 72 },
  { word: 'fallen', phonetic: '/ˈfɔːlən/', meaningCn: '掉落的', meaningEn: 'dropped down', partOfSpeech: 'adj.', examples: ['Fallen stars.', 'Fallen leaves.'], emoji: '🍂', level: 5, frequency: 68 },
  { word: 'fixed', phonetic: '/fɪkst/', meaningCn: '固定的', meaningEn: 'not moving', partOfSpeech: 'adj.', examples: ['A fixed point.', 'Fixed position.'], emoji: '📌', level: 5, frequency: 70 },
  { word: 'sour', phonetic: '/ˈsaʊər/', meaningCn: '酸的', meaningEn: 'having a sharp taste', partOfSpeech: 'adj.', examples: ['Sour grapes.', 'Sour lemon.'], emoji: '🍋', level: 5, frequency: 72 },
  { word: 'hungry', phonetic: '/ˈhʌŋɡri/', meaningCn: '饥饿的', meaningEn: 'wanting food', partOfSpeech: 'adj.', examples: ['A hungry fox.', 'I am hungry.'], emoji: '😋', level: 5, frequency: 78 },
  { word: 'delicious', phonetic: '/dɪˈlɪʃəs/', meaningCn: '美味的', meaningEn: 'very tasty', partOfSpeech: 'adj.', examples: ['Delicious grapes.', 'Delicious food.'], emoji: '😋', level: 5, frequency: 75 },

  // ============ 副词 ============
  { word: 'loudly', phonetic: '/ˈlaʊdli/', meaningCn: '大声地', meaningEn: 'in a loud way', partOfSpeech: 'adv.', examples: ['Roared loudly.', 'Speak loudly.'], emoji: '📢', level: 5, frequency: 72 },
  { word: 'quietly', phonetic: '/ˈkwaɪətli/', meaningCn: '安静地', meaningEn: 'without noise', partOfSpeech: 'adv.', examples: ['Said quietly.', 'Walk quietly.'], emoji: '🤫', level: 5, frequency: 72 },
  { word: 'cleverly', phonetic: '/ˈklevərli/', meaningCn: '聪明地', meaningEn: 'in a smart way', partOfSpeech: 'adv.', examples: ['Spoke cleverly.', 'Solved cleverly.'], emoji: '🧠', level: 5, frequency: 65 },
  { word: 'directly', phonetic: '/dɪˈrektli/', meaningCn: '直接地', meaningEn: 'in a straight way', partOfSpeech: 'adv.', examples: ['Directly above.', 'Go directly.'], emoji: '➡️', level: 5, frequency: 70 },
  { word: 'probably', phonetic: '/ˈprɒbəbli/', meaningCn: '可能', meaningEn: 'likely', partOfSpeech: 'adv.', examples: ['Probably sour.', 'Probably true.'], emoji: '🤔', level: 5, frequency: 78 },
  { word: 'steadily', phonetic: '/ˈstedɪli/', meaningCn: '稳定地', meaningEn: 'at a steady pace', partOfSpeech: 'adv.', examples: ['Move steadily.', 'Grow steadily.'], emoji: '📈', level: 5, frequency: 65 },

  // ============ 连接词/其他 ============
  { word: 'unlike', phonetic: '/ʌnˈlaɪk/', meaningCn: '不像', meaningEn: 'different from', partOfSpeech: 'prep.', examples: ['Unlike other stars.', 'Unlike me.'], emoji: '≠', level: 5, frequency: 70 },
  { word: 'meanwhile', phonetic: '/ˈmiːnwaɪl/', meaningCn: '与此同时', meaningEn: 'at the same time', partOfSpeech: 'adv.', examples: ['Meanwhile, the tortoise.', 'Meanwhile, she waited.'], emoji: '⏱️', level: 5, frequency: 68 },
  { word: 'matter', phonetic: '/ˈmætər/', meaningCn: '无论', meaningEn: 'regardless of', partOfSpeech: 'n.', examples: ['No matter how hard.', 'No matter what.'], emoji: '❓', level: 5, frequency: 72 },
];

export default l5Dictionary;

