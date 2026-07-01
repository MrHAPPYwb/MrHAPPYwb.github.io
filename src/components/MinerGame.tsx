import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import { Check, Clock3, Flag, Gem, Gift, Sparkles, Star, Volume2, X } from 'lucide-react'
import { playNotes, speakFeedback, speakQuestion, speakUi } from '../audio'
import {
  gemMeta,
  questionsForLevel,
  type GemColor,
  type Level,
  type Question,
} from '../curriculum'
import type { TreasureReward } from '../storage'

type HudState = {
  correct: number
  target: number
  combo: number
  score: number
  time: number
  hint: string
}

type SceneController = {
  resolveAnswer: (correct: boolean) => void
  wrongAttempt: () => void
  resolveTreasure: () => void
}

const gemColors = Object.keys(gemMeta) as GemColor[]
const gemTintPalette: Record<GemColor, [number, number, number, number]> = {
  ruby: [0xffb0c5, 0xffffff, 0xff4778, 0xff8fb0],
  sapphire: [0xa8e8ff, 0xffffff, 0x35b7ff, 0x73d3ff],
  emerald: [0xa8ffe0, 0xffffff, 0x35d991, 0x70efba],
  amethyst: [0xe2c4ff, 0xffffff, 0xa968ff, 0xcf9aff],
  citrine: [0xffefad, 0xffffff, 0xffb72e, 0xffd66f],
}

const treasureMeta: Record<
  TreasureReward,
  { name: string; detail: string }
> = {
  'star-sticker': {
    name: '星光贴纸',
    detail: '已经放进收藏册。以后集齐一套，可以装饰矿车和通关相册。',
  },
  'forge-spark': {
    name: '锻造星火',
    detail: '已经存进锻造炉。拥有的星火越多，每次敲打钻石的进度越快。',
  },
  'time-crystal': {
    name: '时间水晶',
    detail: '立即为本关增加 30 秒。以后进入更深矿层时，也能用来补充时间。',
  },
}

function treasureForLevel(levelId: number): TreasureReward {
  return (['star-sticker', 'forge-spark', 'time-crystal'] as const)[
    (levelId - 1) % 3
  ]
}

function QuizOverlay({
  question,
  onWrong,
  onSolved,
}: {
  question: Question
  onWrong: () => void
  onSolved: () => void
}) {
  const [picked, setPicked] = useState('')
  const [resolved, setResolved] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void speakQuestion(question)
    }, 260)
    return () => window.clearTimeout(timer)
  }, [question])

  function answer(option: string) {
    if (resolved) {
      return
    }
    const correct = option === question.answer
    setPicked(option)
    if (!correct) {
      onWrong()
      playNotes([190, 160], 0.12)
      void speakFeedback(false)
      window.setTimeout(() => {
        setPicked('')
      }, 650)
      return
    }
    setResolved(true)
    playNotes([523, 659, 784], 0.11)
    void speakFeedback(true)
    window.setTimeout(onSolved, 900)
  }

  function replay() {
    void speakQuestion(question)
  }

  return (
    <div className="quiz-veil" role="dialog" aria-label="钻石知识挑战">
      <div className={`quiz-crystal subject-${question.subject}`}>
        <div className="quiz-subject">
          <Gem size={18} />
          <span>知识晶核</span>
        </div>
        <div className="quiz-cue">{question.cue}</div>
        <div className="quiz-prompt">
          <strong>{question.prompt}</strong>
          <button type="button" aria-label="再听一遍" onClick={replay}>
            <Volume2 size={19} />
          </button>
        </div>
        <div className="quiz-options">
          {question.options.map((option) => {
            const selected = picked === option
            return (
              <button
                type="button"
                className={`${selected ? 'picked' : ''} ${
                  resolved && option === question.answer ? 'correct' : ''
                }`}
                key={option}
                onClick={() => answer(option)}
              >
                {selected && !resolved ? <X size={18} /> : <Sparkles size={16} />}
                <span>{option}</span>
              </button>
            )
          })}
        </div>
        <div className={`quiz-feedback ${resolved ? 'show' : ''}`}>
          <Check size={18} />
          <span>{question.explain}</span>
        </div>
      </div>
    </div>
  )
}

function TreasureDialog({
  reward,
  onConfirm,
}: {
  reward: TreasureReward
  onConfirm: () => void
}) {
  return (
    <div className="treasure-veil" role="dialog" aria-label="宝箱奖励">
      <div className="treasure-dialog">
        <div className="treasure-dialog-title">
          <Gift size={20} />
          <span>神秘宝箱打开啦</span>
        </div>
        <img src="assets/crystal-chest-v2.webp" alt="" />
        <div className="treasure-reward-name">
          <Star size={22} />
          <strong>{treasureMeta[reward].name}</strong>
        </div>
        <p>{treasureMeta[reward].detail}</p>
        <button type="button" onClick={onConfirm}>
          <Gift size={20} />
          <span>收进背包</span>
        </button>
      </div>
    </div>
  )
}

export function MinerGame({
  level,
  weakQuestionIds,
  onAnswer,
  onTreasure,
  onComplete,
}: {
  level: Level
  weakQuestionIds: string[]
  onAnswer: (question: Question, correct: boolean, combo: number) => void
  onTreasure: (levelId: number, reward: TreasureReward) => void
  onComplete: (score: number) => void
}) {
  const gameHostRef = useRef<HTMLDivElement>(null)
  const controllerRef = useRef<SceneController | null>(null)
  const onAnswerRef = useRef(onAnswer)
  const onTreasureRef = useRef(onTreasure)
  const onCompleteRef = useRef(onComplete)
  onAnswerRef.current = onAnswer
  onTreasureRef.current = onTreasure
  onCompleteRef.current = onComplete
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null)
  const [treasureReward, setTreasureReward] = useState<TreasureReward | null>(
    null,
  )
  const [hud, setHud] = useState<HudState>({
    correct: 0,
    target: level.target,
    combo: 0,
    score: 0,
    time: level.timeLimit,
    hint: '点击矿洞，发射抓钩',
  })
  const questionLevelRef = useRef(0)
  const questionPoolRef = useRef<Question[]>([])
  if (questionLevelRef.current !== level.id) {
    questionLevelRef.current = level.id
    questionPoolRef.current = questionsForLevel(level, weakQuestionIds)
  }
  const questionPool = questionPoolRef.current

  useEffect(() => {
    const host = gameHostRef.current
    if (!host) {
      return
    }

    setActiveQuestion(null)
    setTreasureReward(null)
    if (import.meta.env.DEV) {
      const qaTreasure = new URLSearchParams(window.location.search).get(
        'qaTreasure',
      )
      if (
        qaTreasure === 'star-sticker' ||
        qaTreasure === 'forge-spark' ||
        qaTreasure === 'time-crystal'
      ) {
        setTreasureReward(qaTreasure)
      }
    }
    setHud({
      correct: 0,
      target: level.target,
      combo: 0,
      score: 0,
      time: level.timeLimit,
      hint: '点击矿洞，发射抓钩',
    })

    type MineItem = {
      sprite: Phaser.GameObjects.Container
      color?: GemColor
      question?: Question
      radius: number
      weight: number
      value: number
      kind: 'gem' | 'ore' | 'chest'
    }

    class CrystalMineScene extends Phaser.Scene {
      private rope!: Phaser.GameObjects.Graphics
      private hook!: Phaser.GameObjects.Container
      private items: MineItem[] = []
      private anchor = new Phaser.Math.Vector2(195, 112)
      private angle = -52
      private angleDirection = 1
      private ropeLength = 62
      private launchElapsed = 0
      private ropeVelocity = 0
      private phase:
        | 'swing'
        | 'extend'
        | 'retract'
        | 'quiz'
        | 'treasure'
        | 'done' = 'swing'
      private caught: MineItem | null = null
      private correct = 0
      private combo = 0
      private score = 0
      private remaining = level.timeLimit
      private lastSecond = level.timeLimit
      private questionIndex = 0
      private currentQuestion: Question | null = null
      private completing = false

      preload() {
        this.load.image('crystal-mine-bg', 'assets/crystal-mine-v1.webp')
        this.load.image('metal-diamond-claw', 'assets/metal-diamond-claw-v1.webp')
        this.load.image('knowledge-diamond', 'assets/knowledge-diamond-v2.webp')
        this.load.image('mine-ore', 'assets/crystal-ore-v2.webp')
        this.load.image('treasure-chest', 'assets/crystal-chest-v2.webp')
      }

      create() {
        const background = this.add.image(195, 422, 'crystal-mine-bg')
        background.setDisplaySize(390, 844)
        background.setDepth(-5)

        this.createHook()
        this.spawnField()

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          if (pointer.y < 82 || this.phase !== 'swing') {
            return
          }
          this.phase = 'extend'
          this.launchElapsed = 0
          this.ropeVelocity = 330 + Math.min(this.combo, 5) * 8
          setHud((current) => ({ ...current, hint: '抓钩出发！' }))
          playNotes([310, 420], 0.07)
        })

        controllerRef.current = {
          resolveAnswer: (correct) => this.resolveAnswer(correct),
          resolveTreasure: () => {
            setTreasureReward(null)
            this.phase = 'swing'
          },
          wrongAttempt: () => {
            this.combo = 0
            setHud((current) => ({
              ...current,
              combo: 0,
              hint: '提示已经点亮，再试一次',
            }))
          },
        }
      }

      private createHook() {
        this.rope = this.add.graphics().setDepth(9)
        const claw = this.add.image(0, 0, 'metal-diamond-claw')
        claw.setDisplaySize(56, 86)
        claw.setOrigin(0.5, 0.2)
        this.hook = this.add.container(this.anchor.x, this.anchor.y + 62, [
          claw,
        ])
        this.hook.setDepth(10)
      }

      private spawnField() {
        this.items.forEach((item) => item.sprite.destroy())
        this.items = []
        const positions: Array<{ x: number; y: number }> = []
        const specs: Array<{
          kind: MineItem['kind']
          question?: Question
        }> = [
          ...questionPool.slice(0, 9).map((question) => ({
            kind: 'gem' as const,
            question,
          })),
          { kind: 'ore' },
          { kind: 'ore' },
          { kind: 'ore' },
          { kind: 'chest' },
        ]
        for (let index = 0; index < specs.length; index += 1) {
          let x = 70
          let y = 350
          let attempts = 0
          do {
            x = Phaser.Math.Between(48, 342)
            y = Phaser.Math.Between(248, 710)
            attempts += 1
          } while (
            attempts < 45 &&
            positions.some(
              (position) =>
                Phaser.Math.Distance.Between(x, y, position.x, position.y) < 68,
            )
          )
          positions.push({ x, y })

          const spec = specs[index]
          const color = spec.question
            ? gemColors[(index * 2 + level.id) % gemColors.length]
            : undefined
          const texture =
            spec.kind === 'gem'
              ? 'knowledge-diamond'
              : spec.kind === 'ore'
                ? 'mine-ore'
                : 'treasure-chest'
          const image = this.add.image(0, 0, texture)
          let radius = 36
          if (spec.kind === 'gem' && color) {
            const width = Phaser.Math.Between(48, 72)
            image.setDisplaySize(width, Math.round(width * 0.85))
            image.setTint(...gemTintPalette[color])
            radius = width * 0.44
          } else if (spec.kind === 'ore') {
            const width = Phaser.Math.Between(76, 100)
            image.setDisplaySize(width, Math.round(width * 1.03))
            radius = width * 0.42
          } else {
            image.setDisplaySize(94, 84)
            radius = 42
          }
          const sprite = this.add.container(x, y, [image])
          sprite.setDepth(3 + Math.round(y / 200))
          if (spec.kind !== 'ore') {
            this.tweens.add({
              targets: sprite,
              y: y - Phaser.Math.Between(4, 11),
              angle: Phaser.Math.Between(-7, 7),
              duration: Phaser.Math.Between(1300, 2200),
              yoyo: true,
              repeat: -1,
              ease: 'Sine.inOut',
            })
          }
          this.items.push({
            sprite,
            color,
            question: spec.question,
            radius,
            weight: spec.kind === 'ore' ? 2.4 : spec.kind === 'chest' ? 1.55 : 1,
            value: spec.kind === 'ore' ? 20 : spec.kind === 'chest' ? 80 : 100,
            kind: spec.kind,
          })
        }
      }

      private ropeAngle() {
        if (this.phase !== 'extend') return this.angle
        const damping = Math.max(0, 1 - this.launchElapsed / 1.35)
        return this.angle + Math.sin(this.launchElapsed * 10) * damping * 3.2
      }

      private currentTip() {
        const radians = Phaser.Math.DegToRad(this.ropeAngle())
        return new Phaser.Math.Vector2(
          this.anchor.x + Math.sin(radians) * this.ropeLength,
          this.anchor.y + Math.cos(radians) * this.ropeLength,
        )
      }

      private catchItem(item: MineItem) {
        this.caught = item
        this.phase = 'retract'
        this.tweens.killTweensOf(item.sprite)
        item.sprite.setDepth(8)
        playNotes(
          item.kind === 'ore'
            ? [170]
            : item.kind === 'chest'
              ? [392, 523, 784]
              : [620, 810],
          item.kind === 'ore' ? 0.12 : 0.08,
        )
        setHud((current) => ({
          ...current,
          hint:
            item.kind === 'ore'
              ? '抓到发光矿石，有点重！'
              : item.kind === 'chest'
                ? '神秘宝箱正在拉上来！'
                : '抓到一颗晶莹的知识钻石！',
        }))
      }

      private openQuestion() {
        const question =
          this.caught?.question ??
          questionPool[this.questionIndex % questionPool.length]
        this.questionIndex += 1
        this.currentQuestion = question
        this.phase = 'quiz'
        this.caught?.sprite.destroy()
        this.items = this.items.filter((item) => item !== this.caught)
        this.caught = null
        setActiveQuestion(question)
      }

      private resolveAnswer(correct: boolean) {
        if (this.phase !== 'quiz') {
          return
        }
        const question =
          this.currentQuestion ??
          questionPool[(this.questionIndex - 1) % questionPool.length]
        if (correct) {
          this.correct += 1
          this.combo += 1
          this.score += 100 + Math.max(0, this.combo - 1) * 20
          this.cameras.main.flash(180, 255, 235, 140, false)
        } else {
          this.combo = 0
        }
        onAnswerRef.current(question, correct, this.combo)
        this.currentQuestion = null
        setActiveQuestion(null)
        setHud({
          correct: this.correct,
          target: level.target,
          combo: this.combo,
          score: this.score,
          time: Math.ceil(this.remaining),
          hint:
            this.combo >= 2
              ? `连续答对 ${this.combo} 题，抓钩加速！`
              : '继续瞄准发光钻石',
        })
        if (this.correct >= level.target && !this.completing) {
          this.completing = true
          this.phase = 'done'
          window.setTimeout(() => onCompleteRef.current(this.score), 650)
          return
        }
        this.phase = 'swing'
      }

      private collectTreasure() {
        const reward = treasureForLevel(level.id)
        if (reward === 'time-crystal') {
          this.remaining += 30
          this.lastSecond = Math.ceil(this.remaining)
        }
        this.score += 80
        onTreasureRef.current(level.id, reward)
        setTreasureReward(reward)
        void speakUi(`treasure-${reward}`)
        this.caught?.sprite.destroy()
        this.items = this.items.filter((item) => item !== this.caught)
        this.caught = null
        this.phase = 'treasure'
        setHud((current) => ({
          ...current,
          score: this.score,
          time: Math.ceil(this.remaining),
          hint: `宝箱奖励：${treasureMeta[reward].name}`,
        }))
      }

      update(_time: number, delta: number) {
        if (this.phase === 'done') {
          return
        }
        const seconds = delta / 1000
        if (this.phase !== 'quiz' && this.phase !== 'treasure') {
          this.remaining -= seconds
          if (this.remaining <= 0) {
            this.remaining = 25
            setHud((current) => ({
              ...current,
              time: 25,
              hint: '矿灯送来 25 秒，不用着急',
            }))
            playNotes([392, 523, 659], 0.1)
          }
          const rounded = Math.ceil(this.remaining)
          if (rounded !== this.lastSecond) {
            this.lastSecond = rounded
            setHud((current) => ({ ...current, time: rounded }))
          }
        }

        const swingSpeed = 34 + Math.min(this.combo, 5) * 2
        if (this.phase === 'swing') {
          this.angle += this.angleDirection * swingSpeed * seconds
          if (this.angle > 58 || this.angle < -58) {
            this.angle = Phaser.Math.Clamp(this.angle, -58, 58)
            this.angleDirection *= -1
          }
        } else if (this.phase === 'extend') {
          this.launchElapsed += seconds
          this.ropeVelocity = Math.max(
            118 + Math.min(this.combo, 5) * 5,
            this.ropeVelocity - 92 * seconds,
          )
          this.ropeLength += this.ropeVelocity * seconds
          const tip = this.currentTip()
          const collision = this.items.find(
            (item) =>
              Phaser.Math.Distance.Between(
                tip.x,
                tip.y,
                item.sprite.x,
                item.sprite.y,
              ) <
              item.radius + 13,
          )
          if (collision) {
            this.catchItem(collision)
          } else if (
            tip.x < 12 ||
            tip.x > 378 ||
            tip.y > 830 ||
            this.ropeLength > 650
          ) {
            this.phase = 'retract'
          }
        } else if (this.phase === 'retract') {
          const retractSpeed =
            (285 + this.combo * 10) / (this.caught?.weight ?? 1)
          this.ropeLength -= retractSpeed * seconds
          if (this.ropeLength <= 62) {
            this.ropeLength = 62
            if (this.caught?.kind === 'ore') {
              this.score += this.caught.value
              this.caught.sprite.destroy()
              this.items = this.items.filter((item) => item !== this.caught)
              this.caught = null
              this.phase = 'swing'
              setHud((current) => ({
                ...current,
                score: this.score,
                hint: '发光矿石换成 20 分，继续找知识钻石',
              }))
            } else if (this.caught?.kind === 'chest') {
              this.collectTreasure()
            } else if (this.caught) {
              this.openQuestion()
            } else {
              this.phase = 'swing'
            }
          }
        }

        const tip = this.currentTip()
        this.rope.clear()
        const distance = Phaser.Math.Distance.Between(
          this.anchor.x,
          this.anchor.y,
          tip.x,
          tip.y,
        )
        const normal = new Phaser.Math.Vector2(
          -(tip.y - this.anchor.y),
          tip.x - this.anchor.x,
        ).normalize()
        const sway =
          this.phase === 'extend'
            ? Math.sin(this.launchElapsed * 8.4) *
              Math.max(0, 1 - this.launchElapsed / 1.4) *
              Math.min(14, distance * 0.025)
            : 0
        const control = new Phaser.Math.Vector2(
          (this.anchor.x + tip.x) / 2 + normal.x * sway,
          (this.anchor.y + tip.y) / 2 + normal.y * sway + Math.min(7, distance * 0.012),
        )
        const curve = new Phaser.Curves.QuadraticBezier(
          this.anchor.clone(),
          control,
          tip,
        )
        const ropePoints = curve.getPoints(18)
        this.rope.lineStyle(5, 0xc98b55, 0.95)
        this.rope.strokePoints(ropePoints, false)
        this.rope.lineStyle(2, 0xfff0cf, 0.8)
        this.rope.strokePoints(ropePoints, false)
        this.hook.setPosition(tip.x, tip.y)
        this.hook.setRotation(-Phaser.Math.DegToRad(this.ropeAngle()))
        if (this.caught) {
          const radians = Phaser.Math.DegToRad(this.ropeAngle())
          this.caught.sprite.setPosition(
            tip.x + Math.sin(radians) * 34,
            tip.y + Math.cos(radians) * 34,
          )
          this.caught.sprite.setRotation(-radians)
        }
      }
    }

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host,
      width: 390,
      height: 844,
      transparent: true,
      backgroundColor: '#150f2a',
      antialias: true,
      render: { powerPreference: 'high-performance' },
      scale: {
        mode: Phaser.Scale.ENVELOP,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 390,
        height: 844,
      },
      scene: CrystalMineScene,
    })

    return () => {
      controllerRef.current = null
      game.destroy(true)
    }
  }, [level.id, level.target, level.timeLimit, questionPool])

  return (
    <section className="miner-game" aria-label={`第 ${level.id} 关水晶矿洞`}>
      <div className="phaser-host" ref={gameHostRef} />
      <header className="mine-hud" aria-label="关卡信息">
        <div className="mine-hud-group">
          <div className="mine-info-box">
            <Flag size={16} />
            <span>
              <small>关卡</small>
              <strong>{level.id}/100</strong>
            </span>
          </div>
          <div className="mine-info-box">
            <Gem size={16} />
            <span>
              <small>知识宝石</small>
              <strong>{hud.correct}/{hud.target}</strong>
            </span>
          </div>
        </div>
        <div className="mine-hud-group">
          <div className="mine-info-box score-info-box">
            <Star size={16} />
            <span>
              <small>{hud.combo > 1 ? `连击 ×${hud.combo}` : '得分'}</small>
              <strong>{hud.score}</strong>
            </span>
          </div>
          <div className="mine-info-box time-info-box">
            <Clock3 size={16} />
            <span>
              <small>读秒</small>
              <strong>{hud.time}</strong>
            </span>
          </div>
        </div>
      </header>
      <div className="tap-ripple" aria-hidden="true">
        <span />
      </div>
      {activeQuestion && (
        <QuizOverlay
          key={activeQuestion.id}
          question={activeQuestion}
          onWrong={() =>
            {
              controllerRef.current?.wrongAttempt()
              onAnswerRef.current(activeQuestion, false, 0)
            }
          }
          onSolved={() => controllerRef.current?.resolveAnswer(true)}
        />
      )}
      {treasureReward && (
        <TreasureDialog
          reward={treasureReward}
          onConfirm={() => controllerRef.current?.resolveTreasure()}
        />
      )}
    </section>
  )
}
