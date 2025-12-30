/**
 * L1 基础词典数据 (扩充版 ~160 词)
 * 包含小学一年级核心词汇
 */

import type { DictionaryEntry } from '@/db';

export const l1Dictionary: DictionaryEntry[] = [
  // ============ 代词 ============
  { word: 'I', phonetic: '/aɪ/', meaningCn: '我', meaningEn: 'first person singular', partOfSpeech: 'pron.', examples: ['I am happy.', 'I like apples.'], emoji: '👆', level: 1, frequency: 100 },
  { word: 'you', phonetic: '/juː/', meaningCn: '你', meaningEn: 'second person', partOfSpeech: 'pron.', examples: ['You are kind.', 'I love you.'], emoji: '👉', level: 1, frequency: 100 },
  { word: 'he', phonetic: '/hiː/', meaningCn: '他', meaningEn: 'male person', partOfSpeech: 'pron.', examples: ['He is tall.', 'He can run.'], emoji: '👦', level: 1, frequency: 95 },
  { word: 'she', phonetic: '/ʃiː/', meaningCn: '她', meaningEn: 'female person', partOfSpeech: 'pron.', examples: ['She is pretty.', 'She likes cats.'], emoji: '👧', level: 1, frequency: 95 },
  { word: 'it', phonetic: '/ɪt/', meaningCn: '它', meaningEn: 'a thing or animal', partOfSpeech: 'pron.', examples: ['It is a cat.', 'It is red.'], emoji: '👆', level: 1, frequency: 100 },
  { word: 'we', phonetic: '/wiː/', meaningCn: '我们', meaningEn: 'first person plural', partOfSpeech: 'pron.', examples: ['We are happy.', 'We go to school.'], emoji: '👥', level: 1, frequency: 90 },
  { word: 'they', phonetic: '/ðeɪ/', meaningCn: '他们', meaningEn: 'third person plural', partOfSpeech: 'pron.', examples: ['They are friends.', 'They like to play.'], emoji: '👫', level: 1, frequency: 90 },
  { word: 'my', phonetic: '/maɪ/', meaningCn: '我的', meaningEn: 'belonging to me', partOfSpeech: 'pron.', examples: ['My cat.', 'My family.'], emoji: '🙋', level: 1, frequency: 95 },
  { word: 'your', phonetic: '/jʊr/', meaningCn: '你的', meaningEn: 'belonging to you', partOfSpeech: 'pron.', examples: ['Your book.', 'Your name.'], emoji: '👉', level: 1, frequency: 90 },
  { word: 'this', phonetic: '/ðɪs/', meaningCn: '这个', meaningEn: 'something near', partOfSpeech: 'pron.', examples: ['This is a cat.', 'This is my mom.'], emoji: '👆', level: 1, frequency: 95 },
  { word: 'that', phonetic: '/ðæt/', meaningCn: '那个', meaningEn: 'something far', partOfSpeech: 'pron.', examples: ['That is a dog.', 'That is big.'], emoji: '👉', level: 1, frequency: 90 },

  // ============ 常用动词 ============
  { word: 'is', phonetic: '/ɪz/', meaningCn: '是', meaningEn: 'be (third person singular)', partOfSpeech: 'v.', examples: ['This is a cat.', 'It is red.'], emoji: '✓', level: 1, frequency: 100 },
  { word: 'am', phonetic: '/æm/', meaningCn: '是', meaningEn: 'be (first person)', partOfSpeech: 'v.', examples: ['I am happy.', 'I am six.'], emoji: '✓', level: 1, frequency: 100 },
  { word: 'are', phonetic: '/ɑːr/', meaningCn: '是（复数）', meaningEn: 'be (plural)', partOfSpeech: 'v.', examples: ['They are happy.', 'Colors are beautiful.'], emoji: '✓', level: 1, frequency: 100 },
  { word: 'have', phonetic: '/hæv/', meaningCn: '有', meaningEn: 'to possess', partOfSpeech: 'v.', examples: ['I have a cat.', 'I have many toys.'], emoji: '🤲', level: 1, frequency: 95 },
  { word: 'has', phonetic: '/hæz/', meaningCn: '有', meaningEn: 'to possess (third person)', partOfSpeech: 'v.', examples: ['She has a dog.', 'He has a ball.'], emoji: '🤲', level: 1, frequency: 90 },
  { word: 'can', phonetic: '/kæn/', meaningCn: '能', meaningEn: 'to be able to', partOfSpeech: 'v.', examples: ['I can run.', 'She can sing.'], emoji: '💪', level: 1, frequency: 95 },
  { word: 'see', phonetic: '/siː/', meaningCn: '看见', meaningEn: 'to perceive with eyes', partOfSpeech: 'v.', examples: ['I see a dog.', 'I see the moon.'], emoji: '👀', level: 1, frequency: 90 },
  { word: 'look', phonetic: '/lʊk/', meaningCn: '看', meaningEn: 'to direct eyes at', partOfSpeech: 'v.', examples: ['Look at me.', 'Look at the sky.'], emoji: '👁️', level: 1, frequency: 88 },
  { word: 'love', phonetic: '/lʌv/', meaningCn: '爱', meaningEn: 'to feel deep affection', partOfSpeech: 'v.', examples: ['I love my cat.', 'I love fruit.'], emoji: '❤️', level: 1, frequency: 85 },
  { word: 'like', phonetic: '/laɪk/', meaningCn: '喜欢', meaningEn: 'to enjoy', partOfSpeech: 'v.', examples: ['I like apples.', 'The cat likes to play.'], emoji: '👍', level: 1, frequency: 85 },
  { word: 'want', phonetic: '/wɒnt/', meaningCn: '想要', meaningEn: 'to desire', partOfSpeech: 'v.', examples: ['I want a toy.', 'Do you want this?'], emoji: '🙏', level: 1, frequency: 85 },
  { word: 'go', phonetic: '/ɡoʊ/', meaningCn: '去', meaningEn: 'to move or travel', partOfSpeech: 'v.', examples: ['I go to school.', 'I go to the park.'], emoji: '🚶', level: 1, frequency: 85 },
  { word: 'come', phonetic: '/kʌm/', meaningCn: '来', meaningEn: 'to move toward', partOfSpeech: 'v.', examples: ['Come here!', 'Come to me.'], emoji: '👋', level: 1, frequency: 85 },
  { word: 'play', phonetic: '/pleɪ/', meaningCn: '玩', meaningEn: 'to engage in activity for fun', partOfSpeech: 'v.', examples: ['I play with toys.', 'It likes to play.'], emoji: '🎮', level: 1, frequency: 80 },
  { word: 'run', phonetic: '/rʌn/', meaningCn: '跑', meaningEn: 'to move quickly', partOfSpeech: 'v.', examples: ['The dog can run.', 'Run fast!'], emoji: '🏃', level: 1, frequency: 75 },
  { word: 'jump', phonetic: '/dʒʌmp/', meaningCn: '跳', meaningEn: 'to leap', partOfSpeech: 'v.', examples: ['I can jump.', 'Jump high!'], emoji: '🦘', level: 1, frequency: 75 },
  { word: 'sit', phonetic: '/sɪt/', meaningCn: '坐', meaningEn: 'to be seated', partOfSpeech: 'v.', examples: ['Sit down.', 'The cat sits here.'], emoji: '🪑', level: 1, frequency: 75 },
  { word: 'stand', phonetic: '/stænd/', meaningCn: '站', meaningEn: 'to be on feet', partOfSpeech: 'v.', examples: ['Stand up.', 'I stand here.'], emoji: '🧍', level: 1, frequency: 75 },
  { word: 'eat', phonetic: '/iːt/', meaningCn: '吃', meaningEn: 'to consume food', partOfSpeech: 'v.', examples: ['I eat breakfast.', 'Eat your food.'], emoji: '🍽️', level: 1, frequency: 75 },
  { word: 'drink', phonetic: '/drɪŋk/', meaningCn: '喝', meaningEn: 'to consume liquid', partOfSpeech: 'v.', examples: ['Drink water.', 'I drink milk.'], emoji: '🥤', level: 1, frequency: 75 },
  { word: 'read', phonetic: '/riːd/', meaningCn: '读', meaningEn: 'to look at words', partOfSpeech: 'v.', examples: ['Read a book.', 'I can read.'], emoji: '📖', level: 1, frequency: 75 },
  { word: 'write', phonetic: '/raɪt/', meaningCn: '写', meaningEn: 'to form letters', partOfSpeech: 'v.', examples: ['Write your name.', 'I write ABC.'], emoji: '✍️', level: 1, frequency: 75 },
  { word: 'say', phonetic: '/seɪ/', meaningCn: '说', meaningEn: 'to speak words', partOfSpeech: 'v.', examples: ['Say hello.', 'What did you say?'], emoji: '💬', level: 1, frequency: 80 },
  { word: 'open', phonetic: '/ˈoʊpən/', meaningCn: '打开', meaningEn: 'to make accessible', partOfSpeech: 'v.', examples: ['Open the door.', 'Open your book.'], emoji: '📂', level: 1, frequency: 75 },
  { word: 'close', phonetic: '/kloʊz/', meaningCn: '关闭', meaningEn: 'to shut', partOfSpeech: 'v.', examples: ['Close the door.', 'Close your eyes.'], emoji: '📁', level: 1, frequency: 75 },
  { word: 'give', phonetic: '/ɡɪv/', meaningCn: '给', meaningEn: 'to hand to someone', partOfSpeech: 'v.', examples: ['Give me a ball.', 'Give it to mom.'], emoji: '🤝', level: 1, frequency: 78 },
  { word: 'put', phonetic: '/pʊt/', meaningCn: '放', meaningEn: 'to place', partOfSpeech: 'v.', examples: ['Put it here.', 'Put on your shoes.'], emoji: '📥', level: 1, frequency: 75 },
  { word: 'thank', phonetic: '/θæŋk/', meaningCn: '谢谢', meaningEn: 'to express gratitude', partOfSpeech: 'v.', examples: ['Thank you!', 'I thank mom.'], emoji: '🙏', level: 1, frequency: 85 },

  // ============ 动物 ============
  { word: 'cat', phonetic: '/kæt/', meaningCn: '猫', meaningEn: 'a small furry pet', partOfSpeech: 'n.', examples: ['I have a cat.', 'The cat is white.'], emoji: '🐱', level: 1, frequency: 90 },
  { word: 'dog', phonetic: '/dɔːɡ/', meaningCn: '狗', meaningEn: 'a loyal pet animal', partOfSpeech: 'n.', examples: ['I see a dog.', 'The dog says woof.'], emoji: '🐶', level: 1, frequency: 90 },
  { word: 'rabbit', phonetic: '/ˈræbɪt/', meaningCn: '兔子', meaningEn: 'a small animal with long ears', partOfSpeech: 'n.', examples: ['A little rabbit.', 'The rabbit is happy.'], emoji: '🐰', level: 1, frequency: 75 },
  { word: 'bird', phonetic: '/bɜːrd/', meaningCn: '鸟', meaningEn: 'a flying animal', partOfSpeech: 'n.', examples: ['I see a bird.', 'The bird can fly.'], emoji: '🐦', level: 1, frequency: 70 },
  { word: 'fish', phonetic: '/fɪʃ/', meaningCn: '鱼', meaningEn: 'a water animal', partOfSpeech: 'n.', examples: ['I have a fish.', 'The fish swims.'], emoji: '🐟', level: 1, frequency: 75 },
  { word: 'pig', phonetic: '/pɪɡ/', meaningCn: '猪', meaningEn: 'a farm animal', partOfSpeech: 'n.', examples: ['A little pig.', 'The pig is pink.'], emoji: '🐷', level: 1, frequency: 70 },
  { word: 'duck', phonetic: '/dʌk/', meaningCn: '鸭子', meaningEn: 'a water bird', partOfSpeech: 'n.', examples: ['I see a duck.', 'The duck says quack.'], emoji: '🦆', level: 1, frequency: 70 },
  { word: 'cow', phonetic: '/kaʊ/', meaningCn: '牛', meaningEn: 'a farm animal', partOfSpeech: 'n.', examples: ['A big cow.', 'The cow says moo.'], emoji: '🐄', level: 1, frequency: 70 },
  { word: 'hen', phonetic: '/hen/', meaningCn: '母鸡', meaningEn: 'a female chicken', partOfSpeech: 'n.', examples: ['A fat hen.', 'The hen has eggs.'], emoji: '🐔', level: 1, frequency: 65 },
  { word: 'frog', phonetic: '/frɒɡ/', meaningCn: '青蛙', meaningEn: 'a jumping animal', partOfSpeech: 'n.', examples: ['A green frog.', 'The frog can jump.'], emoji: '🐸', level: 1, frequency: 65 },
  { word: 'ant', phonetic: '/ænt/', meaningCn: '蚂蚁', meaningEn: 'a tiny insect', partOfSpeech: 'n.', examples: ['A little ant.', 'The ant is small.'], emoji: '🐜', level: 1, frequency: 60 },
  { word: 'bee', phonetic: '/biː/', meaningCn: '蜜蜂', meaningEn: 'an insect that makes honey', partOfSpeech: 'n.', examples: ['I see a bee.', 'The bee buzzes.'], emoji: '🐝', level: 1, frequency: 60 },

  // ============ 颜色 ============
  { word: 'red', phonetic: '/red/', meaningCn: '红色', meaningEn: 'the color of blood', partOfSpeech: 'adj.', examples: ['A red apple.', 'The car is red.'], emoji: '🔴', level: 1, frequency: 85 },
  { word: 'blue', phonetic: '/bluː/', meaningCn: '蓝色', meaningEn: 'the color of the sky', partOfSpeech: 'adj.', examples: ['The sky is blue.', 'A blue ball.'], emoji: '🔵', level: 1, frequency: 85 },
  { word: 'green', phonetic: '/ɡriːn/', meaningCn: '绿色', meaningEn: 'the color of grass', partOfSpeech: 'adj.', examples: ['The grass is green.', 'A green tree.'], emoji: '🟢', level: 1, frequency: 80 },
  { word: 'yellow', phonetic: '/ˈjeloʊ/', meaningCn: '黄色', meaningEn: 'the color of the sun', partOfSpeech: 'adj.', examples: ['The sun is yellow.', 'A yellow banana.'], emoji: '🟡', level: 1, frequency: 75 },
  { word: 'white', phonetic: '/waɪt/', meaningCn: '白色', meaningEn: 'the color of snow', partOfSpeech: 'adj.', examples: ['The cat is white.', 'White clouds.'], emoji: '⬜', level: 1, frequency: 80 },
  { word: 'black', phonetic: '/blæk/', meaningCn: '黑色', meaningEn: 'the darkest color', partOfSpeech: 'adj.', examples: ['A black cat.', 'Black hair.'], emoji: '⬛', level: 1, frequency: 80 },
  { word: 'brown', phonetic: '/braʊn/', meaningCn: '棕色', meaningEn: 'the color of chocolate', partOfSpeech: 'adj.', examples: ['The dog is brown.', 'Brown bear.'], emoji: '🟫', level: 1, frequency: 70 },
  { word: 'pink', phonetic: '/pɪŋk/', meaningCn: '粉红色', meaningEn: 'a light red color', partOfSpeech: 'adj.', examples: ['A pink flower.', 'Pink dress.'], emoji: '💗', level: 1, frequency: 70 },
  { word: 'orange', phonetic: '/ˈɔːrɪndʒ/', meaningCn: '橙色', meaningEn: 'between red and yellow', partOfSpeech: 'adj.', examples: ['An orange ball.', 'Orange juice.'], emoji: '🟠', level: 1, frequency: 70 },
  { word: 'purple', phonetic: '/ˈpɜːrpl/', meaningCn: '紫色', meaningEn: 'a mix of red and blue', partOfSpeech: 'adj.', examples: ['A purple flower.', 'Purple grapes.'], emoji: '🟣', level: 1, frequency: 65 },

  // ============ 数字 ============
  { word: 'one', phonetic: '/wʌn/', meaningCn: '一', meaningEn: 'the number 1', partOfSpeech: 'num.', examples: ['One apple.', 'I have one cat.'], emoji: '1️⃣', level: 1, frequency: 90 },
  { word: 'two', phonetic: '/tuː/', meaningCn: '二', meaningEn: 'the number 2', partOfSpeech: 'num.', examples: ['Two oranges.', 'Two dogs.'], emoji: '2️⃣', level: 1, frequency: 90 },
  { word: 'three', phonetic: '/θriː/', meaningCn: '三', meaningEn: 'the number 3', partOfSpeech: 'num.', examples: ['Three bananas.', 'Three cats.'], emoji: '3️⃣', level: 1, frequency: 85 },
  { word: 'four', phonetic: '/fɔːr/', meaningCn: '四', meaningEn: 'the number 4', partOfSpeech: 'num.', examples: ['Four grapes.', 'Four balls.'], emoji: '4️⃣', level: 1, frequency: 80 },
  { word: 'five', phonetic: '/faɪv/', meaningCn: '五', meaningEn: 'the number 5', partOfSpeech: 'num.', examples: ['Five strawberries.', 'Five toys.'], emoji: '5️⃣', level: 1, frequency: 75 },
  { word: 'six', phonetic: '/sɪks/', meaningCn: '六', meaningEn: 'the number 6', partOfSpeech: 'num.', examples: ['Six eggs.', 'I am six.'], emoji: '6️⃣', level: 1, frequency: 75 },
  { word: 'seven', phonetic: '/ˈsevən/', meaningCn: '七', meaningEn: 'the number 7', partOfSpeech: 'num.', examples: ['Seven days.', 'Seven colors.'], emoji: '7️⃣', level: 1, frequency: 70 },
  { word: 'eight', phonetic: '/eɪt/', meaningCn: '八', meaningEn: 'the number 8', partOfSpeech: 'num.', examples: ['Eight legs.', 'Eight books.'], emoji: '8️⃣', level: 1, frequency: 70 },
  { word: 'nine', phonetic: '/naɪn/', meaningCn: '九', meaningEn: 'the number 9', partOfSpeech: 'num.', examples: ['Nine stars.', 'Nine birds.'], emoji: '9️⃣', level: 1, frequency: 70 },
  { word: 'ten', phonetic: '/ten/', meaningCn: '十', meaningEn: 'the number 10', partOfSpeech: 'num.', examples: ['Ten fingers.', 'Ten toes.'], emoji: '🔟', level: 1, frequency: 70 },

  // ============ 身体部位 ============
  { word: 'head', phonetic: '/hed/', meaningCn: '头', meaningEn: 'top part of body', partOfSpeech: 'n.', examples: ['My head.', 'Touch your head.'], emoji: '🗣️', level: 1, frequency: 80 },
  { word: 'eye', phonetic: '/aɪ/', meaningCn: '眼睛', meaningEn: 'organ for seeing', partOfSpeech: 'n.', examples: ['I have two eyes.', 'Close your eyes.'], emoji: '👁️', level: 1, frequency: 85 },
  { word: 'ear', phonetic: '/ɪr/', meaningCn: '耳朵', meaningEn: 'organ for hearing', partOfSpeech: 'n.', examples: ['I have two ears.', 'Touch your ear.'], emoji: '👂', level: 1, frequency: 80 },
  { word: 'nose', phonetic: '/noʊz/', meaningCn: '鼻子', meaningEn: 'organ for smelling', partOfSpeech: 'n.', examples: ['My nose.', 'Touch your nose.'], emoji: '👃', level: 1, frequency: 80 },
  { word: 'mouth', phonetic: '/maʊθ/', meaningCn: '嘴', meaningEn: 'opening for eating', partOfSpeech: 'n.', examples: ['Open your mouth.', 'Close your mouth.'], emoji: '👄', level: 1, frequency: 80 },
  { word: 'hand', phonetic: '/hænd/', meaningCn: '手', meaningEn: 'part at end of arm', partOfSpeech: 'n.', examples: ['My hand.', 'Wash your hands.'], emoji: '✋', level: 1, frequency: 85 },
  { word: 'foot', phonetic: '/fʊt/', meaningCn: '脚', meaningEn: 'part at end of leg', partOfSpeech: 'n.', examples: ['My foot.', 'Left foot.'], emoji: '🦶', level: 1, frequency: 75 },
  { word: 'leg', phonetic: '/leɡ/', meaningCn: '腿', meaningEn: 'limb for walking', partOfSpeech: 'n.', examples: ['My leg.', 'Two legs.'], emoji: '🦵', level: 1, frequency: 75 },
  { word: 'arm', phonetic: '/ɑːrm/', meaningCn: '手臂', meaningEn: 'upper limb', partOfSpeech: 'n.', examples: ['My arm.', 'Two arms.'], emoji: '💪', level: 1, frequency: 75 },
  { word: 'face', phonetic: '/feɪs/', meaningCn: '脸', meaningEn: 'front of head', partOfSpeech: 'n.', examples: ['My face.', 'Wash your face.'], emoji: '😊', level: 1, frequency: 80 },

  // ============ 家庭 ============
  { word: 'mom', phonetic: '/mɑːm/', meaningCn: '妈妈', meaningEn: 'mother', partOfSpeech: 'n.', examples: ['This is my mom.', 'Mom is kind.'], emoji: '👩', level: 1, frequency: 85 },
  { word: 'dad', phonetic: '/dæd/', meaningCn: '爸爸', meaningEn: 'father', partOfSpeech: 'n.', examples: ['This is my dad.', 'Dad is strong.'], emoji: '👨', level: 1, frequency: 85 },
  { word: 'sister', phonetic: '/ˈsɪstər/', meaningCn: '姐妹', meaningEn: 'female sibling', partOfSpeech: 'n.', examples: ['My sister.', 'She is my sister.'], emoji: '👧', level: 1, frequency: 75 },
  { word: 'brother', phonetic: '/ˈbrʌðər/', meaningCn: '兄弟', meaningEn: 'male sibling', partOfSpeech: 'n.', examples: ['My brother.', 'He is my brother.'], emoji: '👦', level: 1, frequency: 75 },
  { word: 'family', phonetic: '/ˈfæməli/', meaningCn: '家庭', meaningEn: 'parents and children', partOfSpeech: 'n.', examples: ['My family.', 'I love my family.'], emoji: '👨‍👩‍👧', level: 1, frequency: 80 },
  { word: 'friend', phonetic: '/frend/', meaningCn: '朋友', meaningEn: 'a person you like', partOfSpeech: 'n.', examples: ['My friend.', 'We are friends.'], emoji: '🤝', level: 1, frequency: 85 },

  // ============ 形容词 ============
  { word: 'big', phonetic: '/bɪɡ/', meaningCn: '大的', meaningEn: 'large in size', partOfSpeech: 'adj.', examples: ['A big apple.', 'The dog is big.'], emoji: '🐘', level: 1, frequency: 85 },
  { word: 'small', phonetic: '/smɔːl/', meaningCn: '小的', meaningEn: 'little in size', partOfSpeech: 'adj.', examples: ['A small ant.', 'Small cat.'], emoji: '🐜', level: 1, frequency: 85 },
  { word: 'little', phonetic: '/ˈlɪtl/', meaningCn: '小的', meaningEn: 'small in size', partOfSpeech: 'adj.', examples: ['A little cat.', 'A little rabbit.'], emoji: '🐜', level: 1, frequency: 85 },
  { word: 'happy', phonetic: '/ˈhæpi/', meaningCn: '快乐的', meaningEn: 'feeling joy', partOfSpeech: 'adj.', examples: ['I am happy.', 'The rabbit is happy.'], emoji: '😊', level: 1, frequency: 80 },
  { word: 'sad', phonetic: '/sæd/', meaningCn: '伤心的', meaningEn: 'feeling unhappy', partOfSpeech: 'adj.', examples: ['I am sad.', "Don't be sad."], emoji: '😢', level: 1, frequency: 75 },
  { word: 'good', phonetic: '/ɡʊd/', meaningCn: '好的', meaningEn: 'of high quality', partOfSpeech: 'adj.', examples: ['Good morning!', 'Good night!'], emoji: '👍', level: 1, frequency: 90 },
  { word: 'bad', phonetic: '/bæd/', meaningCn: '坏的', meaningEn: 'not good', partOfSpeech: 'adj.', examples: ['Bad dog!', 'That is bad.'], emoji: '👎', level: 1, frequency: 75 },
  { word: 'new', phonetic: '/nuː/', meaningCn: '新的', meaningEn: 'not old', partOfSpeech: 'adj.', examples: ['A new toy.', 'New friend.'], emoji: '🆕', level: 1, frequency: 80 },
  { word: 'old', phonetic: '/oʊld/', meaningCn: '旧的/老的', meaningEn: 'not new/aged', partOfSpeech: 'adj.', examples: ['Old book.', 'He is old.'], emoji: '👴', level: 1, frequency: 75 },
  { word: 'hot', phonetic: '/hɒt/', meaningCn: '热的', meaningEn: 'high temperature', partOfSpeech: 'adj.', examples: ['Hot water.', 'It is hot.'], emoji: '🔥', level: 1, frequency: 75 },
  { word: 'cold', phonetic: '/koʊld/', meaningCn: '冷的', meaningEn: 'low temperature', partOfSpeech: 'adj.', examples: ['Cold water.', 'It is cold.'], emoji: '❄️', level: 1, frequency: 75 },
  { word: 'pretty', phonetic: '/ˈprɪti/', meaningCn: '漂亮的', meaningEn: 'attractive', partOfSpeech: 'adj.', examples: ['Pretty flowers.', 'You are pretty.'], emoji: '🌸', level: 1, frequency: 70 },
  { word: 'tall', phonetic: '/tɔːl/', meaningCn: '高的', meaningEn: 'high in stature', partOfSpeech: 'adj.', examples: ['Tall trees.', 'He is tall.'], emoji: '🌲', level: 1, frequency: 70 },
  { word: 'short', phonetic: '/ʃɔːrt/', meaningCn: '矮的/短的', meaningEn: 'not tall', partOfSpeech: 'adj.', examples: ['Short hair.', 'I am short.'], emoji: '📏', level: 1, frequency: 70 },
  { word: 'fast', phonetic: '/fæst/', meaningCn: '快的', meaningEn: 'moving quickly', partOfSpeech: 'adj.', examples: ['Run fast!', 'A fast car.'], emoji: '⚡', level: 1, frequency: 70 },
  { word: 'slow', phonetic: '/sloʊ/', meaningCn: '慢的', meaningEn: 'not fast', partOfSpeech: 'adj.', examples: ['Slow down.', 'A slow turtle.'], emoji: '🐢', level: 1, frequency: 70 },
  { word: 'soft', phonetic: '/sɔːft/', meaningCn: '柔软的', meaningEn: 'not hard', partOfSpeech: 'adj.', examples: ['The cat is soft.', 'Soft fur.'], emoji: '☁️', level: 1, frequency: 65 },
  { word: 'long', phonetic: '/lɒŋ/', meaningCn: '长的', meaningEn: 'not short', partOfSpeech: 'adj.', examples: ['Long hair.', 'A long rope.'], emoji: '📏', level: 1, frequency: 75 },

  // ============ 水果 ============
  { word: 'apple', phonetic: '/ˈæpl/', meaningCn: '苹果', meaningEn: 'a round fruit', partOfSpeech: 'n.', examples: ['A red apple.', 'I eat an apple.'], emoji: '🍎', level: 1, frequency: 85 },
  { word: 'banana', phonetic: '/bəˈnænə/', meaningCn: '香蕉', meaningEn: 'a yellow curved fruit', partOfSpeech: 'n.', examples: ['Three bananas.', 'Yellow banana.'], emoji: '🍌', level: 1, frequency: 75 },
  { word: 'pear', phonetic: '/per/', meaningCn: '梨', meaningEn: 'a sweet fruit', partOfSpeech: 'n.', examples: ['A green pear.', 'I like pears.'], emoji: '🍐', level: 1, frequency: 70 },
  { word: 'grape', phonetic: '/ɡreɪp/', meaningCn: '葡萄', meaningEn: 'a small fruit', partOfSpeech: 'n.', examples: ['Purple grapes.', 'I eat grapes.'], emoji: '🍇', level: 1, frequency: 70 },
  { word: 'fruit', phonetic: '/fruːt/', meaningCn: '水果', meaningEn: 'edible plant product', partOfSpeech: 'n.', examples: ['I love fruit.', 'Fresh fruit.'], emoji: '🍇', level: 1, frequency: 75 },

  // ============ 食物 ============
  { word: 'water', phonetic: '/ˈwɔːtər/', meaningCn: '水', meaningEn: 'a clear liquid', partOfSpeech: 'n.', examples: ['Drink water.', 'Cold water.'], emoji: '💧', level: 1, frequency: 90 },
  { word: 'milk', phonetic: '/mɪlk/', meaningCn: '牛奶', meaningEn: 'a white drink', partOfSpeech: 'n.', examples: ['I drink milk.', 'A glass of milk.'], emoji: '🥛', level: 1, frequency: 80 },
  { word: 'egg', phonetic: '/eɡ/', meaningCn: '鸡蛋', meaningEn: 'laid by chickens', partOfSpeech: 'n.', examples: ['I eat an egg.', 'Six eggs.'], emoji: '🥚', level: 1, frequency: 75 },
  { word: 'rice', phonetic: '/raɪs/', meaningCn: '米饭', meaningEn: 'a grain food', partOfSpeech: 'n.', examples: ['I eat rice.', 'White rice.'], emoji: '🍚', level: 1, frequency: 80 },
  { word: 'bread', phonetic: '/bred/', meaningCn: '面包', meaningEn: 'baked food', partOfSpeech: 'n.', examples: ['I eat bread.', 'Fresh bread.'], emoji: '🍞', level: 1, frequency: 75 },
  { word: 'cake', phonetic: '/keɪk/', meaningCn: '蛋糕', meaningEn: 'a sweet dessert', partOfSpeech: 'n.', examples: ['Birthday cake.', 'I love cake.'], emoji: '🎂', level: 1, frequency: 75 },

  // ============ 自然 ============
  { word: 'sun', phonetic: '/sʌn/', meaningCn: '太阳', meaningEn: 'the star in our sky', partOfSpeech: 'n.', examples: ['The sun is up.', 'Yellow sun.'], emoji: '☀️', level: 1, frequency: 80 },
  { word: 'moon', phonetic: '/muːn/', meaningCn: '月亮', meaningEn: 'Earth satellite', partOfSpeech: 'n.', examples: ['I see the moon.', 'Full moon.'], emoji: '🌙', level: 1, frequency: 75 },
  { word: 'star', phonetic: '/stɑːr/', meaningCn: '星星', meaningEn: 'a point of light in the sky', partOfSpeech: 'n.', examples: ['I see stars.', 'Twinkle star.'], emoji: '⭐', level: 1, frequency: 75 },
  { word: 'sky', phonetic: '/skaɪ/', meaningCn: '天空', meaningEn: 'the space above Earth', partOfSpeech: 'n.', examples: ['The sky is blue.', 'Look at the sky.'], emoji: '🌤️', level: 1, frequency: 75 },
  { word: 'tree', phonetic: '/triː/', meaningCn: '树', meaningEn: 'a tall plant', partOfSpeech: 'n.', examples: ['Tall trees.', 'Green tree.'], emoji: '🌳', level: 1, frequency: 75 },
  { word: 'flower', phonetic: '/ˈflaʊər/', meaningCn: '花', meaningEn: 'a colorful plant', partOfSpeech: 'n.', examples: ['Pretty flowers.', 'Red flower.'], emoji: '🌸', level: 1, frequency: 70 },

  // ============ 物品 ============
  { word: 'book', phonetic: '/bʊk/', meaningCn: '书', meaningEn: 'for reading', partOfSpeech: 'n.', examples: ['Read a book.', 'My book.'], emoji: '📖', level: 1, frequency: 85 },
  { word: 'pen', phonetic: '/pen/', meaningCn: '钢笔', meaningEn: 'for writing', partOfSpeech: 'n.', examples: ['A red pen.', 'My pen.'], emoji: '🖊️', level: 1, frequency: 80 },
  { word: 'pencil', phonetic: '/ˈpensl/', meaningCn: '铅笔', meaningEn: 'for drawing', partOfSpeech: 'n.', examples: ['A yellow pencil.', 'My pencil.'], emoji: '✏️', level: 1, frequency: 80 },
  { word: 'bag', phonetic: '/bæɡ/', meaningCn: '书包', meaningEn: 'for carrying things', partOfSpeech: 'n.', examples: ['My bag.', 'School bag.'], emoji: '🎒', level: 1, frequency: 80 },
  { word: 'desk', phonetic: '/desk/', meaningCn: '书桌', meaningEn: 'a table for work', partOfSpeech: 'n.', examples: ['My desk.', 'A big desk.'], emoji: '🪑', level: 1, frequency: 75 },
  { word: 'chair', phonetic: '/tʃer/', meaningCn: '椅子', meaningEn: 'for sitting', partOfSpeech: 'n.', examples: ['Sit on the chair.', 'A red chair.'], emoji: '🪑', level: 1, frequency: 75 },
  { word: 'ball', phonetic: '/bɔːl/', meaningCn: '球', meaningEn: 'a round object', partOfSpeech: 'n.', examples: ['Play with a ball.', 'Red ball.'], emoji: '⚽', level: 1, frequency: 75 },
  { word: 'toy', phonetic: '/tɔɪ/', meaningCn: '玩具', meaningEn: 'an object to play with', partOfSpeech: 'n.', examples: ['Many toys.', 'Play with toys.'], emoji: '🧸', level: 1, frequency: 75 },
  { word: 'door', phonetic: '/dɔːr/', meaningCn: '门', meaningEn: 'for entering', partOfSpeech: 'n.', examples: ['Open the door.', 'Close the door.'], emoji: '🚪', level: 1, frequency: 75 },
  { word: 'window', phonetic: '/ˈwɪndoʊ/', meaningCn: '窗户', meaningEn: 'for looking outside', partOfSpeech: 'n.', examples: ['Open the window.', 'Look out the window.'], emoji: '🪟', level: 1, frequency: 70 },

  // ============ 地点 ============
  { word: 'home', phonetic: '/hoʊm/', meaningCn: '家', meaningEn: 'where you live', partOfSpeech: 'n.', examples: ['Go home.', 'I love home.'], emoji: '🏠', level: 1, frequency: 85 },
  { word: 'school', phonetic: '/skuːl/', meaningCn: '学校', meaningEn: 'a place to learn', partOfSpeech: 'n.', examples: ['Go to school.', 'My school.'], emoji: '🏫', level: 1, frequency: 80 },
  { word: 'park', phonetic: '/pɑːrk/', meaningCn: '公园', meaningEn: 'an outdoor area', partOfSpeech: 'n.', examples: ['Go to the park.', 'In the park.'], emoji: '🏞️', level: 1, frequency: 70 },
  { word: 'room', phonetic: '/ruːm/', meaningCn: '房间', meaningEn: 'a space in building', partOfSpeech: 'n.', examples: ['My room.', 'A big room.'], emoji: '🛏️', level: 1, frequency: 75 },

  // ============ 时间 ============
  { word: 'morning', phonetic: '/ˈmɔːrnɪŋ/', meaningCn: '早上', meaningEn: 'early part of day', partOfSpeech: 'n.', examples: ['Good morning!', 'In the morning.'], emoji: '🌅', level: 1, frequency: 80 },
  { word: 'night', phonetic: '/naɪt/', meaningCn: '夜晚', meaningEn: 'dark time of day', partOfSpeech: 'n.', examples: ['Good night!', 'At night.'], emoji: '🌙', level: 1, frequency: 80 },
  { word: 'day', phonetic: '/deɪ/', meaningCn: '天/白天', meaningEn: '24 hours', partOfSpeech: 'n.', examples: ['Every day.', 'A nice day.'], emoji: '📅', level: 1, frequency: 85 },
  { word: 'today', phonetic: '/təˈdeɪ/', meaningCn: '今天', meaningEn: 'this day', partOfSpeech: 'n.', examples: ['Today is Monday.', 'What is today?'], emoji: '📆', level: 1, frequency: 80 },

  // ============ 介词 ============
  { word: 'in', phonetic: '/ɪn/', meaningCn: '在...里', meaningEn: 'inside', partOfSpeech: 'prep.', examples: ['In the box.', 'In the room.'], emoji: '📥', level: 1, frequency: 95 },
  { word: 'on', phonetic: '/ɒn/', meaningCn: '在...上', meaningEn: 'on top of', partOfSpeech: 'prep.', examples: ['On the desk.', 'On the floor.'], emoji: '⬆️', level: 1, frequency: 95 },
  { word: 'to', phonetic: '/tuː/', meaningCn: '到', meaningEn: 'in direction of', partOfSpeech: 'prep.', examples: ['Go to school.', 'Come to me.'], emoji: '➡️', level: 1, frequency: 100 },
  { word: 'at', phonetic: '/æt/', meaningCn: '在', meaningEn: 'at a place', partOfSpeech: 'prep.', examples: ['At home.', 'At school.'], emoji: '📍', level: 1, frequency: 90 },
  { word: 'with', phonetic: '/wɪð/', meaningCn: '和', meaningEn: 'together', partOfSpeech: 'prep.', examples: ['Play with me.', 'Go with mom.'], emoji: '🤝', level: 1, frequency: 90 },

  // ============ 问候语 ============
  { word: 'hello', phonetic: '/həˈloʊ/', meaningCn: '你好', meaningEn: 'a greeting', partOfSpeech: 'interj.', examples: ['Hello!', 'Hello, friend!'], emoji: '👋', level: 1, frequency: 95 },
  { word: 'hi', phonetic: '/haɪ/', meaningCn: '嗨', meaningEn: 'informal greeting', partOfSpeech: 'interj.', examples: ['Hi!', 'Hi there!'], emoji: '👋', level: 1, frequency: 95 },
  { word: 'bye', phonetic: '/baɪ/', meaningCn: '再见', meaningEn: 'goodbye', partOfSpeech: 'interj.', examples: ['Bye!', 'Bye bye!'], emoji: '👋', level: 1, frequency: 90 },
  { word: 'please', phonetic: '/pliːz/', meaningCn: '请', meaningEn: 'polite word', partOfSpeech: 'interj.', examples: ['Please help me.', 'Yes, please.'], emoji: '🙏', level: 1, frequency: 90 },
  { word: 'sorry', phonetic: '/ˈsɒri/', meaningCn: '对不起', meaningEn: 'expressing regret', partOfSpeech: 'interj.', examples: ['Sorry!', 'I am sorry.'], emoji: '😔', level: 1, frequency: 85 },
  { word: 'yes', phonetic: '/jes/', meaningCn: '是', meaningEn: 'affirmative', partOfSpeech: 'interj.', examples: ['Yes!', 'Yes, I can.'], emoji: '✅', level: 1, frequency: 100 },
  { word: 'no', phonetic: '/noʊ/', meaningCn: '不', meaningEn: 'negative', partOfSpeech: 'interj.', examples: ['No!', 'No, thank you.'], emoji: '❌', level: 1, frequency: 100 },
];

export default l1Dictionary;

