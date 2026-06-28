import { ArrowLeft, Sparkles, Volume2 } from 'lucide-react'
import { pinyin } from 'pinyin-pro'

export function PinyinLine({
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

export function SceneHeader({
  title,
  subtitle,
  level,
  total,
  reward,
  onBack,
}: {
  title: string
  subtitle: string
  level?: number
  total?: number
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
          {level && total ? `${level}/${total} · ` : ''}
          {title}
        </strong>
      </div>
      <div className="reward-token" aria-label={`奖励 ${reward} 颗星`}>
        <Sparkles size={17} />
        <span>{reward}</span>
      </div>
    </header>
  )
}

export function NpcDialogue({
  portrait,
  text,
  onSpeak,
  className = '',
}: {
  portrait: string
  text: string
  onSpeak: () => void
  className?: string
}) {
  return (
    <div className={`npc-dialogue ${className}`}>
      <span className="npc-portrait" aria-hidden="true">
        {portrait}
      </span>
      <PinyinLine text={text} onSpeak={onSpeak} />
    </div>
  )
}
