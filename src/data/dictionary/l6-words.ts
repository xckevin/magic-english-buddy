/**
 * L6 词典数据 - 时光回廊
 * 包含过去完成时、条件状语从句、逻辑连接词相关词汇
 */

import type { DictionaryEntry } from '@/db';

export const l6Dictionary: DictionaryEntry[] = [
  // ============ 时态/语法词汇 ============
  { word: 'succeed', phonetic: '/səkˈsiːd/', meaningCn: '成功', meaningEn: 'to achieve a goal', partOfSpeech: 'v.', examples: ['He finally succeeded.', 'Will you succeed?'], emoji: '🏆', level: 6, frequency: 72 },
  { word: 'fail', phonetic: '/feɪl/', meaningCn: '失败', meaningEn: 'not to succeed', partOfSpeech: 'v.', examples: ['Edison failed many times.', "Don't fear failure."], emoji: '❌', level: 6, frequency: 75 },
  { word: 'invent', phonetic: '/ɪnˈvent/', meaningCn: '发明', meaningEn: 'to create something new', partOfSpeech: 'v.', examples: ['He invented the light bulb.', 'Who invented this?'], emoji: '💡', level: 6, frequency: 72 },
  { word: 'discover', phonetic: '/dɪˈskʌvər/', meaningCn: '发现', meaningEn: 'to find something unknown', partOfSpeech: 'v.', examples: ['Discover the secret.', 'She discovered a new planet.'], emoji: '🔍', level: 6, frequency: 75 },
  { word: 'await', phonetic: '/əˈweɪt/', meaningCn: '等待', meaningEn: 'to wait for', partOfSpeech: 'v.', examples: ['What awaited humanity?', 'Await your turn.'], emoji: '⏳', level: 6, frequency: 62 },
  { word: 'rely', phonetic: '/rɪˈlaɪ/', meaningCn: '依靠', meaningEn: 'to depend on', partOfSpeech: 'v.', examples: ['Rely on horses.', 'I rely on you.'], emoji: '🤝', level: 6, frequency: 70 },
  { word: 'function', phonetic: '/ˈfʌŋkʃn/', meaningCn: '运作', meaningEn: 'to work properly', partOfSpeech: 'v.', examples: ['Stop functioning.', 'How does it function?'], emoji: '⚙️', level: 6, frequency: 68 },
  { word: 'warn', phonetic: '/wɔːrn/', meaningCn: '警告', meaningEn: 'to tell of danger', partOfSpeech: 'v.', examples: ['The keeper warned.', 'I warned you.'], emoji: '⚠️', level: 6, frequency: 72 },
  { word: 'control', phonetic: '/kənˈtroʊl/', meaningCn: '控制', meaningEn: 'to have power over', partOfSpeech: 'v.', examples: ['Control the hourglass.', 'Control your emotions.'], emoji: '🎮', level: 6, frequency: 78 },
  { word: 'misuse', phonetic: '/ˌmɪsˈjuːz/', meaningCn: '滥用', meaningEn: 'to use wrongly', partOfSpeech: 'v.', examples: ['Misusing power.', "Don't misuse it."], emoji: '🚫', level: 6, frequency: 55 },

  // ============ 逻辑连接词 ============
  { word: 'therefore', phonetic: '/ˈðerˌfɔːr/', meaningCn: '因此', meaningEn: 'for that reason', partOfSpeech: 'adv.', examples: ['Therefore, they learned.', 'Therefore, I agree.'], emoji: '➡️', level: 6, frequency: 68 },
  { word: 'however', phonetic: '/haʊˈevər/', meaningCn: '然而', meaningEn: 'but', partOfSpeech: 'adv.', examples: ['However, he warned.', 'However, I disagree.'], emoji: '↩️', level: 6, frequency: 72 },
  { word: 'although', phonetic: '/ɔːlˈðoʊ/', meaningCn: '尽管', meaningEn: 'even though', partOfSpeech: 'conj.', examples: ['Although dangerous.', 'Although it rained.'], emoji: '🔄', level: 6, frequency: 72 },
  { word: 'eventually', phonetic: '/ɪˈventʃuəli/', meaningCn: '最终', meaningEn: 'in the end', partOfSpeech: 'adv.', examples: ['Eventually created.', 'Eventually, he succeeded.'], emoji: '🏁', level: 6, frequency: 70 },
  { word: 'rather', phonetic: '/ˈræðər/', meaningCn: '而是', meaningEn: 'instead', partOfSpeech: 'adv.', examples: ['Rather a step.', 'Rather, it is good.'], emoji: '⇄', level: 6, frequency: 68 },
  { word: 'nearly', phonetic: '/ˈnɪrli/', meaningCn: '将近', meaningEn: 'almost', partOfSpeech: 'adv.', examples: ['Nearly twenty years.', 'Nearly finished.'], emoji: '≈', level: 6, frequency: 72 },

  // ============ 蒸汽朋克主题词汇 ============
  { word: 'machine', phonetic: '/məˈʃiːn/', meaningCn: '机器', meaningEn: 'a mechanical device', partOfSpeech: 'n.', examples: ['Time machine.', 'A complex machine.'], emoji: '⚙️', level: 6, frequency: 80 },
  { word: 'clockwork', phonetic: '/ˈklɒkwɜːrk/', meaningCn: '发条装置', meaningEn: 'mechanism with gears', partOfSpeech: 'n.', examples: ['Powered by clockwork.', 'Clockwork city.'], emoji: '⏰', level: 6, frequency: 55 },
  { word: 'hourglass', phonetic: '/ˈaʊərɡlæs/', meaningCn: '沙漏', meaningEn: 'time measuring device', partOfSpeech: 'n.', examples: ['Ancient hourglass.', 'Turn the hourglass.'], emoji: '⏳', level: 6, frequency: 58 },
  { word: 'gear', phonetic: '/ɡɪr/', meaningCn: '齿轮', meaningEn: 'a toothed wheel', partOfSpeech: 'n.', examples: ['Metal gears.', 'The gears turned.'], emoji: '⚙️', level: 6, frequency: 65 },
  { word: 'steam', phonetic: '/stiːm/', meaningCn: '蒸汽', meaningEn: 'water vapor', partOfSpeech: 'n.', examples: ['Steam engine.', 'Steam power.'], emoji: '💨', level: 6, frequency: 70 },
  { word: 'engine', phonetic: '/ˈendʒɪn/', meaningCn: '引擎', meaningEn: 'a machine that produces power', partOfSpeech: 'n.', examples: ['Steam engine.', 'Car engine.'], emoji: '🚂', level: 6, frequency: 75 },
  { word: 'professor', phonetic: '/prəˈfesər/', meaningCn: '教授', meaningEn: 'a university teacher', partOfSpeech: 'n.', examples: ['Professor Wells.', 'My professor.'], emoji: '👨‍🏫', level: 6, frequency: 70 },
  { word: 'inventor', phonetic: '/ɪnˈventər/', meaningCn: '发明家', meaningEn: 'one who invents', partOfSpeech: 'n.', examples: ['A great inventor.', 'Edison was an inventor.'], emoji: '🔧', level: 6, frequency: 68 },
  { word: 'engineer', phonetic: '/ˌendʒɪˈnɪr/', meaningCn: '工程师', meaningEn: 'one who builds machines', partOfSpeech: 'n.', examples: ['Skilled engineers.', 'She is an engineer.'], emoji: '👷', level: 6, frequency: 72 },
  { word: 'citizen', phonetic: '/ˈsɪtɪzn/', meaningCn: '公民', meaningEn: 'a resident of a city', partOfSpeech: 'n.', examples: ['Every citizen.', 'Good citizen.'], emoji: '👤', level: 6, frequency: 70 },
  { word: 'timekeeper', phonetic: '/ˈtaɪmkiːpər/', meaningCn: '计时员', meaningEn: 'one who keeps time', partOfSpeech: 'n.', examples: ['The last timekeeper.', 'Generations of timekeepers.'], emoji: '⏱️', level: 6, frequency: 45 },

  // ============ 抽象概念词汇 ============
  { word: 'failure', phonetic: '/ˈfeɪljər/', meaningCn: '失败', meaningEn: 'lack of success', partOfSpeech: 'n.', examples: ['First failure.', 'Learn from failure.'], emoji: '❌', level: 6, frequency: 72 },
  { word: 'success', phonetic: '/səkˈses/', meaningCn: '成功', meaningEn: 'achievement of goal', partOfSpeech: 'n.', examples: ['Opposite of success.', 'Great success.'], emoji: '✅', level: 6, frequency: 78 },
  { word: 'persistence', phonetic: '/pərˈsɪstəns/', meaningCn: '坚持', meaningEn: 'not giving up', partOfSpeech: 'n.', examples: ['His persistence.', 'Show persistence.'], emoji: '💪', level: 6, frequency: 62 },
  { word: 'consequence', phonetic: '/ˈkɒnsɪkwəns/', meaningCn: '后果', meaningEn: 'result of an action', partOfSpeech: 'n.', examples: ['Terrible consequences.', 'Face the consequences.'], emoji: '⚖️', level: 6, frequency: 68 },
  { word: 'secret', phonetic: '/ˈsiːkrət/', meaningCn: '秘密', meaningEn: 'something hidden', partOfSpeech: 'n.', examples: ['Secret of time travel.', 'Keep a secret.'], emoji: '🤫', level: 6, frequency: 75 },
  { word: 'journey', phonetic: '/ˈdʒɜːrni/', meaningCn: '旅程', meaningEn: 'a long trip', partOfSpeech: 'n.', examples: ['Dangerous journey.', 'Begin the journey.'], emoji: '🚀', level: 6, frequency: 72 },
  { word: 'humanity', phonetic: '/hjuːˈmænəti/', meaningCn: '人类', meaningEn: 'all human beings', partOfSpeech: 'n.', examples: ['Awaited humanity.', 'For humanity.'], emoji: '🌍', level: 6, frequency: 65 },
  { word: 'transportation', phonetic: '/ˌtrænspɔːrˈteɪʃn/', meaningCn: '交通', meaningEn: 'moving from place to place', partOfSpeech: 'n.', examples: ['For transportation.', 'Public transportation.'], emoji: '🚗', level: 6, frequency: 68 },
  { word: 'opposite', phonetic: '/ˈɒpəzɪt/', meaningCn: '对立面', meaningEn: 'completely different', partOfSpeech: 'n.', examples: ['Opposite of success.', 'Exact opposite.'], emoji: '↔️', level: 6, frequency: 70 },

  // ============ 形容词 ============
  { word: 'responsible', phonetic: '/rɪˈspɒnsəbl/', meaningCn: '负责任的', meaningEn: 'having duties', partOfSpeech: 'adj.', examples: ['Be responsible.', 'Responsible person.'], emoji: '✅', level: 6, frequency: 72 },
  { word: 'impossible', phonetic: '/ɪmˈpɒsəbl/', meaningCn: '不可能的', meaningEn: 'cannot be done', partOfSpeech: 'adj.', examples: ['Seemed impossible.', 'Nothing is impossible.'], emoji: '🚫', level: 6, frequency: 75 },
  { word: 'terrible', phonetic: '/ˈterəbl/', meaningCn: '可怕的', meaningEn: 'very bad', partOfSpeech: 'adj.', examples: ['Terrible consequences.', 'Terrible storm.'], emoji: '😰', level: 6, frequency: 72 },
  { word: 'ancient', phonetic: '/ˈeɪnʃənt/', meaningCn: '古老的', meaningEn: 'very old', partOfSpeech: 'adj.', examples: ['Ancient hourglass.', 'Ancient history.'], emoji: '🏛️', level: 6, frequency: 72 },
  { word: 'daily', phonetic: '/ˈdeɪli/', meaningCn: '每日的', meaningEn: 'every day', partOfSpeech: 'adj.', examples: ['Wind daily.', 'Daily routine.'], emoji: '📅', level: 6, frequency: 75 },
];

export default l6Dictionary;

