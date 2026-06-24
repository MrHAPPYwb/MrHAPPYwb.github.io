export type SubjectId = 'chinese' | 'math' | 'english'

export type TaskMode = 'hanzi' | 'math' | 'english'

export type LearningTask = {
  id: string
  subject: SubjectId
  mode: TaskMode
  title: string
  prompt: string
  cue: string
  answer: string
  options: string[]
  reward: number
  skill: string
  character?: string
  visual?: number
  speak?: string
}

export type SubjectMeta = {
  id: SubjectId
  name: string
  shortName: string
  place: string
  color: string
  accent: string
}

export const subjects: Record<SubjectId, SubjectMeta> = {
  chinese: {
    id: 'chinese',
    name: '语文森林',
    shortName: '语文',
    place: '字宝宝树屋',
    color: '#0f766e',
    accent: '#ccfbf1',
  },
  math: {
    id: 'math',
    name: '数学集市',
    shortName: '数学',
    place: '凑十水果摊',
    color: '#b45309',
    accent: '#fef3c7',
  },
  english: {
    id: 'english',
    name: '英语小镇',
    shortName: '英语',
    place: '声音糖果屋',
    color: '#2563eb',
    accent: '#dbeafe',
  },
}

export const tasks: LearningTask[] = [
  {
    id: 'cn-ri',
    subject: 'chinese',
    mode: 'hanzi',
    title: '太阳醒了',
    prompt: '听读音，点出正确的字',
    cue: 'ri',
    answer: '日',
    options: ['日', '月', '目'],
    reward: 2,
    skill: '识字 + 拼音 + 笔顺',
    character: '日',
  },
  {
    id: 'cn-shan',
    subject: 'chinese',
    mode: 'hanzi',
    title: '小山冒出来',
    prompt: '哪一个字读 shan?',
    cue: 'shan',
    answer: '山',
    options: ['上', '山', '三'],
    reward: 2,
    skill: '形近字辨认',
    character: '山',
  },
  {
    id: 'cn-shui',
    subject: 'chinese',
    mode: 'hanzi',
    title: '水滴回家',
    prompt: '给水滴找到自己的字',
    cue: 'shui',
    answer: '水',
    options: ['火', '木', '水'],
    reward: 2,
    skill: '字形和意义连接',
    character: '水',
  },
  {
    id: 'math-ten',
    subject: 'math',
    mode: 'math',
    title: '果篮凑成十',
    prompt: '篮子里有 6 个草莓，还要几个才是 10?',
    cue: '6 + ? = 10',
    answer: '4',
    options: ['3', '4', '5'],
    reward: 2,
    skill: '凑十法',
    visual: 6,
  },
  {
    id: 'math-compare',
    subject: 'math',
    mode: 'math',
    title: '谁的贝壳多',
    prompt: '8 和 5，哪一个更大?',
    cue: '8 ? 5',
    answer: '8',
    options: ['8', '5', '一样多'],
    reward: 2,
    skill: '比较大小',
    visual: 8,
  },
  {
    id: 'math-add',
    subject: 'math',
    mode: 'math',
    title: '小车装积木',
    prompt: '7 块积木再放 2 块，一共有几块?',
    cue: '7 + 2',
    answer: '9',
    options: ['8', '9', '10'],
    reward: 2,
    skill: '20 以内加法',
    visual: 7,
  },
  {
    id: 'en-apple',
    subject: 'english',
    mode: 'english',
    title: '苹果在这里',
    prompt: '听声音，点 apple',
    cue: 'apple',
    answer: 'apple',
    options: ['apple', 'book', 'cat'],
    reward: 2,
    skill: '听词辨物',
    speak: 'apple',
  },
  {
    id: 'en-red',
    subject: 'english',
    mode: 'english',
    title: '颜色糖果',
    prompt: '点出 red',
    cue: 'red',
    answer: 'red',
    options: ['blue', 'red', 'green'],
    reward: 2,
    skill: '颜色词',
    speak: 'red',
  },
  {
    id: 'en-cat',
    subject: 'english',
    mode: 'english',
    title: '小猫听口令',
    prompt: '听声音，点 cat',
    cue: 'cat',
    answer: 'cat',
    options: ['dog', 'cat', 'bag'],
    reward: 2,
    skill: '动物词',
    speak: 'cat',
  },
]

export function getSubjectTasks(subject: SubjectId) {
  return tasks.filter((task) => task.subject === subject)
}

export function getDailyTasks() {
  return [
    tasks.find((task) => task.id === 'cn-ri'),
    tasks.find((task) => task.id === 'math-ten'),
    tasks.find((task) => task.id === 'en-apple'),
  ].filter((task): task is LearningTask => Boolean(task))
}
