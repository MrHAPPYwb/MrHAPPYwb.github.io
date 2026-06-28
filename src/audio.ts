type VoiceLanguage = 'zh-CN' | 'en-US'

const preferredVoiceNames: Record<VoiceLanguage, string[]> = {
  'zh-CN': [
    'Tingting',
    'Yu-shu',
    'Meijia',
    'Xiaoxiao',
    'Xiaoyi',
    'Microsoft Xiaoxiao',
    'Google 普通话（中国大陆）',
  ],
  'en-US': [
    'Samantha',
    'Ava',
    'Allison',
    'Susan',
    'Zira',
    'Microsoft Aria',
    'Google US English',
  ],
}

let cachedVoices: SpeechSynthesisVoice[] = []

function synth() {
  return 'speechSynthesis' in window ? window.speechSynthesis : null
}

export function prepareVoices() {
  const engine = synth()
  if (!engine) {
    return
  }
  const refresh = () => {
    cachedVoices = engine.getVoices()
  }
  refresh()
  engine.addEventListener?.('voiceschanged', refresh, { once: true })
}

function chooseVoice(lang: VoiceLanguage) {
  const voices = cachedVoices.length ? cachedVoices : synth()?.getVoices() ?? []
  const preferred = preferredVoiceNames[lang]
  return (
    preferred
      .map((name) =>
        voices.find((voice) =>
          voice.name.toLowerCase().includes(name.toLowerCase()),
        ),
      )
      .find(Boolean) ??
    voices.find((voice) => voice.lang.toLowerCase() === lang.toLowerCase()) ??
    voices.find((voice) =>
      voice.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()),
    )
  )
}

function utter(text: string, lang: VoiceLanguage) {
  return new Promise<void>((resolve) => {
    const engine = synth()
    if (!engine || !text.trim()) {
      resolve()
      return
    }

    const speech = new SpeechSynthesisUtterance(text)
    speech.lang = lang
    speech.voice = chooseVoice(lang) ?? null
    speech.rate = lang === 'zh-CN' ? 0.86 : 0.8
    speech.pitch = lang === 'zh-CN' ? 1.12 : 1.03
    speech.volume = 1
    speech.onend = () => resolve()
    speech.onerror = () => resolve()
    engine.speak(speech)
  })
}

export async function speak(
  text: string,
  lang: VoiceLanguage = 'zh-CN',
  cancelCurrent = true,
) {
  const engine = synth()
  if (cancelCurrent) {
    engine?.cancel()
  }
  await utter(text, lang)
}

export async function speakEnglishThenChinese(
  english: string,
  chinese: string,
) {
  const engine = synth()
  engine?.cancel()
  await utter(english, 'en-US')
  await new Promise((resolve) => window.setTimeout(resolve, 180))
  await utter(chinese, 'zh-CN')
}

let sharedAudioContext: AudioContext | null = null

function getAudioContext() {
  if (sharedAudioContext) {
    return sharedAudioContext
  }
  const AudioContextClass =
    window.AudioContext ??
    (
      window as typeof window & {
        webkitAudioContext?: typeof AudioContext
      }
    ).webkitAudioContext
  sharedAudioContext = AudioContextClass ? new AudioContextClass() : null
  return sharedAudioContext
}

export function playNotes(notes: number[], duration = 0.12) {
  const context = getAudioContext()
  if (!context) {
    return
  }
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
