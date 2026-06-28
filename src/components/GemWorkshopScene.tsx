import { Check, Gem, Hammer, Sparkles, Volume2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { playNotes, speak, speakEnglishThenChinese } from '../audio'
import { NpcDialogue, SceneHeader } from './GameUI'

type Recipe = {
  name: string
  character: string
  riddle: string
  chineseOptions: string[]
  red: number
  blue: number
  word: string
  color: string
}

const recipes: Recipe[] = [
  {
    name: '研姐的星光晶石',
    character: '晶',
    riddle: '三个“日”叠在一起，表示明亮。请选择这个字。',
    chineseOptions: ['晶', '森', '品'],
    red: 3,
    blue: 2,
    word: 'GEM',
    color: '#66e7ff',
  },
  {
    name: '研姐的红玉宝石',
    character: '玉',
    riddle: '“王”字加一点，像珍贵的美玉。请选择这个字。',
    chineseOptions: ['玉', '主', '王'],
    red: 4,
    blue: 3,
    word: 'RUBY',
    color: '#ff5f87',
  },
  {
    name: '研姐的银河星石',
    character: '星',
    riddle: '太阳的“日”和出生的“生”合在一起，变成夜空的什么字？',
    chineseOptions: ['星', '早', '明'],
    red: 5,
    blue: 4,
    word: 'STAR',
    color: '#ffd45d',
  },
]

export function GemWorkshopScene({
  recipeIndex,
  onBack,
  onComplete,
}: {
  recipeIndex: number
  onBack: () => void
  onComplete: (name: string) => void
}) {
  const recipe = recipes[recipeIndex % recipes.length]
  const [stage, setStage] = useState<'name' | 'measure' | 'spell' | 'polish'>('name')
  const [message, setMessage] = useState(`宝石师：${recipe.riddle}`)
  const [red, setRed] = useState(0)
  const [blue, setBlue] = useState(0)
  const [letters, setLetters] = useState<string[]>([])
  const [polish, setPolish] = useState(0)
  const lastPolishRef = useRef({ x: 0, y: 0 })
  const polishingRef = useRef(false)

  useEffect(() => {
    const timer = window.setTimeout(
      () => void speak(`研姐，欢迎来到宝石工坊。${recipe.riddle}`),
      550,
    )
    return () => window.clearTimeout(timer)
  }, [recipe])

  function chooseCharacter(option: string) {
    if (option !== recipe.character) {
      setMessage('宝石师：观察字的组成，再试一次。')
      void speak(recipe.riddle)
      playNotes([190], 0.12)
      return
    }
    setStage('measure')
    setMessage(
      `宝石师：读对了！现在取 ${recipe.red} 颗红晶和 ${recipe.blue} 颗蓝晶，一共要几颗？`,
    )
    void speak(
      `读对了。现在请取${recipe.red}颗红晶和${recipe.blue}颗蓝晶，再算一共几颗。`,
    )
    playNotes([523, 659], 0.1)
  }

  function addOre(kind: 'red' | 'blue') {
    if (kind === 'red') {
      setRed((value) => Math.min(value + 1, recipe.red + 1))
    } else {
      setBlue((value) => Math.min(value + 1, recipe.blue + 1))
    }
    playNotes([kind === 'red' ? 620 : 440], 0.07)
  }

  function fuse() {
    if (red !== recipe.red || blue !== recipe.blue) {
      setMessage(
        `宝石师：配方是 ${recipe.red} 颗红晶和 ${recipe.blue} 颗蓝晶。点错了可以点托盘清空。`,
      )
      void speak(`请数一数。红晶要${recipe.red}颗，蓝晶要${recipe.blue}颗。`)
      playNotes([180, 160], 0.1)
      return
    }
    setStage('spell')
    setMessage(`宝石师：熔炼成功！Listen and build the word: ${recipe.word}.`)
    void speakEnglishThenChinese(
      `Build the word ${recipe.word}.`,
      `请按顺序拼出单词${recipe.word}。`,
    )
    playNotes([420, 560, 720], 0.13)
  }

  const scrambled = [...recipe.word.slice(1), recipe.word[0]]

  function pickLetter(letter: string, index: number) {
    const expected = recipe.word[letters.length]
    if (letter !== expected) {
      void speakEnglishThenChinese(
        `Listen again. ${recipe.word}.`,
        `再听一遍，下一颗字母宝石不是${letter}。`,
      )
      playNotes([190], 0.12)
      return
    }
    const next = [...letters, `${letter}-${index}`]
    setLetters(next)
    playNotes([520 + next.length * 55], 0.08)
    if (next.length === recipe.word.length) {
      setStage('polish')
      setMessage('宝石师：最后一步，用手指来回擦亮你制造的宝石！')
      void speak('最后一步。请用手指来回擦亮你亲手制造的宝石。')
    }
  }

  function rub(event: React.PointerEvent<HTMLDivElement>) {
    if (event.type === 'pointerdown') {
      event.currentTarget.setPointerCapture(event.pointerId)
      polishingRef.current = true
      lastPolishRef.current = { x: event.clientX, y: event.clientY }
      return
    }
    if (!polishingRef.current) {
      return
    }
    const distance =
      Math.abs(event.clientX - lastPolishRef.current.x) +
      Math.abs(event.clientY - lastPolishRef.current.y)
    if (distance > 22) {
      lastPolishRef.current = { x: event.clientX, y: event.clientY }
      setPolish((value) => {
        const next = Math.min(10, value + 1)
        playNotes([650 + next * 24], 0.04)
        if (next === 10) {
          window.setTimeout(() => onComplete(recipe.name), 700)
          void speak(`${recipe.name}制造完成。这颗宝石里有语文、数学和英语的力量。`)
        }
        return next
      })
    }
  }

  return (
    <section className={`scene interior-scene gem-scene gem-stage-${stage}`} aria-label="研姐的宝石工坊">
      <img className="scene-art" src="assets/gem-workshop-v1.webp" alt="" />
      <div className="interior-vignette" />
      <SceneHeader
        title="亲手制造宝石"
        subtitle={`融合配方 ${recipeIndex % recipes.length + 1}/3`}
        reward={5}
        onBack={onBack}
      />
      <NpcDialogue
        portrait="👩🏻‍🏭"
        text={message}
        onSpeak={() =>
          stage === 'spell'
            ? void speakEnglishThenChinese(
                `Build the word ${recipe.word}.`,
                `请按顺序拼出单词${recipe.word}。`,
              )
            : void speak(message.replace('宝石师：', ''))
        }
        className="gem-dialogue"
      />

      {stage === 'name' && (
        <div className="gem-language-station">
          <div className="ancient-riddle">
            <span>甲骨秘纹</span>
            <strong>{recipe.riddle}</strong>
          </div>
          <div className="rune-options">
            {recipe.chineseOptions.map((option) => (
              <button type="button" key={option} onClick={() => chooseCharacter(option)}>
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {stage === 'measure' && (
        <div className="ore-station">
          <div className="ore-equation">
            <span>{red}</span>
            <b>+</b>
            <span>{blue}</span>
            <b>=</b>
            <strong>{red + blue}</strong>
          </div>
          <div className="ore-trays">
            <button type="button" className="red-ore" onClick={() => addOre('red')}>
              <Gem size={34} />
              <strong>红晶 {red}/{recipe.red}</strong>
            </button>
            <button type="button" className="blue-ore" onClick={() => addOre('blue')}>
              <Gem size={34} />
              <strong>蓝晶 {blue}/{recipe.blue}</strong>
            </button>
          </div>
          <div className="ore-actions">
            <button
              type="button"
              onClick={() => {
                setRed(0)
                setBlue(0)
              }}
            >
              清空托盘
            </button>
            <button type="button" className="fuse-button" onClick={fuse}>
              <Sparkles size={18} />
              开始熔炼
            </button>
          </div>
        </div>
      )}

      {stage === 'spell' && (
        <div className="gem-spell-station">
          <button
            type="button"
            className="word-listen"
            onClick={() =>
              void speakEnglishThenChinese(
                `${recipe.word}. Build the word ${recipe.word}.`,
                `请拼出${recipe.word}。`,
              )
            }
          >
            <Volume2 size={20} />
            <span>{recipe.word}</span>
          </button>
          <div className="gem-word-lock">
            {recipe.word.split('').map((letter, index) => (
              <span key={`${letter}-${index}`}>
                {letters[index]?.split('-')[0] ?? ''}
              </span>
            ))}
          </div>
          <div className="gem-letter-bank">
            {scrambled.map((letter, index) => {
              const used = letters.includes(`${letter}-${index}`)
              return (
                <button
                  type="button"
                  className={used ? 'used' : ''}
                  disabled={used}
                  key={`${letter}-${index}`}
                  onClick={() => pickLetter(letter, index)}
                >
                  {letter}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {stage === 'polish' && (
        <div className="polish-station">
          <div
            className="raw-gem"
            style={{
              '--gem-color': recipe.color,
              '--polish': `${30 + polish * 7}%`,
            } as React.CSSProperties}
            onPointerDown={rub}
            onPointerMove={rub}
            onPointerUp={() => {
              polishingRef.current = false
            }}
            onPointerCancel={() => {
              polishingRef.current = false
            }}
          >
            <Gem size={122} />
            {polish >= 10 && <Check className="gem-check" size={38} />}
          </div>
          <div className="polish-meter">
            <span style={{ width: `${polish * 10}%` }} />
          </div>
          <strong>
            <Hammer size={18} />
            用手指来回擦亮 {polish * 10}%
          </strong>
        </div>
      )}
    </section>
  )
}
