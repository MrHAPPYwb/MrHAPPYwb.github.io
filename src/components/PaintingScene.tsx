import { Brush, Check, Eraser, RotateCcw, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { playNotes, speak } from '../audio'
import { NpcDialogue, SceneHeader } from './GameUI'

const colors = ['#ef476f', '#ff8a00', '#ffd166', '#16a085', '#119ddd', '#7b4dcc']
const prompts = ['画一颗会发光的宝石', '画彩虹下的小花园', '画研姐想象中的魔法小屋']

export function PaintingScene({
  paintingNumber,
  onBack,
  onComplete,
}: {
  paintingNumber: number
  onBack: () => void
  onComplete: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef({ x: 0, y: 0 })
  const marksRef = useRef(0)
  const [color, setColor] = useState(colors[0])
  const [width, setWidth] = useState(8)
  const [marks, setMarks] = useState(0)
  const prompt = prompts[paintingNumber % prompts.length]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const rect = canvas.getBoundingClientRect()
    const scale = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.max(1, Math.round(rect.width * scale))
    canvas.height = Math.max(1, Math.round(rect.height * scale))
    const context = canvas.getContext('2d')
    context?.scale(scale, scale)
    context?.clearRect(0, 0, rect.width, rect.height)
    const timer = window.setTimeout(
      () => void speak(`研姐，欢迎来到绘画花园。今天请你${prompt}。`),
      500,
    )
    return () => window.clearTimeout(timer)
  }, [prompt])

  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  function start(event: React.PointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)
    drawingRef.current = true
    lastPointRef.current = point(event)
    marksRef.current += 1
    setMarks(marksRef.current)
    playNotes([460], 0.04)
  }

  function startMouse(event: React.MouseEvent<HTMLCanvasElement>) {
    if (drawingRef.current) {
      return
    }
    drawingRef.current = true
    lastPointRef.current = point(event as unknown as React.PointerEvent<HTMLCanvasElement>)
    marksRef.current += 1
    setMarks(marksRef.current)
  }

  function markTap() {
    if (marksRef.current === 0) {
      marksRef.current = 1
      setMarks(1)
    }
  }

  function move(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) {
      return
    }
    const context = event.currentTarget.getContext('2d')
    const next = point(event)
    if (!context) {
      return
    }
    context.beginPath()
    context.moveTo(lastPointRef.current.x, lastPointRef.current.y)
    context.lineTo(next.x, next.y)
    context.strokeStyle = color
    context.lineWidth = width
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.stroke()
    lastPointRef.current = next
  }

  function stop() {
    drawingRef.current = false
  }

  function clear() {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (canvas && context) {
      const rect = canvas.getBoundingClientRect()
      context.clearRect(0, 0, rect.width, rect.height)
    }
    setMarks(0)
    marksRef.current = 0
    playNotes([260, 220], 0.08)
  }

  function finish() {
    if (marksRef.current < 1) {
      void speak('先在画布上多画几笔，再把作品变成颜色宝石。')
      return
    }
    const dataUrl = canvasRef.current?.toDataURL('image/webp', 0.72)
    if (dataUrl) {
      try {
        window.localStorage.setItem('yanjie-latest-painting', dataUrl)
      } catch {
        // The drawing still completes if private browsing limits storage.
      }
    }
    playNotes([523, 659, 784, 1047], 0.13)
    void speak('画完成了！你的颜色变成了两份宝石粉。')
    onComplete()
  }

  return (
    <section className="scene interior-scene painting-scene" aria-label="魔法绘画花园">
      <img className="scene-art" src="assets/painting-garden-v1.webp" alt="" />
      <div className="interior-vignette" />
      <SceneHeader
        title="魔法绘画花园"
        subtitle={`研姐的第 ${paintingNumber + 1} 幅作品`}
        reward={2}
        onBack={onBack}
      />
      <NpcDialogue
        portrait="🧚‍♀️"
        text={`颜色精灵：${prompt}，没有标准答案。`}
        onSpeak={() => void speak(`研姐，${prompt}。大胆画出你想到的样子。`)}
        className="painting-dialogue"
      />
      <canvas
        ref={canvasRef}
        className="paint-canvas"
        data-marks={marks}
        aria-label="用手指绘画的画布"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={stop}
        onPointerCancel={stop}
        onMouseDown={startMouse}
        onMouseUp={stop}
        onClick={markTap}
      />
      <div className="painting-tools">
        <div className="paint-swatches" aria-label="选择颜色">
          {colors.map((item) => (
            <button
              type="button"
              aria-label={`选择颜色 ${item}`}
              className={color === item ? 'active' : ''}
              style={{ background: item }}
              key={item}
              onClick={() => {
                setColor(item)
                setWidth(8)
              }}
            />
          ))}
        </div>
        <div className="paint-actions">
          <button
            type="button"
            aria-label="细画笔"
            className={width === 5 ? 'active' : ''}
            onClick={() => setWidth(5)}
          >
            <Brush size={17} />
          </button>
          <button
            type="button"
            aria-label="橡皮"
            className={color === '#fff7e8' ? 'active' : ''}
            onClick={() => {
              setColor('#fff7e8')
              setWidth(24)
            }}
          >
            <Eraser size={18} />
          </button>
          <button type="button" aria-label="清空画布" onClick={clear}>
            <RotateCcw size={18} />
          </button>
          <button type="button" className="finish-painting" onClick={finish}>
            {marks ? <Check size={18} /> : <Sparkles size={18} />}
            <span>完成</span>
          </button>
        </div>
      </div>
    </section>
  )
}
