import { Check, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { playNotes, speak } from '../audio'
import type { ChoiceChallenge } from '../content'
import { NpcDialogue } from './GameUI'

export function ChoiceQuest({
  challenge,
  npcName,
  portrait,
  onComplete,
}: {
  challenge: ChoiceChallenge
  npcName: string
  portrait: string
  onComplete: (message: string) => void
}) {
  const [selected, setSelected] = useState('')
  const [message, setMessage] = useState(`${npcName}：${challenge.story}`)
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    const text = `${challenge.story}${challenge.question}`
    const timer = window.setTimeout(() => void speak(text), 550)
    return () => window.clearTimeout(timer)
  }, [challenge])

  function answer(option: string) {
    if (locked) {
      return
    }
    setSelected(option)
    if (option !== challenge.answer) {
      const next = `${npcName}：再观察一次，你已经很接近了。`
      setMessage(next)
      void speak(`${challenge.question}。再想一想。`)
      playNotes([190, 170], 0.12)
      return
    }

    setLocked(true)
    setMessage(`${npcName}：${challenge.explanation}`)
    void speak(`答对了。${challenge.explanation}`)
    playNotes([523, 659, 784], 0.13)
    window.setTimeout(
      () => onComplete(`${challenge.explanation} 知识宝石点亮了！`),
      1200,
    )
  }

  return (
    <div className="choice-quest">
      <NpcDialogue
        portrait={portrait}
        text={message}
        onSpeak={() => void speak(message.replace(`${npcName}：`, ''))}
      />
      <div className="challenge-stage">
        <span className="challenge-unit">{challenge.visual}</span>
        <div className="challenge-question">
          <small>qǐng xuǎn zé</small>
          <strong>{challenge.question}</strong>
        </div>
        <div
          className={`choice-grid options-${challenge.options.length}`}
          aria-label="选择答案"
        >
          {challenge.options.map((option) => (
            <button
              type="button"
              className={`${selected === option ? 'selected' : ''} ${
                locked && option === challenge.answer ? 'correct' : ''
              }`}
              key={option}
              onClick={() => answer(option)}
            >
              {locked && option === challenge.answer ? (
                <Check size={20} />
              ) : (
                <Sparkles size={16} />
              )}
              <span>{option}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
