import { useEffect, useRef, useState } from 'react'
import HanziWriter from 'hanzi-writer'
import { pinyin } from 'pinyin-pro'
import { Brush, RotateCcw } from 'lucide-react'
import { loadLocalCharacterData } from '../hanziData'

type HanziPracticeProps = {
  character: string
}

export function HanziPractice({ character }: HanziPracticeProps) {
  const targetRef = useRef<HTMLDivElement>(null)
  const writerRef = useRef<HanziWriter | null>(null)
  const [quizReady, setQuizReady] = useState(false)
  const tone = pinyin(character, { toneType: 'symbol' })

  useEffect(() => {
    const target = targetRef.current
    if (!target) {
      return
    }

    target.innerHTML = ''
    setQuizReady(false)
    const writer = HanziWriter.create(target, character, {
      width: 142,
      height: 142,
      padding: 10,
      showOutline: true,
      showCharacter: false,
      strokeColor: '#0f172a',
      outlineColor: '#cbd5e1',
      highlightColor: '#f97316',
      drawingColor: '#0f766e',
      charDataLoader: loadLocalCharacterData,
    })

    writerRef.current = writer
    void writer.animateCharacter({
      onComplete: () => setQuizReady(true),
    })

    return () => {
      writer.cancelQuiz()
      writerRef.current = null
    }
  }, [character])

  function replay() {
    setQuizReady(false)
    void writerRef.current?.animateCharacter({
      onComplete: () => setQuizReady(true),
    })
  }

  function startQuiz() {
    setQuizReady(false)
    void writerRef.current?.quiz({
      leniency: 1.2,
      showHintAfterMisses: 2,
      highlightOnComplete: true,
      onComplete: () => setQuizReady(true),
    })
  }

  return (
    <div className="hanzi-practice" aria-label={`${character} 的笔顺练习`}>
      <div className="hanzi-stage" ref={targetRef} />
      <div className="hanzi-side">
        <strong>{character}</strong>
        <span>{tone}</span>
        <div className="tool-row">
          <button type="button" className="icon-button" onClick={replay}>
            <RotateCcw size={18} />
            <span>再看</span>
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={startQuiz}
            disabled={!quizReady}
          >
            <Brush size={18} />
            <span>描一描</span>
          </button>
        </div>
      </div>
    </div>
  )
}
