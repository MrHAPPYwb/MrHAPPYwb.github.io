export type SubjectId = 'chinese' | 'math' | 'english'
export type GemColor = 'ruby' | 'sapphire' | 'emerald' | 'amethyst' | 'citrine'

export type Question = {
  id: string
  subject: SubjectId
  skill: string
  prompt: string
  options: string[]
  answer: string
  explain: string
  cue: string
  spoken?: string
  translation?: string
}

export type Level = {
  id: number
  chapter: number
  chapterName: string
  title: string
  subject: 'mixed'
  skill: string
  questions: Question[]
  target: number
  timeLimit: number
  rewardColor?: GemColor
}

type LevelSeed = {
  title: string
  subject: SubjectId
  skill: string
  questions: Question[]
}

const cn = (
  key: string,
  title: string,
  skill: string,
  questions: Array<Omit<Question, 'id' | 'subject' | 'skill'>>,
): LevelSeed => ({
  title,
  subject: 'chinese',
  skill,
  questions: questions.map((item, index) => ({
    ...item,
    id: `cn-${key}-${index + 1}`,
    subject: 'chinese',
    skill,
  })),
})

const math = (
  key: string,
  title: string,
  skill: string,
  questions: Array<Omit<Question, 'id' | 'subject' | 'skill'>>,
): LevelSeed => ({
  title,
  subject: 'math',
  skill,
  questions: questions.map((item, index) => ({
    ...item,
    id: `math-${key}-${index + 1}`,
    subject: 'math',
    skill,
  })),
})

const en = (
  key: string,
  title: string,
  skill: string,
  questions: Array<Omit<Question, 'id' | 'subject' | 'skill'>>,
): LevelSeed => ({
  title,
  subject: 'english',
  skill,
  questions: questions.map((item, index) => ({
    ...item,
    id: `en-${key}-${index + 1}`,
    subject: 'english',
    skill,
  })),
})

const chineseLevels: LevelSeed[] = [
  cn('vowels', '单韵母水晶', '汉语拼音：a o e i u ü', [
    { prompt: '小嘴张大，读“啊”，是哪一个韵母？', options: ['a', 'o', 'e'], answer: 'a', explain: '嘴巴张大读 a。', cue: '👄' },
    { prompt: '圆圆嘴巴读“喔”，是哪一个韵母？', options: ['o', 'i', 'u'], answer: 'o', explain: '嘴唇拢圆读 o。', cue: '⭕' },
    { prompt: '小鱼吹泡泡“ü”，请选择。', options: ['u', 'ü', 'e'], answer: 'ü', explain: 'ü 的嘴形像吹小泡泡。', cue: '🐟' },
  ]),
  cn('tones', '声调轨道', '汉语拼音：四声', [
    { prompt: '“妈妈”的“妈”读第几声？', options: ['第一声', '第二声', '第三声'], answer: '第一声', explain: 'mā 声音平平高高，是第一声。', cue: '👩' },
    { prompt: '“小马”的“马”读第几声？', options: ['第二声', '第三声', '第四声'], answer: '第三声', explain: 'mǎ 先降再升，是第三声。', cue: '🐴' },
    { prompt: '“大骂”的“骂”读第几声？', options: ['第一声', '第三声', '第四声'], answer: '第四声', explain: 'mà 声音快速下降，是第四声。', cue: '📣' },
  ]),
  cn('bpmf', '声母列车一', '汉语拼音：b p m f', [
    { prompt: '“爸爸”的声母是什么？', options: ['b', 'p', 'm'], answer: 'b', explain: '“爸”读 bà，声母是 b。', cue: '👨' },
    { prompt: '“苹果”的“苹”声母是什么？', options: ['b', 'p', 'f'], answer: 'p', explain: '“苹”读 píng，声母是 p。', cue: '🍎' },
    { prompt: '“妈妈”的声母是什么？', options: ['m', 'f', 'p'], answer: 'm', explain: '“妈”读 mā，声母是 m。', cue: '👩' },
  ]),
  cn('dtnl', '声母列车二', '汉语拼音：d t n l', [
    { prompt: '“大”的声母是什么？', options: ['d', 't', 'n'], answer: 'd', explain: '“大”读 dà，声母是 d。', cue: '🐘' },
    { prompt: '“兔子”的“兔”声母是什么？', options: ['d', 't', 'l'], answer: 't', explain: '“兔”读 tù，声母是 t。', cue: '🐰' },
    { prompt: '“梨”的声母是什么？', options: ['n', 'l', 'd'], answer: 'l', explain: '“梨”读 lí，声母是 l。', cue: '🍐' },
  ]),
  cn('gkh', '声母列车三', '汉语拼音：g k h', [
    { prompt: '“哥哥”的声母是什么？', options: ['g', 'k', 'h'], answer: 'g', explain: '“哥”读 gē，声母是 g。', cue: '👦' },
    { prompt: '“开门”的“开”声母是什么？', options: ['g', 'k', 'h'], answer: 'k', explain: '“开”读 kāi，声母是 k。', cue: '🚪' },
    { prompt: '“花”的声母是什么？', options: ['k', 'h', 'g'], answer: 'h', explain: '“花”读 huā，声母是 h。', cue: '🌸' },
  ]),
  cn('jqx', '声母魔法门', '汉语拼音：j q x 与 ü', [
    { prompt: '“小鸡”的“鸡”声母是什么？', options: ['j', 'q', 'x'], answer: 'j', explain: '“鸡”读 jī，声母是 j。', cue: '🐥' },
    { prompt: '“气球”的“气”声母是什么？', options: ['j', 'q', 'x'], answer: 'q', explain: '“气”读 qì，声母是 q。', cue: '🎈' },
    { prompt: 'j、q、x 遇到 ü，ü 要怎么做？', options: ['去掉两点', '加一横', '变成 o'], answer: '去掉两点', explain: '小 ü 见到 j、q、x，擦掉眼泪笑嘻嘻。', cue: 'ü' },
  ]),
  cn('zcs', '平舌音矿道', '汉语拼音：z c s', [
    { prompt: '“走路”的“走”声母是什么？', options: ['z', 'c', 's'], answer: 'z', explain: '“走”读 zǒu，声母是 z。', cue: '🚶' },
    { prompt: '“草地”的“草”声母是什么？', options: ['z', 'c', 's'], answer: 'c', explain: '“草”读 cǎo，声母是 c。', cue: '🌿' },
    { prompt: '“三”的声母是什么？', options: ['s', 'c', 'z'], answer: 's', explain: '“三”读 sān，声母是 s。', cue: '3️⃣' },
  ]),
  cn('zhchshr', '翘舌音山洞', '汉语拼音：zh ch sh r', [
    { prompt: '“竹子”的“竹”声母是什么？', options: ['z', 'zh', 'ch'], answer: 'zh', explain: '“竹”读 zhú，是翘舌音 zh。', cue: '🎋' },
    { prompt: '“吃饭”的“吃”声母是什么？', options: ['c', 'ch', 'sh'], answer: 'ch', explain: '“吃”读 chī，是翘舌音 ch。', cue: '🥣' },
    { prompt: '“热”的声母是什么？', options: ['r', 'l', 'sh'], answer: 'r', explain: '“热”读 rè，声母是 r。', cue: '♨️' },
  ]),
  cn('yw', '整体认读小船', '汉语拼音：y w 与整体认读', [
    { prompt: 'i 单独成音节时，谁来帮助它？', options: ['y', 'w', 'b'], answer: 'y', explain: 'i 前面加 y，组成 yi。', cue: 'i → yi' },
    { prompt: 'u 单独成音节时，谁来帮助它？', options: ['y', 'w', 'm'], answer: 'w', explain: 'u 前面加 w，组成 wu。', cue: 'u → wu' },
    { prompt: '下面哪个要整体认读？', options: ['yi', 'bā', 'pō'], answer: 'yi', explain: 'yi 是整体认读音节。', cue: '🚤' },
  ]),
  cn('aieiu', '复韵母彩桥一', '汉语拼音：ai ei ui', [
    { prompt: '“白菜”的“白”里有哪个复韵母？', options: ['ai', 'ei', 'ui'], answer: 'ai', explain: 'bái 中的韵母是 ai。', cue: '🥬' },
    { prompt: '“黑色”的“黑”里有哪个复韵母？', options: ['ai', 'ei', 'ui'], answer: 'ei', explain: 'hēi 中的韵母是 ei。', cue: '⚫' },
    { prompt: '“水”的音节 shuǐ 里有哪个复韵母？', options: ['ui', 'iu', 'ei'], answer: 'ui', explain: 'shuǐ 中的韵母是 ui。', cue: '💧' },
  ]),
  cn('aoouiu', '复韵母彩桥二', '汉语拼音：ao ou iu', [
    { prompt: '“小猫”的“猫”里有哪个韵母？', options: ['ao', 'ou', 'iu'], answer: 'ao', explain: 'māo 中的韵母是 ao。', cue: '🐱' },
    { prompt: '“小狗”的“狗”里有哪个韵母？', options: ['ao', 'ou', 'iu'], answer: 'ou', explain: 'gǒu 中的韵母是 ou。', cue: '🐶' },
    { prompt: '“六”的音节 liù 里有哪个韵母？', options: ['iu', 'ui', 'ou'], answer: 'iu', explain: 'liù 中的韵母是 iu。', cue: '6️⃣' },
  ]),
  cn('ieueer', '复韵母彩桥三', '汉语拼音：ie üe er', [
    { prompt: '“叶子”的“叶”里有哪个韵母？', options: ['ie', 'üe', 'er'], answer: 'ie', explain: 'yè 中的韵母是 ie。', cue: '🍃' },
    { prompt: '“月亮”的“月”里有哪个韵母？', options: ['ie', 'üe', 'er'], answer: 'üe', explain: 'yuè 里藏着 üe。', cue: '🌙' },
    { prompt: '“耳朵”的“耳”是什么特殊韵母？', options: ['er', 'ie', 'ei'], answer: 'er', explain: '“耳”读 ěr，韵母是 er。', cue: '👂' },
  ]),
  cn('frontnasal', '前鼻韵母湖', '汉语拼音：an en in un ün', [
    { prompt: '“山”的韵母是什么？', options: ['an', 'ang', 'en'], answer: 'an', explain: 'shān 的韵母是 an。', cue: '⛰️' },
    { prompt: '“森林”的“林”韵母是什么？', options: ['in', 'ing', 'en'], answer: 'in', explain: 'lín 的韵母是 in。', cue: '🌲' },
    { prompt: '“云”的音节 yún 里藏着哪个韵母？', options: ['un', 'ün', 'in'], answer: 'ün', explain: 'yún 由整体认读音节 yun 表示，韵母是 ün。', cue: '☁️' },
  ]),
  cn('backnasal', '后鼻韵母谷', '汉语拼音：ang eng ing ong', [
    { prompt: '“太阳”的“阳”韵母是什么？', options: ['an', 'ang', 'eng'], answer: 'ang', explain: 'yáng 的韵母是 ang。', cue: '☀️' },
    { prompt: '“星星”的“星”韵母是什么？', options: ['in', 'ing', 'ong'], answer: 'ing', explain: 'xīng 的韵母是 ing。', cue: '⭐' },
    { prompt: '“红”的韵母是什么？', options: ['ong', 'eng', 'ang'], answer: 'ong', explain: 'hóng 的韵母是 ong。', cue: '🔴' },
  ]),
  cn('whole', '整体认读城堡', '汉语拼音：整体认读音节', [
    { prompt: '下面哪个是整体认读音节？', options: ['zhi', 'zhā', 'pō'], answer: 'zhi', explain: 'zhi 不拆开拼，要整体认读。', cue: '🏰' },
    { prompt: '下面哪个是整体认读音节？', options: ['yuan', 'guā', 'mā'], answer: 'yuan', explain: 'yuan 是整体认读音节。', cue: '⭕' },
    { prompt: '“云”的整体认读音节是什么？', options: ['yun', 'yün', 'wun'], answer: 'yun', explain: '“云”写作 yún，yun 要整体认读。', cue: '☁️' },
  ]),
  cn('tone-mark', '声调帽子', '汉语拼音：标调规则', [
    { prompt: '“hǎo”的声调帽子戴在哪个字母上？', options: ['a', 'o', 'h'], answer: 'a', explain: '有 a 先找 a，声调标在 a 上。', cue: 'hǎo' },
    { prompt: '“shuǐ”的声调标在哪个字母上？', options: ['u', 'i', 's'], answer: 'i', explain: 'ui 同在，声调标在后面的 i 上。', cue: 'shuǐ' },
    { prompt: '“liù”的声调标在哪个字母上？', options: ['i', 'u', 'l'], answer: 'u', explain: 'iu 同在，声调标在后面的 u 上。', cue: 'liù' },
  ]),
  cn('strokes', '笔画宝石', '识字写字：基本笔画', [
    { prompt: '“一”的笔画名称是什么？', options: ['横', '竖', '撇'], answer: '横', explain: '从左向右写的“一”叫横。', cue: '一' },
    { prompt: '“丨”的笔画名称是什么？', options: ['点', '竖', '捺'], answer: '竖', explain: '从上向下写的“丨”叫竖。', cue: '丨' },
    { prompt: '“丶”的笔画名称是什么？', options: ['点', '横', '提'], answer: '点', explain: '小小的一笔“丶”叫点。', cue: '丶' },
  ]),
  cn('stroke-order', '笔顺机关', '识字写字：笔顺规则', [
    { prompt: '写“十”应该先写什么？', options: ['横', '竖', '点'], answer: '横', explain: '“十”按先横后竖的规则写。', cue: '十' },
    { prompt: '写“八”应该先写什么？', options: ['撇', '捺', '横'], answer: '撇', explain: '“八”先撇后捺。', cue: '八' },
    { prompt: '写“国”时通常先写什么？', options: ['外面', '里面', '最后封口'], answer: '外面', explain: '全包围结构先外后内再封口。', cue: '国' },
  ]),
  cn('radicals', '偏旁侦探', '识字写字：常用偏旁', [
    { prompt: '“河”的偏旁是什么？', options: ['三点水', '木字旁', '提手旁'], answer: '三点水', explain: '“河”与水有关，左边是三点水。', cue: '河 🌊' },
    { prompt: '“树”的偏旁是什么？', options: ['木字旁', '口字旁', '女字旁'], answer: '木字旁', explain: '树木与木有关，偏旁是木字旁。', cue: '树 🌳' },
    { prompt: '“妈”的偏旁是什么？', options: ['女字旁', '人字旁', '日字旁'], answer: '女字旁', explain: '“妈”的左边是女字旁。', cue: '妈 👩' },
  ]),
  cn('pictograph', '象形文字矿脉', '识字：象形与字义', [
    { prompt: '哪个字最像一轮太阳？', options: ['日', '木', '水'], answer: '日', explain: '“日”最早像圆圆的太阳。', cue: '☀️' },
    { prompt: '哪个字最像三座山峰？', options: ['山', '火', '田'], answer: '山', explain: '“山”的三竖像连在一起的山峰。', cue: '⛰️' },
    { prompt: '哪个字像树干、树枝和树根？', options: ['木', '大', '禾'], answer: '木', explain: '“木”保留了树的主要样子。', cue: '🌳' },
  ]),
  cn('structure', '汉字建筑师', '识字写字：字形结构', [
    { prompt: '“明”是什么结构？', options: ['左右结构', '上下结构', '独体字'], answer: '左右结构', explain: '“日”在左、“月”在右，是左右结构。', cue: '日 + 月' },
    { prompt: '“苗”是什么结构？', options: ['上下结构', '左右结构', '全包围'], answer: '上下结构', explain: '草字头在上，“田”在下。', cue: '艹 + 田' },
    { prompt: '“人”是什么结构？', options: ['独体字', '左右结构', '半包围'], answer: '独体字', explain: '“人”不能再分成两个部件，是独体字。', cue: '人' },
  ]),
  cn('form-sound', '形音义拼图', '识字：字形、字音、字义', [
    { prompt: '“清”为什么有三点水？', options: ['与水有关', '与树有关', '与手有关'], answer: '与水有关', explain: '三点水常提示这个字与水有关。', cue: '清 💧' },
    { prompt: '“晴”为什么有日字旁？', options: ['与太阳天气有关', '与吃饭有关', '与走路有关'], answer: '与太阳天气有关', explain: '晴天有太阳，日字旁提示字义。', cue: '晴 ☀️' },
    { prompt: '“请、清、情”右边都有“青”，它常提示什么？', options: ['读音相近', '意思相同', '笔画一样少'], answer: '读音相近', explain: '形声字的一部分常提示读音。', cue: '青' },
  ]),
  cn('words', '组词工坊', '词语：正确组词', [
    { prompt: '“春”可以组成哪个词？', options: ['春天', '春桌', '春笔'], answer: '春天', explain: '“春天”表示一个季节。', cue: '🌱' },
    { prompt: '“学”可以组成哪个词？', options: ['学生', '学花', '学雨'], answer: '学生', explain: '“学生”是在学校学习的人。', cue: '🎒' },
    { prompt: '“快”可以组成哪个词？', options: ['快乐', '快树', '快云'], answer: '快乐', explain: '“快乐”表示开心的感受。', cue: '😊' },
  ]),
  cn('measure-words', '量词花园', '词语：常用量词', [
    { prompt: '一（  ）花', options: ['朵', '只', '本'], answer: '朵', explain: '花常用量词“朵”。', cue: '🌸' },
    { prompt: '一（  ）小鸟', options: ['只', '条', '把'], answer: '只', explain: '小鸟常用量词“只”。', cue: '🐦' },
    { prompt: '一（  ）书', options: ['本', '辆', '颗'], answer: '本', explain: '书常用量词“本”。', cue: '📘' },
  ]),
  cn('opposites', '反义词跷跷板', '词语：反义词', [
    { prompt: '“大”的反义词是什么？', options: ['小', '多', '长'], answer: '小', explain: '大和小意思相反。', cue: '🐘 ↔ 🐭' },
    { prompt: '“上”的反义词是什么？', options: ['下', '左', '前'], answer: '下', explain: '上和下表示相反的位置。', cue: '⬆️ ↔ ?' },
    { prompt: '“多”的反义词是什么？', options: ['少', '大', '远'], answer: '少', explain: '多和少表示相反的数量。', cue: '⭐⭐⭐ ↔ ⭐' },
  ]),
  cn('synonyms', '近义词伙伴', '词语：近义词', [
    { prompt: '“高兴”和哪个词意思相近？', options: ['开心', '伤心', '生气'], answer: '开心', explain: '高兴和开心都表示愉快。', cue: '😊' },
    { prompt: '“美丽”和哪个词意思相近？', options: ['漂亮', '难看', '安静'], answer: '漂亮', explain: '美丽和漂亮意思相近。', cue: '🌈' },
    { prompt: '“马上”和哪个词意思相近？', options: ['立刻', '慢慢', '昨天'], answer: '立刻', explain: '马上和立刻都表示很快去做。', cue: '⚡' },
  ]),
  cn('classify', '词语分类箱', '词语：按类别整理', [
    { prompt: '哪个不是水果？', options: ['苹果', '尺子', '香蕉'], answer: '尺子', explain: '尺子是文具，不是水果。', cue: '🍎 🍌 📏' },
    { prompt: '哪个是表示动作的词？', options: ['跑', '红', '桌子'], answer: '跑', explain: '“跑”表示一个动作。', cue: '🏃' },
    { prompt: '哪个是表示颜色的词？', options: ['绿色', '小鸟', '唱歌'], answer: '绿色', explain: '绿色表示颜色。', cue: '🟢' },
  ]),
  cn('sentence-order', '句子小火车', '句子：连词成句', [
    { prompt: '哪句话顺序正确？', options: ['我去公园玩。', '公园我玩去。', '玩去我公园。'], answer: '我去公园玩。', explain: '先说谁，再说去哪里做什么。', cue: '🚂' },
    { prompt: '哪句话顺序正确？', options: ['小鸟在天上飞。', '天上飞小鸟在。', '飞在小鸟天上。'], answer: '小鸟在天上飞。', explain: '“谁在哪里做什么”让句子更通顺。', cue: '🐦' },
    { prompt: '哪句话顺序正确？', options: ['妈妈给我讲故事。', '故事妈妈我给讲。', '我故事讲给妈妈。'], answer: '妈妈给我讲故事。', explain: '人物和动作的顺序要清楚。', cue: '📖' },
  ]),
  cn('sentence-frame', '谁在哪里做什么', '句子：完整表达', [
    { prompt: '补完整：小鱼在（  ）。', options: ['水里游', '蓝蓝的', '一条'], answer: '水里游', explain: '“小鱼在水里游”说清了在哪里做什么。', cue: '🐟' },
    { prompt: '补完整：小朋友在操场上（  ）。', options: ['跑步', '红色', '一朵'], answer: '跑步', explain: '跑步是小朋友可以做的动作。', cue: '🏃' },
    { prompt: '哪句话说得最完整？', options: ['妹妹在画画。', '妹妹在。', '画画。'], answer: '妹妹在画画。', explain: '完整句子说清了谁在做什么。', cue: '👧🎨' },
  ]),
  cn('punctuation', '标点灯塔', '句子：标点符号', [
    { prompt: '“你今天开心吗”后面用什么？', options: ['？', '。', '！'], answer: '？', explain: '这是一个问题，句末用问号。', cue: '❓' },
    { prompt: '“春天来了”后面通常用什么？', options: ['。', '？', '，'], answer: '。', explain: '一句话说完，通常用句号。', cue: '🌱' },
    { prompt: '“这里真美呀”后面用什么更合适？', options: ['！', '。', '？'], answer: '！', explain: '强烈的赞美和感叹用感叹号。', cue: '🌈' },
  ]),
  cn('complete', '完整句魔法', '句子：补充与仿写', [
    { prompt: '“弯弯的月亮像（  ）。”', options: ['小船', '大树', '雨点'], answer: '小船', explain: '弯弯的月亮和小船形状相像。', cue: '🌙' },
    { prompt: '“雪白雪白的（  ）”搭配什么？', options: ['云朵', '小草', '太阳'], answer: '云朵', explain: '云朵可以是雪白雪白的。', cue: '☁️' },
    { prompt: '“我一边走路，一边（  ）。”', options: ['唱歌', '红色', '书包'], answer: '唱歌', explain: '“一边……一边……”连接同时做的两个动作。', cue: '🚶🎵' },
  ]),
  cn('expression', '表达变形石', '句子：词语运用', [
    { prompt: '“一会儿……一会儿……”适合说什么？', options: ['小猫一会儿跑，一会儿跳。', '苹果一会儿红。', '书包一会儿。'], answer: '小猫一会儿跑，一会儿跳。', explain: '这个句式表示两个动作交替发生。', cue: '🐱' },
    { prompt: '“因为……所以……”哪句正确？', options: ['因为下雨，所以带伞。', '因为书包，所以苹果。', '所以因为去。'], answer: '因为下雨，所以带伞。', explain: '“因为”说原因，“所以”说结果。', cue: '🌧️☂️' },
    { prompt: '“越……越……”哪句正确？', options: ['雨越下越大。', '雨越书包。', '越苹果越。'], answer: '雨越下越大。', explain: '“越……越……”表示程度不断变化。', cue: '🌧️' },
  ]),
  cn('read-info', '阅读寻宝一', '阅读：提取明显信息', [
    { prompt: '短文：春雨沙沙，小草绿了，桃花红了。什么红了？', options: ['桃花', '小草', '春雨'], answer: '桃花', explain: '短文直接说“桃花红了”。', cue: '🌧️🌸' },
    { prompt: '短文：小熊带着蜂蜜去看奶奶。小熊带了什么？', options: ['蜂蜜', '苹果', '鲜花'], answer: '蜂蜜', explain: '从句子里找到“小熊带着蜂蜜”。', cue: '🐻🍯' },
    { prompt: '短文：早上，太阳从东方升起。太阳从哪里升起？', options: ['东方', '西方', '北方'], answer: '东方', explain: '短文明确告诉我们是东方。', cue: '🌅' },
  ]),
  cn('read-reason', '阅读寻宝二', '阅读：理解原因与顺序', [
    { prompt: '小鸟飞回家，因为鸟宝宝在等它。小鸟为什么回家？', options: ['宝宝在等它', '要去游泳', '太阳出来了'], answer: '宝宝在等它', explain: '“因为”后面说出了原因。', cue: '🐦🏠' },
    { prompt: '先洗手，再吃饭。应该先做什么？', options: ['洗手', '吃饭', '睡觉'], answer: '洗手', explain: '“先”后面的事情要先完成。', cue: '🧼🥣' },
    { prompt: '乌云来了，所以小蚂蚁搬家。蚂蚁搬家可能因为什么？', options: ['要下雨', '要下雪', '要过年'], answer: '要下雨', explain: '乌云常提示快要下雨。', cue: '☁️🐜' },
  ]),
  cn('poem', '古诗星河', '积累：古诗与韵文', [
    { prompt: '“床前明月光”写的是什么光？', options: ['月光', '阳光', '灯光'], answer: '月光', explain: '诗句中的“明月光”就是月光。', cue: '🌙' },
    { prompt: '“锄禾日当午”中，农民在做什么？', options: ['锄地', '睡觉', '钓鱼'], answer: '锄地', explain: '“锄禾”写农民在田里劳动。', cue: '🌾' },
    { prompt: '“春眠不觉晓”写的是哪个季节？', options: ['春天', '夏天', '冬天'], answer: '春天', explain: '诗句开头的“春”告诉了我们季节。', cue: '🌸' },
  ]),
  cn('polite', '礼貌表达站', '口语交际：倾听与礼貌表达', [
    { prompt: '同学摔倒了，怎么说最合适？', options: ['你没事吧？我来帮你。', '快走开。', '不关我的事。'], answer: '你没事吧？我来帮你。', explain: '先关心对方，再主动帮助。', cue: '🤝' },
    { prompt: '向别人借铅笔，怎么说？', options: ['请问可以借我一支铅笔吗？', '快给我！', '我就拿走了。'], answer: '请问可以借我一支铅笔吗？', explain: '使用“请问、可以吗”更有礼貌。', cue: '✏️' },
    { prompt: '别人帮助了你，应该说什么？', options: ['谢谢', '没关系', '再见'], answer: '谢谢', explain: '接受帮助后要真诚地说谢谢。', cue: '💗' },
  ]),
  cn('picture-talk', '看图说话站', '表达：观察与有序描述', [
    { prompt: '图中小朋友正在给花浇水。哪句最清楚？', options: ['小朋友在花园里给花浇水。', '花园小朋友。', '水花。'], answer: '小朋友在花园里给花浇水。', explain: '说清了谁、在哪里、做什么。', cue: '🧒🌷' },
    { prompt: '描述下雨天，哪句最完整？', options: ['天空下着雨，大家撑起雨伞。', '雨伞。', '大家天空。'], answer: '天空下着雨，大家撑起雨伞。', explain: '先说天气，再说人物动作。', cue: '🌧️☂️' },
    { prompt: '讲故事时，顺序怎么安排更清楚？', options: ['先、再、最后', '最后、先、再', '随便说'], answer: '先、再、最后', explain: '使用顺序词能让故事更清楚。', cue: '1️⃣2️⃣3️⃣' },
  ]),
  cn('phonetic-word', '形声字实验室', '识字：形声字规律', [
    { prompt: '“河、湖、海”都有什么相同偏旁？', options: ['三点水', '木字旁', '草字头'], answer: '三点水', explain: '这些字都与水有关。', cue: '河 湖 海' },
    { prompt: '“桃、树、林”都有什么相同偏旁？', options: ['木字旁', '日字旁', '言字旁'], answer: '木字旁', explain: '这些字大多与树木有关。', cue: '桃 树 林' },
    { prompt: '猜一猜：“蝴蝶”的虫字旁提示什么？', options: ['与虫类有关', '与水有关', '与说话有关'], answer: '与虫类有关', explain: '偏旁常能帮助猜测字义。', cue: '🦋' },
  ]),
  cn('similar-forms', '形近字辨认', '识字：形近字辨析', [
    { prompt: '太阳从地平线上出来，应该用哪个字？', options: ['日', '目', '白'], answer: '日', explain: '“日”表示太阳或一天。', cue: '☀️' },
    { prompt: '用眼睛看东西，应该选哪个字？', options: ['目', '日', '自'], answer: '目', explain: '“目”最早像一只眼睛。', cue: '👁️' },
    { prompt: '“人”和“入”怎样区分？', options: ['撇捺方向和位置不同', '完全一样', '读音一样'], answer: '撇捺方向和位置不同', explain: '仔细观察笔画相交和开口位置。', cue: '人 / 入' },
  ]),
  cn('lower-literacy', '下册识字花园', '识字：生活主题词语', [
    { prompt: '春天来了，冰雪会怎样？', options: ['融化', '结冰', '变硬'], answer: '融化', explain: '天气变暖，冰雪会慢慢融化。', cue: '🌱' },
    { prompt: '夏天池塘里常见什么？', options: ['荷花', '梅花', '雪花'], answer: '荷花', explain: '荷花常在夏天开放。', cue: '🪷' },
    { prompt: '“保护”最适合和哪个词搭配？', options: ['环境', '蛋糕', '铅笔盒'], answer: '环境', explain: '我们要保护环境。', cue: '🌍' },
  ]),
  cn('dictation', '听音选字', '识字：同音字与听写意识', [
    { prompt: '“禾苗”的“禾”是哪一个？', options: ['禾', '和', '河'], answer: '禾', explain: '禾表示庄稼，禾苗用“禾”。', cue: '🌾' },
    { prompt: '“河水”的“河”是哪一个？', options: ['河', '和', '禾'], answer: '河', explain: '河水与水有关，用三点水的“河”。', cue: '🌊' },
    { prompt: '“我和你”的“和”是哪一个？', options: ['和', '禾', '河'], answer: '和', explain: '连接两个人或事物时用“和”。', cue: '我 + 你' },
  ]),
  cn('review-word', '词句总复习', '语文综合：字词句运用', [
    { prompt: '哪一组都是表示动作的词？', options: ['跑、跳、唱', '红、黄、蓝', '桌、椅、门'], answer: '跑、跳、唱', explain: '跑、跳、唱都表示动作。', cue: '🏃🤸🎤' },
    { prompt: '哪句话既完整又有正确标点？', options: ['小鸟在树上唱歌。', '小鸟树上', '小鸟在树上唱歌？'], answer: '小鸟在树上唱歌。', explain: '句子完整，陈述句末用句号。', cue: '🐦🌳' },
    { prompt: '“一轮明月”中的量词是什么？', options: ['轮', '明', '月'], answer: '轮', explain: '“轮”是月亮常用的量词。', cue: '🌕' },
  ]),
  cn('review-read', '阅读总复习', '语文综合：阅读与表达', [
    { prompt: '短文：研姐先整理书包，再去睡觉。她先做什么？', options: ['整理书包', '睡觉', '吃饭'], answer: '整理书包', explain: '“先”后面是最先完成的事情。', cue: '🎒' },
    { prompt: '看到春天公园的图，先观察什么更好？', options: ['人物和景物', '只看一个角落', '不观察就写'], answer: '人物和景物', explain: '看图表达要先整体观察。', cue: '🌳👧' },
    { prompt: '朗读问句时，语气通常怎样？', options: ['句末稍上扬', '一直很低', '完全不出声'], answer: '句末稍上扬', explain: '问句朗读时要读出疑问语气。', cue: '❓' },
  ]),
  cn('final', '语文皇冠挑战', '语文综合能力', [
    { prompt: '“晴、清、请”读音相近，怎样判断用哪个？', options: ['根据偏旁和句子意思', '随便选', '只看笔画多少'], answer: '根据偏旁和句子意思', explain: '偏旁提示字义，句子帮助确定用字。', cue: '晴 清 请' },
    { prompt: '读完短文后，怎样更容易找到答案？', options: ['回到文中找关键词', '只看题目猜', '跳过短文'], answer: '回到文中找关键词', explain: '从原文找依据，答案更准确。', cue: '🔍📖' },
    { prompt: '把事情讲清楚，最重要的是什么？', options: ['按顺序说清人物和事情', '说得越快越好', '只说最后一句'], answer: '按顺序说清人物和事情', explain: '有顺序、有重点，别人才能听明白。', cue: '👧💬' },
  ]),
]

const mathLevels: LevelSeed[] = [
  math('zero', '空篮子里的 0', '数与数量：0 的认识', [
    { prompt: '盘子里一个苹果也没有，用哪个数表示？', options: ['0', '1', '2'], answer: '0', explain: '一个也没有，可以用 0 表示。', cue: '🍽️' },
    { prompt: '树上原来有 2 只鸟，全飞走了，还剩几只？', options: ['0', '1', '2'], answer: '0', explain: '全部飞走，一只也没有，剩 0 只。', cue: '🌳' },
    { prompt: '0 和 1，哪个数更小？', options: ['0', '1', '一样大'], answer: '0', explain: '0 表示没有，比 1 小。', cue: '0 < 1' },
  ]),
  math('count5', '数到 5 的花园', '数与数量：1—5', [
    { prompt: '一共有几颗草莓？', options: ['3', '4', '5'], answer: '4', explain: '按顺序点数，有 4 颗。', cue: '🍓🍓🍓🍓' },
    { prompt: '数字 5 可以表示哪一组？', options: ['⭐⭐⭐⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐'], answer: '⭐⭐⭐⭐⭐', explain: '5 对应 5 个物体。', cue: '5' },
    { prompt: '3 后面的数是什么？', options: ['2', '4', '5'], answer: '4', explain: '数数时 3 后面是 4。', cue: '1 2 3 ?' },
  ]),
  math('compare5', '鳄鱼比大小', '数与数量：大小比较', [
    { prompt: '4 和 2，哪个数更大？', options: ['4', '2', '一样大'], answer: '4', explain: '4 个比 2 个多，所以 4 更大。', cue: '⭐⭐⭐⭐ / ⭐⭐' },
    { prompt: '3（  ）5，括号里放什么？', options: ['＜', '＞', '＝'], answer: '＜', explain: '3 比 5 小，所以用小于号。', cue: '3 ? 5' },
    { prompt: '2 和 2 中间放什么符号？', options: ['＝', '＞', '＜'], answer: '＝', explain: '两边数量相同，用等号。', cue: '🍎🍎 ? 🍎🍎' },
  ]),
  math('ordinal', '排队第几个', '数与数量：序数', [
    { prompt: '从左数，小兔排第 2。请选择它。', options: ['🐻', '🐰', '🐱'], answer: '🐰', explain: '从左依次是第 1、第 2、第 3。', cue: '🐻 🐰 🐱' },
    { prompt: '队伍有 5 人，第 5 人在哪里？', options: ['最后面', '最前面', '中间'], answer: '最后面', explain: '从前往后数，第 5 人在最后。', cue: '👧👧👧👧👧' },
    { prompt: '第 3 和 3 个意思一样吗？', options: ['不一样', '完全一样', '都表示总数'], answer: '不一样', explain: '“第 3”表示位置，“3 个”表示数量。', cue: '3 / 第3' },
  ]),
  math('compose5', '5 的分合', '数的组成：5 以内', [
    { prompt: '2 和几合起来是 5？', options: ['2', '3', '4'], answer: '3', explain: '2 + 3 = 5。', cue: '2 + ? = 5' },
    { prompt: '5 可以分成 1 和几？', options: ['4', '3', '2'], answer: '4', explain: '5 = 1 + 4。', cue: '5 → 1 + ?' },
    { prompt: '哪两个数能合成 5？', options: ['2 和 3', '1 和 2', '3 和 3'], answer: '2 和 3', explain: '2 和 3 合起来正好是 5。', cue: '🧩' },
  ]),
  math('add5', '5 以内加法', '运算：5 以内加法', [
    { prompt: '2 + 3 = ?', options: ['4', '5', '6'], answer: '5', explain: '2 个和 3 个合起来是 5 个。', cue: '🍎🍎 + 🍎🍎🍎' },
    { prompt: '1 只鸟又飞来 2 只，一共有几只？', options: ['2', '3', '4'], answer: '3', explain: '1 + 2 = 3。', cue: '🐦 + 🐦🐦' },
    { prompt: '哪道算式等于 4？', options: ['2 + 2', '1 + 2', '3 + 2'], answer: '2 + 2', explain: '2 + 2 = 4。', cue: '4' },
  ]),
  math('sub5', '5 以内减法', '运算：5 以内减法', [
    { prompt: '5 - 2 = ?', options: ['2', '3', '4'], answer: '3', explain: '5 个去掉 2 个，还剩 3 个。', cue: '⭐⭐⭐⭐⭐ - ⭐⭐' },
    { prompt: '4 块饼干吃掉 1 块，还剩几块？', options: ['2', '3', '4'], answer: '3', explain: '4 - 1 = 3。', cue: '🍪🍪🍪🍪' },
    { prompt: '哪道算式等于 2？', options: ['5 - 3', '4 - 1', '3 - 0'], answer: '5 - 3', explain: '5 - 3 = 2。', cue: '2' },
  ]),
  math('count10', '数到 10', '数与数量：6—10', [
    { prompt: '6 后面的数是什么？', options: ['5', '7', '8'], answer: '7', explain: '数数时 6 后面是 7。', cue: '5 6 ?' },
    { prompt: '一双手共有几根手指？', options: ['8', '9', '10'], answer: '10', explain: '两只手一共有 10 根手指。', cue: '👐' },
    { prompt: '哪组表示数字 8？', options: ['8 颗星', '6 颗星', '10 颗星'], answer: '8 颗星', explain: '数字 8 对应 8 个物体。', cue: '8️⃣' },
  ]),
  math('compose10', '凑十烟花', '数的组成：10', [
    { prompt: '6 和几合起来是 10？', options: ['3', '4', '5'], answer: '4', explain: '6 + 4 = 10。', cue: '6 + ? = 10' },
    { prompt: '10 可以分成 7 和几？', options: ['2', '3', '4'], answer: '3', explain: '10 = 7 + 3。', cue: '10 → 7 + ?' },
    { prompt: '哪一对是“好朋友数”，能凑成 10？', options: ['8 和 2', '8 和 3', '5 和 4'], answer: '8 和 2', explain: '8 和 2 合起来正好是 10。', cue: '🎆' },
  ]),
  math('add10', '10 以内加法', '运算：10 以内加法', [
    { prompt: '4 + 5 = ?', options: ['8', '9', '10'], answer: '9', explain: '从 4 接着数 5 个，得到 9。', cue: '4 + 5' },
    { prompt: '盒里有 3 支笔，又放进 4 支，一共有几支？', options: ['6', '7', '8'], answer: '7', explain: '3 + 4 = 7。', cue: '✏️' },
    { prompt: '哪道算式等于 10？', options: ['6 + 4', '5 + 4', '7 + 2'], answer: '6 + 4', explain: '6 和 4 是凑十好朋友。', cue: '🔟' },
  ]),
  math('sub10', '10 以内减法', '运算：10 以内减法', [
    { prompt: '9 - 4 = ?', options: ['4', '5', '6'], answer: '5', explain: '从 9 里去掉 4，还剩 5。', cue: '9 - 4' },
    { prompt: '有 8 个气球，飞走 3 个，还剩几个？', options: ['4', '5', '6'], answer: '5', explain: '8 - 3 = 5。', cue: '🎈' },
    { prompt: '哪道算式等于 6？', options: ['10 - 4', '9 - 4', '8 - 3'], answer: '10 - 4', explain: '10 - 4 = 6。', cue: '6' },
  ]),
  math('mixed10', '加减选择器', '运算：加减法含义', [
    { prompt: '两组苹果合起来，应该用什么法？', options: ['加法', '减法', '比较'], answer: '加法', explain: '把两部分合在一起用加法。', cue: '🍎 + 🍎' },
    { prompt: '从 8 个里拿走 2 个，应该用什么法？', options: ['减法', '加法', '排序'], answer: '减法', explain: '从整体中去掉一部分用减法。', cue: '8 - 2' },
    { prompt: '求“还剩多少”通常用什么法？', options: ['减法', '加法', '不计算'], answer: '减法', explain: '“还剩”表示从原来数量中去掉一部分。', cue: '📦' },
  ]),
  math('count20', '11—20 数字矿', '数与数量：11—20', [
    { prompt: '1 个十和 4 个一组成多少？', options: ['14', '41', '10'], answer: '14', explain: '1 个十写在十位，4 个一写在个位。', cue: '🔟 + ••••' },
    { prompt: '18 里面有几个十和几个一？', options: ['1 个十和 8 个一', '8 个十和 1 个一', '18 个十'], answer: '1 个十和 8 个一', explain: '18 的十位是 1，个位是 8。', cue: '18' },
    { prompt: '19 后面的数是什么？', options: ['18', '20', '21'], answer: '20', explain: '19 再添 1 就是 20。', cue: '18 19 ?' },
  ]),
  math('place20', '十位个位塔', '数位：十位与个位', [
    { prompt: '15 的“1”在什么位？', options: ['十位', '个位', '百位'], answer: '十位', explain: '15 的 1 表示 1 个十。', cue: '15' },
    { prompt: '17 的“7”表示什么？', options: ['7 个一', '7 个十', '1 个七'], answer: '7 个一', explain: '个位上的 7 表示 7 个一。', cue: '17' },
    { prompt: '2 个十组成哪个数？', options: ['2', '20', '12'], answer: '20', explain: '2 个十就是 20。', cue: '🔟🔟' },
  ]),
  math('nocarry20', '20 以内不进位', '运算：十加几与相应减法', [
    { prompt: '10 + 6 = ?', options: ['16', '15', '17'], answer: '16', explain: '1 个十和 6 个一组成 16。', cue: '10 + 6' },
    { prompt: '17 - 7 = ?', options: ['9', '10', '11'], answer: '10', explain: '17 去掉 7 个一，还剩 1 个十。', cue: '17 - 7' },
    { prompt: '14 - 10 = ?', options: ['4', '10', '24'], answer: '4', explain: '14 去掉 1 个十，还剩 4 个一。', cue: '14 - 10' },
  ]),
  math('carry20', '凑十进位', '运算：20 以内进位加法', [
    { prompt: '8 + 7 = ?', options: ['14', '15', '16'], answer: '15', explain: '把 7 分成 2 和 5，8 先凑成 10，再加 5。', cue: '8 + 2 + 5' },
    { prompt: '9 + 6 = ?', options: ['14', '15', '16'], answer: '15', explain: '9 加 1 凑成 10，再加 5，得到 15。', cue: '9 + 1 + 5' },
    { prompt: '7 + 5 = ?', options: ['11', '12', '13'], answer: '12', explain: '7 加 3 凑成 10，再加 2，得到 12。', cue: '7 + 3 + 2' },
  ]),
  math('solid', '立体积木洞', '图形：认识立体图形', [
    { prompt: '哪个物体最容易向各方向滚动？', options: ['球', '正方体', '长方体'], answer: '球', explain: '球的表面都是弯曲的，容易滚动。', cue: '⚽ 📦 🧊' },
    { prompt: '魔方最像什么立体图形？', options: ['正方体', '圆柱', '球'], answer: '正方体', explain: '魔方有 6 个大小相同的正方形面。', cue: '🧊' },
    { prompt: '易拉罐最像什么立体图形？', options: ['圆柱', '球', '长方体'], answer: '圆柱', explain: '易拉罐上下是圆形，侧面是弯曲的。', cue: '🥫' },
  ]),
  math('position', '方向藏宝图', '空间：上、下、前、后、左、右', [
    { prompt: '小猫在桌子的什么位置？', options: ['下面', '上面', '右边'], answer: '下面', explain: '小猫的位置比桌子低，在桌子下面。', cue: '🪑\n🐈' },
    { prompt: '你的右手是哪一边？', options: ['右边', '左边', '上面'], answer: '右边', explain: '伸出常用来写字的手，通常是右手。', cue: '👉' },
    { prompt: '排队时，面对前方，你身后的位置叫什么？', options: ['后面', '前面', '左边'], answer: '后面', explain: '背对着的方向是后面。', cue: '🧍' },
  ]),
  math('clock', '整时钟楼', '时间：认识整时', [
    { prompt: '分针指 12，时针指 7，是几时？', options: ['7 时', '12 时', '6 时'], answer: '7 时', explain: '分针指 12、时针指 7，就是 7 时。', cue: '🕖' },
    { prompt: '早上 8 时通常在做什么？', options: ['上学', '睡午觉', '吃晚饭'], answer: '上学', explain: '早上 8 时通常是上学时间。', cue: '🕗🎒' },
    { prompt: '时针走一大格，大约经过多久？', options: ['1 小时', '1 分钟', '1 天'], answer: '1 小时', explain: '时针从一个数字走到下一个数字经过 1 小时。', cue: '🕐→🕑' },
  ]),
  math('classify', '分类整理车', '数据：分类与整理', [
    { prompt: '哪个不应该放进水果篮？', options: ['胡萝卜', '苹果', '梨'], answer: '胡萝卜', explain: '胡萝卜是蔬菜，苹果和梨是水果。', cue: '🍎🥕🍐' },
    { prompt: '整理玩具时，可以按什么分类？', options: ['种类或颜色', '随便堆', '只看大小'], answer: '种类或颜色', explain: '按同一个标准分类，整理结果才清楚。', cue: '🧸🚗⚽' },
    { prompt: '把红积木和蓝积木分开，是按什么分类？', options: ['颜色', '形状', '数量'], answer: '颜色', explain: '红和蓝是不同的颜色。', cue: '🟥🟦' },
  ]),
  math('minus20', '20 以内退位', '运算：20 以内退位减法', [
    { prompt: '13 - 6 = ?', options: ['6', '7', '8'], answer: '7', explain: '先从 13 减 3 到 10，再减 3，得到 7。', cue: '13 - 3 - 3' },
    { prompt: '15 - 8 = ?', options: ['6', '7', '8'], answer: '7', explain: '15 分成 10 和 5，10 - 8 = 2，再加 5 得 7。', cue: '15 - 8' },
    { prompt: '12 - 9 = ?', options: ['2', '3', '4'], answer: '3', explain: '想 9 加几等于 12，9 + 3 = 12。', cue: '9 + ? = 12' },
  ]),
  math('count100', '百数王国', '数与数量：100 以内数', [
    { prompt: '29 后面的数是什么？', options: ['28', '30', '39'], answer: '30', explain: '29 再添 1，个位满十，变成 30。', cue: '28 29 ?' },
    { prompt: '10 个十是多少？', options: ['10', '100', '90'], answer: '100', explain: '10 个十组成 1 个百，就是 100。', cue: '🔟 × 10' },
    { prompt: '70 里面有几个十？', options: ['7 个十', '70 个十', '0 个十'], answer: '7 个十', explain: '70 的十位是 7，表示 7 个十。', cue: '70' },
  ]),
  math('place100', '百以内数位', '数位：100 以内组成', [
    { prompt: '46 里面有几个十和几个一？', options: ['4 个十和 6 个一', '6 个十和 4 个一', '46 个十'], answer: '4 个十和 6 个一', explain: '十位是 4，个位是 6。', cue: '46' },
    { prompt: '8 个十和 3 个一组成多少？', options: ['83', '38', '80'], answer: '83', explain: '8 写在十位，3 写在个位。', cue: '80 + 3' },
    { prompt: '100 的“1”在什么位？', options: ['百位', '十位', '个位'], answer: '百位', explain: '100 由 1 个百组成。', cue: '100' },
  ]),
  math('compare100', '百以内比大小', '数与数量：100 以内比较', [
    { prompt: '48 和 52，哪个更大？', options: ['52', '48', '一样大'], answer: '52', explain: '先比十位，5 个十比 4 个十大。', cue: '48 ? 52' },
    { prompt: '67（  ）65', options: ['＞', '＜', '＝'], answer: '＞', explain: '十位相同，再比个位，7 比 5 大。', cue: '67 ? 65' },
    { prompt: '99 和 100，哪个更小？', options: ['99', '100', '一样大'], answer: '99', explain: '100 比 99 多 1。', cue: '99 / 100' },
  ]),
  math('sequence100', '数字规律路', '数与数量：顺序与估数', [
    { prompt: '20、30、40、（  ）', options: ['50', '41', '60'], answer: '50', explain: '每次增加 10。', cue: '20 30 40 ?' },
    { prompt: '56、57、（  ）、59', options: ['58', '60', '55'], answer: '58', explain: '每次增加 1。', cue: '56 57 ? 59' },
    { prompt: '一盒彩珠大约有 98 颗，最接近哪个整十数？', options: ['100', '90', '80'], answer: '100', explain: '98 离 100 只差 2。', cue: '≈ 98' },
  ]),
  math('money', '人民币兑换所', '量与计量：认识人民币', [
    { prompt: '1 元等于多少角？', options: ['10 角', '5 角', '100 角'], answer: '10 角', explain: '1 元 = 10 角。', cue: '💴' },
    { prompt: '1 角等于多少分？', options: ['10 分', '1 分', '100 分'], answer: '10 分', explain: '1 角 = 10 分。', cue: '🪙' },
    { prompt: '两个 5 角合起来是多少？', options: ['1 元', '5 元', '10 元'], answer: '1 元', explain: '5 角 + 5 角 = 10 角 = 1 元。', cue: '5角 + 5角' },
  ]),
  math('money-calc', '小小收银员', '量与计量：人民币计算', [
    { prompt: '一支笔 3 元，付 5 元，找回多少？', options: ['2 元', '3 元', '8 元'], answer: '2 元', explain: '5 - 3 = 2 元。', cue: '✏️' },
    { prompt: '苹果 4 元，牛奶 5 元，一共多少？', options: ['9 元', '8 元', '10 元'], answer: '9 元', explain: '4 + 5 = 9 元。', cue: '🍎🥛' },
    { prompt: '8 元可以买哪件不超预算的物品？', options: ['7 元的球', '9 元的熊', '12 元的车'], answer: '7 元的球', explain: '7 小于 8，不会超过预算。', cue: '💰8' },
  ]),
  math('add100', '百以内不进位加法', '运算：100 以内加法', [
    { prompt: '30 + 20 = ?', options: ['50', '40', '60'], answer: '50', explain: '3 个十加 2 个十是 5 个十。', cue: '30 + 20' },
    { prompt: '42 + 5 = ?', options: ['47', '52', '46'], answer: '47', explain: '个位 2 + 5 = 7，十位不变。', cue: '42 + 5' },
    { prompt: '23 + 14 = ?', options: ['37', '36', '47'], answer: '37', explain: '个位 3+4=7，十位 2+1=3。', cue: '23 + 14' },
  ]),
  math('sub100', '百以内不退位减法', '运算：100 以内减法', [
    { prompt: '70 - 30 = ?', options: ['40', '30', '50'], answer: '40', explain: '7 个十减 3 个十剩 4 个十。', cue: '70 - 30' },
    { prompt: '48 - 6 = ?', options: ['42', '44', '38'], answer: '42', explain: '个位 8 - 6 = 2，十位不变。', cue: '48 - 6' },
    { prompt: '65 - 23 = ?', options: ['42', '32', '48'], answer: '42', explain: '个位 5-3=2，十位 6-2=4。', cue: '65 - 23' },
  ]),
  math('carry100', '百以内进位加法', '运算：两位数加一位数进位', [
    { prompt: '28 + 5 = ?', options: ['33', '32', '23'], answer: '33', explain: '8+5=13，个位写 3，向十位进 1。', cue: '28 + 5' },
    { prompt: '46 + 7 = ?', options: ['53', '52', '43'], answer: '53', explain: '6+7=13，再加原来的 4 个十，得到 53。', cue: '46 + 7' },
    { prompt: '39 + 4 = ?', options: ['43', '42', '34'], answer: '43', explain: '9+4=13，3 个十再进 1 个十，得到 43。', cue: '39 + 4' },
  ]),
  math('borrow100', '百以内退位减法', '运算：两位数减一位数退位', [
    { prompt: '32 - 5 = ?', options: ['27', '28', '37'], answer: '27', explain: '从 32 里拿出 10，12-5=7，还剩 2 个十。', cue: '32 - 5' },
    { prompt: '51 - 8 = ?', options: ['43', '42', '59'], answer: '43', explain: '11-8=3，剩下 4 个十，得到 43。', cue: '51 - 8' },
    { prompt: '40 - 6 = ?', options: ['34', '36', '46'], answer: '34', explain: '把 1 个十变成 10 个一，10-6=4，剩 3 个十。', cue: '40 - 6' },
  ]),
  math('story-add', '生活加法题', '问题解决：求总数', [
    { prompt: '左边 12 朵花，右边 7 朵，一共多少朵？', options: ['19', '18', '5'], answer: '19', explain: '求两部分一共多少，用 12 + 7 = 19。', cue: '🌸' },
    { prompt: '车上有 20 人，又上来 6 人，现在有多少人？', options: ['26', '14', '25'], answer: '26', explain: '人数增加，用加法 20 + 6。', cue: '🚌' },
    { prompt: '研姐有 8 颗钻石，又得到 5 颗，一共有多少？', options: ['13', '12', '3'], answer: '13', explain: '把原有和新得到的合起来，8 + 5 = 13。', cue: '💎' },
  ]),
  math('story-sub', '生活减法题', '问题解决：求剩余与相差', [
    { prompt: '有 16 个蛋糕，吃掉 7 个，还剩多少？', options: ['9', '8', '23'], answer: '9', explain: '求剩余，用 16 - 7 = 9。', cue: '🧁' },
    { prompt: '红花 15 朵，黄花 9 朵，红花比黄花多几朵？', options: ['6', '24', '5'], answer: '6', explain: '求相差，用较大数减较小数：15 - 9。', cue: '🌹🌼' },
    { prompt: '书架有 30 本书，借走 8 本，还剩多少？', options: ['22', '38', '18'], answer: '22', explain: '借走后数量变少，用 30 - 8。', cue: '📚' },
  ]),
  math('pattern', '数字找规律', '规律：数列变化', [
    { prompt: '2、4、6、（  ）', options: ['8', '7', '10'], answer: '8', explain: '每次增加 2。', cue: '2 4 6 ?' },
    { prompt: '10、9、8、（  ）', options: ['7', '6', '9'], answer: '7', explain: '每次减少 1。', cue: '10 9 8 ?' },
    { prompt: '5、10、15、（  ）', options: ['20', '16', '25'], answer: '20', explain: '每次增加 5。', cue: '5 10 15 ?' },
  ]),
  math('visual-pattern', '图形找规律', '规律：颜色与图形', [
    { prompt: '🔴🟡🔴🟡，下一个是什么？', options: ['🔴', '🟡', '🔵'], answer: '🔴', explain: '红、黄两个一组重复。', cue: '🔴🟡🔴🟡?' },
    { prompt: '▲●●▲●●，下一个是什么？', options: ['▲', '●', '■'], answer: '▲', explain: '一个三角形、两个圆是一组。', cue: '▲●●▲●●?' },
    { prompt: '大小大小，接下来是什么？', options: ['大', '小', '一样'], answer: '大', explain: '大和小交替重复。', cue: '大 小 大 小 ?' },
  ]),
  math('data', '小小统计员', '数据：简单统计', [
    { prompt: '记录：晴☀️☀️☀️，雨🌧️🌧️，哪种天气多？', options: ['晴天', '雨天', '一样多'], answer: '晴天', explain: '晴天有 3 天，雨天有 2 天。', cue: '☀️☀️☀️ / 🌧️🌧️' },
    { prompt: '投票：苹果 4 票，香蕉 6 票，谁更受欢迎？', options: ['香蕉', '苹果', '一样'], answer: '香蕉', explain: '6 票比 4 票多。', cue: '🍎4 / 🍌6' },
    { prompt: '统计前为什么要确定同一个标准？', options: ['结果才可比较', '看起来更乱', '可以少数几个'], answer: '结果才可比较', explain: '使用同一标准，数据才能公平比较。', cue: '📊' },
  ]),
  math('length', '长度测量站', '量与计量：厘米和米', [
    { prompt: '测量铅笔长度，适合用什么单位？', options: ['厘米', '米', '元'], answer: '厘米', explain: '铅笔比较短，适合用厘米。', cue: '✏️📏' },
    { prompt: '测量教室长度，适合用什么单位？', options: ['米', '厘米', '角'], answer: '米', explain: '教室较长，适合用米。', cue: '🏫' },
    { prompt: '1 米等于多少厘米？', options: ['100 厘米', '10 厘米', '1 厘米'], answer: '100 厘米', explain: '1 米 = 100 厘米。', cue: '1m = ?cm' },
  ]),
  math('flat-shape', '平面图形拼图', '图形：平面图形', [
    { prompt: '哪个图形没有角？', options: ['圆', '三角形', '正方形'], answer: '圆', explain: '圆的边是弯曲的，没有角。', cue: '○ △ □' },
    { prompt: '三角形有几个角？', options: ['3 个', '4 个', '0 个'], answer: '3 个', explain: '三角形有 3 条边和 3 个角。', cue: '△' },
    { prompt: '正方形的四条边有什么特点？', options: ['一样长', '只有两条一样长', '都不一样'], answer: '一样长', explain: '正方形四条边一样长。', cue: '□' },
  ]),
  math('mixed', '生活数学综合', '问题解决：选择合适方法', [
    { prompt: '买 6 元和 8 元的物品，一共多少元？', options: ['14 元', '2 元', '48 元'], answer: '14 元', explain: '求总价用加法：6 + 8。', cue: '🛒' },
    { prompt: '现在 9 时，再过 1 小时是几时？', options: ['10 时', '8 时', '11 时'], answer: '10 时', explain: '时针向前走一大格是 10 时。', cue: '🕘→?' },
    { prompt: '一条丝带长 20 厘米，剪掉 5 厘米，还剩多少？', options: ['15 厘米', '25 厘米', '5 厘米'], answer: '15 厘米', explain: '求剩余长度，用 20 - 5。', cue: '🎀📏' },
  ]),
  math('review-number', '数与运算复习', '数学综合：数与运算', [
    { prompt: '58 的十位是几？', options: ['5', '8', '58'], answer: '5', explain: '十位上的 5 表示 5 个十。', cue: '58' },
    { prompt: '27 + 6 = ?', options: ['33', '32', '21'], answer: '33', explain: '7+6=13，向十位进 1。', cue: '27 + 6' },
    { prompt: '50 - 8 = ?', options: ['42', '48', '58'], answer: '42', explain: '从 50 退一个十，10-8=2，得到 42。', cue: '50 - 8' },
  ]),
  math('review-space', '图形时间复习', '数学综合：图形、位置、时间', [
    { prompt: '圆柱上下两个面是什么形状？', options: ['圆', '正方形', '三角形'], answer: '圆', explain: '圆柱上下是两个大小相同的圆。', cue: '🥫' },
    { prompt: '分针指 12，时针指 3，是几时？', options: ['3 时', '12 时', '6 时'], answer: '3 时', explain: '分针指 12 时，看时针指向几。', cue: '🕒' },
    { prompt: '小球在盒子的左边，盒子在小球的哪边？', options: ['右边', '左边', '上面'], answer: '右边', explain: '左右位置是相对的。', cue: '⚽ 📦' },
  ]),
  math('final', '数学皇冠挑战', '数学综合能力', [
    { prompt: '研姐有 35 元，买 8 元的彩笔，还剩多少？', options: ['27 元', '43 元', '23 元'], answer: '27 元', explain: '求剩余，用 35 - 8 = 27。', cue: '💰🖍️' },
    { prompt: '一列数字每次加 5：25、30、35、（  ）', options: ['40', '36', '45'], answer: '40', explain: '35 再加 5 是 40。', cue: '25 30 35 ?' },
    { prompt: '红宝石 12 颗，蓝宝石比它少 4 颗，蓝宝石有几颗？', options: ['8', '16', '4'], answer: '8', explain: '求比 12 少 4 的数，用 12 - 4。', cue: '❤️💎 / 💙💎' },
  ]),
]

const englishLevels: LevelSeed[] = [
  en('hello', 'Hello! 新朋友', '英语：问候与介绍', [
    { prompt: '见到新朋友，应该说什么？', options: ['Hello!', 'Goodbye!', 'Thank you!'], answer: 'Hello!', explain: 'Hello 用来打招呼。', cue: '👋', spoken: 'Hello! Choose Hello.', translation: '见到新朋友，请选择“你好”。' },
    { prompt: '别人问 “What is your name?”，研姐可以怎样回答？', options: ['My name is Yanjie.', 'I am fine.', 'Good night.'], answer: 'My name is Yanjie.', explain: 'My name is... 用来介绍名字。', cue: '💬', spoken: 'What is your name?', translation: '别人正在问“你叫什么名字”。' },
    { prompt: '分别时可以说什么？', options: ['Goodbye!', 'Hello!', 'Good morning!'], answer: 'Goodbye!', explain: 'Goodbye 表示再见。', cue: '👋', spoken: 'Goodbye!', translation: '分别时说“再见”。' },
  ]),
  en('letters', 'ABC 字母矿', '英语：字母名称与顺序', [
    { prompt: 'Which letter comes after A?', options: ['B', 'C', 'D'], answer: 'B', explain: '字母表中 A 后面是 B。', cue: 'A → ?', spoken: 'Which letter comes after A?', translation: 'A 后面的字母是什么？' },
    { prompt: 'Which one is a capital letter?', options: ['M', 'm', 'n'], answer: 'M', explain: 'M 是大写字母。', cue: '🔤', spoken: 'Choose the capital letter M.', translation: '请选择大写字母 M。' },
    { prompt: 'Match the letters.', options: ['A — a', 'A — b', 'A — d'], answer: 'A — a', explain: 'A 的小写形式是 a。', cue: 'Aa', spoken: 'Match capital A with small a.', translation: '把大写 A 和小写 a 配对。' },
  ]),
  en('numbers', 'One to Ten', '英语：数字 1—10', [
    { prompt: 'How many stars? ⭐⭐⭐', options: ['three', 'two', 'four'], answer: 'three', explain: 'three 表示数字 3。', cue: '⭐⭐⭐', spoken: 'How many stars?', translation: '这里有几颗星星？' },
    { prompt: 'Which word means “五”？', options: ['five', 'four', 'six'], answer: 'five', explain: 'five 的意思是五。', cue: '5️⃣', spoken: 'Choose five.', translation: '请选择英文数字“五”。' },
    { prompt: 'What comes after seven?', options: ['eight', 'six', 'nine'], answer: 'eight', explain: 'seven 后面是 eight。', cue: '7 → ?', spoken: 'What comes after seven?', translation: '七后面的英文数字是什么？' },
  ]),
  en('colors', 'Rainbow Colors', '英语：颜色', [
    { prompt: 'What color is the apple?', options: ['red', 'blue', 'green'], answer: 'red', explain: 'red 表示红色。', cue: '🍎', spoken: 'What color is the apple?', translation: '苹果是什么颜色？' },
    { prompt: 'Which word means “蓝色”？', options: ['blue', 'yellow', 'pink'], answer: 'blue', explain: 'blue 的意思是蓝色。', cue: '🔵', spoken: 'Choose blue.', translation: '请选择“蓝色”。' },
    { prompt: 'The grass is ___.', options: ['green', 'red', 'purple'], answer: 'green', explain: 'grass 是小草，常见颜色是 green。', cue: '🌿', spoken: 'The grass is green.', translation: '小草是绿色的。' },
  ]),
  en('classroom', 'My Classroom', '英语：教室与文具', [
    { prompt: 'You can read it. What is it?', options: ['book', 'pen', 'bag'], answer: 'book', explain: 'book 是书，可以阅读。', cue: '📘', spoken: 'You can read it. What is it?', translation: '它可以用来阅读，是什么？' },
    { prompt: 'Which word means “铅笔”？', options: ['pencil', 'ruler', 'desk'], answer: 'pencil', explain: 'pencil 的意思是铅笔。', cue: '✏️', spoken: 'Choose pencil.', translation: '请选择“铅笔”。' },
    { prompt: 'Put the book in the ___.', options: ['bag', 'apple', 'cat'], answer: 'bag', explain: 'bag 是书包，可以放书。', cue: '🎒', spoken: 'Put the book in the bag.', translation: '把书放进书包里。' },
  ]),
  en('family', 'My Family', '英语：家庭成员', [
    { prompt: 'Who is she? 👩', options: ['mother', 'father', 'brother'], answer: 'mother', explain: 'mother 表示妈妈。', cue: '👩', spoken: 'Who is she?', translation: '她是谁？' },
    { prompt: 'Which word means “爸爸”？', options: ['father', 'sister', 'grandma'], answer: 'father', explain: 'father 表示爸爸。', cue: '👨', spoken: 'Choose father.', translation: '请选择“爸爸”。' },
    { prompt: 'This is my ___. 👧', options: ['sister', 'brother', 'grandpa'], answer: 'sister', explain: 'sister 表示姐妹。', cue: '👧', spoken: 'This is my sister.', translation: '这是我的姐妹。' },
  ]),
  en('body', 'My Body', '英语：身体部位', [
    { prompt: 'We see with our ___.', options: ['eyes', 'ears', 'hands'], answer: 'eyes', explain: 'eyes 是眼睛，我们用眼睛看。', cue: '👀', spoken: 'We see with our eyes.', translation: '我们用什么看东西？' },
    { prompt: 'Which word means “手”？', options: ['hand', 'head', 'foot'], answer: 'hand', explain: 'hand 表示手。', cue: '✋', spoken: 'Choose hand.', translation: '请选择“手”。' },
    { prompt: 'Touch your ___. 👃', options: ['nose', 'mouth', 'ear'], answer: 'nose', explain: 'nose 表示鼻子。', cue: '👃', spoken: 'Touch your nose.', translation: '摸摸你的鼻子。' },
  ]),
  en('animals', 'Animal Friends', '英语：常见动物', [
    { prompt: 'It says meow. What is it?', options: ['cat', 'dog', 'bird'], answer: 'cat', explain: 'cat 是猫，会发出 meow 的声音。', cue: '🐱', spoken: 'It says meow. What is it?', translation: '它会喵喵叫，是什么？' },
    { prompt: 'Which animal can fly?', options: ['bird', 'fish', 'rabbit'], answer: 'bird', explain: 'bird 是鸟，有翅膀会飞。', cue: '🐦', spoken: 'Which animal can fly?', translation: '哪种动物会飞？' },
    { prompt: 'A fish can ___.', options: ['swim', 'fly', 'read'], answer: 'swim', explain: 'fish 会在水里 swim。', cue: '🐟', spoken: 'A fish can swim.', translation: '鱼会做什么？' },
  ]),
  en('food', 'Yummy Food', '英语：食物与饮品', [
    { prompt: 'Which word means “牛奶”？', options: ['milk', 'juice', 'cake'], answer: 'milk', explain: 'milk 表示牛奶。', cue: '🥛', spoken: 'Choose milk.', translation: '请选择“牛奶”。' },
    { prompt: 'It is sweet and has candles.', options: ['cake', 'rice', 'egg'], answer: 'cake', explain: '生日时有蜡烛的甜点是 cake。', cue: '🎂', spoken: 'It is sweet and has candles.', translation: '它甜甜的，上面有蜡烛。' },
    { prompt: 'I am thirsty. I want some ___.', options: ['water', 'bread', 'rice'], answer: 'water', explain: '口渴时可以喝 water。', cue: '💧', spoken: 'I am thirsty. I want some water.', translation: '我口渴了，想喝水。' },
  ]),
  en('fruit', 'Fruit Basket', '英语：水果', [
    { prompt: 'It is red and sweet.', options: ['apple', 'banana', 'pear'], answer: 'apple', explain: 'apple 是苹果。', cue: '🍎', spoken: 'It is red and sweet.', translation: '它是红色的，甜甜的。' },
    { prompt: 'Which fruit is yellow and long?', options: ['banana', 'apple', 'grape'], answer: 'banana', explain: 'banana 是黄色、长长的香蕉。', cue: '🍌', spoken: 'Which fruit is yellow and long?', translation: '哪种水果黄色又长长的？' },
    { prompt: 'I like ___. 🍇', options: ['grapes', 'oranges', 'pears'], answer: 'grapes', explain: 'grapes 表示葡萄。', cue: '🍇', spoken: 'I like grapes.', translation: '我喜欢葡萄。' },
  ]),
  en('clothes', 'Dress-up Room', '英语：服装', [
    { prompt: 'You wear it on your head.', options: ['hat', 'shoe', 'dress'], answer: 'hat', explain: 'hat 是戴在头上的帽子。', cue: '👒', spoken: 'You wear it on your head.', translation: '它戴在头上。' },
    { prompt: 'Which word means “连衣裙”？', options: ['dress', 'shirt', 'coat'], answer: 'dress', explain: 'dress 表示连衣裙。', cue: '👗', spoken: 'Choose dress.', translation: '请选择“连衣裙”。' },
    { prompt: 'Put on your ___. 👟', options: ['shoes', 'hat', 'skirt'], answer: 'shoes', explain: 'shoes 是穿在脚上的鞋。', cue: '👟', spoken: 'Put on your shoes.', translation: '穿上你的鞋。' },
  ]),
  en('toys', 'Toy Box', '英语：玩具', [
    { prompt: 'It is round. You can kick it.', options: ['ball', 'doll', 'kite'], answer: 'ball', explain: 'ball 是球，可以踢。', cue: '⚽', spoken: 'It is round. You can kick it.', translation: '它圆圆的，可以踢。' },
    { prompt: 'Which toy can fly in the sky?', options: ['kite', 'car', 'doll'], answer: 'kite', explain: 'kite 是风筝，可以飞上天空。', cue: '🪁', spoken: 'Which toy can fly in the sky?', translation: '哪种玩具可以飞上天空？' },
    { prompt: 'I have a toy ___. 🚗', options: ['car', 'bear', 'boat'], answer: 'car', explain: 'car 表示小汽车。', cue: '🚗', spoken: 'I have a toy car.', translation: '我有一辆玩具汽车。' },
  ]),
  en('home', 'Sweet Home', '英语：家居物品', [
    { prompt: 'You sleep in it.', options: ['bed', 'chair', 'door'], answer: 'bed', explain: 'bed 是床，用来睡觉。', cue: '🛏️', spoken: 'You sleep in it.', translation: '你在它上面睡觉。' },
    { prompt: 'You sit on a ___.', options: ['chair', 'window', 'lamp'], answer: 'chair', explain: 'chair 是椅子，用来坐。', cue: '🪑', spoken: 'You sit on a chair.', translation: '你坐在椅子上。' },
    { prompt: 'Open the ___. 🚪', options: ['door', 'table', 'clock'], answer: 'door', explain: 'door 表示门。', cue: '🚪', spoken: 'Open the door.', translation: '打开门。' },
  ]),
  en('weather', 'Weather Station', '英语：天气', [
    { prompt: 'The sun is shining. It is ___.', options: ['sunny', 'rainy', 'snowy'], answer: 'sunny', explain: '有太阳的天气是 sunny。', cue: '☀️', spoken: 'It is sunny.', translation: '天气晴朗。' },
    { prompt: 'Take an umbrella. It is ___.', options: ['rainy', 'windy', 'hot'], answer: 'rainy', explain: '需要雨伞时常是 rainy。', cue: '🌧️☂️', spoken: 'It is rainy. Take an umbrella.', translation: '下雨了，请带雨伞。' },
    { prompt: 'Snow is falling. It is ___.', options: ['snowy', 'sunny', 'cloudy'], answer: 'snowy', explain: '下雪的天气是 snowy。', cue: '❄️', spoken: 'It is snowy.', translation: '正在下雪。' },
  ]),
  en('transport', 'Let’s Go!', '英语：交通工具', [
    { prompt: 'It is big and takes us to school.', options: ['bus', 'bike', 'boat'], answer: 'bus', explain: 'bus 是公共汽车。', cue: '🚌', spoken: 'It takes us to school.', translation: '它可以带我们去学校。' },
    { prompt: 'Which one runs on rails?', options: ['train', 'car', 'plane'], answer: 'train', explain: 'train 是火车，在轨道上行驶。', cue: '🚆', spoken: 'Which one runs on rails?', translation: '哪一种在轨道上行驶？' },
    { prompt: 'A plane can ___.', options: ['fly', 'swim', 'jump'], answer: 'fly', explain: 'plane 是飞机，可以 fly。', cue: '✈️', spoken: 'A plane can fly.', translation: '飞机会飞。' },
  ]),
  en('actions', 'Action Time', '英语：日常动作', [
    { prompt: 'Which word means “跳”？', options: ['jump', 'run', 'sit'], answer: 'jump', explain: 'jump 表示跳。', cue: '🤸', spoken: 'Choose jump.', translation: '请选择“跳”。' },
    { prompt: 'I use my legs to ___. 🏃', options: ['run', 'read', 'sing'], answer: 'run', explain: 'run 表示跑。', cue: '🏃', spoken: 'I can run.', translation: '我会跑。' },
    { prompt: 'Open the book and ___.', options: ['read', 'sleep', 'swim'], answer: 'read', explain: '打开书以后可以 read。', cue: '📖', spoken: 'Open the book and read.', translation: '打开书并阅读。' },
  ]),
  en('feelings', 'How Do You Feel?', '英语：感受', [
    { prompt: 'You smile when you are ___.', options: ['happy', 'sad', 'tired'], answer: 'happy', explain: 'happy 表示开心的。', cue: '😊', spoken: 'You are happy.', translation: '你很开心。' },
    { prompt: 'Which word means “伤心的”？', options: ['sad', 'happy', 'angry'], answer: 'sad', explain: 'sad 表示伤心的。', cue: '😢', spoken: 'Choose sad.', translation: '请选择“伤心的”。' },
    { prompt: 'I want to sleep. I am ___.', options: ['tired', 'hungry', 'happy'], answer: 'tired', explain: '想睡觉可能是 tired，累了。', cue: '😴', spoken: 'I am tired.', translation: '我累了。' },
  ]),
  en('prepositions', 'Where Is It?', '英语：方位介词', [
    { prompt: 'The cat is ___ the table. 🐱⬇️', options: ['under', 'on', 'in'], answer: 'under', explain: 'under 表示在下面。', cue: '🪑\n🐱', spoken: 'The cat is under the table.', translation: '小猫在桌子下面。' },
    { prompt: 'The book is ___ the desk.', options: ['on', 'under', 'behind'], answer: 'on', explain: 'on 表示在物体表面上。', cue: '📘\n🪑', spoken: 'The book is on the desk.', translation: '书在桌子上。' },
    { prompt: 'The ball is ___ the box. 📦', options: ['in', 'on', 'next'], answer: 'in', explain: 'in 表示在里面。', cue: '📦⚽', spoken: 'The ball is in the box.', translation: '球在盒子里面。' },
  ]),
  en('can-like', 'I Can, I Like', '英语：can 与 like', [
    { prompt: 'I can ___. 🏊', options: ['swim', 'red', 'milk'], answer: 'swim', explain: 'can 后面接动作，swim 表示游泳。', cue: '🏊', spoken: 'I can swim.', translation: '我会游泳。' },
    { prompt: 'I like ___. 🍎', options: ['apples', 'jump', 'blue'], answer: 'apples', explain: 'like 后面可以接喜欢的事物。', cue: '❤️🍎', spoken: 'I like apples.', translation: '我喜欢苹果。' },
    { prompt: 'Can a bird fly?', options: ['Yes, it can.', 'No, it cannot.', 'It is red.'], answer: 'Yes, it can.', explain: '鸟会飞，所以回答 Yes, it can。', cue: '🐦', spoken: 'Can a bird fly?', translation: '鸟会飞吗？' },
  ]),
  en('reading', 'Little English Story', '英语：简单句阅读', [
    { prompt: '“This is a red apple.” 苹果是什么颜色？', options: ['red', 'blue', 'green'], answer: 'red', explain: '句子中的 red 告诉了颜色。', cue: '🍎', spoken: 'This is a red apple.', translation: '这是一个红苹果。' },
    { prompt: '“The dog is under the chair.” 小狗在哪里？', options: ['under the chair', 'on the chair', 'in the bag'], answer: 'under the chair', explain: 'under the chair 表示在椅子下面。', cue: '🐶🪑', spoken: 'The dog is under the chair.', translation: '小狗在椅子下面。' },
    { prompt: '“Amy has two books.” Amy 有几本书？', options: ['two', 'one', 'three'], answer: 'two', explain: '句子中的 two 表示两本。', cue: '👧📘📘', spoken: 'Amy has two books.', translation: '艾米有两本书。' },
  ]),
  en('final', 'English Crown', '英语：综合听读', [
    { prompt: '“I am hungry.” 研姐现在最需要什么？', options: ['food', 'a bed', 'a pencil'], answer: 'food', explain: 'hungry 表示饿了，需要食物。', cue: '😋', spoken: 'I am hungry.', translation: '我饿了。' },
    { prompt: '“Put the blue ball in the box.” 应该选什么？', options: ['把蓝球放进盒子', '把红球放桌上', '把书放进包'], answer: '把蓝球放进盒子', explain: 'blue ball 是蓝球，in the box 是放进盒子。', cue: '🔵⚽📦', spoken: 'Put the blue ball in the box.', translation: '把蓝色的球放进盒子。' },
    { prompt: 'Which sentence is correct?', options: ['I can jump.', 'I jump can.', 'Can I red.'], answer: 'I can jump.', explain: 'I can + 动作，表示“我会做……”。', cue: '🤸', spoken: 'I can jump.', translation: '我会跳。' },
  ]),
]

const chapterNames = [
  '晨光水晶层',
  '彩虹苔原层',
  '泡泡瀑布层',
  '星花萤火层',
  '月光珍珠层',
  '云朵珊瑚层',
  '蜜糖琥珀层',
  '森林翡翠层',
  '海蓝回声层',
  '紫藤幻境层',
  '樱桃晶洞层',
  '极光滑道层',
  '风铃宝库层',
  '金色钟楼层',
  '雨露花房层',
  '银河轨道层',
  '公主冠冕层',
  '动物乐园层',
  '百宝迷宫层',
  '皇冠核心层',
]

const rewardColors: GemColor[] = [
  'ruby',
  'sapphire',
  'emerald',
  'amethyst',
  'citrine',
]

const chineseCourse = chineseLevels.filter(
  (_, index) => ![8, 30, 41, 42].includes(index),
)
const mathCourse = mathLevels.filter((_, index) => ![11, 40].includes(index))
const englishCourse = englishLevels.filter((_, index) => index !== 9)

if (chineseCourse.length !== 40 || mathCourse.length !== 40 || englishCourse.length !== 20) {
  throw new Error('Curriculum pools must contain 40 Chinese, 40 math and 20 English levels.')
}

function questionsForStage(course: LevelSeed[], levelIndex: number) {
  const currentIndex = Math.min(
    course.length - 1,
    Math.floor((levelIndex * course.length) / 100),
  )
  const current = course[currentIndex]
  const reviewIndex =
    currentIndex === 0 ? 0 : (levelIndex * 7 + currentIndex) % currentIndex
  const review = course[reviewIndex]
  const rotation = levelIndex % 3

  return [
    current.questions[rotation],
    current.questions[(rotation + 1) % 3],
    review.questions[(rotation + 2) % 3],
  ]
}

export const levels: Level[] = Array.from({ length: 100 }, (_, levelIndex) => {
  const id = levelIndex + 1
  const chapterIndex = Math.floor(levelIndex / 5)
  const chineseQuestions = questionsForStage(chineseCourse, levelIndex)
  const mathQuestions = questionsForStage(mathCourse, levelIndex)
  const englishQuestions = questionsForStage(englishCourse, levelIndex)

  return {
    id,
    chapter: chapterIndex + 1,
    chapterName: chapterNames[chapterIndex],
    title: `三科晶核 · ${chapterNames[chapterIndex]}`,
    subject: 'mixed',
    skill: '语文 3 · 数学 3 · English 3',
    questions: [...chineseQuestions, ...mathQuestions, ...englishQuestions],
    target: 9,
    timeLimit: id < 11 ? 180 : id < 51 ? 165 : 150,
    rewardColor: rewardColors[id % rewardColors.length],
  }
})

export const allQuestions = [
  ...chineseCourse.flatMap((level) => level.questions),
  ...mathCourse.flatMap((level) => level.questions),
  ...englishCourse.flatMap((level) => level.questions),
]

export const gemMeta: Record<
  GemColor,
  { name: string; hex: number; css: string }
> = {
  ruby: { name: '玫红钻石', hex: 0xff4778, css: '#ff4778' },
  sapphire: { name: '海蓝钻石', hex: 0x35b7ff, css: '#35b7ff' },
  emerald: { name: '翡翠钻石', hex: 0x35d991, css: '#35d991' },
  amethyst: { name: '紫晶钻石', hex: 0xa968ff, css: '#a968ff' },
  citrine: { name: '蜜糖钻石', hex: 0xffcb3d, css: '#ffcb3d' },
}

export function getLevel(id: number) {
  return levels[Math.min(99, Math.max(0, id - 1))]
}

export function questionsForLevel(
  level: Level,
  weakQuestionIds: string[] = [],
) {
  const reviews = weakQuestionIds
    .map((id) => allQuestions.find((question) => question.id === id))
    .filter((question): question is Question => Boolean(question))

  return (['chinese', 'math', 'english'] as SubjectId[]).flatMap((subject) => {
    const subjectQuestions = level.questions.filter(
      (question) => question.subject === subject,
    )
    const review = reviews.find(
      (question) =>
        question.subject === subject &&
        !subjectQuestions.some((item) => item.id === question.id),
    )
    return review
      ? [subjectQuestions[0], subjectQuestions[1], review]
      : subjectQuestions
  })
}
