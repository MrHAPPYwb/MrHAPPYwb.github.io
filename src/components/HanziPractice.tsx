import { useEffect, useRef, useState } from 'react'
import HanziWriter from 'hanzi-writer'
import { Brush, Eye, Sparkles, Volume2 } from 'lucide-react'
import { pinyin as toPinyin } from 'pinyin-pro'
import type { GlyphStep } from '../content'
import { loadLocalCharacterData } from '../hanziData'

type HanziPracticeProps = {
  character: string
  pinyin: string
  steps: GlyphStep[]
  onNarrate: (text: string) => void
  onStroke: (correct: boolean) => void
  onComplete: () => void
}

type PracticePhase = 'origin' | 'strokes' | 'practice' | 'done'

export function HanziPractice({
  character,
  pinyin,
  steps,
  onNarrate,
  onStroke,
  onComplete,
}: HanziPracticeProps) {
  const targetRef = useRef<HTMLDivElement>(null)
  const writerRef = useRef<HanziWriter | null>(null)
  const [phase, setPhase] = useState<PracticePhase>('origin')
  const [storyIndex, setStoryIndex] = useState(0)
  const [strokesLeft, setStrokesLeft] = useState<number | null>(null)

  useEffect(() => {
    const target = targetRef.current
    if (!target) {
      return
    }

    target.innerHTML = ''
    setPhase('origin')
    setStoryIndex(0)
    setStrokesLeft(null)

    const writer = HanziWriter.create(target, character, {
      width: 248,
      height: 248,
      padding: 14,
      showOutline: true,
      showCharacter: false,
      strokeColor: '#fff4cc',
      outlineColor: 'rgba(255, 244, 204, 0.34)',
      highlightColor: '#48f0d2',
      highlightCompleteColor: '#ffe16a',
      drawingColor: '#ff7a59',
      drawingWidth: 7,
      strokeAnimationSpeed: 1.15,
      delayBetweenStrokes: 320,
      charDataLoader: loadLocalCharacterData,
    })
    writerRef.current = writer

    const timers: number[] = []
    steps.forEach((step, index) => {
      timers.push(
        window.setTimeout(() => {
          setStoryIndex(index)
          onNarrate(step.text)
        }, index * 1450),
      )
    })

    timers.push(
      window.setTimeout(() => {
        setPhase('strokes')
        onNarrate(`现在看${character}字的笔顺。`)
        void writer.animateCharacter({
          onComplete: () => {
            setPhase('practice')
            onNarrate(`轮到你了。用手指写${character}。`)
            void writer.quiz({
              leniency: 1.35,
              showHintAfterMisses: 2,
              markStrokeCorrectAfterMisses: 5,
              highlightOnComplete: true,
              onCorrectStroke: (data) => {
                setStrokesLeft(data.strokesRemaining)
                onStroke(true)
              },
              onMistake: () => onStroke(false),
              onComplete: () => {
                setPhase('done')
                onNarrate(`${character}写好了，太棒了！`)
                window.setTimeout(onComplete, 500)
              },
            })
          },
        })
      }, steps.length * 1450 + 450),
    )

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
      writer.cancelQuiz()
      writerRef.current = null
    }
  }, [character, onComplete, onNarrate, onStroke, steps])

  const currentStep = steps[storyIndex]
  const status =
    phase === 'origin'
      ? '造字动画'
      : phase === 'strokes'
        ? '看笔顺'
        : phase === 'practice'
          ? strokesLeft === null
            ? '请动手写'
            : `还剩 ${strokesLeft} 笔`
          : '完成'

  return (
    <div className={`hanzi-ritual phase-${phase}`}>
      <div className="ritual-status" aria-live="polite">
        {phase === 'origin' ? (
          <Eye size={17} />
        ) : phase === 'practice' ? (
          <Brush size={17} />
        ) : phase === 'done' ? (
          <Sparkles size={17} />
        ) : (
          <Volume2 size={17} />
        )}
        <span>
          <small>{toPinyin(status)}</small>
          {status}
        </span>
      </div>

      <div className="carving-surface">
        <div className="hanzi-touch-stage" ref={targetRef} />
        {phase === 'origin' && (
          <div className="origin-film" key={`${character}-${storyIndex}`}>
            <span className="origin-shape">{currentStep.shape}</span>
            <strong>
              <small>{toPinyin(currentStep.title)}</small>
              {currentStep.title}
            </strong>
          </div>
        )}
        {phase === 'done' && (
          <div className="carving-seal">
            <strong>{character}</strong>
            <span>{pinyin}</span>
          </div>
        )}
      </div>

      <div className="origin-timeline" aria-label="造字动画进度">
        {steps.map((step, index) => (
          <span
            className={index <= storyIndex ? 'lit' : ''}
            key={`${step.title}-${index}`}
          />
        ))}
      </div>
    </div>
  )
}
