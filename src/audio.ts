import type { Question } from './curriculum'

type UiVoice =
  | 'correct'
  | 'try-again'
  | 'level-clear'
  | 'gem-reward'
  | 'forge-ready'
  | 'forge-locked'
  | 'forge-complete'
  | 'treasure-star-sticker'
  | 'treasure-forge-spark'
  | 'treasure-time-crystal'

const audioBase = `${import.meta.env.BASE_URL}audio`
const bufferCache = new Map<string, Promise<AudioBuffer>>()
let audioContext: AudioContext | null = null
let activeSource: AudioBufferSourceNode | null = null

function getAudioContext() {
  if (audioContext) return audioContext
  const Context =
    window.AudioContext ??
    (
      window as typeof window & {
        webkitAudioContext?: typeof AudioContext
      }
    ).webkitAudioContext
  audioContext = Context ? new Context() : null
  return audioContext
}

async function loadBuffer(path: string) {
  const context = getAudioContext()
  if (!context) throw new Error('Web Audio is unavailable')
  const existing = bufferCache.get(path)
  if (existing) return existing
  const loading = fetch(path)
    .then((response) => {
      if (!response.ok) throw new Error(`Voice file ${response.status}`)
      return response.arrayBuffer()
    })
    .then((data) => context.decodeAudioData(data))
  bufferCache.set(path, loading)
  return loading
}

async function playVoice(path: string, cancelCurrent = true) {
  const context = getAudioContext()
  if (!context) return
  await context.resume()
  if (cancelCurrent) {
    activeSource?.stop()
    activeSource = null
  }
  try {
    const buffer = await loadBuffer(path)
    await new Promise<void>((resolve) => {
      const source = context.createBufferSource()
      source.buffer = buffer
      source.connect(context.destination)
      source.onended = () => {
        if (activeSource === source) activeSource = null
        resolve()
      }
      activeSource = source
      source.start()
    })
  } catch {
    // A missing optional clip should never block game play.
  }
}

export function prepareAudio() {
  const unlock = () => {
    void getAudioContext()?.resume()
  }
  window.addEventListener('pointerdown', unlock, { once: true })
  void loadBuffer(`${audioBase}/ui/correct-zh.mp3`).catch(() => undefined)
}

export async function speakQuestion(question: Question) {
  activeSource?.stop()
  activeSource = null
  if (question.subject === 'english') {
    await playVoice(`${audioBase}/questions/${question.id}-en.mp3`)
    await new Promise((resolve) => window.setTimeout(resolve, 160))
    await playVoice(`${audioBase}/questions/${question.id}-zh.mp3`, false)
    return
  }
  await playVoice(`${audioBase}/questions/${question.id}-zh.mp3`)
}

export async function speakFeedback(correct: boolean) {
  await playVoice(
    `${audioBase}/ui/${correct ? 'correct' : 'try-again'}-zh.mp3`,
  )
}

export async function speakUi(key: UiVoice) {
  await playVoice(`${audioBase}/ui/${key}-zh.mp3`)
}

let sharedEffectsContext: AudioContext | null = null

function getEffectsContext() {
  if (sharedEffectsContext) return sharedEffectsContext
  sharedEffectsContext = getAudioContext()
  return sharedEffectsContext
}

export function playNotes(notes: number[], duration = 0.12) {
  const context = getEffectsContext()
  if (!context) return
  void context.resume()
  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const start = context.currentTime + index * duration * 0.78
    oscillator.type = 'sine'
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.16, start + 0.018)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    oscillator.connect(gain).connect(context.destination)
    oscillator.start(start)
    oscillator.stop(start + duration + 0.02)
  })
}
