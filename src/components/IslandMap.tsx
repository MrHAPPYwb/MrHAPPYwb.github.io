import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import type { SubjectId } from '../content'
import { subjects } from '../content'
import type { LearnerProgress } from '../storage'

type IslandMapProps = {
  activeSubject: SubjectId
  progress: LearnerProgress
  onSelectSubject: (subject: SubjectId) => void
}

const islandLayout: Array<{
  id: SubjectId
  x: number
  y: number
  emoji: string
}> = [
  { id: 'chinese', x: 82, y: 92, emoji: '字' },
  { id: 'math', x: 180, y: 142, emoji: '10' },
  { id: 'english', x: 284, y: 88, emoji: 'A' },
]

export function IslandMap({
  activeSubject,
  progress,
  onSelectSubject,
}: IslandMapProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const selectRef = useRef(onSelectSubject)

  useEffect(() => {
    selectRef.current = onSelectSubject
  }, [onSelectSubject])

  useEffect(() => {
    const host = hostRef.current
    if (!host) {
      return
    }

    host.innerHTML = ''

    class MapScene extends Phaser.Scene {
      create() {
        const graphics = this.add.graphics()
        graphics.fillStyle(0xe0f2fe, 1)
        graphics.fillRoundedRect(0, 0, 360, 220, 8)
        graphics.fillStyle(0xbfdbfe, 1)
        graphics.fillEllipse(180, 128, 330, 122)
        graphics.fillStyle(0xffffff, 0.7)
        graphics.fillEllipse(70, 38, 86, 18)
        graphics.fillEllipse(276, 46, 74, 16)

        islandLayout.forEach((island) => {
          const meta = subjects[island.id]
          const selected = island.id === activeSubject
          const fill = selected ? 0xffffff : 0xf8fafc
          const stroke = Number.parseInt(meta.color.slice(1), 16)

          graphics.lineStyle(selected ? 5 : 3, stroke, selected ? 1 : 0.5)
          graphics.fillStyle(fill, 1)
          graphics.fillRoundedRect(island.x - 48, island.y - 38, 96, 76, 8)

          this.add
            .text(island.x, island.y - 8, island.emoji, {
              fontFamily: 'Arial, sans-serif',
              fontSize: island.id === 'math' ? '26px' : '30px',
              color: meta.color,
              fontStyle: '700',
            })
            .setOrigin(0.5)

          this.add
            .text(island.x, island.y + 24, `${meta.shortName} ${progress.subjectStars[island.id]}`, {
              fontFamily: 'Arial, sans-serif',
              fontSize: '13px',
              color: '#334155',
            })
            .setOrigin(0.5)

          this.add
            .zone(island.x, island.y, 104, 86)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
              this.game.events.emit('select-subject', island.id)
            })
        })

        const pet = this.add
          .text(180, 48, `Lv.${progress.petLevel}`, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '18px',
            color: '#0f172a',
            backgroundColor: '#ffffff',
            padding: { x: 10, y: 5 },
          })
          .setOrigin(0.5)

        this.tweens.add({
          targets: pet,
          y: 42,
          duration: 1100,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        })
      }
    }

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host,
      width: 360,
      height: 220,
      backgroundColor: '#e0f2fe',
      scene: MapScene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      transparent: true,
    })

    game.events.on('select-subject', (subject: SubjectId) => {
      selectRef.current(subject)
    })

    return () => {
      game.destroy(true)
    }
  }, [activeSubject, progress])

  return <div className="island-map" ref={hostRef} aria-label="任务岛地图" />
}
