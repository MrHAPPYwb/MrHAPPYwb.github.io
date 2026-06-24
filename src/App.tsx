import { useEffect, useMemo, useState } from 'react'
import {
  BookOpen,
  Check,
  Home,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Volume2,
} from 'lucide-react'
import './App.css'
import { getDailyTasks, getSubjectTasks, subjects, type LearningTask, type SubjectId } from './content'
import { HanziPractice } from './components/HanziPractice'
import { IslandMap } from './components/IslandMap'
import {
  createBlankProgress,
  loadProgress,
  recordTaskDone,
  resetProgress,
  type LearnerProgress,
} from './storage'

type Feedback = 'idle' | 'correct' | 'try-again'

function speak(text: string, lang: string) {
  if (!('speechSynthesis' in window)) {
    return
  }

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  utterance.rate = 0.82
  window.speechSynthesis.speak(utterance)
}

function DotTray({ count }: { count: number }) {
  return (
    <div className="dot-tray" aria-label={`${count} 个物品`}>
      {Array.from({ length: 10 }, (_, index) => (
        <span
          className={index < count ? 'dot filled' : 'dot'}
          key={`dot-${index}`}
        />
      ))}
    </div>
  )
}

function TaskVisual({ task }: { task: LearningTask }) {
  if (task.mode === 'hanzi' && task.character) {
    return <HanziPractice character={task.character} />
  }

  if (task.mode === 'math') {
    return <DotTray count={task.visual ?? 0} />
  }

  return (
    <button
      type="button"
      className="sound-button"
      onClick={() => speak(task.speak ?? task.answer, 'en-US')}
    >
      <Volume2 size={28} />
      <span>{task.cue}</span>
    </button>
  )
}

function ParentPanel({
  progress,
  onReset,
}: {
  progress: LearnerProgress
  onReset: () => void
}) {
  const totalDone = progress.completedTaskIds.length

  return (
    <section className="parent-panel" aria-label="家长面板">
      <div className="panel-heading">
        <ShieldCheck size={19} />
        <h2>家长面板</h2>
      </div>
      <div className="parent-grid">
        <div>
          <span className="metric">{progress.stars}</span>
          <small>星星</small>
        </div>
        <div>
          <span className="metric">{progress.streakDays}</span>
          <small>连续天数</small>
        </div>
        <div>
          <span className="metric">{totalDone}</span>
          <small>完成任务</small>
        </div>
      </div>
      <p className="parent-note">
        第一版建议每天 8-12 分钟。进度只保存在本机，不上传孩子数据。
      </p>
      <button type="button" className="secondary-button" onClick={onReset}>
        <RotateCcw size={17} />
        <span>重置进度</span>
      </button>
    </section>
  )
}

function App() {
  const [progress, setProgress] = useState<LearnerProgress>(createBlankProgress)
  const [activeSubject, setActiveSubject] = useState<SubjectId>('chinese')
  const [taskIndex, setTaskIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [parentOpen, setParentOpen] = useState(false)
  const subjectTasks = useMemo(
    () => getSubjectTasks(activeSubject),
    [activeSubject],
  )
  const task = subjectTasks[taskIndex % subjectTasks.length]
  const dailyTasks = getDailyTasks()
  const dailyDone = dailyTasks.filter((dailyTask) =>
    progress.completedTaskIds.includes(dailyTask.id),
  ).length
  const activeMeta = subjects[activeSubject]

  useEffect(() => {
    let mounted = true
    void loadProgress().then((loadedProgress) => {
      if (mounted) {
        setProgress(loadedProgress)
      }
    })

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    setTaskIndex(0)
    setSelectedAnswer('')
    setFeedback('idle')
  }, [activeSubject])

  async function chooseAnswer(answer: string) {
    if (feedback === 'correct') {
      return
    }

    setSelectedAnswer(answer)
    if (answer !== task.answer) {
      setFeedback('try-again')
      return
    }

    setFeedback('correct')
    const nextProgress = await recordTaskDone(
      progress,
      task.id,
      task.subject,
      task.reward,
    )
    setProgress(nextProgress)
  }

  function nextTask() {
    setTaskIndex((current) => current + 1)
    setSelectedAnswer('')
    setFeedback('idle')
  }

  async function handleReset() {
    const blank = await resetProgress()
    setProgress(blank)
    setSelectedAnswer('')
    setFeedback('idle')
  }

  return (
    <main className="app-shell">
      <section className="top-bar" aria-label="当前状态">
        <div className="brand-mark">
          <Sparkles size={20} />
          <span>彩虹任务岛</span>
        </div>
        <button
          type="button"
          className="parent-toggle"
          onClick={() => setParentOpen((open) => !open)}
        >
          <Home size={18} />
          <span>家长</span>
        </button>
      </section>

      <section className="hero-band" aria-label="今日任务">
        <div className="mission-copy">
          <span className="eyebrow">今日 {dailyDone}/3</span>
          <h1>{activeMeta.place}</h1>
          <p>{progress.petName} 正在收集星星，完成一题就点亮一点岛光。</p>
        </div>
        <div className="pet-badge" aria-label={`宠物等级 ${progress.petLevel}`}>
          <span>Lv.{progress.petLevel}</span>
          <strong>{progress.petName}</strong>
        </div>
      </section>

      <IslandMap
        activeSubject={activeSubject}
        progress={progress}
        onSelectSubject={setActiveSubject}
      />

      <section className="subject-tabs" aria-label="学科选择">
        {(Object.keys(subjects) as SubjectId[]).map((subject) => (
          <button
            type="button"
            key={subject}
            className={subject === activeSubject ? 'tab active' : 'tab'}
            onClick={() => setActiveSubject(subject)}
          >
            {subjects[subject].shortName}
          </button>
        ))}
      </section>

      <section className="task-card" aria-live="polite">
        <div className="task-head">
          <div>
            <span className="subject-pill">{activeMeta.name}</span>
            <h2>{task.title}</h2>
          </div>
          <div className="reward-chip">+{task.reward}</div>
        </div>

        <TaskVisual task={task} />

        <div className="prompt-box">
          <BookOpen size={18} />
          <p>{task.prompt}</p>
        </div>

        <div className="answer-grid">
          {task.options.map((option) => {
            const isSelected = selectedAnswer === option
            const isCorrect = feedback === 'correct' && option === task.answer
            const isWrong =
              feedback === 'try-again' && isSelected && option !== task.answer

            return (
              <button
                type="button"
                className={[
                  'answer-button',
                  isSelected ? 'selected' : '',
                  isCorrect ? 'correct' : '',
                  isWrong ? 'wrong' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                key={option}
                onClick={() => void chooseAnswer(option)}
              >
                {option}
              </button>
            )
          })}
        </div>

        <div className={`feedback ${feedback}`}>
          {feedback === 'idle' && <span>{task.skill}</span>}
          {feedback === 'try-again' && <span>再想一想，答案藏在图里。</span>}
          {feedback === 'correct' && (
            <>
              <Check size={18} />
              <span>点亮成功</span>
              <button type="button" onClick={nextTask}>
                下一站
              </button>
            </>
          )}
        </div>
      </section>

      {parentOpen && <ParentPanel progress={progress} onReset={handleReset} />}
    </main>
  )
}

export default App
