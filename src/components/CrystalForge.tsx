import { ArrowLeft, Gem, Hammer, LockKeyhole, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { playNotes, speakUi } from '../audio'
import { gemMeta, type GemColor } from '../curriculum'
import { canForge, type MinerProgress } from '../storage'
import { CrystalStage, type ForgeShape } from './CrystalStage'

const shapeMeta: Record<ForgeShape, { name: string; icon: string }> = {
  bunny: { name: '水晶小兔', icon: '🐰' },
  cat: { name: '水晶小猫', icon: '🐱' },
  crown: { name: '公主水晶冠', icon: '👑' },
  butterfly: { name: '水晶蝴蝶', icon: '🦋' },
}

const allColors = Object.keys(gemMeta) as GemColor[]

export function CrystalForge({
  progress,
  onBack,
  onForged,
}: {
  progress: MinerProgress
  onBack: () => void
  onForged: (name: string) => void
}) {
  const [shape, setShape] = useState<ForgeShape>('bunny')
  const [hammering, setHammering] = useState(0)
  const [impact, setImpact] = useState(0)
  const finishedRef = useRef(false)
  const unlocked = canForge(progress)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void speakUi(unlocked ? 'forge-ready' : 'forge-locked')
    }, 450)
    return () => window.clearTimeout(timer)
  }, [unlocked])

  function hammer() {
    if (!unlocked || finishedRef.current) {
      return
    }
    const next = Math.min(
      100,
      hammering + 8 + Math.min(progress.forgeSparks, 4),
    )
    setHammering(next)
    setImpact((value) => value + 1)
    playNotes([240 + next * 2.6, 420 + next * 1.8], 0.055)
    navigator.vibrate?.(18)
    if (next >= 100) {
      finishedRef.current = true
      playNotes([523, 659, 784, 1047], 0.14)
      void speakUi('forge-complete')
      window.setTimeout(() => onForged(shapeMeta[shape].name), 900)
    }
  }

  function chooseShape(nextShape: ForgeShape) {
    if (hammering > 0) {
      return
    }
    setShape(nextShape)
    playNotes([480, 620], 0.07)
  }

  return (
    <section className="forge-scene" aria-label="五色水晶锻造工坊">
      <img src="assets/crystal-forge-v1.webp" className="forge-background" alt="" />
      <div className="forge-shade" />
      <header className="forge-header">
        <button type="button" className="icon-button" aria-label="返回矿场" onClick={onBack}>
          <ArrowLeft size={23} />
        </button>
        <div>
          <small>wǔ sè shuǐ jīng duàn zào</small>
          <strong>五色水晶锻造</strong>
        </div>
        <span className={unlocked ? 'unlocked' : ''}>
          {unlocked ? <Sparkles size={20} /> : <LockKeyhole size={20} />}
        </span>
      </header>

      <div className="forge-inventory">
        {allColors.map((color) => (
          <div key={color} style={{ '--gem-color': gemMeta[color].css } as React.CSSProperties}>
            <Gem size={19} />
            <b>{progress.inventory[color]}</b>
          </div>
        ))}
      </div>

      <div
        className={`forge-model ${impact ? 'impact' : ''}`}
        key={`impact-${impact}`}
        onPointerDown={hammer}
      >
        <CrystalStage
          colors={allColors}
          shape={unlocked ? shape : undefined}
          progress={hammering}
          environmentUrl={`${import.meta.env.BASE_URL}assets/crystal-forge-v1.webp`}
        />
        {impact > 0 && hammering < 100 && <span className="impact-burst" />}
      </div>

      {!unlocked ? (
        <div className="forge-locked-copy">
          <LockKeyhole size={26} />
          <strong>还需要集齐五种颜色</strong>
          <span>每通过一个关卡，矿山都会赠送一颗真正的彩钻。</span>
        </div>
      ) : (
        <>
          <div className="shape-selector" aria-label="选择锻造造型">
            {(Object.keys(shapeMeta) as ForgeShape[]).map((item) => (
              <button
                type="button"
                className={shape === item ? 'active' : ''}
                disabled={hammering > 0}
                key={item}
                onClick={() => chooseShape(item)}
              >
                <span>{shapeMeta[item].icon}</span>
                <strong>{shapeMeta[item].name}</strong>
              </button>
            ))}
          </div>
          <div className="forge-controls">
            <div className="forge-progress">
              <span style={{ width: `${hammering}%` }} />
            </div>
            <button type="button" onClick={hammer}>
              <Hammer size={23} />
              <span>{hammering ? `继续敲打 ${hammering}%` : '开始敲打钻石'}</span>
            </button>
          </div>
        </>
      )}
    </section>
  )
}
