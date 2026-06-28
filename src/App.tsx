import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
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
import { playNotes, prepareVoices, speak, speakEnglishThenChinese } from './audio'
import {
  getDailyTasks,
  getSubjectTasks,
  subjects,
  type LearningTask,
  type MarketItem,
  type MarketTask,
  type SubjectId,
} from './content'
import { ChoiceQuest } from './components/ChoiceQuest'
import { GemWorkshopScene } from './components/GemWorkshopScene'
import { NpcDialogue, PinyinLine, SceneHeader } from './components/GameUI'
import { PaintingScene } from './components/PaintingScene'
import {
  createBlankProgress,
  loadProgress,
  recordGem,
  recordPainting,
  recordTaskDone,
  resetProgress,
  type LearnerProgress,
} from './storage'

type SpecialScene = 'art' | 'gem'
type SceneId = 'world' | SubjectId | SpecialScene
type Celebration = { title: string; detail: string } | null
type ZoneId = SubjectId | SpecialScene

const HanziPractice = lazy(() =>
  import('./components/HanziPractice').then((module) => ({
    default: module.HanziPractice,
  })),
)

const sceneBackgrounds: Record<SubjectId, string> = {
  chinese: 'assets/cave-interior-v2.webp',
  math: 'assets/toy-shop-interior-v2.webp',
  english: 'assets/treasure-cavern-v2.webp',
}

const zoneCopy: Record<
  ZoneId,
  { label: string; marker: string; sceneClass: string; pinyin?: string }
> = {
  chinese: {
    label: '造字山洞',
    pinyin: 'zào zì shān dòng',
    marker: '文',
    sceneClass: 'cave-gate',
  },
  math: {
    label: '生活数学城',
    pinyin: 'shēng huó shù xué chéng',
    marker: '数',
    sceneClass: 'shop-gate',
  },
  english: {
    label: '英语宝藏洞',
    marker: 'ABC',
    sceneClass: 'treasure-gate',
  },
  art: {
    label: '绘画花园',
    pinyin: 'huì huà huā yuán',
    marker: '🎨',
    sceneClass: 'art-gate',
  },
  gem: {
    label: '宝石工坊',
    pinyin: 'bǎo shí gōng fāng',
    marker: '💎',
    sceneClass: 'gem-gate',
  },
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
          <h2>研姐的学习记录</h2>
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
          <strong>{progress.craftedGems.length}</strong>
          <span>亲制宝石</span>
        </div>
        <div>
          <strong>{progress.paintingsSaved}</strong>
          <span>绘画作品</span>
        </div>
      </div>
      <div className="coverage-list">
        {(Object.keys(subjects) as SubjectId[]).map((subject) => {
          const tasks = getSubjectTasks(subject)
          const done = tasks.filter((task) =>
            progress.completedTaskIds.includes(task.id),
          ).length
          return (
            <div key={subject}>
              <span>{subjects[subject].shortName}</span>
              <b>{done}/{tasks.length}</b>
              <i>
                <span style={{ width: `${(done / tasks.length) * 100}%` }} />
              </i>
            </div>
          )
        })}
      </div>
      <p>课程覆盖一年级语文、数学核心知识，以及一二年级英语主题。建议每天体验 10—15 分钟。</p>
      <button type="button" className="reset-button" onClick={onReset}>
        <RotateCcw size={17} />
        <span>重置全部进度</span>
      </button>
    </section>
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
  onEnter: (zone: ZoneId) => void
  onParent: () => void
}) {
  return (
    <section className="scene world-scene" aria-label="研姐的彩虹任务岛">
      <img
        className="scene-art"
        src="assets/yanjie-island-v3.webp"
        alt=""
        aria-hidden="true"
      />
      <div className="world-vignette" />
      <header className="world-hud">
        <div className="player-token">
          <span className="avatar-face">研</span>
          <div>
            <strong>研姐的任务岛</strong>
            <span>yán jiě de rèn wù dǎo</span>
            <small>
              今日 {dailyDone}/3 · 星光 {progress.stars} · 宝石粉 {progress.crystalDust}
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
          text="研姐，今天想亲手完成哪场冒险？"
          onSpeak={() => void speak('研姐，今天想亲手完成哪场冒险？')}
        />
      </div>

      {(Object.keys(zoneCopy) as ZoneId[]).map((zoneId) => {
        const zone = zoneCopy[zoneId]
        const isSubject = zoneId === 'chinese' || zoneId === 'math' || zoneId === 'english'
        const subjectTasks = isSubject ? getSubjectTasks(zoneId) : []
        const completed = subjectTasks.filter((task) =>
          progress.completedTaskIds.includes(task.id),
        ).length
        const progressText =
          zoneId === 'art'
            ? `${progress.paintingsSaved} 幅`
            : zoneId === 'gem'
              ? `${progress.craftedGems.length}/3 配方`
              : `${completed}/${subjectTasks.length} 关`
        return (
          <button
            type="button"
            className={`world-gate ${zone.sceneClass}`}
            key={zoneId}
            onClick={() => onEnter(zoneId)}
          >
            <span className="gate-rune">{zone.marker}</span>
            <span className="gate-label">
              <small>{zone.pinyin ?? 'English treasure cave'}</small>
              <strong>{zone.label}</strong>
              <em>{progressText}</em>
            </span>
            <ChevronRight size={18} />
          </button>
        )
      })}
    </section>
  )
}

function ChineseScene({
  task,
  level,
  total,
  onBack,
  onWin,
}: {
  task: LearningTask
  level: number
  total: number
  onBack: () => void
  onWin: (message: string) => void
}) {
  const glyph = task.glyph
  const stableNarrate = useCallback((text: string) => {
    void speak(text)
  }, [])
  const stableStroke = useCallback((correct: boolean) => {
    playNotes(correct ? [660] : [190], correct ? 0.08 : 0.12)
  }, [])

  return (
    <section className="scene interior-scene cave-scene" aria-label="造字山洞">
      <img className="scene-art" src={sceneBackgrounds.chinese} alt="" />
      <div className="interior-vignette" />
      <SceneHeader
        title={task.title}
        subtitle={task.unit}
        level={level}
        total={total}
        reward={task.reward}
        onBack={onBack}
      />
      {glyph ? (
        <>
          <div className="cave-narrator">
            <PinyinLine
              text={glyph.craftLine}
              onSpeak={() => void speak(glyph.craftLine)}
            />
          </div>
          <Suspense fallback={<div className="scene-loading">正在点亮造字石台……</div>}>
            <HanziPractice
              character={glyph.character}
              pinyin={glyph.pinyin}
              steps={glyph.steps}
              onNarrate={stableNarrate}
              onStroke={stableStroke}
              onComplete={() =>
                onWin(`研姐亲手写出了“${glyph.character}”，石门打开了！`)
              }
            />
          </Suspense>
        </>
      ) : (
        task.challenge && (
          <ChoiceQuest
            challenge={task.challenge}
            npcName="甜甜老师"
            portrait="👩🏻‍🏫"
            onComplete={onWin}
          />
        )
      )}
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

function MarketQuest({
  math,
  onWin,
}: {
  math: MarketTask
  onWin: (message: string) => void
}) {
  const [basket, setBasket] = useState<string[]>([])
  const [stage, setStage] = useState<'shop' | 'checkout'>('shop')
  const [reply, setReply] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => void speak(math.story), 600)
    return () => window.clearTimeout(timer)
  }, [math])

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

  function goCheckout() {
    if (!correctBasket) {
      const text =
        total > math.budget
          ? '超过预算了，把清单以外的物品放回货架。'
          : '还没有买齐，请再看看购物清单。'
      setReply(text)
      void speak(text)
      playNotes([190], 0.14)
      return
    }
    setStage('checkout')
    const text = `一共${targetTotal}元。研姐付${math.budget}元，应该找回几元？`
    setReply(text)
    void speak(text)
  }

  function answerChange(answer: number) {
    if (answer !== change) {
      const text = `${math.budget}减${targetTotal}，再数一数。`
      setReply(text)
      void speak(text)
      playNotes([190, 170], 0.12)
      return
    }
    setReply(`答对了！${math.budget} - ${targetTotal} = ${change}。`)
    void speak(`答对了，找回${change}元。`)
    playNotes([523, 659, 784], 0.13)
    window.setTimeout(() => onWin(`采购完成，还找回了 ${change} 元。`), 900)
  }

  return (
    <>
      <NpcDialogue
        portrait="👩🏻‍💼"
        text={
          reply ||
          `店员姐姐：欢迎研姐！请买${targetItems.map((item) => item.name).join('和')}，你有 ${math.budget} 元。`
        }
        onSpeak={() =>
          void speak(
            reply ||
              `欢迎研姐。请买${targetItems.map((item) => item.name).join('和')}，你有${math.budget}元。`,
          )
        }
        className="shopkeeper-dialogue"
      />
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
            onToggle={() => {
              if (stage === 'checkout') {
                return
              }
              playNotes([420 + item.price * 22], 0.09)
              setBasket((items) =>
                items.includes(item.id)
                  ? items.filter((id) => id !== item.id)
                  : [...items, item.id],
              )
            }}
          />
        ))}
      </div>
      {stage === 'shop' ? (
        <div className="basket-console">
          <div className="basket-items">
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
            <span>去结账</span>
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
          <div className="coin-answers">
            {[Math.max(0, change - 1), change, change + 1].map((answer) => (
              <button type="button" key={answer} onClick={() => answerChange(answer)}>
                <Coins size={21} />
                <strong>{answer} 元</strong>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

function MathScene({
  task,
  level,
  total,
  onBack,
  onWin,
}: {
  task: LearningTask
  level: number
  total: number
  onBack: () => void
  onWin: (message: string) => void
}) {
  const math = task.math!
  const isMarket = math.kind === 'market'
  return (
    <section
      className={`scene interior-scene market-scene ${isMarket ? 'market-mode' : 'math-quest-mode'}`}
      aria-label="生活数学城"
    >
      <img className="scene-art market-art" src={sceneBackgrounds.math} alt="" />
      <div className="interior-vignette" />
      <SceneHeader
        title={task.title}
        subtitle={task.unit}
        level={level}
        total={total}
        reward={task.reward}
        onBack={onBack}
      />
      {isMarket ? (
        <MarketQuest math={math} onWin={onWin} />
      ) : (
        task.challenge && (
          <ChoiceQuest
            challenge={task.challenge}
            npcName="朵朵店长"
            portrait="👩🏻‍💼"
            onComplete={onWin}
          />
        )
      )}
    </section>
  )
}

function EnglishScene({
  task,
  level,
  total,
  onBack,
  onWin,
}: {
  task: LearningTask
  level: number
  total: number
  onBack: () => void
  onWin: (message: string) => void
}) {
  const english = task.english!
  const [stage, setStage] = useState<'seek' | 'spell'>('seek')
  const [pickedIndexes, setPickedIndexes] = useState<number[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    const englishPrompt = `${english.clue} Can you find it?`
    const chinesePrompt = `${english.chineseClue} 请找到正确的东西。`
    setMessage(`Guide Lily: ${englishPrompt} 然后听中文提示。`)
    const timer = window.setTimeout(
      () => void speakEnglishThenChinese(englishPrompt, chinesePrompt),
      600,
    )
    return () => window.clearTimeout(timer)
  }, [english])

  const candidates = [
    { emoji: english.distractors[0], value: 'wrong-1' },
    { emoji: english.emoji, value: english.word },
    { emoji: english.distractors[1], value: 'wrong-2' },
  ]
  const builtWord = pickedIndexes
    .map((index) => english.letters[index])
    .join('')

  function findObject(value: string) {
    if (value !== english.word) {
      setMessage('Guide Lily: Look again. 再听中文提示找一找。')
      void speakEnglishThenChinese('Look again.', english.chineseClue)
      playNotes([190], 0.13)
      return
    }
    setStage('spell')
    setMessage(`Guide Lily: You found it! Spell ${english.word}. 请拼出这个单词。`)
    void speakEnglishThenChinese(
      `You found it. Listen: ${english.word}. Spell ${english.word}.`,
      `找到了。现在按顺序拼出单词${english.word}。`,
    )
    playNotes([523, 659], 0.12)
  }

  function pickLetter(letter: string, index: number) {
    if (pickedIndexes.includes(index)) {
      return
    }
    const expected = english.word[builtWord.length]
    if (letter !== expected) {
      setMessage(`Guide Lily: Listen again: ${english.word}. 再听一遍。`)
      void speakEnglishThenChinese(
        `Listen again. ${english.word}.`,
        `下一颗字母不是${letter}，再听一遍。`,
      )
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
      setMessage(`Guide Lily: ${english.sentence} ${english.chineseSentence}`)
      void speakEnglishThenChinese(english.sentence, english.chineseSentence)
      playNotes([523, 659, 784, 1047], 0.13)
      window.setTimeout(() => onWin(`研姐找到了${english.treasure}。`), 1300)
    }
  }

  return (
    <section
      className={`scene interior-scene treasure-scene stage-${stage}`}
      aria-label="英语宝藏洞"
    >
      <img className="scene-art" src={sceneBackgrounds.english} alt="" />
      <div className="interior-vignette" />
      <SceneHeader
        title={task.title}
        subtitle={`${english.grade}年级 · ${english.theme}`}
        level={level}
        total={total}
        reward={task.reward}
        onBack={onBack}
      />
      <div className="robot-dialogue">
        <span className="npc-portrait english-guide" aria-hidden="true">👩🏽</span>
        <div>
          <PinyinLine text={message} lang="en-US" />
          <button
            type="button"
            className="listen-button"
            onClick={() =>
              void speakEnglishThenChinese(
                stage === 'seek'
                  ? `${english.clue} Can you find it?`
                  : `Listen and spell ${english.word}.`,
                stage === 'seek'
                  ? `${english.chineseClue} 请找到正确的东西。`
                  : `请拼出单词${english.word}。`,
              )
            }
          >
            <Volume2 size={18} />
            <span>先英后中</span>
          </button>
        </div>
      </div>
      {stage === 'seek' ? (
        <div className="object-hunt">
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
          <div
            className="word-lock"
            style={{ '--word-length': english.word.length } as React.CSSProperties}
          >
            {english.word.split('').map((letter, index) => (
              <span key={`${letter}-${index}`}>
                {builtWord[index]?.toUpperCase() ?? ''}
              </span>
            ))}
          </div>
          <div
            className="letter-pedestals"
            style={{ '--letter-count': english.letters.length } as React.CSSProperties}
          >
            {english.letters.map((letter, index) => (
              <button
                type="button"
                className={`letter-gem ${pickedIndexes.includes(index) ? 'used' : ''}`}
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
        <span className="next-level">下一段冒险正在打开……</span>
      </div>
    </div>
  )
}

function nextIndexFor(progress: LearnerProgress, subject: SubjectId) {
  const list = getSubjectTasks(subject)
  const index = list.findIndex(
    (task) => !progress.completedTaskIds.includes(task.id),
  )
  return index < 0 ? 0 : index
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
    prepareVoices()
    let mounted = true
    void loadProgress().then((loadedProgress) => {
      if (!mounted) {
        return
      }
      setProgress(loadedProgress)
      setTaskIndexes({
        chinese: nextIndexFor(loadedProgress, 'chinese'),
        math: nextIndexFor(loadedProgress, 'math'),
        english: nextIndexFor(loadedProgress, 'english'),
      })
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
    window.speechSynthesis?.cancel()
    setTransitioning(true)
    playNotes([330, 440, 660], 0.09)
    transitionTimer.current = window.setTimeout(() => {
      if (
        nextScene === 'chinese' ||
        nextScene === 'math' ||
        nextScene === 'english'
      ) {
        setActiveSubject(nextScene)
      }
      setScene(nextScene)
      setTransitioning(false)
      window.scrollTo(0, 0)
    }, 520)
  }

  async function completeQuest(message: string) {
    const nextProgress = await recordTaskDone(
      progress,
      task.id,
      task.subject,
      task.reward,
    )
    setProgress(nextProgress)
    setCelebration({ title: '研姐闯关成功！', detail: message })
    playNotes([523, 659, 784, 1047], 0.16)
    window.setTimeout(() => {
      setTaskIndexes((current) => ({
        ...current,
        [activeSubject]: current[activeSubject] + 1,
      }))
      setCelebration(null)
    }, 2800)
  }

  async function completePainting() {
    const next = await recordPainting(progress)
    setProgress(next)
    setCelebration({
      title: '研姐的作品完成了！',
      detail: '画里的颜色凝成了 2 份宝石粉。',
    })
    window.setTimeout(() => setCelebration(null), 2600)
  }

  async function completeGem(name: string) {
    const next = await recordGem(progress, name)
    setProgress(next)
    setCelebration({
      title: `${name}诞生了！`,
      detail: '语文会命名，数学会配比，英语让宝石走向更大的世界。',
    })
    playNotes([523, 659, 784, 1047], 0.16)
    window.setTimeout(() => {
      setCelebration(null)
      changeScene('world')
    }, 3200)
  }

  async function handleReset() {
    const blank = await resetProgress()
    setProgress(blank)
    setTaskIndexes({ chinese: 0, math: 0, english: 0 })
    setParentOpen(false)
  }

  return (
    <main className={`game-shell active-scene-${scene}`}>
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
          level={taskIndex + 1}
          total={subjectTasks.length}
          onBack={() => changeScene('world')}
          onWin={(message) => void completeQuest(message)}
        />
      )}
      {scene === 'math' && (
        <MathScene
          key={task.id}
          task={task}
          level={taskIndex + 1}
          total={subjectTasks.length}
          onBack={() => changeScene('world')}
          onWin={(message) => void completeQuest(message)}
        />
      )}
      {scene === 'english' && (
        <EnglishScene
          key={task.id}
          task={task}
          level={taskIndex + 1}
          total={subjectTasks.length}
          onBack={() => changeScene('world')}
          onWin={(message) => void completeQuest(message)}
        />
      )}
      {scene === 'art' && (
        <PaintingScene
          paintingNumber={progress.paintingsSaved}
          onBack={() => changeScene('world')}
          onComplete={() => void completePainting()}
        />
      )}
      {scene === 'gem' && (
        <GemWorkshopScene
          recipeIndex={progress.craftedGems.length}
          onBack={() => changeScene('world')}
          onComplete={(name) => void completeGem(name)}
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
