/**
 * L4 词典数据 - 云端之城
 * 包含时态变化相关词汇、过去完成时、将来时
 */

import type { DictionaryEntry } from '@/db';

export const l4Dictionary: DictionaryEntry[] = [
  // ============ 动词（时态变化核心）============
  { word: 'paint', phonetic: '/peɪnt/', meaningCn: '画', meaningEn: 'to make a picture', partOfSpeech: 'v.', examples: ['She paints the sunrise.', 'He painted a picture.'], emoji: '🎨', level: 4, frequency: 75 },
  { word: 'wonder', phonetic: '/ˈwʌndər/', meaningCn: '想知道', meaningEn: 'to want to know', partOfSpeech: 'v.', examples: ['I wonder why.', 'They wondered about it.'], emoji: '🤔', level: 4, frequency: 72 },
  { word: 'build', phonetic: '/bɪld/', meaningCn: '建造', meaningEn: 'to construct', partOfSpeech: 'v.', examples: ['They built a palace.', 'He will build a house.'], emoji: '🏗️', level: 4, frequency: 78 },
  { word: 'rule', phonetic: '/ruːl/', meaningCn: '统治', meaningEn: 'to govern', partOfSpeech: 'v.', examples: ['The king ruled the land.', 'She rules wisely.'], emoji: '👑', level: 4, frequency: 70 },
  { word: 'decorate', phonetic: '/ˈdekəreɪt/', meaningCn: '装饰', meaningEn: 'to make beautiful', partOfSpeech: 'v.', examples: ['Decorate the room.', 'The walls were decorated.'], emoji: '🎀', level: 4, frequency: 68 },
  { word: 'celebrate', phonetic: '/ˈseləbreɪt/', meaningCn: '庆祝', meaningEn: 'to mark with festivities', partOfSpeech: 'v.', examples: ['Celebrate the festival.', 'They celebrated together.'], emoji: '🎉', level: 4, frequency: 75 },
  { word: 'honor', phonetic: '/ˈɒnər/', meaningCn: '纪念', meaningEn: 'to show respect', partOfSpeech: 'v.', examples: ['Honor the king.', 'We honored the heroes.'], emoji: '🏆', level: 4, frequency: 68 },
  { word: 'plant', phonetic: '/plɑːnt/', meaningCn: '种植', meaningEn: 'to put seeds in ground', partOfSpeech: 'v.', examples: ['Plant the flowers.', 'She had planted trees.'], emoji: '🌱', level: 4, frequency: 75 },
  { word: 'bloom', phonetic: '/bluːm/', meaningCn: '开花', meaningEn: 'to produce flowers', partOfSpeech: 'v.', examples: ['Flowers bloom in spring.', 'The roses had bloomed.'], emoji: '🌸', level: 4, frequency: 68 },
  { word: 'heal', phonetic: '/hiːl/', meaningCn: '治愈', meaningEn: 'to make well', partOfSpeech: 'v.', examples: ['The medicine heals.', 'It healed his wounds.'], emoji: '💊', level: 4, frequency: 70 },
  { word: 'protect', phonetic: '/prəˈtekt/', meaningCn: '保护', meaningEn: 'to keep safe', partOfSpeech: 'v.', examples: ['Protect the city.', 'He had protected them.'], emoji: '🛡️', level: 4, frequency: 78 },
  { word: 'approach', phonetic: '/əˈprəʊtʃ/', meaningCn: '接近', meaningEn: 'to come near', partOfSpeech: 'v.', examples: ['The storm approached.', 'They approached the gate.'], emoji: '🚶', level: 4, frequency: 68 },
  { word: 'believe', phonetic: '/bɪˈliːv/', meaningCn: '相信', meaningEn: 'to think true', partOfSpeech: 'v.', examples: ['I believe you.', 'They believed the story.'], emoji: '💭', level: 4, frequency: 80 },
  { word: 'disappear', phonetic: '/ˌdɪsəˈpɪr/', meaningCn: '消失', meaningEn: 'to vanish', partOfSpeech: 'v.', examples: ['He disappeared.', 'The prince had disappeared.'], emoji: '💨', level: 4, frequency: 72 },
  { word: 'search', phonetic: '/sɜːrtʃ/', meaningCn: '搜索', meaningEn: 'to look for', partOfSpeech: 'v.', examples: ['Search for the treasure.', 'They had searched everywhere.'], emoji: '🔍', level: 4, frequency: 75 },
  { word: 'recognize', phonetic: '/ˈrekəɡnaɪz/', meaningCn: '认出', meaningEn: 'to identify', partOfSpeech: 'v.', examples: ['I recognize you.', 'She recognized the ring.'], emoji: '👁️', level: 4, frequency: 70 },
  { word: 'belong', phonetic: '/bɪˈlɒŋ/', meaningCn: '属于', meaningEn: 'to be owned by', partOfSpeech: 'v.', examples: ['It belongs to me.', 'The mirror had belonged to the queen.'], emoji: '📦', level: 4, frequency: 72 },
  { word: 'allow', phonetic: '/əˈlaʊ/', meaningCn: '允许', meaningEn: 'to permit', partOfSpeech: 'v.', examples: ['Allow me to help.', 'She was not allowed.'], emoji: '✅', level: 4, frequency: 75 },
  { word: 'prepare', phonetic: '/prɪˈper/', meaningCn: '准备', meaningEn: 'to make ready', partOfSpeech: 'v.', examples: ['Prepare for the party.', 'They had been preparing.'], emoji: '📋', level: 4, frequency: 78 },
  { word: 'receive', phonetic: '/rɪˈsiːv/', meaningCn: '收到', meaningEn: 'to get', partOfSpeech: 'v.', examples: ['Receive a gift.', 'They will receive prizes.'], emoji: '🎁', level: 4, frequency: 75 },
  { word: 'fight', phonetic: '/faɪt/', meaningCn: '战斗', meaningEn: 'to battle', partOfSpeech: 'v.', examples: ['Fight for freedom.', 'He had fought many battles.'], emoji: '⚔️', level: 4, frequency: 75 },
  { word: 'train', phonetic: '/treɪn/', meaningCn: '训练', meaningEn: 'to practice skills', partOfSpeech: 'v.', examples: ['Train hard.', 'He had trained with warriors.'], emoji: '🏋️', level: 4, frequency: 72 },
  { word: 'teach', phonetic: '/tiːtʃ/', meaningCn: '教', meaningEn: 'to instruct', partOfSpeech: 'v.', examples: ['Teach the students.', 'She teaches English.'], emoji: '📚', level: 4, frequency: 80 },
  { word: 'arrive', phonetic: '/əˈraɪv/', meaningCn: '到达', meaningEn: 'to reach a place', partOfSpeech: 'v.', examples: ['Arrive at school.', 'A young man arrived.'], emoji: '🚪', level: 4, frequency: 78 },

  // ============ 形容词（描述性）============
  { word: 'magnificent', phonetic: '/mæɡˈnɪfɪsnt/', meaningCn: '宏伟的', meaningEn: 'extremely beautiful', partOfSpeech: 'adj.', examples: ['A magnificent palace.', 'Magnificent view.'], emoji: '🏰', level: 4, frequency: 65 },
  { word: 'entirely', phonetic: '/ɪnˈtaɪərli/', meaningCn: '完全地', meaningEn: 'completely', partOfSpeech: 'adv.', examples: ['Entirely made of gold.', 'Entirely new.'], emoji: '💯', level: 4, frequency: 68 },
  { word: 'brightest', phonetic: '/ˈbraɪtɪst/', meaningCn: '最明亮的', meaningEn: 'most bright', partOfSpeech: 'adj.', examples: ['The brightest star.', 'The brightest day.'], emoji: '⭐', level: 4, frequency: 70 },
  { word: 'precious', phonetic: '/ˈpreʃəs/', meaningCn: '珍贵的', meaningEn: 'of great value', partOfSpeech: 'adj.', examples: ['Precious gems.', 'Precious memories.'], emoji: '💎', level: 4, frequency: 72 },
  { word: 'grand', phonetic: '/ɡrænd/', meaningCn: '盛大的', meaningEn: 'impressive', partOfSpeech: 'adj.', examples: ['A grand celebration.', 'Grand palace.'], emoji: '🎊', level: 4, frequency: 70 },
  { word: 'terrible', phonetic: '/ˈterəbl/', meaningCn: '可怕的', meaningEn: 'very bad', partOfSpeech: 'adj.', examples: ['A terrible storm.', 'Terrible news.'], emoji: '😨', level: 4, frequency: 75 },
  { word: 'familiar', phonetic: '/fəˈmɪliər/', meaningCn: '熟悉的', meaningEn: 'well-known', partOfSpeech: 'adj.', examples: ['A familiar face.', 'Familiar voice.'], emoji: '👋', level: 4, frequency: 72 },
  { word: 'mysterious', phonetic: '/mɪˈstɪriəs/', meaningCn: '神秘的', meaningEn: 'hard to explain', partOfSpeech: 'adj.', examples: ['Mysterious powers.', 'A mysterious place.'], emoji: '🔮', level: 4, frequency: 70 },
  { word: 'powerful', phonetic: '/ˈpaʊərfl/', meaningCn: '强大的', meaningEn: 'having great power', partOfSpeech: 'adj.', examples: ['A powerful dragon.', 'Powerful magic.'], emoji: '💪', level: 4, frequency: 78 },
  { word: 'royal', phonetic: '/ˈrɔɪəl/', meaningCn: '皇家的', meaningEn: 'relating to a king', partOfSpeech: 'adj.', examples: ['Royal family.', 'Royal celebration.'], emoji: '👑', level: 4, frequency: 72 },
  { word: 'worthy', phonetic: '/ˈwɜːrði/', meaningCn: '值得的', meaningEn: 'deserving', partOfSpeech: 'adj.', examples: ['A worthy successor.', 'Worthy of praise.'], emoji: '🏅', level: 4, frequency: 68 },
  { word: 'greatest', phonetic: '/ˈɡreɪtɪst/', meaningCn: '最伟大的', meaningEn: 'most great', partOfSpeech: 'adj.', examples: ['The greatest warrior.', 'Greatest king.'], emoji: '🏆', level: 4, frequency: 75 },
  { word: 'bravest', phonetic: '/ˈbreɪvɪst/', meaningCn: '最勇敢的', meaningEn: 'most brave', partOfSpeech: 'adj.', examples: ['The bravest knight.', 'Bravest hero.'], emoji: '🦸', level: 4, frequency: 70 },
  { word: 'excited', phonetic: '/ɪkˈsaɪtɪd/', meaningCn: '兴奋的', meaningEn: 'very happy', partOfSpeech: 'adj.', examples: ['The children are excited.', 'I am excited!'], emoji: '🤩', level: 4, frequency: 78 },

  // ============ 名词（云端主题）============
  { word: 'palace', phonetic: '/ˈpæləs/', meaningCn: '宫殿', meaningEn: 'a royal house', partOfSpeech: 'n.', examples: ['The golden palace.', 'Live in a palace.'], emoji: '🏰', level: 4, frequency: 75 },
  { word: 'kingdom', phonetic: '/ˈkɪŋdəm/', meaningCn: '王国', meaningEn: 'a land with a king', partOfSpeech: 'n.', examples: ['A great kingdom.', 'Rule the kingdom.'], emoji: '👑', level: 4, frequency: 75 },
  { word: 'tower', phonetic: '/ˈtaʊər/', meaningCn: '塔', meaningEn: 'a tall building', partOfSpeech: 'n.', examples: ['The highest tower.', 'A clock tower.'], emoji: '🗼', level: 4, frequency: 72 },
  { word: 'gem', phonetic: '/dʒem/', meaningCn: '宝石', meaningEn: 'a precious stone', partOfSpeech: 'n.', examples: ['Precious gems.', 'A red gem.'], emoji: '💎', level: 4, frequency: 70 },
  { word: 'wall', phonetic: '/wɔːl/', meaningCn: '墙', meaningEn: 'a side of a room', partOfSpeech: 'n.', examples: ['Palace walls.', 'The city wall.'], emoji: '🧱', level: 4, frequency: 80 },
  { word: 'wisdom', phonetic: '/ˈwɪzdəm/', meaningCn: '智慧', meaningEn: 'being wise', partOfSpeech: 'n.', examples: ['Great wisdom.', 'Words of wisdom.'], emoji: '🧠', level: 4, frequency: 68 },
  { word: 'celebration', phonetic: '/ˌseləˈbreɪʃn/', meaningCn: '庆典', meaningEn: 'a festive event', partOfSpeech: 'n.', examples: ['A grand celebration.', 'Birthday celebration.'], emoji: '🎉', level: 4, frequency: 72 },
  { word: 'reign', phonetic: '/reɪn/', meaningCn: '统治', meaningEn: 'period of ruling', partOfSpeech: 'n.', examples: ['A peaceful reign.', 'During his reign.'], emoji: '👑', level: 4, frequency: 65 },
  { word: 'gardener', phonetic: '/ˈɡɑːrdnər/', meaningCn: '园丁', meaningEn: 'one who tends garden', partOfSpeech: 'n.', examples: ['The royal gardener.', 'A skilled gardener.'], emoji: '👨‍🌾', level: 4, frequency: 65 },
  { word: 'wound', phonetic: '/wuːnd/', meaningCn: '伤口', meaningEn: 'an injury', partOfSpeech: 'n.', examples: ['Heal the wound.', 'A deep wound.'], emoji: '🩹', level: 4, frequency: 70 },
  { word: 'dragon', phonetic: '/ˈdræɡən/', meaningCn: '龙', meaningEn: 'a mythical creature', partOfSpeech: 'n.', examples: ['A powerful dragon.', 'The wind dragon.'], emoji: '🐉', level: 4, frequency: 75 },
  { word: 'scale', phonetic: '/skeɪl/', meaningCn: '鳞片', meaningEn: 'skin of fish/reptile', partOfSpeech: 'n.', examples: ['Silver scales.', 'Dragon scales.'], emoji: '🐟', level: 4, frequency: 68 },
  { word: 'wing', phonetic: '/wɪŋ/', meaningCn: '翅膀', meaningEn: 'body part for flying', partOfSpeech: 'n.', examples: ['Wide wings.', 'Spread your wings.'], emoji: '🪶', level: 4, frequency: 75 },
  { word: 'legend', phonetic: '/ˈledʒənd/', meaningCn: '传说', meaningEn: 'an old story', partOfSpeech: 'n.', examples: ['An ancient legend.', 'Legend said...'], emoji: '📜', level: 4, frequency: 72 },
  { word: 'gate', phonetic: '/ɡeɪt/', meaningCn: '大门', meaningEn: 'an entrance', partOfSpeech: 'n.', examples: ['The city gates.', 'Open the gate.'], emoji: '🚪', level: 4, frequency: 75 },
  { word: 'ring', phonetic: '/rɪŋ/', meaningCn: '戒指', meaningEn: 'jewelry for finger', partOfSpeech: 'n.', examples: ['A golden ring.', 'Wedding ring.'], emoji: '💍', level: 4, frequency: 75 },
  { word: 'mirror', phonetic: '/ˈmɪrər/', meaningCn: '镜子', meaningEn: 'a reflective surface', partOfSpeech: 'n.', examples: ['A magic mirror.', 'Look in the mirror.'], emoji: '🪞', level: 4, frequency: 75 },
  { word: 'future', phonetic: '/ˈfjuːtʃər/', meaningCn: '未来', meaningEn: 'time to come', partOfSpeech: 'n.', examples: ['See the future.', 'In the future.'], emoji: '🔮', level: 4, frequency: 80 },
  { word: 'festival', phonetic: '/ˈfestɪvl/', meaningCn: '节日', meaningEn: 'a celebration', partOfSpeech: 'n.', examples: ['Summer festival.', 'Cloud festival.'], emoji: '🎪', level: 4, frequency: 75 },
  { word: 'arrival', phonetic: '/əˈraɪvl/', meaningCn: '到来', meaningEn: 'coming', partOfSpeech: 'n.', examples: ['The arrival of summer.', 'His arrival.'], emoji: '🚪', level: 4, frequency: 68 },
  { word: 'firework', phonetic: '/ˈfaɪərwɜːrk/', meaningCn: '烟花', meaningEn: 'explosive display', partOfSpeech: 'n.', examples: ['Beautiful fireworks.', 'Watch the fireworks.'], emoji: '🎆', level: 4, frequency: 72 },
  { word: 'gift', phonetic: '/ɡɪft/', meaningCn: '礼物', meaningEn: 'a present', partOfSpeech: 'n.', examples: ['Special gifts.', 'A birthday gift.'], emoji: '🎁', level: 4, frequency: 80 },
  { word: 'knight', phonetic: '/naɪt/', meaningCn: '骑士', meaningEn: 'a warrior', partOfSpeech: 'n.', examples: ['A brave knight.', 'The knight fought.'], emoji: '⚔️', level: 4, frequency: 72 },
  { word: 'battle', phonetic: '/ˈbætl/', meaningCn: '战斗', meaningEn: 'a fight', partOfSpeech: 'n.', examples: ['Many battles.', 'Win the battle.'], emoji: '⚔️', level: 4, frequency: 75 },
  { word: 'warrior', phonetic: '/ˈwɔːriər/', meaningCn: '战士', meaningEn: 'a fighter', partOfSpeech: 'n.', examples: ['A great warrior.', 'Brave warriors.'], emoji: '🗡️', level: 4, frequency: 72 },
  { word: 'soldier', phonetic: '/ˈsoʊldʒər/', meaningCn: '士兵', meaningEn: 'army member', partOfSpeech: 'n.', examples: ['Young soldiers.', 'The soldier fought.'], emoji: '💂', level: 4, frequency: 75 },
  { word: 'sword', phonetic: '/sɔːrd/', meaningCn: '剑', meaningEn: 'a weapon', partOfSpeech: 'n.', examples: ['A golden sword.', 'Draw the sword.'], emoji: '🗡️', level: 4, frequency: 72 },
  { word: 'successor', phonetic: '/səkˈsesər/', meaningCn: '继承人', meaningEn: 'one who follows', partOfSpeech: 'n.', examples: ['A worthy successor.', 'Find a successor.'], emoji: '👑', level: 4, frequency: 62 },

  // ============ 时间相关词汇 ============
  { word: 'century', phonetic: '/ˈsentʃəri/', meaningCn: '世纪', meaningEn: '100 years', partOfSpeech: 'n.', examples: ['Centuries ago.', 'This century.'], emoji: '📅', level: 4, frequency: 68 },
  { word: 'perhaps', phonetic: '/pərˈhæps/', meaningCn: '也许', meaningEn: 'maybe', partOfSpeech: 'adv.', examples: ['Perhaps tomorrow.', 'Perhaps one day.'], emoji: '🤔', level: 4, frequency: 75 },
  { word: 'immediately', phonetic: '/ɪˈmiːdiətli/', meaningCn: '立刻', meaningEn: 'at once', partOfSpeech: 'adv.', examples: ['Come immediately.', 'She recognized it immediately.'], emoji: '⚡', level: 4, frequency: 72 },
  { word: 'finally', phonetic: '/ˈfaɪnəli/', meaningCn: '最终', meaningEn: 'at last', partOfSpeech: 'adv.', examples: ['He finally arrived.', 'Finally done!'], emoji: '🎯', level: 4, frequency: 80 },

  // ============ 介词/连词 ============
  { word: 'behind', phonetic: '/bɪˈhaɪnd/', meaningCn: '在...后面', meaningEn: 'at the back of', partOfSpeech: 'prep.', examples: ['Behind the palace.', 'Stand behind me.'], emoji: '↩️', level: 4, frequency: 78 },
  { word: 'during', phonetic: '/ˈdʊrɪŋ/', meaningCn: '在...期间', meaningEn: 'throughout', partOfSpeech: 'prep.', examples: ['During the storm.', 'During summer.'], emoji: '⏱️', level: 4, frequency: 78 },
  { word: 'throughout', phonetic: '/θruːˈaʊt/', meaningCn: '遍及', meaningEn: 'in every part of', partOfSpeech: 'prep.', examples: ['Throughout the kingdom.', 'Throughout the year.'], emoji: '🌍', level: 4, frequency: 68 },
];

export default l4Dictionary;

