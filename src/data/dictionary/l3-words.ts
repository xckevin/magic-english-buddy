/**
 * L3 词典数据 - 闪耀之海
 * 包含描述性形容词、主谓宾结构、复合句相关词汇
 */

import type { DictionaryEntry } from '@/db';

export const l3Dictionary: DictionaryEntry[] = [
  // ============ 描述性形容词（核心）============
  { word: 'shimmering', phonetic: '/ˈʃɪmərɪŋ/', meaningCn: '闪闪发光的', meaningEn: 'shining with a soft, wavering light', partOfSpeech: 'adj.', examples: ['The shimmering waves.', 'Shimmering ocean.'], emoji: '✨', level: 3, frequency: 70 },
  { word: 'sparkling', phonetic: '/ˈspɑːrklɪŋ/', meaningCn: '闪耀的', meaningEn: 'shining brightly with flashes', partOfSpeech: 'adj.', examples: ['The sparkling blue ocean.', 'Sparkling water.'], emoji: '💎', level: 3, frequency: 72 },
  { word: 'enormous', phonetic: '/ɪˈnɔːrməs/', meaningCn: '巨大的', meaningEn: 'extremely large', partOfSpeech: 'adj.', examples: ['The enormous whale.', 'An enormous ship.'], emoji: '🐋', level: 3, frequency: 75 },
  { word: 'tiny', phonetic: '/ˈtaɪni/', meaningCn: '微小的', meaningEn: 'very small', partOfSpeech: 'adj.', examples: ['A tiny starfish.', 'Tiny fish.'], emoji: '🦐', level: 3, frequency: 80 },
  { word: 'ancient', phonetic: '/ˈeɪnʃənt/', meaningCn: '古老的', meaningEn: 'very old', partOfSpeech: 'adj.', examples: ['An ancient ship.', 'Ancient treasure.'], emoji: '🏛️', level: 3, frequency: 72 },
  { word: 'peaceful', phonetic: '/ˈpiːsfl/', meaningCn: '平静的', meaningEn: 'calm and quiet', partOfSpeech: 'adj.', examples: ['A peaceful ocean.', 'Peaceful song.'], emoji: '☮️', level: 3, frequency: 75 },
  { word: 'magical', phonetic: '/ˈmædʒɪkl/', meaningCn: '神奇的', meaningEn: 'having magical powers', partOfSpeech: 'adj.', examples: ['A magical place.', 'Magical coral.'], emoji: '🪄', level: 3, frequency: 78 },
  { word: 'gentle', phonetic: '/ˈdʒentl/', meaningCn: '温柔的', meaningEn: 'kind and calm', partOfSpeech: 'adj.', examples: ['A gentle melody.', 'Gentle waves.'], emoji: '🌸', level: 3, frequency: 75 },
  { word: 'rough', phonetic: '/rʌf/', meaningCn: '汹涌的', meaningEn: 'not smooth or calm', partOfSpeech: 'adj.', examples: ['Rough waves.', 'Rough sea.'], emoji: '🌊', level: 3, frequency: 72 },
  { word: 'dangerous', phonetic: '/ˈdeɪndʒərəs/', meaningCn: '危险的', meaningEn: 'likely to cause harm', partOfSpeech: 'adj.', examples: ['Dangerous storm.', 'Dangerous waters.'], emoji: '⚠️', level: 3, frequency: 75 },
  { word: 'flexible', phonetic: '/ˈfleksəbl/', meaningCn: '灵活的', meaningEn: 'able to bend easily', partOfSpeech: 'adj.', examples: ['Flexible tentacles.', 'Flexible body.'], emoji: '🤸', level: 3, frequency: 68 },
  { word: 'tropical', phonetic: '/ˈtrɒpɪkl/', meaningCn: '热带的', meaningEn: 'relating to the tropics', partOfSpeech: 'adj.', examples: ['Tropical fish.', 'Tropical ocean.'], emoji: '🌴', level: 3, frequency: 70 },
  { word: 'golden', phonetic: '/ˈɡoʊldən/', meaningCn: '金色的', meaningEn: 'made of or like gold', partOfSpeech: 'adj.', examples: ['Golden sunlight.', 'Golden coins.'], emoji: '🪙', level: 3, frequency: 75 },
  { word: 'shiny', phonetic: '/ˈʃaɪni/', meaningCn: '闪亮的', meaningEn: 'bright and reflecting light', partOfSpeech: 'adj.', examples: ['A shiny pearl.', 'Shiny scales.'], emoji: '✨', level: 3, frequency: 78 },
  { word: 'rocky', phonetic: '/ˈrɒki/', meaningCn: '岩石的', meaningEn: 'covered with rocks', partOfSpeech: 'adj.', examples: ['Rocky cliff.', 'Rocky shore.'], emoji: '🪨', level: 3, frequency: 70 },
  { word: 'sandy', phonetic: '/ˈsændi/', meaningCn: '沙质的', meaningEn: 'covered with sand', partOfSpeech: 'adj.', examples: ['Sandy ocean floor.', 'Sandy beach.'], emoji: '🏖️', level: 3, frequency: 72 },
  { word: 'wooden', phonetic: '/ˈwʊdn/', meaningCn: '木制的', meaningEn: 'made of wood', partOfSpeech: 'adj.', examples: ['Wooden ship.', 'Wooden boat.'], emoji: '🪵', level: 3, frequency: 72 },
  { word: 'sunken', phonetic: '/ˈsʌŋkən/', meaningCn: '沉没的', meaningEn: 'lying at the bottom', partOfSpeech: 'adj.', examples: ['Sunken ship.', 'Sunken treasure.'], emoji: '⚓', level: 3, frequency: 65 },
  { word: 'grateful', phonetic: '/ˈɡreɪtfl/', meaningCn: '感激的', meaningEn: 'feeling thankful', partOfSpeech: 'adj.', examples: ['Felt grateful.', 'Grateful for help.'], emoji: '🙏', level: 3, frequency: 72 },
  { word: 'clever', phonetic: '/ˈklevər/', meaningCn: '聪明的', meaningEn: 'quick to understand', partOfSpeech: 'adj.', examples: ['A clever dolphin.', 'Clever idea.'], emoji: '🧠', level: 3, frequency: 78 },
  { word: 'special', phonetic: '/ˈspeʃl/', meaningCn: '特别的', meaningEn: 'different from others', partOfSpeech: 'adj.', examples: ['You are special.', 'Special treasure.'], emoji: '⭐', level: 3, frequency: 82 },

  // ============ 动词（进阶）============
  { word: 'swim', phonetic: '/swɪm/', meaningCn: '游泳', meaningEn: 'to move through water', partOfSpeech: 'v.', examples: ['Fish swim in the sea.', 'Marina swam.'], emoji: '🏊', level: 3, frequency: 85 },
  { word: 'sparkle', phonetic: '/ˈspɑːrkl/', meaningCn: '闪烁', meaningEn: 'to shine with small flashes', partOfSpeech: 'v.', examples: ['Her hair sparkled.', 'Stars sparkle.'], emoji: '✨', level: 3, frequency: 70 },
  { word: 'explore', phonetic: '/ɪkˈsplɔːr/', meaningCn: '探索', meaningEn: 'to travel to discover', partOfSpeech: 'v.', examples: ['Explore the world.', 'Explore the ocean.'], emoji: '🧭', level: 3, frequency: 75 },
  { word: 'dream', phonetic: '/driːm/', meaningCn: '梦想', meaningEn: 'to hope for something', partOfSpeech: 'v.', examples: ['She dreamed of exploring.', 'Dream big!'], emoji: '💭', level: 3, frequency: 80 },
  { word: 'trap', phonetic: '/træp/', meaningCn: '困住', meaningEn: 'to catch and hold', partOfSpeech: 'v.', examples: ['Got trapped in a net.', 'Trap the fish.'], emoji: '🪤', level: 3, frequency: 70 },
  { word: 'push', phonetic: '/pʊʃ/', meaningCn: '推', meaningEn: 'to press against', partOfSpeech: 'v.', examples: ['Push the net open.', 'Push the door.'], emoji: '👐', level: 3, frequency: 78 },
  { word: 'glow', phonetic: '/ɡloʊ/', meaningCn: '发光', meaningEn: 'to give off light', partOfSpeech: 'v.', examples: ['The pearl glowed.', 'Glow softly.'], emoji: '💡', level: 3, frequency: 70 },
  { word: 'remind', phonetic: '/rɪˈmaɪnd/', meaningCn: '提醒', meaningEn: 'to make someone remember', partOfSpeech: 'v.', examples: ['It reminded her.', 'Remind me later.'], emoji: '🔔', level: 3, frequency: 72 },
  { word: 'travel', phonetic: '/ˈtrævl/', meaningCn: '旅行', meaningEn: 'to go from place to place', partOfSpeech: 'v.', examples: ['The song traveled far.', 'Travel the world.'], emoji: '🚀', level: 3, frequency: 78 },
  { word: 'wish', phonetic: '/wɪʃ/', meaningCn: '希望', meaningEn: 'to want something', partOfSpeech: 'v.', examples: ['She wished she could swim.', 'Make a wish!'], emoji: '🌠', level: 3, frequency: 80 },
  { word: 'smile', phonetic: '/smaɪl/', meaningCn: '微笑', meaningEn: 'to show happiness', partOfSpeech: 'v.', examples: ['The starfish smiled.', 'Smile at me.'], emoji: '😊', level: 3, frequency: 82 },
  { word: 'gather', phonetic: '/ˈɡæðər/', meaningCn: '聚集', meaningEn: 'to come together', partOfSpeech: 'v.', examples: ['Clouds gathered.', 'Gather around.'], emoji: '👥', level: 3, frequency: 72 },
  { word: 'hide', phonetic: '/haɪd/', meaningCn: '躲藏', meaningEn: 'to go out of sight', partOfSpeech: 'v.', examples: ['Fish hid in the reef.', 'Hide and seek.'], emoji: '🙈', level: 3, frequency: 78 },
  { word: 'pass', phonetic: '/pæs/', meaningCn: '经过', meaningEn: 'to go by', partOfSpeech: 'v.', examples: ['The storm passed.', 'Time passes.'], emoji: '⏩', level: 3, frequency: 80 },
  { word: 'match', phonetic: '/mætʃ/', meaningCn: '匹配', meaningEn: 'to be similar to', partOfSpeech: 'v.', examples: ['Match the rocks.', 'Colors match.'], emoji: '🎯', level: 3, frequency: 72 },
  { word: 'discover', phonetic: '/dɪˈskʌvər/', meaningCn: '发现', meaningEn: 'to find for the first time', partOfSpeech: 'v.', examples: ['Explorers discovered gold.', 'Discover treasure.'], emoji: '🔍', level: 3, frequency: 75 },
  { word: 'cover', phonetic: '/ˈkʌvər/', meaningCn: '覆盖', meaningEn: 'to put over', partOfSpeech: 'v.', examples: ['Covered with coral.', 'Cover the box.'], emoji: '📦', level: 3, frequency: 75 },
  { word: 'guide', phonetic: '/ɡaɪd/', meaningCn: '引导', meaningEn: 'to show the way', partOfSpeech: 'v.', examples: ['The light guided ships.', 'Guide me home.'], emoji: '🧭', level: 3, frequency: 75 },
  { word: 'return', phonetic: '/rɪˈtɜːrn/', meaningCn: '返回', meaningEn: 'to come back', partOfSpeech: 'v.', examples: ['Sailors returned home.', 'Return the book.'], emoji: '↩️', level: 3, frequency: 78 },
  { word: 'care', phonetic: '/ker/', meaningCn: '关心', meaningEn: 'to look after', partOfSpeech: 'v.', examples: ['Cared for the light.', 'I care about you.'], emoji: '💕', level: 3, frequency: 80 },

  // ============ 名词（海洋主题）============
  { word: 'mermaid', phonetic: '/ˈmɜːrmeɪd/', meaningCn: '美人鱼', meaningEn: 'a mythical sea creature', partOfSpeech: 'n.', examples: ['A beautiful mermaid.', 'The little mermaid.'], emoji: '🧜‍♀️', level: 3, frequency: 70 },
  { word: 'wave', phonetic: '/weɪv/', meaningCn: '波浪', meaningEn: 'moving water on the surface', partOfSpeech: 'n.', examples: ['Shimmering waves.', 'Big waves.'], emoji: '🌊', level: 3, frequency: 80 },
  { word: 'reef', phonetic: '/riːf/', meaningCn: '珊瑚礁', meaningEn: 'underwater ridge of rock or coral', partOfSpeech: 'n.', examples: ['The coral reef.', 'Colorful reef.'], emoji: '🪸', level: 3, frequency: 72 },
  { word: 'dolphin', phonetic: '/ˈdɒlfɪn/', meaningCn: '海豚', meaningEn: 'an intelligent sea mammal', partOfSpeech: 'n.', examples: ['A clever dolphin.', 'Dolphins swim fast.'], emoji: '🐬', level: 3, frequency: 78 },
  { word: 'creature', phonetic: '/ˈkriːtʃər/', meaningCn: '生物', meaningEn: 'a living animal', partOfSpeech: 'n.', examples: ['Sea creatures.', 'Different creatures.'], emoji: '🦑', level: 3, frequency: 75 },
  { word: 'kingdom', phonetic: '/ˈkɪŋdəm/', meaningCn: '王国', meaningEn: 'a land ruled by a king', partOfSpeech: 'n.', examples: ['The coral kingdom.', 'Ocean kingdom.'], emoji: '👑', level: 3, frequency: 72 },
  { word: 'clownfish', phonetic: '/ˈklaʊnfɪʃ/', meaningCn: '小丑鱼', meaningEn: 'an orange fish with white stripes', partOfSpeech: 'n.', examples: ['Orange clownfish.', 'Cute clownfish.'], emoji: '🐠', level: 3, frequency: 68 },
  { word: 'turtle', phonetic: '/ˈtɜːrtl/', meaningCn: '海龟', meaningEn: 'a sea animal with a shell', partOfSpeech: 'n.', examples: ['Green turtles.', 'Sea turtle.'], emoji: '🐢', level: 3, frequency: 75 },
  { word: 'oyster', phonetic: '/ˈɔɪstər/', meaningCn: '牡蛎', meaningEn: 'a shellfish that makes pearls', partOfSpeech: 'n.', examples: ['An oyster on the floor.', 'Pearl oyster.'], emoji: '🦪', level: 3, frequency: 65 },
  { word: 'pearl', phonetic: '/pɜːrl/', meaningCn: '珍珠', meaningEn: 'a precious gem from an oyster', partOfSpeech: 'n.', examples: ['A shiny pearl.', 'Pearl necklace.'], emoji: '🔮', level: 3, frequency: 72 },
  { word: 'necklace', phonetic: '/ˈnekləs/', meaningCn: '项链', meaningEn: 'jewelry worn around the neck', partOfSpeech: 'n.', examples: ['A beautiful necklace.', 'Pearl necklace.'], emoji: '📿', level: 3, frequency: 70 },
  { word: 'whale', phonetic: '/weɪl/', meaningCn: '鲸鱼', meaningEn: 'the largest sea animal', partOfSpeech: 'n.', examples: ['An enormous whale.', 'Blue whale.'], emoji: '🐋', level: 3, frequency: 75 },
  { word: 'melody', phonetic: '/ˈmelədi/', meaningCn: '旋律', meaningEn: 'a sequence of musical notes', partOfSpeech: 'n.', examples: ['A gentle melody.', 'Beautiful melody.'], emoji: '🎵', level: 3, frequency: 68 },
  { word: 'starfish', phonetic: '/ˈstɑːrfɪʃ/', meaningCn: '海星', meaningEn: 'a star-shaped sea animal', partOfSpeech: 'n.', examples: ['A tiny starfish.', 'Orange starfish.'], emoji: '⭐', level: 3, frequency: 70 },
  { word: 'storm', phonetic: '/stɔːrm/', meaningCn: '暴风雨', meaningEn: 'bad weather with wind and rain', partOfSpeech: 'n.', examples: ['Ocean storm.', 'The storm passed.'], emoji: '⛈️', level: 3, frequency: 75 },
  { word: 'cloud', phonetic: '/klaʊd/', meaningCn: '云', meaningEn: 'white mass in the sky', partOfSpeech: 'n.', examples: ['Dark clouds.', 'Storm clouds.'], emoji: '☁️', level: 3, frequency: 80 },
  { word: 'octopus', phonetic: '/ˈɒktəpəs/', meaningCn: '章鱼', meaningEn: 'sea animal with eight arms', partOfSpeech: 'n.', examples: ['A friendly octopus.', 'Octopus has tentacles.'], emoji: '🐙', level: 3, frequency: 70 },
  { word: 'tentacle', phonetic: '/ˈtentəkl/', meaningCn: '触手', meaningEn: 'long flexible arm', partOfSpeech: 'n.', examples: ['Eight tentacles.', 'Flexible tentacles.'], emoji: '🦑', level: 3, frequency: 62 },
  { word: 'ship', phonetic: '/ʃɪp/', meaningCn: '船', meaningEn: 'a large boat', partOfSpeech: 'n.', examples: ['An ancient ship.', 'Sunken ship.'], emoji: '🚢', level: 3, frequency: 80 },
  { word: 'coin', phonetic: '/kɔɪn/', meaningCn: '硬币', meaningEn: 'a metal piece of money', partOfSpeech: 'n.', examples: ['Golden coins.', 'Treasure coins.'], emoji: '🪙', level: 3, frequency: 75 },
  { word: 'jewelry', phonetic: '/ˈdʒuːəlri/', meaningCn: '珠宝', meaningEn: 'decorative items worn', partOfSpeech: 'n.', examples: ['Golden jewelry.', 'Beautiful jewelry.'], emoji: '💎', level: 3, frequency: 70 },
  { word: 'explorer', phonetic: '/ɪkˈsplɔːrər/', meaningCn: '探险家', meaningEn: 'person who explores', partOfSpeech: 'n.', examples: ['Brave explorers.', 'Ocean explorer.'], emoji: '🧭', level: 3, frequency: 68 },
  { word: 'lighthouse', phonetic: '/ˈlaɪthaʊs/', meaningCn: '灯塔', meaningEn: 'tower with a light to guide ships', partOfSpeech: 'n.', examples: ['A tall lighthouse.', 'White lighthouse.'], emoji: '🏠', level: 3, frequency: 68 },
  { word: 'cliff', phonetic: '/klɪf/', meaningCn: '悬崖', meaningEn: 'a steep rock face', partOfSpeech: 'n.', examples: ['Rocky cliff.', 'High cliff.'], emoji: '🏔️', level: 3, frequency: 65 },
  { word: 'darkness', phonetic: '/ˈdɑːrknəs/', meaningCn: '黑暗', meaningEn: 'the absence of light', partOfSpeech: 'n.', examples: ['Through the darkness.', 'In the darkness.'], emoji: '🌑', level: 3, frequency: 72 },
  { word: 'keeper', phonetic: '/ˈkiːpər/', meaningCn: '守护者', meaningEn: 'person who takes care of', partOfSpeech: 'n.', examples: ['Lighthouse keeper.', 'The keeper.'], emoji: '🧑‍✈️', level: 3, frequency: 65 },
  { word: 'sailor', phonetic: '/ˈseɪlər/', meaningCn: '水手', meaningEn: 'person who works on a ship', partOfSpeech: 'n.', examples: ['Many sailors.', 'Brave sailor.'], emoji: '⚓', level: 3, frequency: 72 },
  { word: 'bottom', phonetic: '/ˈbɒtəm/', meaningCn: '底部', meaningEn: 'the lowest part', partOfSpeech: 'n.', examples: ['Ocean floor.', 'At the bottom.'], emoji: '⬇️', level: 3, frequency: 78 },
  { word: 'floor', phonetic: '/flɔːr/', meaningCn: '地板/海底', meaningEn: 'the bottom surface', partOfSpeech: 'n.', examples: ['Ocean floor.', 'Sandy floor.'], emoji: '🏖️', level: 3, frequency: 80 },

  // ============ 副词 ============
  { word: 'deeply', phonetic: '/ˈdiːpli/', meaningCn: '深深地', meaningEn: 'to a great depth', partOfSpeech: 'adv.', examples: ['Deep beneath.', 'Think deeply.'], emoji: '⬇️', level: 3, frequency: 70 },
  { word: 'gracefully', phonetic: '/ˈɡreɪsfəli/', meaningCn: '优雅地', meaningEn: 'in an elegant way', partOfSpeech: 'adv.', examples: ['Spin gracefully.', 'Move gracefully.'], emoji: '🩰', level: 3, frequency: 65 },
  { word: 'quickly', phonetic: '/ˈkwɪkli/', meaningCn: '快速地', meaningEn: 'in a fast way', partOfSpeech: 'adv.', examples: ['Swam quickly.', 'Move quickly.'], emoji: '⚡', level: 3, frequency: 82 },
  { word: 'softly', phonetic: '/ˈsɒftli/', meaningCn: '轻轻地', meaningEn: 'in a gentle way', partOfSpeech: 'adv.', examples: ['Glowed softly.', 'Speak softly.'], emoji: '🤫', level: 3, frequency: 72 },
  { word: 'peacefully', phonetic: '/ˈpiːsfəli/', meaningCn: '平静地', meaningEn: 'in a calm way', partOfSpeech: 'adv.', examples: ['Lived peacefully.', 'Sleep peacefully.'], emoji: '☮️', level: 3, frequency: 70 },
  { word: 'truly', phonetic: '/ˈtruːli/', meaningCn: '真正地', meaningEn: 'in a true way', partOfSpeech: 'adv.', examples: ['Felt truly happy.', 'Truly grateful.'], emoji: '💯', level: 3, frequency: 75 },
  { word: 'usually', phonetic: '/ˈjuːʒuəli/', meaningCn: '通常', meaningEn: 'in most cases', partOfSpeech: 'adv.', examples: ['Usually calm.', 'I usually go.'], emoji: '🔄', level: 3, frequency: 80 },
  { word: 'safely', phonetic: '/ˈseɪfli/', meaningCn: '安全地', meaningEn: 'without danger', partOfSpeech: 'adv.', examples: ['Returned safely.', 'Arrive safely.'], emoji: '🛡️', level: 3, frequency: 78 },

  // ============ 介词/连词 ============
  { word: 'beneath', phonetic: '/bɪˈniːθ/', meaningCn: '在...下面', meaningEn: 'under', partOfSpeech: 'prep.', examples: ['Beneath the waves.', 'Beneath the sea.'], emoji: '⬇️', level: 3, frequency: 68 },
  { word: 'across', phonetic: '/əˈkrɒs/', meaningCn: '穿过', meaningEn: 'from one side to the other', partOfSpeech: 'prep.', examples: ['Traveled across.', 'Swim across.'], emoji: '↔️', level: 3, frequency: 75 },
  { word: 'inside', phonetic: '/ɪnˈsaɪd/', meaningCn: '在里面', meaningEn: 'within', partOfSpeech: 'prep.', examples: ['Inside the ship.', 'Inside the oyster.'], emoji: '📦', level: 3, frequency: 80 },
  { word: 'thanks', phonetic: '/θæŋks/', meaningCn: '多亏', meaningEn: 'because of', partOfSpeech: 'prep.', examples: ['Thanks to him.', 'Thanks to you.'], emoji: '🙏', level: 3, frequency: 80 },

  // ============ 其他词汇 ============
  { word: 'someday', phonetic: '/ˈsʌmdeɪ/', meaningCn: '有一天', meaningEn: 'at some time in the future', partOfSpeech: 'adv.', examples: ['Explore someday.', 'Visit someday.'], emoji: '📅', level: 3, frequency: 75 },
  { word: 'everyone', phonetic: '/ˈevriwʌn/', meaningCn: '每个人', meaningEn: 'all people', partOfSpeech: 'pron.', examples: ['Everyone loved him.', 'Everyone is happy.'], emoji: '👥', level: 3, frequency: 82 },
  { word: 'everything', phonetic: '/ˈevriθɪŋ/', meaningCn: '一切', meaningEn: 'all things', partOfSpeech: 'pron.', examples: ['Everything was calm.', 'Everything is fine.'], emoji: '🌟', level: 3, frequency: 80 },
  { word: 'different', phonetic: '/ˈdɪfrənt/', meaningCn: '不同的', meaningEn: 'not the same', partOfSpeech: 'adj.', examples: ['Different creatures.', 'Different colors.'], emoji: '🔄', level: 3, frequency: 82 },
  { word: 'whole', phonetic: '/hoʊl/', meaningCn: '整个', meaningEn: 'complete', partOfSpeech: 'adj.', examples: ['The whole ocean.', 'Whole world.'], emoji: '🌍', level: 3, frequency: 78 },
];

export default l3Dictionary;

