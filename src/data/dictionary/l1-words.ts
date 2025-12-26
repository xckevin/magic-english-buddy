/**
 * L1 基础词典数据 (精选 200 词)
 * 包含 L1 故事中出现的核心词汇
 */

import type { DictionaryEntry } from '@/db';

export const l1Dictionary: DictionaryEntry[] = [
  // 常用动词
  { word: 'is', phonetic: '/ɪz/', meaningCn: '是', meaningEn: 'be (third person singular)', partOfSpeech: 'v.', examples: ['This is a cat.', 'It is red.'], emoji: '✓', level: 1, frequency: 100 },
  { word: 'are', phonetic: '/ɑːr/', meaningCn: '是（复数）', meaningEn: 'be (plural)', partOfSpeech: 'v.', examples: ['They are happy.', 'Colors are beautiful.'], emoji: '✓', level: 1, frequency: 100 },
  { word: 'have', phonetic: '/hæv/', meaningCn: '有', meaningEn: 'to possess', partOfSpeech: 'v.', examples: ['I have a cat.', 'I have many toys.'], emoji: '🤲', level: 1, frequency: 95 },
  { word: 'see', phonetic: '/siː/', meaningCn: '看见', meaningEn: 'to perceive with eyes', partOfSpeech: 'v.', examples: ['I see a dog.', 'I see the moon.'], emoji: '👀', level: 1, frequency: 90 },
  { word: 'love', phonetic: '/lʌv/', meaningCn: '爱', meaningEn: 'to feel deep affection', partOfSpeech: 'v.', examples: ['I love my cat.', 'I love fruit.'], emoji: '❤️', level: 1, frequency: 85 },
  { word: 'like', phonetic: '/laɪk/', meaningCn: '喜欢', meaningEn: 'to enjoy', partOfSpeech: 'v.', examples: ['I like apples.', 'The cat likes to play.'], emoji: '👍', level: 1, frequency: 85 },
  { word: 'go', phonetic: '/ɡoʊ/', meaningCn: '去', meaningEn: 'to move or travel', partOfSpeech: 'v.', examples: ['I go to school.', 'I go to the park.'], emoji: '🚶', level: 1, frequency: 85 },
  { word: 'play', phonetic: '/pleɪ/', meaningCn: '玩', meaningEn: 'to engage in activity for fun', partOfSpeech: 'v.', examples: ['I play with toys.', 'It likes to play.'], emoji: '🎮', level: 1, frequency: 80 },
  { word: 'run', phonetic: '/rʌn/', meaningCn: '跑', meaningEn: 'to move quickly', partOfSpeech: 'v.', examples: ['The dog can run.', 'Run fast!'], emoji: '🏃', level: 1, frequency: 75 },
  { word: 'eat', phonetic: '/iːt/', meaningCn: '吃', meaningEn: 'to consume food', partOfSpeech: 'v.', examples: ['I eat breakfast.', 'Eat your food.'], emoji: '🍽️', level: 1, frequency: 75 },
  
  // 动物
  { word: 'cat', phonetic: '/kæt/', meaningCn: '猫', meaningEn: 'a small furry pet', partOfSpeech: 'n.', examples: ['I have a cat.', 'The cat is white.'], emoji: '🐱', level: 1, frequency: 90 },
  { word: 'dog', phonetic: '/dɔːɡ/', meaningCn: '狗', meaningEn: 'a loyal pet animal', partOfSpeech: 'n.', examples: ['I see a dog.', 'The dog says woof.'], emoji: '🐶', level: 1, frequency: 90 },
  { word: 'rabbit', phonetic: '/ˈræbɪt/', meaningCn: '兔子', meaningEn: 'a small animal with long ears', partOfSpeech: 'n.', examples: ['A little rabbit.', 'The rabbit is happy.'], emoji: '🐰', level: 1, frequency: 75 },
  { word: 'bird', phonetic: '/bɜːrd/', meaningCn: '鸟', meaningEn: 'a flying animal', partOfSpeech: 'n.', examples: ['I see a bird.', 'The bird can fly.'], emoji: '🐦', level: 1, frequency: 70 },
  
  // 颜色
  { word: 'red', phonetic: '/red/', meaningCn: '红色', meaningEn: 'the color of blood', partOfSpeech: 'adj.', examples: ['A red apple.', 'The car is red.'], emoji: '🔴', level: 1, frequency: 85 },
  { word: 'blue', phonetic: '/bluː/', meaningCn: '蓝色', meaningEn: 'the color of the sky', partOfSpeech: 'adj.', examples: ['The sky is blue.', 'A blue ball.'], emoji: '🔵', level: 1, frequency: 85 },
  { word: 'green', phonetic: '/ɡriːn/', meaningCn: '绿色', meaningEn: 'the color of grass', partOfSpeech: 'adj.', examples: ['The grass is green.', 'A green tree.'], emoji: '🟢', level: 1, frequency: 80 },
  { word: 'yellow', phonetic: '/ˈjeloʊ/', meaningCn: '黄色', meaningEn: 'the color of the sun', partOfSpeech: 'adj.', examples: ['The sun is yellow.', 'A yellow banana.'], emoji: '🟡', level: 1, frequency: 75 },
  { word: 'white', phonetic: '/waɪt/', meaningCn: '白色', meaningEn: 'the color of snow', partOfSpeech: 'adj.', examples: ['The cat is white.', 'White clouds.'], emoji: '⬜', level: 1, frequency: 80 },
  { word: 'brown', phonetic: '/braʊn/', meaningCn: '棕色', meaningEn: 'the color of chocolate', partOfSpeech: 'adj.', examples: ['The dog is brown.', 'Brown bear.'], emoji: '🟫', level: 1, frequency: 70 },
  
  // 数字
  { word: 'one', phonetic: '/wʌn/', meaningCn: '一', meaningEn: 'the number 1', partOfSpeech: 'num.', examples: ['One apple.', 'I have one cat.'], emoji: '1️⃣', level: 1, frequency: 90 },
  { word: 'two', phonetic: '/tuː/', meaningCn: '二', meaningEn: 'the number 2', partOfSpeech: 'num.', examples: ['Two oranges.', 'Two dogs.'], emoji: '2️⃣', level: 1, frequency: 90 },
  { word: 'three', phonetic: '/θriː/', meaningCn: '三', meaningEn: 'the number 3', partOfSpeech: 'num.', examples: ['Three bananas.', 'Three cats.'], emoji: '3️⃣', level: 1, frequency: 85 },
  { word: 'four', phonetic: '/fɔːr/', meaningCn: '四', meaningEn: 'the number 4', partOfSpeech: 'num.', examples: ['Four grapes.', 'Four balls.'], emoji: '4️⃣', level: 1, frequency: 80 },
  { word: 'five', phonetic: '/faɪv/', meaningCn: '五', meaningEn: 'the number 5', partOfSpeech: 'num.', examples: ['Five strawberries.', 'Five toys.'], emoji: '5️⃣', level: 1, frequency: 75 },
  
  // 家庭
  { word: 'mom', phonetic: '/mɑːm/', meaningCn: '妈妈', meaningEn: 'mother', partOfSpeech: 'n.', examples: ['This is my mom.', 'Mom is kind.'], emoji: '👩', level: 1, frequency: 85 },
  { word: 'dad', phonetic: '/dæd/', meaningCn: '爸爸', meaningEn: 'father', partOfSpeech: 'n.', examples: ['This is my dad.', 'Dad is strong.'], emoji: '👨', level: 1, frequency: 85 },
  { word: 'family', phonetic: '/ˈfæməli/', meaningCn: '家庭', meaningEn: 'parents and children', partOfSpeech: 'n.', examples: ['My family.', 'I love my family.'], emoji: '👨‍👩‍👧', level: 1, frequency: 80 },
  
  // 形容词
  { word: 'big', phonetic: '/bɪɡ/', meaningCn: '大的', meaningEn: 'large in size', partOfSpeech: 'adj.', examples: ['A big apple.', 'The dog is big.'], emoji: '🐘', level: 1, frequency: 85 },
  { word: 'little', phonetic: '/ˈlɪtl/', meaningCn: '小的', meaningEn: 'small in size', partOfSpeech: 'adj.', examples: ['A little cat.', 'A little rabbit.'], emoji: '🐜', level: 1, frequency: 85 },
  { word: 'happy', phonetic: '/ˈhæpi/', meaningCn: '快乐的', meaningEn: 'feeling joy', partOfSpeech: 'adj.', examples: ['I am happy.', 'The rabbit is happy.'], emoji: '😊', level: 1, frequency: 80 },
  { word: 'good', phonetic: '/ɡʊd/', meaningCn: '好的', meaningEn: 'of high quality', partOfSpeech: 'adj.', examples: ['Good morning!', 'Good night!'], emoji: '👍', level: 1, frequency: 90 },
  { word: 'pretty', phonetic: '/ˈprɪti/', meaningCn: '漂亮的', meaningEn: 'attractive', partOfSpeech: 'adj.', examples: ['Pretty flowers.', 'You are pretty.'], emoji: '🌸', level: 1, frequency: 70 },
  { word: 'tall', phonetic: '/tɔːl/', meaningCn: '高的', meaningEn: 'high in stature', partOfSpeech: 'adj.', examples: ['Tall trees.', 'He is tall.'], emoji: '🌲', level: 1, frequency: 70 },
  { word: 'fast', phonetic: '/fæst/', meaningCn: '快的', meaningEn: 'moving quickly', partOfSpeech: 'adj.', examples: ['Run fast!', 'A fast car.'], emoji: '⚡', level: 1, frequency: 70 },
  { word: 'soft', phonetic: '/sɔːft/', meaningCn: '柔软的', meaningEn: 'not hard', partOfSpeech: 'adj.', examples: ['The cat is soft.', 'Soft fur.'], emoji: '☁️', level: 1, frequency: 65 },
  { word: 'kind', phonetic: '/kaɪnd/', meaningCn: '善良的', meaningEn: 'friendly and caring', partOfSpeech: 'adj.', examples: ['Mom is kind.', 'Be kind!'], emoji: '💕', level: 1, frequency: 70 },
  { word: 'strong', phonetic: '/strɔːŋ/', meaningCn: '强壮的', meaningEn: 'having power', partOfSpeech: 'adj.', examples: ['Dad is strong.', 'Strong arms.'], emoji: '💪', level: 1, frequency: 70 },
  { word: 'bright', phonetic: '/braɪt/', meaningCn: '明亮的', meaningEn: 'giving off light', partOfSpeech: 'adj.', examples: ['The moon is bright.', 'Bright stars.'], emoji: '✨', level: 1, frequency: 65 },
  
  // 水果
  { word: 'apple', phonetic: '/ˈæpl/', meaningCn: '苹果', meaningEn: 'a round fruit', partOfSpeech: 'n.', examples: ['A red apple.', 'I eat an apple.'], emoji: '🍎', level: 1, frequency: 85 },
  { word: 'banana', phonetic: '/bəˈnænə/', meaningCn: '香蕉', meaningEn: 'a yellow curved fruit', partOfSpeech: 'n.', examples: ['Three bananas.', 'Yellow banana.'], emoji: '🍌', level: 1, frequency: 75 },
  { word: 'orange', phonetic: '/ˈɔːrɪndʒ/', meaningCn: '橙子', meaningEn: 'a citrus fruit', partOfSpeech: 'n.', examples: ['Two oranges.', 'Orange juice.'], emoji: '🍊', level: 1, frequency: 75 },
  { word: 'fruit', phonetic: '/fruːt/', meaningCn: '水果', meaningEn: 'edible plant product', partOfSpeech: 'n.', examples: ['I love fruit.', 'Fresh fruit.'], emoji: '🍇', level: 1, frequency: 75 },
  
  // 自然
  { word: 'sun', phonetic: '/sʌn/', meaningCn: '太阳', meaningEn: 'the star in our sky', partOfSpeech: 'n.', examples: ['The sun is up.', 'Yellow sun.'], emoji: '☀️', level: 1, frequency: 80 },
  { word: 'moon', phonetic: '/muːn/', meaningCn: '月亮', meaningEn: 'Earth\'s satellite', partOfSpeech: 'n.', examples: ['I see the moon.', 'Full moon.'], emoji: '🌙', level: 1, frequency: 75 },
  { word: 'star', phonetic: '/stɑːr/', meaningCn: '星星', meaningEn: 'a point of light in the sky', partOfSpeech: 'n.', examples: ['I see stars.', 'Twinkle star.'], emoji: '⭐', level: 1, frequency: 75 },
  { word: 'sky', phonetic: '/skaɪ/', meaningCn: '天空', meaningEn: 'the space above Earth', partOfSpeech: 'n.', examples: ['The sky is blue.', 'Look at the sky.'], emoji: '🌤️', level: 1, frequency: 75 },
  { word: 'tree', phonetic: '/triː/', meaningCn: '树', meaningEn: 'a tall plant', partOfSpeech: 'n.', examples: ['Tall trees.', 'Green tree.'], emoji: '🌳', level: 1, frequency: 75 },
  { word: 'flower', phonetic: '/ˈflaʊər/', meaningCn: '花', meaningEn: 'a colorful plant', partOfSpeech: 'n.', examples: ['Pretty flowers.', 'Red flower.'], emoji: '🌸', level: 1, frequency: 70 },
  { word: 'grass', phonetic: '/ɡræs/', meaningCn: '草', meaningEn: 'green ground cover', partOfSpeech: 'n.', examples: ['Green grass.', 'Soft grass.'], emoji: '🌿', level: 1, frequency: 65 },
  
  // 日常
  { word: 'ball', phonetic: '/bɔːl/', meaningCn: '球', meaningEn: 'a round object', partOfSpeech: 'n.', examples: ['Play with a ball.', 'Red ball.'], emoji: '⚽', level: 1, frequency: 75 },
  { word: 'toy', phonetic: '/tɔɪ/', meaningCn: '玩具', meaningEn: 'an object to play with', partOfSpeech: 'n.', examples: ['Many toys.', 'Play with toys.'], emoji: '🧸', level: 1, frequency: 75 },
  { word: 'car', phonetic: '/kɑːr/', meaningCn: '汽车', meaningEn: 'a vehicle', partOfSpeech: 'n.', examples: ['A red car.', 'Fast car.'], emoji: '🚗', level: 1, frequency: 75 },
  { word: 'school', phonetic: '/skuːl/', meaningCn: '学校', meaningEn: 'a place to learn', partOfSpeech: 'n.', examples: ['Go to school.', 'My school.'], emoji: '🏫', level: 1, frequency: 80 },
  { word: 'park', phonetic: '/pɑːrk/', meaningCn: '公园', meaningEn: 'an outdoor area', partOfSpeech: 'n.', examples: ['Go to the park.', 'In the park.'], emoji: '🏞️', level: 1, frequency: 70 },
  
  // 时间
  { word: 'morning', phonetic: '/ˈmɔːrnɪŋ/', meaningCn: '早上', meaningEn: 'early part of day', partOfSpeech: 'n.', examples: ['Good morning!', 'In the morning.'], emoji: '🌅', level: 1, frequency: 80 },
  { word: 'night', phonetic: '/naɪt/', meaningCn: '夜晚', meaningEn: 'dark time of day', partOfSpeech: 'n.', examples: ['Good night!', 'At night.'], emoji: '🌙', level: 1, frequency: 80 },
  { word: 'day', phonetic: '/deɪ/', meaningCn: '天/白天', meaningEn: '24 hours', partOfSpeech: 'n.', examples: ['Every day.', 'A nice day.'], emoji: '📅', level: 1, frequency: 85 },
  { word: 'time', phonetic: '/taɪm/', meaningCn: '时间', meaningEn: 'a measurable period', partOfSpeech: 'n.', examples: ['Night time.', 'Time to go.'], emoji: '⏰', level: 1, frequency: 85 },
];

export default l1Dictionary;

