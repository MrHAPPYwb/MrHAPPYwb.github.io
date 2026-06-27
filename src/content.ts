export type SubjectId = 'chinese' | 'math' | 'english'

export type TaskMode = 'glyph' | 'market' | 'treasure'

export type GlyphStep = {
  title: string
  text: string
  shape: string
  action: string
}

export type GlyphTask = {
  character: string
  pinyin: string
  objectName: string
  scene: string
  meaning: string
  craftLine: string
  steps: GlyphStep[]
}

export type EnglishTask = {
  word: string
  meaning: string
  clue: string
  treasure: string
  sound: string
  sentence: string
  letters: string[]
}

export type MarketItem = {
  id: string
  name: string
  price: number
  icon: string
}

export type MathTask = {
  shopName: string
  story: string
  budget: number
  targetItemIds: string[]
  items: MarketItem[]
  coins: number[]
}

export type LearningTask = {
  id: string
  subject: SubjectId
  mode: TaskMode
  title: string
  prompt: string
  reward: number
  skill: string
  glyph?: GlyphTask
  english?: EnglishTask
  math?: MathTask
}

export type SubjectMeta = {
  id: SubjectId
  name: string
  shortName: string
  place: string
  color: string
  accent: string
  promise: string
}

export const subjects: Record<SubjectId, SubjectMeta> = {
  chinese: {
    id: 'chinese',
    name: '造字山谷',
    shortName: '语文',
    place: '象形造字工坊',
    color: '#0f766e',
    accent: '#ccfbf1',
    promise: '先看见世界，再把世界刻成字。',
  },
  math: {
    id: 'math',
    name: '玩具超市',
    shortName: '数学',
    place: '小小购物计划',
    color: '#b45309',
    accent: '#fef3c7',
    promise: '在买东西、付钱、找组合里用数学。',
  },
  english: {
    id: 'english',
    name: '单词宝藏湾',
    shortName: '英语',
    place: '字母宝石寻宝',
    color: '#2563eb',
    accent: '#dbeafe',
    promise: '听声音，找线索，把字母拼成宝物名。',
  },
}

export const tasks: LearningTask[] = [
  {
    id: 'cn-ri',
    subject: 'chinese',
    mode: 'glyph',
    title: '把太阳变成“日”',
    prompt: '造字师先看太阳，再留下最重要的样子。',
    reward: 3,
    skill: '象形观察 + 字形演变 + 笔顺',
    glyph: {
      character: '日',
      pinyin: 'rì',
      objectName: '太阳',
      scene: 'sun',
      meaning: '白天、太阳、一天',
      craftLine: '圆圆的太阳，被刻到龟甲上时慢慢变成了方方的“日”。',
      steps: [
        {
          title: '看见',
          text: '天亮了，太阳从山边升起。',
          shape: '☀',
          action: '观察太阳',
        },
        {
          title: '取象',
          text: '留下外圈和中间的光。',
          shape: '◎',
          action: '拓下轮廓',
        },
        {
          title: '简化',
          text: '刻刀把圆变直，方便写得快。',
          shape: '▭',
          action: '收成方框',
        },
        {
          title: '成字',
          text: '中间一横留住太阳的光。',
          shape: '日',
          action: '刻成日',
        },
      ],
    },
  },
  {
    id: 'cn-shan',
    subject: 'chinese',
    mode: 'glyph',
    title: '把山峰变成“山”',
    prompt: '三座山峰站在一起，字就有了骨架。',
    reward: 3,
    skill: '象形观察 + 结构感知',
    glyph: {
      character: '山',
      pinyin: 'shān',
      objectName: '山峰',
      scene: 'mountain',
      meaning: '高高的山、山坡、山顶',
      craftLine: '最早的“山”像几座连在一起的山峰。',
      steps: [
        {
          title: '看见',
          text: '远处有高低不同的山峰。',
          shape: '⛰',
          action: '望向山峰',
        },
        {
          title: '取象',
          text: '只留下三个最明显的尖峰。',
          shape: '⋀⋀⋀',
          action: '圈出山尖',
        },
        {
          title: '简化',
          text: '山峰变成三根竖线。',
          shape: '∪∩∪',
          action: '连起山脚',
        },
        {
          title: '成字',
          text: '中间最高，两边相伴。',
          shape: '山',
          action: '刻成山',
        },
      ],
    },
  },
  {
    id: 'cn-shui',
    subject: 'chinese',
    mode: 'glyph',
    title: '把水流变成“水”',
    prompt: '水会流动，字也要留下流动的样子。',
    reward: 3,
    skill: '象形观察 + 线条方向',
    glyph: {
      character: '水',
      pinyin: 'shuǐ',
      objectName: '水流',
      scene: 'water',
      meaning: '河水、雨水、喝水',
      craftLine: '“水”中间像水道，两边像溅起的小水流。',
      steps: [
        {
          title: '看见',
          text: '小河弯弯地往前流。',
          shape: '〰',
          action: '听水流声',
        },
        {
          title: '取象',
          text: '保留中间的主水道。',
          shape: '│',
          action: '描出水道',
        },
        {
          title: '简化',
          text: '两边加上溅开的水花。',
          shape: '氺',
          action: '加上水花',
        },
        {
          title: '成字',
          text: '流动的线条变成今天的“水”。',
          shape: '水',
          action: '刻成水',
        },
      ],
    },
  },
  {
    id: 'math-toy-car',
    subject: 'math',
    mode: 'market',
    title: '给小露买玩具车',
    prompt: '购物篮里只能放清单上的玩具，算好一共多少钱。',
    reward: 3,
    skill: '生活加法 + 价格组合',
    math: {
      shopName: '星星玩具超市',
      story: '小露想买玩具车和贴纸。请把它们放进购物篮，再付钱。',
      budget: 10,
      targetItemIds: ['car', 'sticker'],
      coins: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      items: [
        { id: 'car', name: '玩具车', price: 7, icon: '🚗' },
        { id: 'sticker', name: '贴纸', price: 2, icon: '⭐' },
        { id: 'ball', name: '皮球', price: 5, icon: '⚽' },
        { id: 'bear', name: '小熊', price: 8, icon: '🧸' },
      ],
    },
  },
  {
    id: 'math-pencil',
    subject: 'math',
    mode: 'market',
    title: '开学文具采购',
    prompt: '用 10 元以内买齐铅笔和橡皮。',
    reward: 3,
    skill: '预算意识 + 20 以内加法',
    math: {
      shopName: '开学文具角',
      story: '明天上学，需要铅笔和橡皮。选对物品并看看有没有超预算。',
      budget: 10,
      targetItemIds: ['pencil', 'eraser'],
      coins: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      items: [
        { id: 'pencil', name: '铅笔', price: 3, icon: '✏️' },
        { id: 'eraser', name: '橡皮', price: 4, icon: '⬜' },
        { id: 'ruler', name: '尺子', price: 6, icon: '📏' },
        { id: 'notebook', name: '本子', price: 5, icon: '📘' },
      ],
    },
  },
  {
    id: 'math-snack',
    subject: 'math',
    mode: 'market',
    title: '野餐小卖部',
    prompt: '买苹果和牛奶，算一算篮子里的总价。',
    reward: 3,
    skill: '生活情景 + 凑数',
    math: {
      shopName: '野餐小卖部',
      story: '去公园野餐，购物清单上有苹果和牛奶。',
      budget: 12,
      targetItemIds: ['apple', 'milk'],
      coins: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      items: [
        { id: 'apple', name: '苹果', price: 4, icon: '🍎' },
        { id: 'milk', name: '牛奶', price: 6, icon: '🥛' },
        { id: 'cake', name: '蛋糕', price: 9, icon: '🍰' },
        { id: 'juice', name: '果汁', price: 5, icon: '🧃' },
      ],
    },
  },
  {
    id: 'en-apple',
    subject: 'english',
    mode: 'treasure',
    title: '苹果宝箱',
    prompt: '听线索，按顺序点字母宝石。',
    reward: 3,
    skill: '听词 + 拼读 + 字母顺序',
    english: {
      word: 'apple',
      meaning: '苹果',
      clue: 'It is red. It is sweet.',
      treasure: '红苹果徽章',
      sound: 'apple',
      sentence: 'I see an apple.',
      letters: ['a', 'p', 'l', 'e', 'p'],
    },
  },
  {
    id: 'en-book',
    subject: 'english',
    mode: 'treasure',
    title: '书本宝箱',
    prompt: '拼出能打开书架机关的单词。',
    reward: 3,
    skill: '学校物品词 + 拼读',
    english: {
      word: 'book',
      meaning: '书',
      clue: 'Open it. Read it.',
      treasure: '故事书钥匙',
      sound: 'book',
      sentence: 'This is my book.',
      letters: ['b', 'o', 'k', 'o'],
    },
  },
  {
    id: 'en-cat',
    subject: 'english',
    mode: 'treasure',
    title: '小猫宝箱',
    prompt: '跟着脚印，拼出小动物的名字。',
    reward: 3,
    skill: '动物词 + 听音辨字母',
    english: {
      word: 'cat',
      meaning: '小猫',
      clue: 'It says meow.',
      treasure: '小猫铃铛',
      sound: 'cat',
      sentence: 'The cat is cute.',
      letters: ['c', 'a', 't'],
    },
  },
]

export function getSubjectTasks(subject: SubjectId) {
  return tasks.filter((task) => task.subject === subject)
}

export function getDailyTasks() {
  return [
    tasks.find((task) => task.id === 'cn-ri'),
    tasks.find((task) => task.id === 'math-toy-car'),
    tasks.find((task) => task.id === 'en-apple'),
  ].filter((task): task is LearningTask => Boolean(task))
}
