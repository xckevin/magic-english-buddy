/**
 * 小学英语高频词汇 - 主题分类索引
 * 基于 Dolch Words 和中国小学英语课标
 */

// ============ Dolch 基础高频词 (Sight Words) ============
// 这些是最基础的高频词，学生需要能够一眼识别

export const dolchPrePrimer = [
  'a', 'and', 'away', 'big', 'blue', 'can', 'come', 'down',
  'find', 'for', 'funny', 'go', 'help', 'here', 'I', 'in',
  'is', 'it', 'jump', 'little', 'look', 'make', 'me', 'my',
  'not', 'one', 'play', 'red', 'run', 'said', 'see', 'the',
  'three', 'to', 'two', 'up', 'we', 'where', 'yellow', 'you',
];

export const dolchPrimer = [
  'all', 'am', 'are', 'at', 'ate', 'be', 'black', 'brown',
  'but', 'came', 'did', 'do', 'eat', 'four', 'get', 'good',
  'have', 'he', 'into', 'like', 'must', 'new', 'no', 'now',
  'on', 'our', 'out', 'please', 'pretty', 'ran', 'ride', 'saw',
  'say', 'she', 'so', 'soon', 'that', 'there', 'they', 'this',
  'too', 'under', 'want', 'was', 'well', 'went', 'what', 'white',
  'who', 'will', 'with', 'yes',
];

export const dolchFirstGrade = [
  'after', 'again', 'an', 'any', 'as', 'ask', 'by', 'could',
  'every', 'fly', 'from', 'give', 'going', 'had', 'has', 'her',
  'him', 'his', 'how', 'just', 'know', 'let', 'live', 'may',
  'of', 'old', 'once', 'open', 'over', 'put', 'round', 'some',
  'stop', 'take', 'thank', 'them', 'then', 'think', 'walk', 'were',
  'when',
];

export const dolchSecondGrade = [
  'always', 'around', 'because', 'been', 'before', 'best', 'both', 'buy',
  'call', 'cold', 'does', 'don\'t', 'fast', 'first', 'five', 'found',
  'gave', 'goes', 'green', 'its', 'made', 'many', 'off', 'or',
  'pull', 'read', 'right', 'sing', 'sit', 'sleep', 'tell', 'their',
  'these', 'those', 'upon', 'us', 'use', 'very', 'wash', 'which',
  'why', 'wish', 'work', 'would', 'write', 'your',
];

export const dolchThirdGrade = [
  'about', 'better', 'bring', 'carry', 'clean', 'cut', 'done', 'draw',
  'drink', 'eight', 'fall', 'far', 'full', 'got', 'grow', 'hold',
  'hot', 'hurt', 'if', 'keep', 'kind', 'laugh', 'light', 'long',
  'much', 'myself', 'never', 'only', 'own', 'pick', 'seven', 'shall',
  'show', 'six', 'small', 'start', 'ten', 'today', 'together', 'try',
  'warm',
];

// ============ 主题分类词汇 ============

export const themeCategories = {
  // 家庭成员
  family: {
    nameCn: '家庭成员',
    words: [
      'family', 'father', 'mother', 'dad', 'mom', 'parent',
      'brother', 'sister', 'son', 'daughter',
      'grandfather', 'grandmother', 'grandpa', 'grandma',
      'uncle', 'aunt', 'cousin',
      'baby', 'child', 'children',
    ],
    level: [1, 2],
  },

  // 身体部位
  body: {
    nameCn: '身体部位',
    words: [
      'head', 'hair', 'face', 'eye', 'ear', 'nose', 'mouth', 'tooth',
      'neck', 'shoulder', 'arm', 'hand', 'finger',
      'body', 'back', 'stomach', 'leg', 'knee', 'foot', 'toe',
    ],
    level: [1, 2],
  },

  // 颜色
  colors: {
    nameCn: '颜色',
    words: [
      'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink',
      'black', 'white', 'brown', 'grey', 'gold', 'silver',
    ],
    level: [1],
  },

  // 数字
  numbers: {
    nameCn: '数字',
    words: [
      'zero', 'one', 'two', 'three', 'four', 'five',
      'six', 'seven', 'eight', 'nine', 'ten',
      'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
      'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
      'thirty', 'forty', 'fifty', 'hundred',
      'first', 'second', 'third',
    ],
    level: [1, 2],
  },

  // 动物
  animals: {
    nameCn: '动物',
    words: [
      // 宠物和常见动物
      'cat', 'dog', 'bird', 'fish', 'rabbit', 'mouse', 'hamster',
      // 农场动物
      'cow', 'pig', 'sheep', 'horse', 'chicken', 'duck', 'goat',
      // 野生动物
      'lion', 'tiger', 'elephant', 'monkey', 'bear', 'panda', 'fox', 'wolf',
      'deer', 'zebra', 'giraffe', 'kangaroo', 'koala',
      // 海洋动物
      'fish', 'whale', 'dolphin', 'shark', 'octopus', 'turtle', 'crab',
      // 昆虫
      'bee', 'butterfly', 'ant', 'spider',
      // 鸟类
      'eagle', 'owl', 'parrot', 'penguin',
    ],
    level: [1, 2, 3],
  },

  // 水果
  fruits: {
    nameCn: '水果',
    words: [
      'apple', 'banana', 'orange', 'pear', 'grape', 'peach',
      'strawberry', 'watermelon', 'mango', 'cherry', 'lemon',
      'pineapple', 'coconut', 'kiwi',
    ],
    level: [1, 2],
  },

  // 蔬菜
  vegetables: {
    nameCn: '蔬菜',
    words: [
      'tomato', 'potato', 'carrot', 'onion', 'cabbage', 'cucumber',
      'corn', 'bean', 'pea', 'mushroom', 'pepper', 'pumpkin',
    ],
    level: [2, 3],
  },

  // 食物和饮料
  food: {
    nameCn: '食物饮料',
    words: [
      // 主食
      'bread', 'rice', 'noodle', 'egg', 'meat', 'chicken', 'fish',
      // 甜点
      'cake', 'cookie', 'candy', 'chocolate', 'ice cream',
      // 饮料
      'water', 'milk', 'juice', 'tea', 'coffee',
      // 餐食
      'breakfast', 'lunch', 'dinner', 'meal', 'snack',
    ],
    level: [1, 2],
  },

  // 天气
  weather: {
    nameCn: '天气',
    words: [
      'sunny', 'cloudy', 'rainy', 'windy', 'snowy', 'foggy',
      'hot', 'warm', 'cool', 'cold',
      'sun', 'cloud', 'rain', 'wind', 'snow', 'storm', 'thunder',
      'rainbow',
    ],
    level: [1, 2],
  },

  // 季节和月份
  timeAndDate: {
    nameCn: '时间日期',
    words: [
      // 季节
      'spring', 'summer', 'autumn', 'fall', 'winter',
      // 星期
      'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
      'week', 'weekend',
      // 月份
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
      'month', 'year',
      // 时间词
      'morning', 'noon', 'afternoon', 'evening', 'night',
      'today', 'tomorrow', 'yesterday',
      'now', 'later', 'soon', 'always', 'sometimes', 'never',
    ],
    level: [1, 2, 3],
  },

  // 学校
  school: {
    nameCn: '学校',
    words: [
      'school', 'classroom', 'desk', 'chair', 'blackboard',
      'book', 'pen', 'pencil', 'ruler', 'eraser', 'bag', 'notebook',
      'teacher', 'student', 'classmate', 'friend',
      'homework', 'test', 'lesson', 'subject',
      'English', 'Chinese', 'math', 'music', 'art', 'PE',
    ],
    level: [1, 2],
  },

  // 地点
  places: {
    nameCn: '地点',
    words: [
      'home', 'house', 'room', 'bedroom', 'bathroom', 'kitchen',
      'school', 'library', 'playground', 'park', 'zoo',
      'hospital', 'shop', 'store', 'supermarket', 'restaurant',
      'city', 'town', 'street', 'road',
      'farm', 'forest', 'mountain', 'river', 'lake', 'sea', 'beach',
    ],
    level: [1, 2, 3],
  },

  // 交通工具
  transportation: {
    nameCn: '交通工具',
    words: [
      'car', 'bus', 'train', 'plane', 'bike', 'bicycle', 'boat', 'ship',
      'taxi', 'subway', 'metro', 'motorcycle',
    ],
    level: [1, 2],
  },

  // 衣服
  clothes: {
    nameCn: '衣服',
    words: [
      'clothes', 'shirt', 'T-shirt', 'pants', 'jeans', 'shorts',
      'dress', 'skirt', 'coat', 'jacket', 'sweater',
      'shoes', 'socks', 'hat', 'cap', 'gloves', 'scarf',
    ],
    level: [1, 2],
  },

  // 职业
  jobs: {
    nameCn: '职业',
    words: [
      'teacher', 'doctor', 'nurse', 'driver', 'farmer', 'worker',
      'police', 'fireman', 'cook', 'chef', 'singer', 'dancer',
      'artist', 'writer', 'scientist', 'pilot',
    ],
    level: [2, 3],
  },

  // 动作动词
  actions: {
    nameCn: '动作动词',
    words: [
      // 基础动作
      'go', 'come', 'run', 'walk', 'jump', 'sit', 'stand', 'sleep',
      'eat', 'drink', 'read', 'write', 'draw', 'sing', 'dance', 'play',
      // 感知动作
      'see', 'look', 'watch', 'hear', 'listen', 'feel', 'smell', 'taste',
      // 交流动作
      'say', 'speak', 'talk', 'tell', 'ask', 'answer',
      // 学习动作
      'learn', 'study', 'think', 'know', 'remember', 'forget',
      // 日常动作
      'open', 'close', 'put', 'take', 'give', 'get', 'make', 'buy',
      'wash', 'clean', 'cook', 'help',
    ],
    level: [1, 2, 3],
  },

  // 情感形容词
  feelings: {
    nameCn: '情感',
    words: [
      'happy', 'sad', 'angry', 'scared', 'afraid', 'surprised',
      'excited', 'tired', 'hungry', 'thirsty', 'sick',
      'good', 'bad', 'nice', 'kind', 'friendly',
      'love', 'like', 'hate',
    ],
    level: [1, 2],
  },

  // 描述形容词
  descriptions: {
    nameCn: '描述词',
    words: [
      // 大小
      'big', 'small', 'little', 'large', 'huge', 'tiny',
      // 长短高矮
      'long', 'short', 'tall', 'high', 'low',
      // 新旧
      'new', 'old', 'young',
      // 快慢
      'fast', 'slow', 'quick',
      // 温度
      'hot', 'cold', 'warm', 'cool',
      // 其他
      'beautiful', 'pretty', 'handsome', 'ugly',
      'clean', 'dirty', 'easy', 'hard', 'difficult',
      'important', 'interesting', 'boring', 'funny',
    ],
    level: [1, 2, 3],
  },

  // 常用介词
  prepositions: {
    nameCn: '介词',
    words: [
      'in', 'on', 'at', 'to', 'from', 'with', 'for', 'of',
      'under', 'over', 'above', 'below', 'behind', 'before',
      'between', 'next', 'near', 'by', 'through', 'across',
    ],
    level: [1, 2, 3],
  },

  // 疑问词
  questionWords: {
    nameCn: '疑问词',
    words: [
      'what', 'who', 'where', 'when', 'why', 'how',
      'which', 'whose',
      'how many', 'how much', 'how old', 'how long',
    ],
    level: [1, 2],
  },

  // 常用短语
  commonPhrases: {
    nameCn: '常用短语',
    words: [
      'hello', 'hi', 'goodbye', 'bye',
      'please', 'thank you', 'thanks', 'sorry', 'excuse me',
      'yes', 'no', 'OK', 'sure',
      'good morning', 'good afternoon', 'good evening', 'good night',
      'how are you', 'I\'m fine', 'nice to meet you',
    ],
    level: [1],
  },
};

// ============ 统计信息 ============
export const wordStats = {
  dolchTotal: dolchPrePrimer.length + dolchPrimer.length + dolchFirstGrade.length
    + dolchSecondGrade.length + dolchThirdGrade.length,
  themeCategories: Object.keys(themeCategories).length,
  totalUniqueWords: 0, // 由运行时计算
};

// 获取所有主题词汇
export const getAllThemeWords = (): string[] => {
  const allWords = new Set<string>();
  Object.values(themeCategories).forEach((category) => {
    category.words.forEach((word: string) => allWords.add(word.toLowerCase()));
  });
  return Array.from(allWords);
};

// 获取指定级别的词汇
export const getWordsByLevel = (level: number): string[] => {
  const words = new Set<string>();
  Object.values(themeCategories).forEach((category) => {
    if (category.level.includes(level)) {
      category.words.forEach((word: string) => words.add(word.toLowerCase()));
    }
  });
  return Array.from(words);
};

// 获取所有 Dolch 高频词
export const getAllDolchWords = (): string[] => {
  return [
    ...dolchPrePrimer,
    ...dolchPrimer,
    ...dolchFirstGrade,
    ...dolchSecondGrade,
    ...dolchThirdGrade,
  ];
};

export default {
  dolchPrePrimer,
  dolchPrimer,
  dolchFirstGrade,
  dolchSecondGrade,
  dolchThirdGrade,
  themeCategories,
  wordStats,
  getAllThemeWords,
  getWordsByLevel,
  getAllDolchWords,
};

