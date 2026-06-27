import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Coins,
  Home,
  RotateCcw,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  Volume2,
} from 'lucide-react'
import { pinyin } from 'pinyin-pro'
import './App.css'
import {
  getDailyTasks,
  getSubjectTasks,
  type LearningTask,
  type MarketItem,
  type SubjectId,
} from './content'
import { HanziPractice } from './components/HanziPractice'
import {
  createBlankProgress,
  loadProgress,
  recordTaskDone,
  resetProgress,
  type LearnerProgress,
} from './storage'

type SceneId = 'world' | SubjectId
type Celebration = { title: string; detail: string } | null

const sceneBackgrounds: Record<SubjectId, string> = {
  chinese: 'assets/cave-interior-v2.webp',
  math: 'assets/toy-shop-interior-v2.webp',
  english: 'assets/treasure-cavern-v2.webp',
}

const zoneCopy: Record<
  SubjectId,
  { label: string; pinyin: string; marker: string; sceneClass: string }
> = {
  chinese: {
    label: '古字山洞',
    pinyin: 'gǔ zì shān dòng',
    marker: '刻',
    sceneClass: 'cave-gate',
  },
  math: {
    label: '玩具超市',
    pinyin: 'wán jù chāo shì',
    marker: '买',
    sceneClass: 'shop-gate',
  },
  english: {
    label: '单词宝窟',
    pinyin: 'dān cí bǎo kū',
    marker: 'A',
    sceneClass: 'treasure-gate',
  },
}

const englishObjects: Record<
  string,
  { emoji: string; name: string; wrong: [string, string] }
> = {
  apple: { emoji: '🍎', name: 'apple', wrong: ['📘', '🐱'] },
  book: { emoji: '📘', name: 'book', wrong: ['🍎', '🐱'] },
  cat: { emoji: '🐱', name: 'cat', wrong: ['📘', '🍎'] },
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

function playNotes(notes: number[], duration = 0.12) {
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

function speak(text: string, lang = 'zh-CN') {
  if (!('speechSynthesis' in window)) {
    return
  }

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  utterance.rate = lang === 'zh-CN' ? 0.78 : 0.72
  utterance.pitch = 1.08
  window.speechSynthesis.speak(utterance)
}

function PinyinLine({
  text,
  className = '',
  lang = 'zh-CN',
  onSpeak,
}: {
  text: string
  className?: string
  lang?: string
  onSpeak?: () => void
}) {
  const pronunciation =
    lang === 'zh-CN'
      ? pinyin(text, { toneType: 'symbol', nonZh: 'consecutive' })
      : ''

  return (
    <div className={`pinyin-line ${className}`}>
      {pronunciation && <span className="pronunciation">{pronunciation}</span>}
      <span className="line-text">{text}</span>
      {onSpeak && (
        <button
          type="button"
          className="voice-dot"
          aria-label={`朗读：${text}`}
          onClick={onSpeak}
        >
          <Volume2 size={17} />
        </button>
      )}
    </div>
  )
}

function ParentPanel({
  progress,
  onReset,
  onClose,
}: {
  progress: LearnerProgress
  onReset: () => void
  onClose: () => void
}) {
  return (
    <section className="parent-sheet" aria-label="家长面板">
      <div className="sheet-head">
        <div>
          <ShieldCheck size={18} />
          <h2>家长面板</h2>
        </div>
        <button type="button" onClick={onClose}>
          关闭
        </button>
      </div>
      <div className="parent-grid">
        <div>
          <strong>{progress.stars}</strong>
          <span>星光</span>
        </div>
        <div>
          <strong>{progress.streakDays}</strong>
          <span>连续天</span>
        </div>
        <div>
          <strong>{progress.completedTaskIds.length}</strong>
          <span>通关</span>
        </div>
      </div>
      <p>建议每天体验 8-12 分钟。学习记录只保存在这台手机。</p>
      <button type="button" className="reset-button" onClick={onReset}>
        <RotateCcw size={17} />
        <span>重置进度</span>
      </button>
    </section>
  )
}

function SceneHeader({
  title,
  subtitle,
  reward,
  onBack,
}: {
  title: string
  subtitle: string
  reward: number
  onBack: () => void
}) {
  return (
    <header className="scene-hud">
      <button
        type="button"
        className="round-control"
        aria-label="返回任务岛"
        onClick={onBack}
      >
        <ArrowLeft size={22} />
      </button>
      <div className="level-sign">
        <small>{pinyin(`${subtitle} ${title}`)}</small>
        <strong>
          {subtitle} · {title}
        </strong>
      </div>
      <div className="reward-token" aria-label={`奖励 ${reward} 颗星`}>
        <Sparkles size={17} />
        <span>{reward}</span>
      </div>
    </header>
  )
}

function WorldScene({
  progress,
  dailyDone,
  onEnter,
  onParent,
}: {
  progress: LearnerProgress
  dailyDone: number
  onEnter: (subject: SubjectId) => void
  onParent: () => void
}) {
  return (
    <section className="scene world-scene" aria-label="彩虹任务岛">
      <img
        className="scene-art"
        src="assets/rainbow-quest-world.webp"
        alt=""
        aria-hidden="true"
      />
      <div className="world-vignette" />
      <header className="world-hud">
        <div className="player-token">
          <span className="avatar-face">露</span>
          <div>
            <strong>彩虹任务岛</strong>
            <span>cǎi hóng rèn wù dǎo</span>
            <small>
              今日 {dailyDone}/3 · 星光 {progress.stars}
            </small>
          </div>
        </div>
        <button
          type="button"
          className="round-control"
          aria-label="打开家长面板"
          onClick={onParent}
        >
          <Home size={20} />
        </button>
      </header>

      <div className="world-guide">
        <PinyinLine
          text="今天想去哪里冒险？"
          onSpeak={() => speak('今天想去哪里冒险？')}
        />
      </div>

      {(Object.keys(zoneCopy) as SubjectId[]).map((subject) => {
        const zone = zoneCopy[subject]
        return (
          <button
            type="button"
            className={`world-gate ${zone.sceneClass}`}
            key={subject}
            onClick={() => onEnter(subject)}
          >
            <span className="gate-rune">{zone.marker}</span>
            <span className="gate-label">
              <small>{zone.pinyin}</small>
              <strong>{zone.label}</strong>
            </span>
            <ChevronRight size={18} />
          </button>
        )
      })}

      <div className="world-companion" aria-hidden="true">
        <span>小露</span>
      </div>
    </section>
  )
}

function ChineseScene({
  task,
  onBack,
  onWin,
}: {
  task: LearningTask
  onBack: () => void
  onWin: (message: string) => void
}) {
  const glyph = task.glyph
  const stableNarrate = useCallback((text: string) => speak(text), [])
  const stableStroke = useCallback((correct: boolean) => {
    playNotes(correct ? [660] : [190], correct ? 0.08 : 0.12)
  }, [])

  if (!glyph) {
    return null
  }

  return (
    <section className="scene interior-scene cave-scene" aria-label="古字山洞">
      <img
        className="scene-art"
        src={sceneBackgrounds.chinese}
        alt=""
        aria-hidden="true"
      />
      <div className="interior-vignette" />
      <SceneHeader
        title={glyph.character}
        subtitle="第一关 · 造字石台"
        reward={task.reward}
        onBack={onBack}
      />

      <div className="cave-narrator">
        <PinyinLine
          text={glyph.craftLine}
          onSpeak={() => speak(glyph.craftLine)}
        />
      </div>

      <HanziPractice
        character={glyph.character}
        pinyin={glyph.pinyin}
        steps={glyph.steps}
        onNarrate={stableNarrate}
        onStroke={stableStroke}
        onComplete={() =>
          onWin(`你亲手写出了“${glyph.character}”，石门打开了！`)
        }
      />
    </section>
  )
}

function MarketItemButton({
  item,
  selected,
  index,
  onToggle,
}: {
  item: MarketItem
  selected: boolean
  index: number
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      className={`market-object item-${index + 1} ${selected ? 'selected' : ''}`}
      aria-pressed={selected}
      onClick={onToggle}
    >
      <span className="object-emoji">{item.icon}</span>
      <span className="price-tag">
        <small>{pinyin(item.name)}</small>
        <strong>{item.name}</strong>
        <b>{item.price} 元</b>
      </span>
      {selected && <Check className="picked-check" size={20} />}
    </button>
  )
}

function MathScene({
  task,
  onBack,
  onWin,
}: {
  task: LearningTask
  onBack: () => void
  onWin: (message: string) => void
}) {
  const math = task.math!
  const [basket, setBasket] = useState<string[]>([])
  const [stage, setStage] = useState<'shop' | 'checkout'>('shop')
  const [reply, setReply] = useState('')

  useEffect(() => {
    setBasket([])
    setStage('shop')
    setReply('')
    const timer = window.setTimeout(() => speak(math.story), 650)
    return () => window.clearTimeout(timer)
  }, [math, task.id])

  const selectedItems = math.items.filter((item) => basket.includes(item.id))
  const targetItems = math.items.filter((item) =>
    math.targetItemIds.includes(item.id),
  )
  const total = selectedItems.reduce((sum, item) => sum + item.price, 0)
  const targetTotal = targetItems.reduce((sum, item) => sum + item.price, 0)
  const change = math.budget - targetTotal
  const correctBasket =
    basket.length === math.targetItemIds.length &&
    math.targetItemIds.every((id) => basket.includes(id))

  function toggleItem(item: MarketItem) {
    if (stage !== 'shop') {
      return
    }
    playNotes([420 + item.price * 22], 0.09)
    setBasket((items) =>
      items.includes(item.id)
        ? items.filter((id) => id !== item.id)
        : [...items, item.id],
    )
  }

  function goCheckout() {
    if (!correctBasket) {
      const message =
        total > math.budget
          ? '超过预算了，把不在清单里的玩具放回去。'
          : '还没有买齐，请再看看购物清单。'
      setReply(message)
      speak(message)
      playNotes([190], 0.16)
      return
    }

    setStage('checkout')
    setReply(`店员：一共 ${targetTotal} 元。你付 ${math.budget} 元，我要找你几元？`)
    speak(`一共${targetTotal}元。你付${math.budget}元，我要找你几元？`)
  }

  function answerChange(answer: number) {
    if (answer !== change) {
      setReply(`${math.budget} 减 ${targetTotal}，再数一数。`)
      speak(`${math.budget}减${targetTotal}，再数一数。`)
      playNotes([190, 170], 0.12)
      return
    }

    setReply(`答对了！${math.budget} - ${targetTotal} = ${change}。`)
    speak(`答对了，找你${change}元。欢迎下次光临！`)
    playNotes([523, 659, 784], 0.13)
    window.setTimeout(
      () => onWin(`采购完成，还找回了 ${change} 元。`),
      900,
    )
  }

  return (
    <section
      className={`scene interior-scene market-scene stage-${stage}`}
      aria-label="玩具超市"
    >
      <img
        className="scene-art market-art"
        src={sceneBackgrounds.math}
        alt=""
        aria-hidden="true"
      />
      <div className="interior-vignette" />
      <SceneHeader
        title={task.title}
        subtitle="采购任务 · 20 以内加减法"
        reward={task.reward}
        onBack={onBack}
      />

      <div className="shopkeeper-dialogue">
        <span className="npc-portrait" aria-hidden="true">
          👩🏻‍💼
        </span>
        <PinyinLine
          text={
            reply ||
            `店员：欢迎光临！请买${targetItems.map((item) => item.name).join('和')}，你有 ${math.budget} 元。`
          }
          onSpeak={() =>
            speak(
              reply ||
                `欢迎光临！请买${targetItems.map((item) => item.name).join('和')}，你有${math.budget}元。`,
            )
          }
        />
      </div>

      <div className="shopping-list">
        <span>
          <small>qīng dān</small>
          清单
        </span>
        {targetItems.map((item) => (
          <strong key={item.id}>
            {item.icon} {item.name}
          </strong>
        ))}
      </div>

      <div className="market-objects">
        {math.items.map((item, index) => (
          <MarketItemButton
            item={item}
            selected={basket.includes(item.id)}
            index={index}
            key={item.id}
            onToggle={() => toggleItem(item)}
          />
        ))}
      </div>

      {stage === 'shop' ? (
        <div className="basket-console">
          <div className="basket-items" aria-label="购物篮">
            <ShoppingBasket size={27} />
            <div>
              <small>{selectedItems.length ? 'hé jì' : 'kōng'}</small>
              <strong>
                {selectedItems.length
                  ? selectedItems.map((item) => item.price).join(' + ')
                  : '空'}
              </strong>
            </div>
            <span>= {total} 元</span>
          </div>
          <button type="button" className="checkout-button" onClick={goCheckout}>
            <Coins size={20} />
            <span>
              <small>qù jié zhàng</small>
              去结账
            </span>
          </button>
        </div>
      ) : (
        <div className="checkout-counter">
          <div className="equation-strip">
            <span>{math.budget}</span>
            <b>−</b>
            <span>{targetTotal}</span>
            <b>=</b>
            <strong>?</strong>
          </div>
          <div className="coin-answers" aria-label="选择找零">
            {[Math.max(0, change - 1), change, change + 1].map((answer) => (
              <button
                type="button"
                key={answer}
                onClick={() => answerChange(answer)}
              >
                <Coins size={21} />
                <strong>{answer} 元</strong>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function EnglishScene({
  task,
  onBack,
  onWin,
}: {
  task: LearningTask
  onBack: () => void
  onWin: (message: string) => void
}) {
  const english = task.english!
  const [stage, setStage] = useState<'seek' | 'spell'>('seek')
  const [pickedIndexes, setPickedIndexes] = useState<number[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    setStage('seek')
    setPickedIndexes([])
    setMessage(`探险机器人：${english.clue} Can you find it?`)
    const timer = window.setTimeout(
      () => speak(`${english.clue} Can you find it?`, 'en-US'),
      650,
    )
    return () => window.clearTimeout(timer)
  }, [english, task.id])

  const object = englishObjects[english.word] ?? englishObjects.apple
  const candidates = [
    { emoji: object.wrong[0], value: 'wrong-1' },
    { emoji: object.emoji, value: object.name },
    { emoji: object.wrong[1], value: 'wrong-2' },
  ]
  const builtWord = pickedIndexes
    .map((index) => english.letters[index])
    .join('')

  function findObject(value: string) {
    if (value !== object.name) {
      setMessage('探险机器人：Look again. 再看看线索。')
      speak('Look again.', 'en-US')
      playNotes([190], 0.13)
      return
    }

    setStage('spell')
    setMessage(`You found an ${english.word}! 听一听，再拼出它。`)
    speak(`You found an ${english.word}! ${english.sound}.`, 'en-US')
    playNotes([523, 659], 0.12)
  }

  function pickLetter(letter: string, index: number) {
    if (pickedIndexes.includes(index)) {
      return
    }

    const expected = english.word[builtWord.length]
    if (letter !== expected) {
      setMessage(`探险机器人：Listen again. ${english.sound}.`)
      speak(english.sound, 'en-US')
      playNotes([190], 0.12)
      return
    }

    const nextIndexes = [...pickedIndexes, index]
    const nextWord = nextIndexes
      .map((pickedIndex) => english.letters[pickedIndex])
      .join('')
    setPickedIndexes(nextIndexes)
    playNotes([520 + nextIndexes.length * 60], 0.1)

    if (nextWord === english.word) {
      setMessage(`探险机器人：${english.sentence} 宝箱打开了！`)
      speak(english.sentence, 'en-US')
      playNotes([523, 659, 784, 1047], 0.13)
      window.setTimeout(() => onWin(`你找到了${english.treasure}。`), 1100)
    } else {
      setMessage(`探险机器人：Great! 下一颗宝石在哪里？`)
    }
  }

  return (
    <section
      className={`scene interior-scene treasure-scene stage-${stage}`}
      aria-label="单词宝窟"
    >
      <img
        className="scene-art"
        src={sceneBackgrounds.english}
        alt=""
        aria-hidden="true"
      />
      <div className="interior-vignette" />
      <SceneHeader
        title={task.title}
        subtitle="探险任务 · 找实物拼单词"
        reward={task.reward}
        onBack={onBack}
      />

      <div className="robot-dialogue">
        <span className="npc-portrait robot" aria-hidden="true">
          🤖
        </span>
        <div>
          <PinyinLine text={message} />
          <button
            type="button"
            className="listen-button"
            onClick={() =>
              speak(
                stage === 'seek' ? english.clue : english.sound,
                'en-US',
              )
            }
          >
            <Volume2 size={18} />
            <span>Listen</span>
          </button>
        </div>
      </div>

      {stage === 'seek' ? (
        <div className="object-hunt" aria-label="寻找线索中的实物">
          {candidates.map((candidate, index) => (
            <button
              type="button"
              className={`clue-object clue-${index + 1}`}
              key={candidate.value}
              onClick={() => findObject(candidate.value)}
            >
              <span>{candidate.emoji}</span>
              <Sparkles size={18} />
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="word-lock" aria-label="单词锁">
            {english.word.split('').map((letter, index) => (
              <span key={`${letter}-${index}`}>
                {builtWord[index]?.toUpperCase() ?? ''}
              </span>
            ))}
          </div>
          <div className="letter-pedestals" aria-label="字母宝石">
            {english.letters.map((letter, index) => (
              <button
                type="button"
                className={`letter-gem gem-${index + 1} ${
                  pickedIndexes.includes(index) ? 'used' : ''
                }`}
                key={`${letter}-${index}`}
                onClick={() => pickLetter(letter, index)}
              >
                <span>{letter}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  )
}

function CelebrationOverlay({
  celebration,
}: {
  celebration: NonNullable<Celebration>
}) {
  return (
    <div className="celebration" role="status" aria-live="assertive">
      <div className="confetti" aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => (
          <i key={index} />
        ))}
      </div>
      <div className="victory-badge">
        <Sparkles size={48} />
        <PinyinLine text={celebration.title} />
        <PinyinLine text={celebration.detail} />
        <span className="next-level">下一关正在打开…</span>
      </div>
    </div>
  )
}

function App() {
  const [progress, setProgress] = useState<LearnerProgress>(createBlankProgress)
  const [scene, setScene] = useState<SceneId>('world')
  const [activeSubject, setActiveSubject] = useState<SubjectId>('chinese')
  const [taskIndexes, setTaskIndexes] = useState<Record<SubjectId, number>>({
    chinese: 0,
    math: 0,
    english: 0,
  })
  const [transitioning, setTransitioning] = useState(false)
  const [celebration, setCelebration] = useState<Celebration>(null)
  const [parentOpen, setParentOpen] = useState(false)
  const transitionTimer = useRef<number | null>(null)
  const subjectTasks = useMemo(
    () => getSubjectTasks(activeSubject),
    [activeSubject],
  )
  const taskIndex = taskIndexes[activeSubject] % subjectTasks.length
  const task = subjectTasks[taskIndex]
  const dailyDone = getDailyTasks().filter((dailyTask) =>
    progress.completedTaskIds.includes(dailyTask.id),
  ).length

  useEffect(() => {
    let mounted = true
    void loadProgress().then((loadedProgress) => {
      if (mounted) {
        setProgress(loadedProgress)
      }
    })
    return () => {
      mounted = false
      if (transitionTimer.current !== null) {
        window.clearTimeout(transitionTimer.current)
      }
    }
  }, [])

  function changeScene(nextScene: SceneId) {
    if (transitioning) {
      return
    }
    setTransitioning(true)
    playNotes([330, 440, 660], 0.09)
    transitionTimer.current = window.setTimeout(() => {
      if (nextScene !== 'world') {
        setActiveSubject(nextScene)
      }
      setScene(nextScene)
      setTransitioning(false)
      window.scrollTo(0, 0)
    }, 520)
  }

  async function completeQuest(message: string) {
    if (!progress.completedTaskIds.includes(task.id)) {
      const nextProgress = await recordTaskDone(
        progress,
        task.id,
        task.subject,
        task.reward,
      )
      setProgress(nextProgress)
    }

    setCelebration({ title: '闯关成功！', detail: message })
    playNotes([523, 659, 784, 1047], 0.16)
    window.setTimeout(() => {
      setTaskIndexes((current) => ({
        ...current,
        [activeSubject]: current[activeSubject] + 1,
      }))
      setCelebration(null)
    }, 2800)
  }

  async function handleReset() {
    const blank = await resetProgress()
    setProgress(blank)
    setTaskIndexes({ chinese: 0, math: 0, english: 0 })
    setParentOpen(false)
  }

  return (
    <main className={`game-shell scene-${scene}`}>
      {scene === 'world' && (
        <WorldScene
          progress={progress}
          dailyDone={dailyDone}
          onEnter={changeScene}
          onParent={() => setParentOpen(true)}
        />
      )}
      {scene === 'chinese' && (
        <ChineseScene
          key={task.id}
          task={task}
          onBack={() => changeScene('world')}
          onWin={(message) => void completeQuest(message)}
        />
      )}
      {scene === 'math' && (
        <MathScene
          key={task.id}
          task={task}
          onBack={() => changeScene('world')}
          onWin={(message) => void completeQuest(message)}
        />
      )}
      {scene === 'english' && (
        <EnglishScene
          key={task.id}
          task={task}
          onBack={() => changeScene('world')}
          onWin={(message) => void completeQuest(message)}
        />
      )}

      <div className={`portal-transition ${transitioning ? 'active' : ''}`}>
        <span />
      </div>

      {celebration && <CelebrationOverlay celebration={celebration} />}
      {parentOpen && (
        <ParentPanel
          progress={progress}
          onReset={() => void handleReset()}
          onClose={() => setParentOpen(false)}
        />
      )}
    </main>
  )
}

export default App
