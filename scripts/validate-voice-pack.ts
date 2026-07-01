import { readFile, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { allQuestions } from '../src/curriculum.ts'

type VoiceJob = {
  path: string
  text: string
  voice: string
}

const audioRoot = new URL('../public/audio/', import.meta.url)
const manifest = JSON.parse(
  await readFile(new URL('voice-jobs.json', audioRoot), 'utf8'),
) as {
  voices: { mandarin: string; americanEnglish: string }
  jobs: VoiceJob[]
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

assert(
  manifest.voices.mandarin === 'zh-CN-XiaoxiaoNeural',
  'Mandarin voice must be Xiaoxiao Neural',
)
assert(
  manifest.voices.americanEnglish === 'en-US-AnaNeural',
  'English voice must be US Ana Neural',
)
assert(manifest.jobs.length === 370, `Expected 370 voice clips, received ${manifest.jobs.length}`)
assert(
  new Set(manifest.jobs.map((job) => job.path)).size === manifest.jobs.length,
  'Voice paths must be unique',
)

const expectedQuestionPaths = allQuestions.flatMap((question) =>
  question.subject === 'english'
    ? [
        `questions/${question.id}-en.mp3`,
        `questions/${question.id}-zh.mp3`,
      ]
    : [`questions/${question.id}-zh.mp3`],
)
const actualPaths = new Set(manifest.jobs.map((job) => job.path))
for (const path of expectedQuestionPaths) {
  assert(actualPaths.has(path), `Missing voice job ${path}`)
}

let totalBytes = 0
for (const job of manifest.jobs) {
  assert(job.text.trim().length > 0, `Empty voice text for ${job.path}`)
  const info = await stat(fileURLToPath(new URL(job.path, audioRoot)))
  assert(info.size > 1000, `Voice clip is empty or invalid: ${job.path}`)
  totalBytes += info.size
}

console.log(
  `Voice pack OK: ${manifest.jobs.length} clips, ` +
    `${(totalBytes / 1024 / 1024).toFixed(2)} MiB, Xiaoxiao Mandarin + Ana US English.`,
)
