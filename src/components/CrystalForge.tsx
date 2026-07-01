import {
  ArrowLeft,
  Castle,
  Cat,
  Crown,
  Flower2,
  GalleryHorizontal,
  Gem,
  Hammer,
  Heart,
  LockKeyhole,
  Origami,
  Rabbit,
  Sparkles,
  Star,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { playForgeHit, playNotes, speakUi } from '../audio'
import { gemMeta, type GemColor } from '../curriculum'
import {
  forgeShapeMeta,
  forgeShapeOrder,
  type ForgedCreation,
  type ForgeShape,
} from '../forge'
import { canForge, type MinerProgress } from '../storage'
import { CrystalStage } from './CrystalStage'

const shapeIcons: Record<ForgeShape, LucideIcon> = {
  bunny: Rabbit,
  cat: Cat,
  crown: Crown,
  butterfly: Origami,
  heart: Heart,
  star: Star,
  castle: Castle,
  flower: Flower2,
}

const allColors = Object.keys(gemMeta) as GemColor[]
type ForgeView = 'forge' | 'result' | 'gallery'

export function CrystalForge({
  progress,
  onBack,
  onForged,
}: {
  progress: MinerProgress
  onBack: () => void
  onForged: (shape: ForgeShape) => Promise<ForgedCreation | undefined>
}) {
  const [shape, setShape] = useState<ForgeShape>('bunny')
  const [hammering, setHammering] = useState(0)
  const [impact, setImpact] = useState(0)
  const [swing, setSwing] = useState(0)
  const [view, setView] = useState<ForgeView>('forge')
  const [result, setResult] = useState<ForgedCreation | null>(null)
  const [selectedCreationId, setSelectedCreationId] = useState<string | null>(
    progress.forgedCreations.at(-1)?.id ?? null,
  )
  const finishedRef = useRef(false)
  const strikingRef = useRef(false)
  const timersRef = useRef<number[]>([])
  const qaMode = import.meta.env.DEV
    ? new URLSearchParams(window.location.search).get('qaForge')
    : null
  const qaReady = qaMode === 'ready' || qaMode === 'gallery'
  const visibleInventory = qaReady
    ? Object.fromEntries(allColors.map((color) => [color, 1])) as Record<GemColor, number>
    : progress.inventory
  const unlocked = qaReady || canForge(progress)
  const activeColorKey = allColors
    .filter((color) => visibleInventory[color] > 0)
    .join('|')
  const activeColors = useMemo(
    () => activeColorKey
      ? activeColorKey.split('|') as GemColor[]
      : [],
    [activeColorKey],
  )
  const qaCreations = useMemo(
    () => qaMode === 'gallery' && progress.forgedCreations.length === 0
      ? forgeShapeOrder.map((item, index) => ({
          id: `qa-${item}`,
          shape: item,
          name: forgeShapeMeta[item].name,
          forgedAt: Date.now() - index * 60_000,
        }))
      : [],
    [qaMode, progress.forgedCreations.length],
  )
  const creations = progress.forgedCreations.length
    ? progress.forgedCreations
    : qaCreations
  const selectedCreation = creations.find(
    (creation) => creation.id === selectedCreationId,
  ) ?? creations.at(-1)

  useEffect(() => {
    if (view !== 'forge') return
    const timer = window.setTimeout(() => {
      void speakUi(unlocked ? 'forge-ready' : 'forge-locked')
    }, 450)
    return () => window.clearTimeout(timer)
  }, [unlocked, view])

  useEffect(() => {
    if (!selectedCreationId && creations.length) {
      setSelectedCreationId(creations.at(-1)?.id ?? null)
    }
  }, [creations, selectedCreationId])

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  function schedule(callback: () => void, delay: number) {
    const timer = window.setTimeout(callback, delay)
    timersRef.current.push(timer)
  }

  function finishForge() {
    schedule(() => {
      void (async () => {
        const saved = await onForged(shape)
        const creation = saved ?? (qaReady
          ? {
              id: `qa-result-${shape}`,
              shape,
              name: forgeShapeMeta[shape].name,
              forgedAt: Date.now(),
            }
          : undefined)
        if (!creation) {
          finishedRef.current = false
          strikingRef.current = false
          return
        }
        setResult(creation)
        setSelectedCreationId(creation.id)
        setView('result')
        playNotes([523, 659, 784, 1047], 0.14)
        void speakUi('forge-complete')
      })()
    }, 620)
  }

  function hammer() {
    if (!unlocked || finishedRef.current || strikingRef.current || view !== 'forge') {
      return
    }
    strikingRef.current = true
    setSwing((value) => value + 1)
    schedule(() => {
      const next = Math.min(
        100,
        hammering + (qaReady ? 50 : 8 + Math.min(progress.forgeSparks, 4)),
      )
      setHammering(next)
      setImpact((value) => value + 1)
      playForgeHit(next / 100)
      navigator.vibrate?.([22, 18, 10])
      if (next >= 100) {
        finishedRef.current = true
        finishForge()
      } else {
        schedule(() => {
          strikingRef.current = false
        }, 150)
      }
    }, 170)
  }

  function chooseShape(nextShape: ForgeShape) {
    if (hammering > 0) return
    setShape(nextShape)
    playNotes([480, 620], 0.07)
  }

  function resetForge() {
    setHammering(0)
    setImpact(0)
    setSwing(0)
    setResult(null)
    finishedRef.current = false
    strikingRef.current = false
    setView('forge')
  }

  function openGallery(creation?: ForgedCreation) {
    if (hammering > 0 && !finishedRef.current) return
    if (creation) setSelectedCreationId(creation.id)
    else if (!selectedCreationId) {
      setSelectedCreationId(creations.at(-1)?.id ?? null)
    }
    setView('gallery')
  }

  const headerTitle = view === 'gallery'
    ? '水晶作品陈列馆'
    : view === 'result'
      ? '新作品揭幕'
      : '五色水晶锻造'

  return (
    <section className={`forge-scene forge-view-${view}`} aria-label={headerTitle}>
      <img src="assets/crystal-forge-v1.webp" className="forge-background" alt="" />
      <div className="forge-shade" />
      <header className="forge-header">
        <button
          type="button"
          className="icon-button"
          aria-label={view === 'forge' ? '返回矿场' : '返回锻造台'}
          onClick={view === 'forge' ? onBack : resetForge}
        >
          <ArrowLeft size={23} />
        </button>
        <div>
          <small>{view === 'gallery' ? 'zuò pǐn chén liè guǎn' : 'wǔ sè shuǐ jīng duàn zào'}</small>
          <strong>{headerTitle}</strong>
        </div>
        <button
          type="button"
          className="forge-gallery-button"
          aria-label={view === 'gallery' ? '返回锻造' : '打开作品陈列馆'}
          disabled={view === 'forge' && hammering > 0}
          onClick={view === 'gallery' ? resetForge : () => openGallery(result ?? undefined)}
        >
          {view === 'gallery' ? <Hammer size={20} /> : <GalleryHorizontal size={20} />}
          <b>{creations.length}</b>
        </button>
      </header>

      {view === 'forge' && (
        <>
          <div className="forge-inventory" aria-label="五色钻石库存">
            {allColors.map((color) => {
              const count = visibleInventory[color]
              return (
                <div
                  className={count > 0 ? 'gem-lit' : 'gem-dim'}
                  key={color}
                  aria-label={`${gemMeta[color].name} ${count} 颗`}
                  style={{ '--gem-color': gemMeta[color].css } as CSSProperties}
                >
                  <Gem size={18} />
                  <b>{count}</b>
                </div>
              )
            })}
          </div>

          <div
            className="forge-model"
            onPointerDown={hammer}
          >
            <CrystalStage
              colors={allColors}
              activeColors={activeColors}
              shape={unlocked ? shape : undefined}
              progress={hammering}
              environmentUrl={`${import.meta.env.BASE_URL}assets/crystal-forge-v1.webp`}
            />
            {unlocked && (
              <img
                src={`${import.meta.env.BASE_URL}assets/forge-hammer-v1.png`}
                className={`forge-striking-hammer ${swing ? 'swinging' : ''}`}
                key={`swing-${swing}`}
                alt=""
              />
            )}
            {impact > 0 && hammering < 100 && (
              <div className="impact-sparks" aria-hidden="true">
                <Sparkles size={34} />
                <Sparkles size={24} />
                <Sparkles size={20} />
              </div>
            )}
          </div>

          {!unlocked ? (
            <div className="forge-locked-copy">
              <LockKeyhole size={26} />
              <strong>还需要集齐五种颜色</strong>
              <span>灰暗钻石会在闯关获得后逐颗点亮。</span>
            </div>
          ) : (
            <>
              <div className="shape-selector" aria-label="选择锻造造型">
                {forgeShapeOrder.map((item) => {
                  const ShapeIcon = shapeIcons[item]
                  return (
                    <button
                      type="button"
                      className={shape === item ? 'active' : ''}
                      disabled={hammering > 0}
                      key={item}
                      onClick={() => chooseShape(item)}
                    >
                      <ShapeIcon size={23} />
                      <strong>{forgeShapeMeta[item].name}</strong>
                    </button>
                  )
                })}
              </div>
              <div className="forge-controls">
                <div className="forge-progress" aria-label={`锻造进度 ${hammering}%`}>
                  <span style={{ width: `${hammering}%` }} />
                </div>
                <button type="button" onClick={hammer}>
                  <Hammer size={23} />
                  <span>{hammering ? `继续锤炼 ${hammering}%` : '挥锤锻造钻石'}</span>
                </button>
              </div>
            </>
          )}
        </>
      )}

      {view === 'result' && result && (
        <div className="forge-result" role="dialog" aria-label="锻造成果">
          <div className="forge-result-stage">
            <CrystalStage
              colors={allColors}
              shape={result.shape}
              progress={100}
              environmentUrl={`${import.meta.env.BASE_URL}assets/crystal-forge-v1.webp`}
            />
          </div>
          <div className="forge-result-copy">
            <Sparkles size={27} />
            <small>研姐亲手锻造成功</small>
            <strong>{result.name}</strong>
            <span>{forgeShapeMeta[result.shape].description}</span>
          </div>
          <div className="forge-result-actions">
            <button type="button" onClick={() => openGallery(result)}>
              <GalleryHorizontal size={20} />
              <span>放入陈列馆查看</span>
            </button>
            <button type="button" onClick={onBack}>
              返回矿场
            </button>
          </div>
        </div>
      )}

      {view === 'gallery' && (
        <div className="forge-gallery">
          {selectedCreation ? (
            <>
              <div className="gallery-stage">
                <CrystalStage
                  colors={allColors}
                  shape={selectedCreation.shape}
                  progress={100}
                  environmentUrl={`${import.meta.env.BASE_URL}assets/crystal-forge-v1.webp`}
                />
              </div>
              <div className="gallery-caption">
                <small>研姐的第 {creations.findIndex((item) => item.id === selectedCreation.id) + 1} 件作品</small>
                <strong>{selectedCreation.name}</strong>
                <span>{forgeShapeMeta[selectedCreation.shape].description}</span>
              </div>
              <div className="gallery-strip" aria-label="作品列表">
                {creations.map((creation) => {
                  const CreationIcon = shapeIcons[creation.shape]
                  return (
                    <button
                      type="button"
                      className={creation.id === selectedCreation.id ? 'active' : ''}
                      key={creation.id}
                      onClick={() => setSelectedCreationId(creation.id)}
                    >
                      <CreationIcon size={22} />
                      <strong>{creation.name}</strong>
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="gallery-empty">
              <GalleryHorizontal size={50} />
              <strong>陈列馆正在等待第一件作品</strong>
              <span>集齐五色钻石后，就能把亲手锻造的作品永久收藏在这里。</span>
              <button type="button" onClick={resetForge}>
                <Hammer size={20} />
                <span>去锻造第一件作品</span>
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
