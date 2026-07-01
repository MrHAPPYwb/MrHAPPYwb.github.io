import { ArrowLeft, Check, Gem, Hammer, LockKeyhole } from 'lucide-react'
import { levels } from '../curriculum'
import type { MinerProgress } from '../storage'

export function LevelMap({
  progress,
  onBack,
  onForge,
  onSelect,
}: {
  progress: MinerProgress
  onBack: () => void
  onForge: () => void
  onSelect: (levelId: number) => void
}) {
  return (
    <section className="level-map" aria-label="100 关水晶矿山地图">
      <img src="assets/crystal-mine-v1.webp" alt="" />
      <div className="map-shade" />
      <header className="map-header">
        <button type="button" className="icon-button" aria-label="返回矿场" onClick={onBack}>
          <ArrowLeft size={22} />
        </button>
        <div>
          <small>100 LEVELS</small>
          <strong>研姐的水晶矿山</strong>
        </div>
        <button type="button" className="forge-shortcut" aria-label="进入锻造工坊" onClick={onForge}>
          <Hammer size={21} />
        </button>
      </header>
      <div className="map-summary">
        <span>已通关 <b>{progress.completedLevels.length}</b>/100</span>
        <span>宝箱 <b>{progress.openedChests.length}</b>/100</span>
        <span>贴纸 <b>{progress.starStickers}</b> 张</span>
        <span>已锻造 <b>{progress.forgedCreations.length}</b> 件</span>
      </div>
      <div className="level-path">
        {Array.from({ length: 20 }, (_, chapterIndex) => {
          const chapterLevels = levels.slice(chapterIndex * 5, chapterIndex * 5 + 5)
          return (
            <section className="map-chapter" key={chapterIndex}>
              <div className="chapter-label">
                <span>矿层 {chapterIndex + 1}</span>
                <strong>{chapterLevels[0].chapterName}</strong>
                <em>{chapterIndex * 5 + 1}—{chapterIndex * 5 + 5}</em>
              </div>
              <div className="chapter-track">
                {chapterLevels.map((level) => {
                  const completed = progress.completedLevels.includes(level.id)
                  const unlocked = level.id <= progress.currentLevel || completed
                  return (
                    <button
                      type="button"
                      disabled={!unlocked}
                      className={`${completed ? 'completed' : ''} ${
                        level.id === progress.currentLevel ? 'current' : ''
                      } subject-mixed`}
                      key={level.id}
                      aria-label={`第 ${level.id} 关 ${level.title}${unlocked ? '' : ' 未解锁'}`}
                      onClick={() => onSelect(level.id)}
                    >
                      <small className="mixed-subjects">
                        <i>语</i><i>数</i><i>EN</i>
                      </small>
                      <strong>{level.id}</strong>
                      {completed ? (
                        <Check size={14} />
                      ) : unlocked ? (
                        level.rewardColor ? <Gem size={15} /> : null
                      ) : (
                        <LockKeyhole size={13} />
                      )}
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </section>
  )
}
