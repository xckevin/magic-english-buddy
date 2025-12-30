/**
 * L2 词典数据 - 回声山谷
 * 包含动词、祈使句、简单主谓宾相关词汇
 */

import type { DictionaryEntry } from '@/db';

export const l2Dictionary: DictionaryEntry[] = [
  // ============ 动词（核心）============
  { word: 'sing', phonetic: '/sɪŋ/', meaningCn: '唱歌', meaningEn: 'to make music with your voice', partOfSpeech: 'v.', examples: ['The bird sings a song.', 'I like to sing.'], emoji: '🎤', level: 2, frequency: 90 },
  { word: 'walk', phonetic: '/wɔːk/', meaningCn: '走路', meaningEn: 'to move on foot', partOfSpeech: 'v.', examples: ['I walk to school.', 'The kitten was walking.'], emoji: '🚶', level: 2, frequency: 90 },
  { word: 'find', phonetic: '/faɪnd/', meaningCn: '找到', meaningEn: 'to discover', partOfSpeech: 'v.', examples: ['I find my book.', 'The owl helped find home.'], emoji: '🔍', level: 2, frequency: 88 },
  { word: 'help', phonetic: '/help/', meaningCn: '帮助', meaningEn: 'to assist someone', partOfSpeech: 'v.', examples: ['Can you help me?', 'The owl helped the kitten.'], emoji: '🤝', level: 2, frequency: 88 },
  { word: 'listen', phonetic: '/ˈlɪsən/', meaningCn: '听', meaningEn: 'to pay attention to sound', partOfSpeech: 'v.', examples: ['Listen to the song.', 'All animals listen.'], emoji: '👂', level: 2, frequency: 85 },
  { word: 'wake', phonetic: '/weɪk/', meaningCn: '醒来', meaningEn: 'to stop sleeping', partOfSpeech: 'v.', examples: ['I wake up early.', 'The animals wake up.'], emoji: '⏰', level: 2, frequency: 85 },
  { word: 'fly', phonetic: '/flaɪ/', meaningCn: '飞', meaningEn: 'to move through air', partOfSpeech: 'v.', examples: ['Birds can fly.', 'The kite flies high.'], emoji: '✈️', level: 2, frequency: 85 },
  { word: 'touch', phonetic: '/tʌtʃ/', meaningCn: '触摸', meaningEn: 'to feel with fingers', partOfSpeech: 'v.', examples: ['Touch the flower.', 'When you touch them.'], emoji: '👆', level: 2, frequency: 80 },
  { word: 'change', phonetic: '/tʃeɪndʒ/', meaningCn: '改变', meaningEn: 'to become different', partOfSpeech: 'v.', examples: ['Colors can change.', 'The weather changes.'], emoji: '🔄', level: 2, frequency: 80 },
  { word: 'stop', phonetic: '/stɒp/', meaningCn: '停止', meaningEn: 'to cease moving', partOfSpeech: 'v.', examples: ['The rain stopped.', 'Stop here.'], emoji: '🛑', level: 2, frequency: 82 },
  { word: 'appear', phonetic: '/əˈpɪr/', meaningCn: '出现', meaningEn: 'to become visible', partOfSpeech: 'v.', examples: ['A rainbow appeared.', 'The sun appears.'], emoji: '✨', level: 2, frequency: 75 },
  { word: 'show', phonetic: '/ʃoʊ/', meaningCn: '展示', meaningEn: 'to display', partOfSpeech: 'v.', examples: ['Show me the map.', 'The map showed a path.'], emoji: '👁️', level: 2, frequency: 80 },
  { word: 'live', phonetic: '/lɪv/', meaningCn: '居住', meaningEn: 'to reside', partOfSpeech: 'v.', examples: ['I live in a house.', 'The mouse lived here.'], emoji: '🏠', level: 2, frequency: 85 },
  { word: 'come', phonetic: '/kʌm/', meaningCn: '来', meaningEn: 'to move toward', partOfSpeech: 'v.', examples: ['Come here!', 'A cat came to the house.'], emoji: '👋', level: 2, frequency: 90 },
  { word: 'scare', phonetic: '/sker/', meaningCn: '吓唬', meaningEn: 'to frighten', partOfSpeech: 'v.', examples: ['The noise scared the cat.', "Don't scare me!"], emoji: '😱', level: 2, frequency: 70 },
  { word: 'blow', phonetic: '/bloʊ/', meaningCn: '吹', meaningEn: 'to move air', partOfSpeech: 'v.', examples: ['The wind blows.', 'Blow the candle.'], emoji: '💨', level: 2, frequency: 75 },
  { word: 'decide', phonetic: '/dɪˈsaɪd/', meaningCn: '决定', meaningEn: 'to make a choice', partOfSpeech: 'v.', examples: ['I decide to go.', 'He decided to sleep.'], emoji: '🤔', level: 2, frequency: 70 },
  { word: 'share', phonetic: '/ʃer/', meaningCn: '分享', meaningEn: 'to give part of something', partOfSpeech: 'v.', examples: ['Share your food.', 'He shared vegetables.'], emoji: '🤲', level: 2, frequency: 75 },
  { word: 'watch', phonetic: '/wɒtʃ/', meaningCn: '观看', meaningEn: 'to look at', partOfSpeech: 'v.', examples: ['Watch the movie.', 'She watched over them.'], emoji: '👀', level: 2, frequency: 80 },
  { word: 'work', phonetic: '/wɜːrk/', meaningCn: '工作', meaningEn: 'to do a job', partOfSpeech: 'v.', examples: ['I work hard.', 'The farmer worked.'], emoji: '💼', level: 2, frequency: 85 },

  // ============ 形容词（描述性）============
  { word: 'beautiful', phonetic: '/ˈbjuːtɪfl/', meaningCn: '美丽的', meaningEn: 'pleasing to look at', partOfSpeech: 'adj.', examples: ['A beautiful song.', 'The rainbow is beautiful.'], emoji: '🌺', level: 2, frequency: 85 },
  { word: 'old', phonetic: '/oʊld/', meaningCn: '老的', meaningEn: 'having lived for many years', partOfSpeech: 'adj.', examples: ['An old tree.', 'An old map.'], emoji: '👴', level: 2, frequency: 85 },
  { word: 'small', phonetic: '/smɔːl/', meaningCn: '小的', meaningEn: 'little in size', partOfSpeech: 'adj.', examples: ['A small bird.', 'A small mouse.'], emoji: '🐜', level: 2, frequency: 88 },
  { word: 'dark', phonetic: '/dɑːrk/', meaningCn: '黑暗的', meaningEn: 'without light', partOfSpeech: 'adj.', examples: ['It was dark.', 'A dark night.'], emoji: '🌑', level: 2, frequency: 80 },
  { word: 'friendly', phonetic: '/ˈfrendli/', meaningCn: '友好的', meaningEn: 'kind and pleasant', partOfSpeech: 'adj.', examples: ['A friendly owl.', 'Be friendly!'], emoji: '😊', level: 2, frequency: 80 },
  { word: 'colorful', phonetic: '/ˈkʌlərfl/', meaningCn: '五彩的', meaningEn: 'having many colors', partOfSpeech: 'adj.', examples: ['A colorful rainbow.', 'Colorful kites.'], emoji: '🌈', level: 2, frequency: 75 },
  { word: 'brave', phonetic: '/breɪv/', meaningCn: '勇敢的', meaningEn: 'not afraid', partOfSpeech: 'adj.', examples: ['A brave mouse.', 'Be brave!'], emoji: '💪', level: 2, frequency: 78 },
  { word: 'loud', phonetic: '/laʊd/', meaningCn: '响亮的', meaningEn: 'making much noise', partOfSpeech: 'adj.', examples: ['A loud noise.', 'Speak loud!'], emoji: '📢', level: 2, frequency: 78 },
  { word: 'secret', phonetic: '/ˈsiːkrət/', meaningCn: '秘密的', meaningEn: 'hidden', partOfSpeech: 'adj.', examples: ['A secret garden.', 'Keep it secret.'], emoji: '🤫', level: 2, frequency: 75 },
  { word: 'hidden', phonetic: '/ˈhɪdn/', meaningCn: '隐藏的', meaningEn: 'not visible', partOfSpeech: 'adj.', examples: ['A hidden treasure.', 'Hidden path.'], emoji: '🙈', level: 2, frequency: 72 },
  { word: 'warm', phonetic: '/wɔːrm/', meaningCn: '温暖的', meaningEn: 'slightly hot', partOfSpeech: 'adj.', examples: ['A warm cave.', 'Warm sunshine.'], emoji: '🌡️', level: 2, frequency: 80 },
  { word: 'sleepy', phonetic: '/ˈsliːpi/', meaningCn: '困倦的', meaningEn: 'wanting to sleep', partOfSpeech: 'adj.', examples: ['The bear felt sleepy.', 'I am sleepy.'], emoji: '😴', level: 2, frequency: 75 },
  { word: 'high', phonetic: '/haɪ/', meaningCn: '高的', meaningEn: 'far above ground', partOfSpeech: 'adj.', examples: ['High in the sky.', 'A high mountain.'], emoji: '⬆️', level: 2, frequency: 82 },
  { word: 'lost', phonetic: '/lɒst/', meaningCn: '迷路的', meaningEn: 'unable to find the way', partOfSpeech: 'adj.', examples: ['A lost kitten.', 'I am lost.'], emoji: '😢', level: 2, frequency: 75 },

  // ============ 名词（场景相关）============
  { word: 'song', phonetic: '/sɒŋ/', meaningCn: '歌曲', meaningEn: 'music with words', partOfSpeech: 'n.', examples: ['Sing a song.', 'A beautiful song.'], emoji: '🎵', level: 2, frequency: 85 },
  { word: 'valley', phonetic: '/ˈvæli/', meaningCn: '山谷', meaningEn: 'low land between hills', partOfSpeech: 'n.', examples: ['Echo valley.', 'Through the valley.'], emoji: '🏞️', level: 2, frequency: 70 },
  { word: 'echo', phonetic: '/ˈekoʊ/', meaningCn: '回声', meaningEn: 'repeated sound', partOfSpeech: 'n.', examples: ['I hear an echo.', 'The song echoes.'], emoji: '🔊', level: 2, frequency: 65 },
  { word: 'forest', phonetic: '/ˈfɔːrɪst/', meaningCn: '森林', meaningEn: 'large area with trees', partOfSpeech: 'n.', examples: ['In the forest.', 'A big forest.'], emoji: '🌲', level: 2, frequency: 80 },
  { word: 'owl', phonetic: '/aʊl/', meaningCn: '猫头鹰', meaningEn: 'a night bird', partOfSpeech: 'n.', examples: ['A friendly owl.', 'The owl can see at night.'], emoji: '🦉', level: 2, frequency: 70 },
  { word: 'kitten', phonetic: '/ˈkɪtn/', meaningCn: '小猫', meaningEn: 'a young cat', partOfSpeech: 'n.', examples: ['A little kitten.', 'The kitten is lost.'], emoji: '🐱', level: 2, frequency: 78 },
  { word: 'rainbow', phonetic: '/ˈreɪnboʊ/', meaningCn: '彩虹', meaningEn: 'arc of colors in sky', partOfSpeech: 'n.', examples: ['A beautiful rainbow.', 'I see a rainbow!'], emoji: '🌈', level: 2, frequency: 75 },
  { word: 'rain', phonetic: '/reɪn/', meaningCn: '雨', meaningEn: 'water from clouds', partOfSpeech: 'n.', examples: ['The rain stopped.', 'After the rain.'], emoji: '🌧️', level: 2, frequency: 85 },
  { word: 'bridge', phonetic: '/brɪdʒ/', meaningCn: '桥', meaningEn: 'structure over water', partOfSpeech: 'n.', examples: ['A rainbow bridge.', 'Cross the bridge.'], emoji: '🌉', level: 2, frequency: 75 },
  { word: 'children', phonetic: '/ˈtʃɪldrən/', meaningCn: '孩子们', meaningEn: 'young people', partOfSpeech: 'n.', examples: ['The children ran.', 'Happy children.'], emoji: '👧', level: 2, frequency: 85 },
  { word: 'mouse', phonetic: '/maʊs/', meaningCn: '老鼠', meaningEn: 'a small rodent', partOfSpeech: 'n.', examples: ['A brave mouse.', 'The mouse is small.'], emoji: '🐭', level: 2, frequency: 80 },
  { word: 'house', phonetic: '/haʊs/', meaningCn: '房子', meaningEn: 'a building to live in', partOfSpeech: 'n.', examples: ['A big house.', 'I live in a house.'], emoji: '🏠', level: 2, frequency: 90 },
  { word: 'noise', phonetic: '/nɔɪz/', meaningCn: '噪音', meaningEn: 'loud sound', partOfSpeech: 'n.', examples: ['A loud noise.', 'What is that noise?'], emoji: '🔊', level: 2, frequency: 75 },
  { word: 'garden', phonetic: '/ˈɡɑːrdn/', meaningCn: '花园', meaningEn: 'place to grow plants', partOfSpeech: 'n.', examples: ['A secret garden.', 'In the garden.'], emoji: '🌷', level: 2, frequency: 78 },
  { word: 'middle', phonetic: '/ˈmɪdl/', meaningCn: '中间', meaningEn: 'the center part', partOfSpeech: 'n.', examples: ['In the middle.', 'The middle of the forest.'], emoji: '⭕', level: 2, frequency: 75 },
  { word: 'map', phonetic: '/mæp/', meaningCn: '地图', meaningEn: 'drawing of an area', partOfSpeech: 'n.', examples: ['A treasure map.', 'Look at the map.'], emoji: '🗺️', level: 2, frequency: 75 },
  { word: 'treasure', phonetic: '/ˈtreʒər/', meaningCn: '宝藏', meaningEn: 'valuable things', partOfSpeech: 'n.', examples: ['Hidden treasure.', 'Find the treasure.'], emoji: '💎', level: 2, frequency: 72 },
  { word: 'path', phonetic: '/pæθ/', meaningCn: '小路', meaningEn: 'a way to walk', partOfSpeech: 'n.', examples: ['A secret path.', 'Follow the path.'], emoji: '🛤️', level: 2, frequency: 75 },
  { word: 'bed', phonetic: '/bed/', meaningCn: '床', meaningEn: 'furniture for sleeping', partOfSpeech: 'n.', examples: ['Under the bed.', 'Go to bed.'], emoji: '🛏️', level: 2, frequency: 85 },
  { word: 'wind', phonetic: '/wɪnd/', meaningCn: '风', meaningEn: 'moving air', partOfSpeech: 'n.', examples: ['The wind blows.', 'Strong wind.'], emoji: '💨', level: 2, frequency: 80 },
  { word: 'hill', phonetic: '/hɪl/', meaningCn: '小山', meaningEn: 'a small mountain', partOfSpeech: 'n.', examples: ['On the hill.', 'Up the hill.'], emoji: '⛰️', level: 2, frequency: 75 },
  { word: 'kite', phonetic: '/kaɪt/', meaningCn: '风筝', meaningEn: 'a flying toy', partOfSpeech: 'n.', examples: ['Fly a kite.', 'Colorful kites.'], emoji: '🪁', level: 2, frequency: 70 },
  { word: 'winter', phonetic: '/ˈwɪntər/', meaningCn: '冬天', meaningEn: 'coldest season', partOfSpeech: 'n.', examples: ['Winter is coming.', 'In winter.'], emoji: '❄️', level: 2, frequency: 80 },
  { word: 'spring', phonetic: '/sprɪŋ/', meaningCn: '春天', meaningEn: 'season after winter', partOfSpeech: 'n.', examples: ['Wait until spring.', 'In spring.'], emoji: '🌸', level: 2, frequency: 80 },
  { word: 'cave', phonetic: '/keɪv/', meaningCn: '洞穴', meaningEn: 'hole in rock', partOfSpeech: 'n.', examples: ['A warm cave.', 'In the cave.'], emoji: '🕳️', level: 2, frequency: 70 },
  { word: 'bear', phonetic: '/ber/', meaningCn: '熊', meaningEn: 'a large furry animal', partOfSpeech: 'n.', examples: ['A sleepy bear.', 'The bear sleeps.'], emoji: '🐻', level: 2, frequency: 78 },
  { word: 'farmer', phonetic: '/ˈfɑːrmər/', meaningCn: '农夫', meaningEn: 'person who farms', partOfSpeech: 'n.', examples: ['A kind farmer.', 'The farmer works.'], emoji: '👨‍🌾', level: 2, frequency: 75 },
  { word: 'farm', phonetic: '/fɑːrm/', meaningCn: '农场', meaningEn: 'land for growing food', partOfSpeech: 'n.', examples: ['On the farm.', 'A big farm.'], emoji: '🌾', level: 2, frequency: 78 },
  { word: 'vegetable', phonetic: '/ˈvedʒtəbl/', meaningCn: '蔬菜', meaningEn: 'plant food', partOfSpeech: 'n.', examples: ['Fresh vegetables.', 'Eat vegetables.'], emoji: '🥬', level: 2, frequency: 75 },
  { word: 'neighbor', phonetic: '/ˈneɪbər/', meaningCn: '邻居', meaningEn: 'person living nearby', partOfSpeech: 'n.', examples: ['My neighbor.', 'Help your neighbors.'], emoji: '🏘️', level: 2, frequency: 72 },
  { word: 'princess', phonetic: '/ˈprɪnses/', meaningCn: '公主', meaningEn: 'daughter of a king', partOfSpeech: 'n.', examples: ['A beautiful princess.', 'The moon princess.'], emoji: '👸', level: 2, frequency: 75 },
  { word: 'earth', phonetic: '/ɜːrθ/', meaningCn: '地球', meaningEn: 'our planet', partOfSpeech: 'n.', examples: ['On Earth.', 'Planet Earth.'], emoji: '🌍', level: 2, frequency: 78 },

  // ============ 副词 ============
  { word: 'every', phonetic: '/ˈevri/', meaningCn: '每个', meaningEn: 'each one', partOfSpeech: 'adv.', examples: ['Every morning.', 'Every day.'], emoji: '📅', level: 2, frequency: 88 },
  { word: 'through', phonetic: '/θruː/', meaningCn: '穿过', meaningEn: 'from one side to another', partOfSpeech: 'prep.', examples: ['Through the valley.', 'Walk through.'], emoji: '➡️', level: 2, frequency: 80 },
  { word: 'outside', phonetic: '/ˌaʊtˈsaɪd/', meaningCn: '外面', meaningEn: 'not inside', partOfSpeech: 'adv.', examples: ['Go outside.', 'Play outside.'], emoji: '🌳', level: 2, frequency: 80 },
  { word: 'away', phonetic: '/əˈweɪ/', meaningCn: '离开', meaningEn: 'to another place', partOfSpeech: 'adv.', examples: ['Run away.', 'Go away!'], emoji: '🏃', level: 2, frequency: 82 },
  { word: 'strongly', phonetic: '/ˈstrɒŋli/', meaningCn: '强烈地', meaningEn: 'with force', partOfSpeech: 'adv.', examples: ['Wind blew strongly.', 'Feel strongly.'], emoji: '💪', level: 2, frequency: 68 },
  { word: 'until', phonetic: '/ənˈtɪl/', meaningCn: '直到', meaningEn: 'up to a time', partOfSpeech: 'prep.', examples: ['Until spring.', 'Wait until then.'], emoji: '⏳', level: 2, frequency: 75 },
  { word: 'once', phonetic: '/wʌns/', meaningCn: '曾经', meaningEn: 'at one time', partOfSpeech: 'adv.', examples: ['Once upon a time.', 'There was once.'], emoji: '1️⃣', level: 2, frequency: 80 },
  { word: 'ago', phonetic: '/əˈɡoʊ/', meaningCn: '以前', meaningEn: 'in the past', partOfSpeech: 'adv.', examples: ['Long ago.', 'Years ago.'], emoji: '⏪', level: 2, frequency: 78 },

  // ============ 连接词/介词 ============
  { word: 'because', phonetic: '/bɪˈkɒz/', meaningCn: '因为', meaningEn: 'for the reason that', partOfSpeech: 'conj.', examples: ['Because it was dark.', 'Because I love you.'], emoji: '💭', level: 2, frequency: 85 },
  { word: 'when', phonetic: '/wen/', meaningCn: '当...时', meaningEn: 'at what time', partOfSpeech: 'conj.', examples: ['When you touch them.', 'When I go.'], emoji: '⏰', level: 2, frequency: 88 },
  { word: 'after', phonetic: '/ˈæftər/', meaningCn: '在...之后', meaningEn: 'following in time', partOfSpeech: 'prep.', examples: ['After the rain.', 'After school.'], emoji: '➡️', level: 2, frequency: 85 },
  { word: 'under', phonetic: '/ˈʌndər/', meaningCn: '在...下面', meaningEn: 'below', partOfSpeech: 'prep.', examples: ['Under the bed.', 'Under the tree.'], emoji: '⬇️', level: 2, frequency: 82 },
  { word: 'over', phonetic: '/ˈoʊvər/', meaningCn: '在...上方', meaningEn: 'above', partOfSpeech: 'prep.', examples: ['Over the children.', 'Fly over.'], emoji: '⬆️', level: 2, frequency: 80 },

  // ============ 代词/限定词 ============
  { word: 'all', phonetic: '/ɔːl/', meaningCn: '所有', meaningEn: 'every one', partOfSpeech: 'det.', examples: ['All the animals.', 'All day.'], emoji: '💯', level: 2, frequency: 90 },
  { word: 'their', phonetic: '/ðer/', meaningCn: '他们的', meaningEn: 'belonging to them', partOfSpeech: 'pron.', examples: ['Their kites.', 'Their home.'], emoji: '👥', level: 2, frequency: 88 },
  { word: 'who', phonetic: '/huː/', meaningCn: '谁', meaningEn: 'what person', partOfSpeech: 'pron.', examples: ['Who helped?', 'The mouse who lived.'], emoji: '❓', level: 2, frequency: 85 },
];

export default l2Dictionary;

