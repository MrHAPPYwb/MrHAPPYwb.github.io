import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Gem, Hammer, Map, RotateCcw, Sparkles } from 'lucide-react'
import './App.css'
import { playNotes, prepareAudio, speakUi } from './audio'
import {
  gemMeta,
  getLevel,
  type GemColor,
  type Level,
  type Question,
} from './curriculum'
import type { ForgedCreation, ForgeShape } from './forge'
import { LevelMap } from './components/LevelMap'
import {
  completeLevel,
  createBlankProgress,
  forgeCreation,
  loadProgress,
  openTreasure,
  recordQuestion,
  resetProgress,
  weakQuestionIds,
  type MinerProgress,
  type TreasureReward,
} from './storage'

type Screen = 'mine' | 'map' | 'forge'
type Completion = {
  level: Level
  score: number
  rewardColor?: GemColor
}

const MinerGame = lazy(() =>
  import('./components/MinerGame').then((module) => ({
    default: module.MinerGame,
  })),
)

const CrystalForge = lazy(() =>
  import('./components/CrystalForge').then((module) => ({
    default: module.CrystalForge,
  })),
)

const CrystalStage = lazy(() =>
  import('./components/CrystalStage').then((module) => ({
    default: module.CrystalStage,
  })),
)

function GameLoading() {
  return (
    <div className="game-loading">
      <Gem size={42} />
      <strong>水晶矿道正在打开……</strong>
    </div>
  )
}

function LevelComplete({
  completion,
  onContinue,
}: {
  completion: Completion
  onContinue: () => void
}) {
  const reward = completion.rewardColor

  useEffect(() => {
    void speakUi(reward ? 'gem-reward' : 'level-clear')
  }, [completion, reward])

  return (
    <div className="level-complete" role="dialog" aria-label="关卡完成">
      <div className="complete-rays" aria-hidden="true" />
      <div className="complete-title">
        <small>LEVEL {completion.level.id} CLEAR</small>
        <strong>{reward ? '本关彩钻奖励！' : '抓矿成功！'}</strong>
        <span>{completion.score} 分</span>
      </div>
      {reward ? (
        <>
          <Suspense fallback={<GameLoading />}>
            <CrystalStage colors={[reward]} className="reward-crystal" />
          </Suspense>
          <div className="reward-name">
            <Gem size={20} />
            <strong>{gemMeta[reward].name}</strong>
          </div>
        </>
      ) : (
        <div className="clear-emblem">
          <Sparkles size={72} />
          <strong>{completion.level.skill}</strong>
        </div>
      )}
      <button type="button" className="continue-button" onClick={onContinue}>
        <span>{completion.level.id >= 100 ? '查看全部矿层' : '进入下一关'}</span>
      </button>
    </div>
  )
}

function App() {
  const [progress, setProgress] = useState<MinerProgress>(createBlankProgress)
  const progressRef = useRef(progress)
  const [screen, setScreen] = useState<Screen>('mine')
  const [selectedLevel, setSelectedLevel] = useState(1)
  const [completion, setCompletion] = useState<Completion | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const currentLevel = getLevel(selectedLevel)
  progressRef.current = progress

  useEffect(() => {
    prepareAudio()
    let mounted = true
    void loadProgress().then((stored) => {
      if (!mounted) {
        return
      }
      progressRef.current = stored
      setProgress(stored)
      setSelectedLevel(stored.currentLevel)
    })
    return () => {
      mounted = false
    }
  }, [])

  const handleAnswer = useCallback(
    async (question: Question, correct: boolean, combo: number) => {
      const next = await recordQuestion(
        progressRef.current,
        question.id,
        selectedLevel,
        correct,
        combo,
      )
      progressRef.current = next
      setProgress(next)
    },
    [selectedLevel],
  )

  const handleLevelComplete = useCallback(
    async (score: number) => {
      const before = progressRef.current
      const firstCompletion = !before.completedLevels.includes(selectedLevel)
      const next = await completeLevel(
        before,
        selectedLevel,
        currentLevel.rewardColor,
      )
      progressRef.current = next
      setProgress(next)
      setCompletion({
        level: currentLevel,
        score,
        rewardColor:
          firstCompletion && currentLevel.rewardColor
            ? currentLevel.rewardColor
            : undefined,
      })
      playNotes([523, 659, 784, 1047], 0.14)
    },
    [currentLevel, selectedLevel],
  )

  const handleTreasure = useCallback(
    async (levelId: number, reward: TreasureReward) => {
      const next = await openTreasure(progressRef.current, levelId, reward)
      progressRef.current = next
      setProgress(next)
    },
    [],
  )

  async function handleForged(shape: ForgeShape) {
    const next = await forgeCreation(progressRef.current, shape)
    progressRef.current = next
    setProgress(next)
    return next.forgedCreations.at(-1) as ForgedCreation | undefined
  }

  async function handleReset() {
    const blank = await resetProgress()
    progressRef.current = blank
    setProgress(blank)
    setSelectedLevel(1)
    setCompletion(null)
    setSettingsOpen(false)
    setScreen('mine')
  }

  function continueAfterLevel() {
    const nextLevel = Math.min(100, currentLevel.id + 1)
    setCompletion(null)
    if (currentLevel.id >= 100) {
      setScreen('map')
      return
    }
    setSelectedLevel(nextLevel)
  }

  return (
    <main className="game-shell">
      {screen === 'mine' && (
        <>
          <Suspense fallback={<GameLoading />}>
            <MinerGame
              key={currentLevel.id}
              level={currentLevel}
              weakQuestionIds={weakQuestionIds(progress, currentLevel.id)}
              onAnswer={(question, correct, combo) =>
                void handleAnswer(question, correct, combo)
              }
              onTreasure={(levelId, reward) =>
                void handleTreasure(levelId, reward)
              }
              onComplete={(score) => void handleLevelComplete(score)}
            />
          </Suspense>
          <nav className="game-dock" aria-label="游戏导航">
            <button type="button" onClick={() => setScreen('map')}>
              <Map size={21} />
              <span>100关</span>
            </button>
            <div className="dock-player">
              <strong>研姐</strong>
              <span>{currentLevel.chapterName}</span>
            </div>
            <button type="button" onClick={() => setScreen('forge')}>
              <Hammer size={21} />
              <span>锻造</span>
            </button>
          </nav>
          <button
            type="button"
            className="settings-trigger"
            aria-label="打开家长设置"
            onClick={() => setSettingsOpen(true)}
          >
            <span>家长</span>
          </button>
        </>
      )}

      {screen === 'map' && (
        <LevelMap
          progress={progress}
          onBack={() => setScreen('mine')}
          onForge={() => setScreen('forge')}
          onSelect={(levelId) => {
            setSelectedLevel(levelId)
            setScreen('mine')
          }}
        />
      )}

      {screen === 'forge' && (
        <Suspense fallback={<GameLoading />}>
          <CrystalForge
            progress={progress}
            onBack={() => setScreen('mine')}
            onForged={handleForged}
          />
        </Suspense>
      )}

      {completion && (
        <LevelComplete
          completion={completion}
          onContinue={continueAfterLevel}
        />
      )}

      {settingsOpen && (
        <div className="parent-settings" role="dialog" aria-label="家长设置">
          <div>
            <strong>学习记录</strong>
            <button type="button" onClick={() => setSettingsOpen(false)}>
              关闭
            </button>
          </div>
          <p>
            已通关 {progress.completedLevels.length}/100 · 累计答对{' '}
            {progress.totalCorrect} 题 · 最佳连击 {progress.bestCombo}
          </p>
          <p>
            宝箱收藏：星光贴纸 {progress.starStickers} 张 · 锻造星火{' '}
            {progress.forgeSparks} 枚
          </p>
          <p>错题会在间隔两个以上关卡后重新进入钻石，直到稳定答对。</p>
          <button type="button" className="reset-progress" onClick={() => void handleReset()}>
            <RotateCcw size={18} />
            <span>重置全部进度</span>
          </button>
        </div>
      )}
    </main>
  )
}

export default App
