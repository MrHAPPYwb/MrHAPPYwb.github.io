import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import { Check, Clock3, Gem, Sparkles, Volume2, X } from 'lucide-react'
import { playNotes, speak, speakEnglishThenChinese } from '../audio'
import {
  gemMeta,
  questionsForLevel,
  type GemColor,
  type Level,
  type Question,
} from '../curriculum'
import { renderGemTexture } from '../gem3d'

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
}

const gemColors = Object.keys(gemMeta) as GemColor[]

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
      if (question.subject === 'english') {
        void speakEnglishThenChinese(
          question.spoken ?? question.prompt,
          question.translation ?? question.prompt,
        )
      } else {
        void speak(question.prompt)
      }
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
      void speak(`再想一想。${question.explain}`)
      window.setTimeout(() => {
        setPicked('')
      }, 650)
      return
    }
    setResolved(true)
    playNotes([523, 659, 784], 0.11)
    if (question.subject === 'english') {
      void speakEnglishThenChinese(
        question.spoken ?? question.answer,
        `答对了。${question.explain}`,
      )
    } else {
      void speak(`答对了。${question.explain}`)
    }
    window.setTimeout(onSolved, 900)
  }

  function replay() {
    if (question.subject === 'english') {
      void speakEnglishThenChinese(
        question.spoken ?? question.prompt,
        question.translation ?? question.prompt,
      )
    } else {
      void speak(question.prompt)
    }
  }

  return (
    <div className="quiz-veil" role="dialog" aria-label="钻石知识挑战">
      <div className={`quiz-crystal subject-${question.subject}`}>
        <div className="quiz-subject">
          <Gem size={18} />
          <span>
            {question.subject === 'chinese'
              ? '语文晶核'
              : question.subject === 'math'
                ? '数学晶核'
                : 'English Gem'}
          </span>
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

export function MinerGame({
  level,
  weakQuestionIds,
  onAnswer,
  onComplete,
}: {
  level: Level
  weakQuestionIds: string[]
  onAnswer: (question: Question, correct: boolean, combo: number) => void
  onComplete: (score: number) => void
}) {
  const gameHostRef = useRef<HTMLDivElement>(null)
  const controllerRef = useRef<SceneController | null>(null)
  const onAnswerRef = useRef(onAnswer)
  const onCompleteRef = useRef(onComplete)
  onAnswerRef.current = onAnswer
  onCompleteRef.current = onComplete
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null)
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
    setHud({
      correct: 0,
      target: level.target,
      combo: 0,
      score: 0,
      time: level.timeLimit,
      hint: '点击矿洞，发射抓钩',
    })

    type MineItem = {
      sprite: Phaser.GameObjects.Image
      color?: GemColor
      radius: number
      weight: number
      value: number
      isRock: boolean
    }

    class CrystalMineScene extends Phaser.Scene {
      private rope!: Phaser.GameObjects.Graphics
      private hook!: Phaser.GameObjects.Container
      private items: MineItem[] = []
      private anchor = new Phaser.Math.Vector2(195, 156)
      private angle = -52
      private angleDirection = 1
      private ropeLength = 76
      private phase: 'swing' | 'extend' | 'retract' | 'quiz' | 'done' = 'swing'
      private caught: MineItem | null = null
      private correct = 0
      private combo = 0
      private score = 0
      private remaining = level.timeLimit
      private lastSecond = level.timeLimit
      private questionIndex = 0
      private completing = false

      preload() {
        this.load.image('crystal-mine-bg', 'assets/crystal-mine-v1.webp')
      }

      create() {
        const background = this.add.image(195, 422, 'crystal-mine-bg')
        background.setDisplaySize(390, 844)
        background.setDepth(-5)

        gemColors.forEach((color) => {
          if (!this.textures.exists(`gem-${color}`)) {
            this.textures.addCanvas(
              `gem-${color}`,
              renderGemTexture(gemMeta[color].hex, 180),
              true,
            )
          }
        })
        this.createRockTexture()
        this.createHook()
        this.spawnField()

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          if (pointer.y < 112 || this.phase !== 'swing') {
            return
          }
          this.phase = 'extend'
          setHud((current) => ({ ...current, hint: '抓钩出发！' }))
          playNotes([310, 420], 0.07)
        })

        controllerRef.current = {
          resolveAnswer: (correct) => this.resolveAnswer(correct),
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

      private createRockTexture() {
        if (this.textures.exists('mine-rock')) {
          return
        }
        const graphics = this.make.graphics({ x: 0, y: 0 })
        graphics.fillStyle(0x49394f, 1)
        graphics.fillEllipse(50, 44, 90, 72)
        graphics.fillStyle(0x77637b, 0.9)
        graphics.fillEllipse(38, 31, 44, 27)
        graphics.fillStyle(0xb49caf, 0.55)
        graphics.fillCircle(30, 25, 7)
        graphics.lineStyle(4, 0xe2c9e2, 0.35)
        graphics.strokeEllipse(50, 44, 88, 70)
        graphics.generateTexture('mine-rock', 100, 88)
        graphics.destroy()
      }

      private createHook() {
        this.rope = this.add.graphics().setDepth(9)
        const hookGraphics = this.add.graphics()
        hookGraphics.fillStyle(0xffd8a6, 1)
        hookGraphics.fillCircle(0, 0, 10)
        hookGraphics.lineStyle(6, 0xf0b46f, 1)
        hookGraphics.beginPath()
        hookGraphics.arc(-7, 8, 16, 0.1, 1.72, false)
        hookGraphics.strokePath()
        hookGraphics.beginPath()
        hookGraphics.arc(7, 8, 16, 1.42, 3.04, false)
        hookGraphics.strokePath()
        hookGraphics.lineStyle(2, 0xffffff, 0.75)
        hookGraphics.strokeCircle(-3, -4, 4)
        this.hook = this.add.container(this.anchor.x, this.anchor.y + 76, [
          hookGraphics,
        ])
        this.hook.setDepth(10)
      }

      private spawnField() {
        this.items.forEach((item) => item.sprite.destroy())
        this.items = []
        const positions: Array<{ x: number; y: number }> = []
        const itemCount = 10
        for (let index = 0; index < itemCount; index += 1) {
          let x = 70
          let y = 350
          let attempts = 0
          do {
            x = Phaser.Math.Between(48, 342)
            y = Phaser.Math.Between(300, 760)
            attempts += 1
          } while (
            attempts < 30 &&
            positions.some((position) => Phaser.Math.Distance.Between(x, y, position.x, position.y) < 92)
          )
          positions.push({ x, y })

          const isRock = index >= 7
          const color = isRock
            ? undefined
            : gemColors[(index + level.id) % gemColors.length]
          const sprite = this.add.image(
            x,
            y,
            isRock ? 'mine-rock' : `gem-${color}`,
          )
          const scale = isRock
            ? Phaser.Math.FloatBetween(0.54, 0.78)
            : Phaser.Math.FloatBetween(0.34, 0.48)
          sprite.setScale(scale)
          sprite.setDepth(3 + Math.round(y / 200))
          if (!isRock) {
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
            radius: isRock ? 36 * scale : 64 * scale,
            weight: isRock ? 2.4 : 1,
            value: isRock ? 15 : 100,
            isRock,
          })
        }
      }

      private currentTip() {
        const radians = Phaser.Math.DegToRad(this.angle)
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
        playNotes(item.isRock ? [170] : [620, 810], item.isRock ? 0.12 : 0.08)
        setHud((current) => ({
          ...current,
          hint: item.isRock ? '抓到石头，有点重！' : '抓到知识钻石！',
        }))
      }

      private openQuestion() {
        const question = questionPool[this.questionIndex % questionPool.length]
        this.questionIndex += 1
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
        const question = questionPool[(this.questionIndex - 1) % questionPool.length]
        if (correct) {
          this.correct += 1
          this.combo += 1
          this.score += 100 + Math.max(0, this.combo - 1) * 20
          this.cameras.main.flash(180, 255, 235, 140, false)
        } else {
          this.combo = 0
        }
        onAnswerRef.current(question, correct, this.combo)
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
        if (this.items.filter((item) => !item.isRock).length < 3) {
          this.spawnField()
        }
        this.phase = 'swing'
      }

      update(_time: number, delta: number) {
        if (this.phase === 'done') {
          return
        }
        const seconds = delta / 1000
        if (this.phase !== 'quiz') {
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

        const swingSpeed = 42 + Math.min(this.combo, 5) * 3
        if (this.phase === 'swing') {
          this.angle += this.angleDirection * swingSpeed * seconds
          if (this.angle > 58 || this.angle < -58) {
            this.angle = Phaser.Math.Clamp(this.angle, -58, 58)
            this.angleDirection *= -1
          }
        } else if (this.phase === 'extend') {
          this.ropeLength += (470 + this.combo * 20) * seconds
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
            this.ropeLength > 690
          ) {
            this.phase = 'retract'
          }
        } else if (this.phase === 'retract') {
          const retractSpeed =
            (560 + this.combo * 22) / (this.caught?.weight ?? 1)
          this.ropeLength -= retractSpeed * seconds
          if (this.ropeLength <= 76) {
            this.ropeLength = 76
            if (this.caught?.isRock) {
              this.score += this.caught.value
              this.caught.sprite.destroy()
              this.items = this.items.filter((item) => item !== this.caught)
              this.caught = null
              this.phase = 'swing'
              setHud((current) => ({
                ...current,
                score: this.score,
                hint: '石头换成 15 分，继续找钻石',
              }))
            } else if (this.caught) {
              this.openQuestion()
            } else {
              this.phase = 'swing'
            }
          }
        }

        const tip = this.currentTip()
        this.rope.clear()
        this.rope.lineStyle(4, 0xffd79b, 1)
        this.rope.lineBetween(this.anchor.x, this.anchor.y, tip.x, tip.y)
        this.rope.lineStyle(1.5, 0xffffff, 0.65)
        this.rope.lineBetween(this.anchor.x - 1, this.anchor.y, tip.x - 1, tip.y)
        this.hook.setPosition(tip.x, tip.y)
        this.hook.setRotation(-Phaser.Math.DegToRad(this.angle))
        if (this.caught) {
          this.caught.sprite.setPosition(tip.x, tip.y + 20)
          this.caught.sprite.setRotation(-Phaser.Math.DegToRad(this.angle))
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
        mode: Phaser.Scale.FIT,
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
      <header className="miner-hud">
        <div className="level-pill">
          <small>LEVEL</small>
          <strong>{level.id}/100</strong>
        </div>
        <div className="target-pill">
          <Gem size={19} />
          <span>
            <small>{level.skill}</small>
            <strong>{hud.correct}/{hud.target}</strong>
          </span>
        </div>
        <div className="time-pill">
          <Clock3 size={18} />
          <strong>{hud.time}</strong>
        </div>
      </header>
      <div className="miner-status">
        <span>{hud.hint}</span>
        <b>{hud.combo > 1 ? `COMBO ×${hud.combo}` : `${hud.score} 分`}</b>
      </div>
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
    </section>
  )
}
