export type SubjectId = 'chinese' | 'math' | 'english'

export type TaskMode = 'glyph' | 'quiz' | 'market' | 'treasure'

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
  meaning: string
  craftLine: string
  steps: GlyphStep[]
}

export type ChoiceChallenge = {
  kind:
    | 'pinyin'
    | 'word'
    | 'sentence'
    | 'reading'
    | 'number'
    | 'compare'
    | 'calculate'
    | 'shape'
    | 'position'
    | 'clock'
    | 'money'
    | 'pattern'
    | 'data'
  story: string
  question: string
  visual: string
  options: string[]
  answer: string
  explanation: string
}

export type EnglishTask = {
  word: string
  meaning: string
  theme: string
  grade: 1 | 2
  clue: string
  chineseClue: string
  treasure: string
  sentence: string
  chineseSentence: string
  emoji: string
  distractors: [string, string]
  letters: string[]
}

export type MarketItem = {
  id: string
  name: string
  price: number
  icon: string
}

export type MarketTask = {
  kind: 'market'
  shopName: string
  story: string
  budget: number
  targetItemIds: string[]
  items: MarketItem[]
}

export type MathTask = MarketTask | (ChoiceChallenge & { kind: Exclude<ChoiceChallenge['kind'], 'pinyin' | 'word' | 'sentence' | 'reading'> })

export type LearningTask = {
  id: string
  subject: SubjectId
  mode: TaskMode
  title: string
  prompt: string
  reward: number
  skill: string
  unit: string
  glyph?: GlyphTask
  challenge?: ChoiceChallenge
  english?: EnglishTask
  math?: MathTask
}

export type SubjectMeta = {
  id: SubjectId
  name: string
  shortName: string
  place: string
  promise: string
}

export const subjects: Record<SubjectId, SubjectMeta> = {
  chinese: {
    id: 'chinese',
    name: '造字山谷',
    shortName: '语文',
    place: '一年级语文全册',
    promise: '从声音、图画和故事里读懂汉字。',
  },
  math: {
    id: 'math',
    name: '生活数学城',
    shortName: '数学',
    place: '一年级数学全册',
    promise: '用数量、形状和计算解决生活任务。',
  },
  english: {
    id: 'english',
    name: '单词宝藏湾',
    shortName: '英语',
    place: '一二年级英语',
    promise: '先听懂，再寻找，最后亲手拼出单词。',
  },
}

const glyphSources: Array<{
  character: string
  pinyin: string
  objectName: string
  meaning: string
  craftLine: string
  shapes: [string, string, string, string]
  lines: [string, string, string, string]
}> = [
  {
    character: '日',
    pinyin: 'rì',
    objectName: '太阳',
    meaning: '太阳、白天、一天',
    craftLine: '圆圆的太阳刻到甲骨上，慢慢变成方方的“日”。',
    shapes: ['☀', '◎', '▭', '日'],
    lines: ['太阳从山边升起。', '留下外圈和中间的光。', '刻刀把圆线变直。', '中间一横留住太阳的光。'],
  },
  {
    character: '山',
    pinyin: 'shān',
    objectName: '山峰',
    meaning: '山峰、山坡、山顶',
    craftLine: '最早的“山”，就像三座连在一起的山峰。',
    shapes: ['⛰', '⋀⋀⋀', '∪∩∪', '山'],
    lines: ['远处有高低不同的山峰。', '留下三个最明显的尖峰。', '山峰变成三根竖线。', '中间最高，两边相伴。'],
  },
  {
    character: '水',
    pinyin: 'shuǐ',
    objectName: '水流',
    meaning: '河水、雨水、喝水',
    craftLine: '“水”中间像水道，两边像溅起的小水流。',
    shapes: ['〰', '│', '氺', '水'],
    lines: ['小河弯弯地往前流。', '保留中间的主水道。', '两边加上溅开的水花。', '流动的线条变成“水”。'],
  },
  {
    character: '火',
    pinyin: 'huǒ',
    objectName: '火焰',
    meaning: '火苗、火光、红火',
    craftLine: '跳动的火苗向上升，古人把它画成了“火”。',
    shapes: ['🔥', '♨', '灬', '火'],
    lines: ['火苗一高一低地跳舞。', '留下中间的大火苗。', '两边的小火星向外飞。', '四笔组成温暖的“火”。'],
  },
  {
    character: '木',
    pinyin: 'mù',
    objectName: '大树',
    meaning: '树木、木头、木船',
    craftLine: '树干、树枝和树根一起，长成了“木”。',
    shapes: ['🌳', 'Ψ', '十', '木'],
    lines: ['大树稳稳站在土地上。', '找到树干和向外的树枝。', '再留下伸开的树根。', '一棵树变成了“木”。'],
  },
  {
    character: '月',
    pinyin: 'yuè',
    objectName: '月亮',
    meaning: '月亮、月份、明月',
    craftLine: '弯弯的月亮被画进字里，就有了“月”。',
    shapes: ['🌙', '◖', '冂', '月'],
    lines: ['夜空挂着弯弯的月亮。', '留下月亮外面的弧线。', '刻直以后方便书写。', '两道月光落在里面。'],
  },
  {
    character: '大',
    pinyin: 'dà',
    objectName: '张开手的人',
    meaning: '大小、长大、大地',
    craftLine: '一个人张开双手双脚，表示“大”。',
    shapes: ['🧍', '人', 'メ', '大'],
    lines: ['小朋友把双手张得很开。', '头、手和脚连成轮廓。', '用三笔留下这个姿势。', '张开身体就是“大”。'],
  },
  {
    character: '小',
    pinyin: 'xiǎo',
    objectName: '细小的沙粒',
    meaning: '大小、小心、小鸟',
    craftLine: '中间一粒、两边两粒，细小的东西变成“小”。',
    shapes: ['∴', '•', '八', '小'],
    lines: ['手心里有三颗小沙粒。', '中间的一颗最显眼。', '两边的沙粒轻轻分开。', '三笔写成“小”。'],
  },
]

function makeGlyphTask(
  source: (typeof glyphSources)[number],
  index: number,
): LearningTask {
  const titles = ['看见', '取象', '简化', '成字']
  const actions = ['仔细观察', '找出特点', '变成线条', '亲手写字']
  return {
    id: `cn-glyph-${source.character}`,
    subject: 'chinese',
    mode: 'glyph',
    title: `把${source.objectName}变成“${source.character}”`,
    prompt: source.craftLine,
    reward: 3,
    skill: '象形观察、字义与规范笔顺',
    unit: `识字与写字 ${index + 1}`,
    glyph: {
      character: source.character,
      pinyin: source.pinyin,
      objectName: source.objectName,
      meaning: source.meaning,
      craftLine: source.craftLine,
      steps: titles.map((title, stepIndex) => ({
        title,
        text: source.lines[stepIndex],
        shape: source.shapes[stepIndex],
        action: actions[stepIndex],
      })),
    },
  }
}

const chineseQuizSources: Array<{
  id: string
  title: string
  unit: string
  kind: ChoiceChallenge['kind']
  story: string
  question: string
  visual: string
  options: string[]
  answer: string
  explanation: string
}> = [
  {
    id: 'tones',
    title: '声调精灵',
    unit: '汉语拼音：四声',
    kind: 'pinyin',
    story: '小马要跨过四座声调桥。',
    question: '“小马”的“马”读第几声？',
    visual: '🐴  mǎ',
    options: ['第一声', '第二声', '第三声', '第四声'],
    answer: '第三声',
    explanation: 'mǎ 的声调先降再升，是第三声。',
  },
  {
    id: 'initial-final',
    title: '拼音风车',
    unit: '汉语拼音：声母与韵母',
    kind: 'pinyin',
    story: '风车需要把声母和韵母拼在一起。',
    question: 'h 和 uā 拼在一起，读什么？',
    visual: 'h + uā = ?  🌼',
    options: ['huā', 'hā', 'wā', 'guā'],
    answer: 'huā',
    explanation: 'h-u-ā 连起来读 huā，就是“花”。',
  },
  {
    id: 'whole-syllable',
    title: '整体认读车站',
    unit: '汉语拼音：整体认读音节',
    kind: 'pinyin',
    story: '只有整体认读音节才能登上直达列车。',
    question: '下面哪个是整体认读音节？',
    visual: '🚂  zhī',
    options: ['zhī', 'bā', 'pō', 'kē'],
    answer: 'zhī',
    explanation: 'zhi 不拆开拼读，要整体认读。',
  },
  {
    id: 'radical',
    title: '偏旁侦探',
    unit: '识字：偏旁部首',
    kind: 'word',
    story: '小河把自己的偏旁藏在石头里。',
    question: '“河”字的偏旁是什么？',
    visual: '河  🌊',
    options: ['三点水', '木字旁', '提手旁', '口字旁'],
    answer: '三点水',
    explanation: '“河”与水有关，左边是三点水。',
  },
  {
    id: 'stroke',
    title: '笔画机关',
    unit: '写字：基本笔画与笔顺',
    kind: 'word',
    story: '石门只认“先横后竖”的书写规则。',
    question: '“十”字应该先写哪一笔？',
    visual: '十',
    options: ['横', '竖', '撇', '点'],
    answer: '横',
    explanation: '写“十”时先横后竖。',
  },
  {
    id: 'quantifier',
    title: '量词花园',
    unit: '词语：常用量词',
    kind: 'word',
    story: '给花朵找到合适的数量伙伴。',
    question: '一（  ）花，括号里放什么？',
    visual: '一 ？ 花  🌸',
    options: ['朵', '只', '本', '条'],
    answer: '朵',
    explanation: '花朵常用量词“朵”：一朵花。',
  },
  {
    id: 'opposite',
    title: '反义词跷跷板',
    unit: '词语：反义词',
    kind: 'word',
    story: '跷跷板两边要放意思相反的词。',
    question: '“高”的反义词是什么？',
    visual: '🦒  高  ↔  ?',
    options: ['低', '大', '远', '多'],
    answer: '低',
    explanation: '高和低表示相反的高度。',
  },
  {
    id: 'word-building',
    title: '词语魔方',
    unit: '词语：组词与积累',
    kind: 'word',
    story: '转动魔方，为“春”找到词语伙伴。',
    question: '哪个词语搭配正确？',
    visual: '春 + ?  🌱',
    options: ['春天', '春书', '春桌', '春笔'],
    answer: '春天',
    explanation: '“春天”是表示季节的词语。',
  },
  {
    id: 'sentence-order',
    title: '句子小火车',
    unit: '句子：连词成句',
    kind: 'sentence',
    story: '把词语车厢排成通顺的一句话。',
    question: '哪句话的顺序正确？',
    visual: '我 / 公园 / 去 / 玩',
    options: ['我去公园玩。', '公园我玩去。', '玩我去公园。'],
    answer: '我去公园玩。',
    explanation: '先说“谁”，再说“去哪里做什么”。',
  },
  {
    id: 'punctuation',
    title: '标点灯塔',
    unit: '句子：标点符号',
    kind: 'sentence',
    story: '灯塔要为问题亮起正确的标点。',
    question: '“你今天开心吗”后面用什么标点？',
    visual: '你今天开心吗  ?',
    options: ['？', '。', '！', '，'],
    answer: '？',
    explanation: '这是一个问题，句末用问号。',
  },
  {
    id: 'reading-spring',
    title: '春雨小屋',
    unit: '阅读：提取明显信息',
    kind: 'reading',
    story: '春雨沙沙地下，小草绿了，桃花红了。',
    question: '春雨以后，什么红了？',
    visual: '🌧️  🌱  🌸',
    options: ['桃花', '小草', '天空', '石头'],
    answer: '桃花',
    explanation: '短文说“小草绿了，桃花红了”。',
  },
  {
    id: 'reading-reason',
    title: '小鸟回家',
    unit: '阅读：理解原因',
    kind: 'reading',
    story: '天黑了，小鸟飞回树上的家，因为鸟宝宝在等它。',
    question: '小鸟为什么飞回家？',
    visual: '🐦  →  🌳',
    options: ['鸟宝宝在等它', '它要去游泳', '太阳出来了'],
    answer: '鸟宝宝在等它',
    explanation: '“因为”后面的内容告诉了我们原因。',
  },
  {
    id: 'recitation',
    title: '古诗月光',
    unit: '积累：古诗与背诵',
    kind: 'reading',
    story: '床前明月光，疑是地上霜。',
    question: '诗句里照在床前的是什么？',
    visual: '🌙  ✨',
    options: ['月光', '阳光', '灯光', '火光'],
    answer: '月光',
    explanation: '“床前明月光”写的是明亮的月光。',
  },
  {
    id: 'expression',
    title: '看图会说话',
    unit: '口语交际与看图表达',
    kind: 'sentence',
    story: '研姐看见同学摔倒了，马上跑过去。',
    question: '哪句话最有礼貌，也最合适？',
    visual: '👧  🤝  🧒',
    options: ['你没事吧？我来帮你。', '你快走开。', '我不认识你。'],
    answer: '你没事吧？我来帮你。',
    explanation: '先关心对方，再主动提供帮助。',
  },
]

function makeChineseQuiz(source: (typeof chineseQuizSources)[number]): LearningTask {
  return {
    id: `cn-${source.id}`,
    subject: 'chinese',
    mode: 'quiz',
    title: source.title,
    prompt: source.question,
    reward: 3,
    skill: source.unit,
    unit: source.unit,
    challenge: {
      kind: source.kind,
      story: source.story,
      question: source.question,
      visual: source.visual,
      options: source.options,
      answer: source.answer,
      explanation: source.explanation,
    },
  }
}

function market(
  id: string,
  title: string,
  unit: string,
  shopName: string,
  story: string,
  budget: number,
  targetItemIds: string[],
  items: MarketItem[],
): LearningTask {
  return {
    id,
    subject: 'math',
    mode: 'market',
    title,
    prompt: story,
    reward: 3,
    skill: unit,
    unit,
    math: { kind: 'market', shopName, story, budget, targetItemIds, items },
  }
}

const mathQuizSources: Array<{
  id: string
  title: string
  unit: string
  kind: ChoiceChallenge['kind']
  story: string
  question: string
  visual: string
  options: string[]
  answer: string
  explanation: string
}> = [
  {
    id: 'count-5',
    title: '果园点数',
    unit: '0—5 的认识',
    kind: 'number',
    story: '小篮子要装下所有红苹果。',
    question: '一共有几个苹果？',
    visual: '🍎 🍎 🍎 🍎',
    options: ['3', '4', '5'],
    answer: '4',
    explanation: '按顺序点数：1、2、3、4。',
  },
  {
    id: 'zero',
    title: '空盘子的秘密',
    unit: '0 的认识',
    kind: 'number',
    story: '小猫把盘子里的鱼吃完了。',
    question: '盘子里一条鱼也没有，用哪个数表示？',
    visual: '🍽️',
    options: ['0', '1', '2'],
    answer: '0',
    explanation: '一个也没有，可以用 0 表示。',
  },
  {
    id: 'compare',
    title: '鳄鱼比大小',
    unit: '比较大小',
    kind: 'compare',
    story: '鳄鱼嘴总是朝向数量多的一边。',
    question: '7 和 5 中间应该放什么？',
    visual: '7  ?  5',
    options: ['＞', '＜', '＝'],
    answer: '＞',
    explanation: '7 比 5 大，所以 7＞5。',
  },
  {
    id: 'order',
    title: '数字登山队',
    unit: '数的顺序与序数',
    kind: 'number',
    story: '数字要从小到大排队登山。',
    question: '哪一队排得正确？',
    visual: '1  3  2  5  4',
    options: ['1、2、3、4、5', '5、4、3、2、1', '1、3、2、4、5'],
    answer: '1、2、3、4、5',
    explanation: '从小到大，每次增加 1。',
  },
  {
    id: 'compose-10',
    title: '凑十烟花',
    unit: '10 的组成',
    kind: 'calculate',
    story: '两束数字烟花合起来要正好是 10。',
    question: '6 和几合起来是 10？',
    visual: '6 + ? = 10',
    options: ['3', '4', '5'],
    answer: '4',
    explanation: '6 和 4 组成 10。',
  },
  {
    id: 'add-10',
    title: '小鸭过河',
    unit: '10 以内加法',
    kind: 'calculate',
    story: '河里原来有 3 只小鸭，又游来 4 只。',
    question: '现在一共有几只小鸭？',
    visual: '🦆🦆🦆  +  🦆🦆🦆🦆',
    options: ['6', '7', '8'],
    answer: '7',
    explanation: '3 + 4 = 7。',
  },
  {
    id: 'subtract-10',
    title: '气球飞走了',
    unit: '10 以内减法',
    kind: 'calculate',
    story: '研姐有 9 个气球，飞走了 3 个。',
    question: '还剩几个气球？',
    visual: '9 - 3 = ?  🎈',
    options: ['5', '6', '7'],
    answer: '6',
    explanation: '从 9 里去掉 3，还剩 6。',
  },
  {
    id: 'teen-number',
    title: '十位与个位',
    unit: '11—20 各数的认识',
    kind: 'number',
    story: '一捆小棒表示 1 个十，旁边还有 4 根。',
    question: '1 个十和 4 个一组成多少？',
    visual: '🔟 +  ••••',
    options: ['10', '14', '41'],
    answer: '14',
    explanation: '1 个十和 4 个一组成 14。',
  },
  {
    id: 'add-20',
    title: '星星凑整',
    unit: '20 以内进位加法',
    kind: 'calculate',
    story: '先把 8 凑成 10，会算得更快。',
    question: '8 + 7 等于多少？',
    visual: '8 + 2 + 5 = ?',
    options: ['14', '15', '16'],
    answer: '15',
    explanation: '把 7 分成 2 和 5，8+2=10，10+5=15。',
  },
  {
    id: 'subtract-20',
    title: '彩珠退位',
    unit: '20 以内退位减法',
    kind: 'calculate',
    story: '从 13 颗彩珠里拿走 6 颗。',
    question: '13 - 6 等于多少？',
    visual: '13 - 3 - 3 = ?',
    options: ['6', '7', '8'],
    answer: '7',
    explanation: '先减 3 到 10，再减 3，结果是 7。',
  },
  {
    id: 'shape',
    title: '积木建筑师',
    unit: '认识立体图形',
    kind: 'shape',
    story: '选一个能稳稳滚动的积木。',
    question: '哪个物体最容易滚动？',
    visual: '📦  ⚽  🧊',
    options: ['球', '正方体', '长方体'],
    answer: '球',
    explanation: '球的表面是弯曲的，向各个方向都容易滚动。',
  },
  {
    id: 'position',
    title: '小猫藏宝图',
    unit: '上、下、前、后、左、右',
    kind: 'position',
    story: '小猫躲在桌子的下面。',
    question: '小猫在桌子的什么位置？',
    visual: '🪑\n🐈',
    options: ['上面', '下面', '左边'],
    answer: '下面',
    explanation: '小猫的位置比桌子低，在桌子下面。',
  },
  {
    id: 'clock',
    title: '整时钟楼',
    unit: '认识整时',
    kind: 'clock',
    story: '分针指着 12，时针指着 7。',
    question: '钟面表示几时？',
    visual: '🕖',
    options: ['6 时', '7 时', '12 时'],
    answer: '7 时',
    explanation: '分针指 12、时针指 7，就是 7 时。',
  },
  {
    id: 'money',
    title: '硬币兑换所',
    unit: '认识人民币',
    kind: 'money',
    story: '用 1 元硬币兑换 5 角硬币。',
    question: '1 元等于几个 5 角？',
    visual: '1 元 = ? × 5 角',
    options: ['1 个', '2 个', '5 个'],
    answer: '2 个',
    explanation: '1 元等于 10 角，两个 5 角正好是 10 角。',
  },
  {
    id: 'classify',
    title: '整理魔法柜',
    unit: '分类与整理',
    kind: 'data',
    story: '把水果放进同一个篮子里。',
    question: '哪一个不应该放进水果篮？',
    visual: '🍎  🍌  🥕  🍐',
    options: ['苹果', '胡萝卜', '梨'],
    answer: '胡萝卜',
    explanation: '胡萝卜是蔬菜，其余都是水果。',
  },
  {
    id: 'pattern',
    title: '彩灯找规律',
    unit: '找规律',
    kind: 'pattern',
    story: '彩灯按照红、黄、红、黄不断重复。',
    question: '下一盏灯是什么颜色？',
    visual: '🔴 🟡 🔴 🟡  ?',
    options: ['红色', '黄色', '蓝色'],
    answer: '红色',
    explanation: '红、黄两个一组重复，下一盏是红色。',
  },
  {
    id: 'data',
    title: '天气记录员',
    unit: '简单数据整理',
    kind: 'data',
    story: '本周有 3 天晴、2 天雨、1 天多云。',
    question: '哪种天气的天数最多？',
    visual: '☀️☀️☀️  🌧️🌧️  ☁️',
    options: ['晴天', '雨天', '多云'],
    answer: '晴天',
    explanation: '晴天有 3 天，比雨天和多云都多。',
  },
]

function makeMathQuiz(source: (typeof mathQuizSources)[number]): LearningTask {
  const challenge: ChoiceChallenge = {
    kind: source.kind,
    story: source.story,
    question: source.question,
    visual: source.visual,
    options: source.options,
    answer: source.answer,
    explanation: source.explanation,
  }
  return {
    id: `math-${source.id}`,
    subject: 'math',
    mode: 'quiz',
    title: source.title,
    prompt: source.question,
    reward: 3,
    skill: source.unit,
    unit: source.unit,
    challenge,
    math: challenge as MathTask,
  }
}

const englishSources: Array<{
  word: string
  meaning: string
  theme: string
  grade: 1 | 2
  clue: string
  chineseClue: string
  sentence: string
  chineseSentence: string
  emoji: string
  distractors: [string, string]
}> = [
  { word: 'apple', meaning: '苹果', theme: '水果', grade: 1, clue: 'It is red and sweet.', chineseClue: '它是红色的，吃起来甜甜的。', sentence: 'I see an apple.', chineseSentence: '我看见一个苹果。', emoji: '🍎', distractors: ['📘', '🐱'] },
  { word: 'book', meaning: '书', theme: '文具', grade: 1, clue: 'Open it and read it.', chineseClue: '打开它，就能读故事。', sentence: 'This is my book.', chineseSentence: '这是我的书。', emoji: '📘', distractors: ['🍎', '🎒'] },
  { word: 'cat', meaning: '猫', theme: '动物', grade: 1, clue: 'It says meow.', chineseClue: '它会喵喵叫。', sentence: 'The cat is cute.', chineseSentence: '这只猫很可爱。', emoji: '🐱', distractors: ['🐶', '🐟'] },
  { word: 'dog', meaning: '狗', theme: '动物', grade: 1, clue: 'It can run and bark.', chineseClue: '它会跑，也会汪汪叫。', sentence: 'I like my dog.', chineseSentence: '我喜欢我的小狗。', emoji: '🐶', distractors: ['🐱', '🐰'] },
  { word: 'sun', meaning: '太阳', theme: '自然', grade: 1, clue: 'It is bright in the sky.', chineseClue: '它在天空中发出明亮的光。', sentence: 'The sun is hot.', chineseSentence: '太阳很热。', emoji: '☀️', distractors: ['🌙', '⭐'] },
  { word: 'fish', meaning: '鱼', theme: '动物', grade: 1, clue: 'It can swim in water.', chineseClue: '它能在水里游。', sentence: 'The fish is blue.', chineseSentence: '这条鱼是蓝色的。', emoji: '🐟', distractors: ['🐦', '🐸'] },
  { word: 'milk', meaning: '牛奶', theme: '食物', grade: 1, clue: 'It is a white drink.', chineseClue: '它是一种白色的饮品。', sentence: 'I drink milk.', chineseSentence: '我喝牛奶。', emoji: '🥛', distractors: ['🧃', '🍰'] },
  { word: 'red', meaning: '红色', theme: '颜色', grade: 1, clue: 'It is the color of an apple.', chineseClue: '它是苹果常见的颜色。', sentence: 'The bag is red.', chineseSentence: '这个包是红色的。', emoji: '🔴', distractors: ['🔵', '🟡'] },
  { word: 'hand', meaning: '手', theme: '身体', grade: 1, clue: 'You use it to hold a pencil.', chineseClue: '你用它握住铅笔。', sentence: 'Clap your hands.', chineseSentence: '拍拍你的手。', emoji: '✋', distractors: ['👂', '👣'] },
  { word: 'mom', meaning: '妈妈', theme: '家人', grade: 1, clue: 'She is in your family.', chineseClue: '她是你的家人。', sentence: 'I love my mom.', chineseSentence: '我爱妈妈。', emoji: '👩', distractors: ['👨', '👶'] },
  { word: 'pen', meaning: '钢笔', theme: '学校', grade: 1, clue: 'You can write with it.', chineseClue: '你可以用它写字。', sentence: 'This is a pen.', chineseSentence: '这是一支钢笔。', emoji: '🖊️', distractors: ['📏', '✂️'] },
  { word: 'bus', meaning: '公共汽车', theme: '交通', grade: 1, clue: 'It is big and takes us to school.', chineseClue: '它很大，可以带我们去学校。', sentence: 'I go by bus.', chineseSentence: '我乘公共汽车出行。', emoji: '🚌', distractors: ['🚲', '🚗'] },
  { word: 'rain', meaning: '雨', theme: '天气', grade: 2, clue: 'It falls from the clouds.', chineseClue: '它从云朵里落下来。', sentence: 'I see the rain.', chineseSentence: '我看见雨。', emoji: '🌧️', distractors: ['☀️', '❄️'] },
  { word: 'cake', meaning: '蛋糕', theme: '食物', grade: 2, clue: 'We eat it at a birthday party.', chineseClue: '生日聚会时我们会吃它。', sentence: 'The cake is yummy.', chineseSentence: '蛋糕很好吃。', emoji: '🍰', distractors: ['🍞', '🍎'] },
  { word: 'bird', meaning: '鸟', theme: '动物', grade: 2, clue: 'It has wings and can fly.', chineseClue: '它有翅膀，可以飞。', sentence: 'The bird is in the tree.', chineseSentence: '小鸟在树上。', emoji: '🐦', distractors: ['🐟', '🐢'] },
  { word: 'dress', meaning: '连衣裙', theme: '服装', grade: 2, clue: 'You can wear it.', chineseClue: '你可以把它穿在身上。', sentence: 'My dress is pink.', chineseSentence: '我的连衣裙是粉色的。', emoji: '👗', distractors: ['👒', '👟'] },
  { word: 'clock', meaning: '时钟', theme: '时间', grade: 2, clue: 'It tells the time.', chineseClue: '它会告诉我们时间。', sentence: 'Look at the clock.', chineseSentence: '看看时钟。', emoji: '🕒', distractors: ['📅', '🔔'] },
  { word: 'chair', meaning: '椅子', theme: '教室', grade: 2, clue: 'You can sit on it.', chineseClue: '你可以坐在它上面。', sentence: 'Sit on the chair.', chineseSentence: '坐在椅子上。', emoji: '🪑', distractors: ['🚪', '🛏️'] },
  { word: 'happy', meaning: '开心的', theme: '感受', grade: 2, clue: 'You feel this when you smile.', chineseClue: '当你微笑时，会有这种感受。', sentence: 'I am happy today.', chineseSentence: '我今天很开心。', emoji: '😊', distractors: ['😢', '😴'] },
  { word: 'jump', meaning: '跳', theme: '动作', grade: 2, clue: 'Move your body up from the ground.', chineseClue: '让身体离开地面向上运动。', sentence: 'I can jump high.', chineseSentence: '我能跳得很高。', emoji: '🤸', distractors: ['🏊', '🛌'] },
  { word: 'tiger', meaning: '老虎', theme: '动物', grade: 2, clue: 'It is a big striped cat.', chineseClue: '它是身上有条纹的大猫。', sentence: 'The tiger can run.', chineseSentence: '老虎会跑。', emoji: '🐯', distractors: ['🦁', '🐼'] },
  { word: 'flower', meaning: '花', theme: '自然', grade: 2, clue: 'It grows in a garden.', chineseClue: '它生长在花园里。', sentence: 'This flower is beautiful.', chineseSentence: '这朵花很美。', emoji: '🌸', distractors: ['🌳', '🍄'] },
  { word: 'under', meaning: '在下面', theme: '方位', grade: 2, clue: 'The cat is below the table.', chineseClue: '小猫在桌子的下面。', sentence: 'The cat is under the table.', chineseSentence: '小猫在桌子下面。', emoji: '⬇️', distractors: ['⬆️', '↔️'] },
  { word: 'seven', meaning: '七', theme: '数字', grade: 2, clue: 'It comes after six.', chineseClue: '它排在数字六的后面。', sentence: 'I have seven stars.', chineseSentence: '我有七颗星星。', emoji: '7️⃣', distractors: ['6️⃣', '8️⃣'] },
]

function shuffledLetters(word: string) {
  const letters = word.split('')
  if (letters.length < 2) {
    return letters
  }
  return [...letters.slice(1), letters[0]]
}

function makeEnglishTask(source: (typeof englishSources)[number]): LearningTask {
  return {
    id: `en-${source.word}`,
    subject: 'english',
    mode: 'treasure',
    title: `${source.meaning}宝藏`,
    prompt: source.chineseClue,
    reward: 3,
    skill: `${source.grade}年级 · ${source.theme} · 听说读拼`,
    unit: `${source.grade}年级 ${source.theme}`,
    english: {
      ...source,
      treasure: `${source.meaning}宝石`,
      letters: shuffledLetters(source.word),
    },
  }
}

export const chineseTasks: LearningTask[] = [
  ...glyphSources.map(makeGlyphTask),
  ...chineseQuizSources.map(makeChineseQuiz),
]

export const mathTasks: LearningTask[] = [
  ...mathQuizSources.map(makeMathQuiz),
  market(
    'math-toy-shop',
    '玩具采购员',
    '解决 20 以内购物问题',
    '星星玩具超市',
    '研姐想买玩具车和贴纸。把它们放进购物篮，再算找回多少钱。',
    15,
    ['car', 'sticker'],
    [
      { id: 'car', name: '玩具车', price: 8, icon: '🚗' },
      { id: 'sticker', name: '贴纸', price: 3, icon: '⭐' },
      { id: 'ball', name: '皮球', price: 6, icon: '⚽' },
      { id: 'bear', name: '小熊', price: 9, icon: '🧸' },
    ],
  ),
  market(
    'math-school-shop',
    '开学文具采购',
    '人民币、预算与加减法',
    '彩虹文具店',
    '请用 12 元买齐铅笔和橡皮，再到收银台结账。',
    12,
    ['pencil', 'eraser'],
    [
      { id: 'pencil', name: '铅笔', price: 4, icon: '✏️' },
      { id: 'eraser', name: '橡皮', price: 3, icon: '⬜' },
      { id: 'ruler', name: '尺子', price: 6, icon: '📏' },
      { id: 'notebook', name: '本子', price: 8, icon: '📘' },
    ],
  ),
  market(
    'math-picnic-shop',
    '野餐小卖部',
    '生活中的加减法',
    '公园小卖部',
    '野餐清单上有苹果和牛奶。买齐以后算一算还剩多少钱。',
    18,
    ['apple', 'milk'],
    [
      { id: 'apple', name: '苹果', price: 5, icon: '🍎' },
      { id: 'milk', name: '牛奶', price: 7, icon: '🥛' },
      { id: 'cake', name: '蛋糕', price: 9, icon: '🍰' },
      { id: 'juice', name: '果汁', price: 6, icon: '🧃' },
    ],
  ),
]

export const englishTasks = englishSources.map(makeEnglishTask)
export const tasks: LearningTask[] = [...chineseTasks, ...mathTasks, ...englishTasks]

export function getSubjectTasks(subject: SubjectId) {
  return tasks.filter((task) => task.subject === subject)
}

export function getDailyTasks(day = new Date().getDate()) {
  const pick = (list: LearningTask[], offset: number) =>
    list[(day + offset) % list.length]
  return [
    pick(chineseTasks, 0),
    pick(mathTasks, 3),
    pick(englishTasks, 7),
  ]
}

export function getCoverage(subject: SubjectId) {
  const list = getSubjectTasks(subject)
  return {
    total: list.length,
    units: Array.from(new Set(list.map((task) => task.unit))),
  }
}
