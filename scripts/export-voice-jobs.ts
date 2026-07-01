import { mkdir, writeFile } from 'node:fs/promises'
import { allQuestions } from '../src/curriculum.ts'

const outputRoot = new URL('../public/audio/', import.meta.url)

type VoiceJob = {
  path: string
  text: string
  voice: 'zh-CN-XiaoxiaoNeural' | 'en-US-AnaNeural'
  rate: string
  pitch: string
}

const jobs: VoiceJob[] = []
for (const question of allQuestions) {
  if (question.subject === 'english') {
    jobs.push({
      path: `questions/${question.id}-en.mp3`,
      text: question.spoken ?? question.prompt,
      voice: 'en-US-AnaNeural',
      rate: '-8%',
      pitch: '+2Hz',
    })
    jobs.push({
      path: `questions/${question.id}-zh.mp3`,
      text: question.translation ?? `请用英语回答：${question.prompt}`,
      voice: 'zh-CN-XiaoxiaoNeural',
      rate: '-6%',
      pitch: '+2Hz',
    })
  } else {
    jobs.push({
      path: `questions/${question.id}-zh.mp3`,
      text: question.prompt,
      voice: 'zh-CN-XiaoxiaoNeural',
      rate: '-6%',
      pitch: '+2Hz',
    })
  }
}

const ui: Record<string, string> = {
  'correct-zh.mp3': '答对了，太棒了！',
  'try-again-zh.mp3': '再想一想，看看发光的提示。',
  'level-clear-zh.mp3': '九颗知识宝石全部找到，新的矿层打开啦！',
  'gem-reward-zh.mp3': '研姐完成了五关挑战，得到一颗晶莹的彩色钻石！',
  'forge-ready-zh.mp3': '五色钻石已经集齐，选择喜欢的造型，亲手敲打锻造吧。',
  'forge-locked-zh.mp3': '每通过五关会得到一颗彩色钻石，集齐五种颜色就能开启锻造。',
  'forge-complete-zh.mp3': '锻造完成！这是研姐亲手制作的水晶作品。',
  'treasure-star-sticker-zh.mp3': '宝箱里是一张星光贴纸，已经放进收藏册。',
  'treasure-forge-spark-zh.mp3': '宝箱里是一枚锻造星火，以后敲打钻石更有力量。',
  'treasure-time-crystal-zh.mp3': '宝箱里是一颗时间水晶，本关增加三十秒。',
}

for (const [path, text] of Object.entries(ui)) {
  jobs.push({
    path: `ui/${path}`,
    text,
    voice: 'zh-CN-XiaoxiaoNeural',
    rate: '-5%',
    pitch: '+2Hz',
  })
}

await mkdir(outputRoot, { recursive: true })
await writeFile(
  new URL('voice-jobs.json', outputRoot),
  JSON.stringify(
    {
      generatedFor: '研姐的水晶矿山',
      voices: {
        mandarin: 'zh-CN-XiaoxiaoNeural',
        americanEnglish: 'en-US-AnaNeural',
      },
      jobs,
    },
    null,
    2,
  ),
  'utf8',
)
console.log(`Voice jobs exported: ${jobs.length}`)
