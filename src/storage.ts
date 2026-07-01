import Dexie, { type Table } from 'dexie'
import { levels, type GemColor } from './curriculum'

export type SkillRecord = {
  correct: number
  wrong: number
  lastSeenLevel: number
}

export type TreasureReward = 'star-sticker' | 'forge-spark' | 'time-crystal'

export type MinerProgress = {
  id: string
  playerName: string
  currentLevel: number
  completedLevels: number[]
  rewardedLevels: number[]
  inventory: Record<GemColor, number>
  forgedCreations: string[]
  questionRecords: Record<string, SkillRecord>
  totalCorrect: number
  bestCombo: number
  openedChests: number[]
  starStickers: number
  forgeSparks: number
}

class CrystalMineDB extends Dexie {
  progress!: Table<MinerProgress, string>

  constructor() {
    super('yanjieCrystalMineDB')
    this.version(1).stores({ progress: 'id' })
  }
}

const db = new CrystalMineDB()

export function createBlankProgress(): MinerProgress {
  return {
    id: 'main',
    playerName: '研姐',
    currentLevel: 1,
    completedLevels: [],
    rewardedLevels: [],
    inventory: {
      ruby: 0,
      sapphire: 0,
      emerald: 0,
      amethyst: 0,
      citrine: 0,
    },
    forgedCreations: [],
    questionRecords: {},
    totalCorrect: 0,
    bestCombo: 0,
    openedChests: [],
    starStickers: 0,
    forgeSparks: 0,
  }
}

function normalize(progress: MinerProgress): MinerProgress {
  const blank = createBlankProgress()
  const completedLevels = Array.isArray(progress.completedLevels)
    ? progress.completedLevels
    : []
  const hasRewardLedger = Array.isArray(progress.rewardedLevels)
  const inventory = { ...blank.inventory, ...progress.inventory }

  if (!hasRewardLedger) {
    const legacyRewardedLevels = new Set(
      completedLevels.filter((levelId) => levelId % 5 === 0),
    )
    completedLevels.forEach((levelId) => {
      if (legacyRewardedLevels.has(levelId)) return
      const rewardColor = levels[levelId - 1]?.rewardColor
      if (rewardColor) inventory[rewardColor] += 1
    })
  }

  return {
    ...blank,
    ...progress,
    playerName: '研姐',
    completedLevels,
    rewardedLevels: hasRewardLedger ? progress.rewardedLevels : completedLevels,
    forgedCreations: Array.isArray(progress.forgedCreations)
      ? progress.forgedCreations
      : [],
    openedChests: Array.isArray(progress.openedChests)
      ? progress.openedChests
      : [],
    inventory,
    questionRecords: progress.questionRecords ?? {},
  }
}

export async function loadProgress() {
  const stored = await db.progress.get('main')
  if (stored) {
    const normalized = normalize(stored)
    if (!Array.isArray(stored.rewardedLevels)) {
      await db.progress.put(normalized)
    }
    return normalized
  }
  const blank = createBlankProgress()
  await db.progress.put(blank)
  return blank
}

export async function saveProgress(progress: MinerProgress) {
  await db.progress.put(progress)
  return progress
}

export async function recordQuestion(
  progress: MinerProgress,
  questionId: string,
  levelId: number,
  correct: boolean,
  combo: number,
) {
  const previous = progress.questionRecords[questionId] ?? {
    correct: 0,
    wrong: 0,
    lastSeenLevel: 0,
  }
  const next: MinerProgress = {
    ...progress,
    totalCorrect: progress.totalCorrect + (correct ? 1 : 0),
    bestCombo: Math.max(progress.bestCombo, combo),
    questionRecords: {
      ...progress.questionRecords,
      [questionId]: {
        correct: previous.correct + (correct ? 1 : 0),
        wrong: previous.wrong + (correct ? 0 : 1),
        lastSeenLevel: levelId,
      },
    },
  }
  await saveProgress(next)
  return next
}

export async function completeLevel(
  progress: MinerProgress,
  levelId: number,
  rewardColor?: GemColor,
) {
  const firstCompletion = !progress.completedLevels.includes(levelId)
  const firstReward = !progress.rewardedLevels.includes(levelId)
  const completedLevels = firstCompletion
    ? [...progress.completedLevels, levelId].sort((a, b) => a - b)
    : progress.completedLevels
  const rewardedLevels = firstReward
    ? [...progress.rewardedLevels, levelId].sort((a, b) => a - b)
    : progress.rewardedLevels
  const nextLevel = Math.min(100, Math.max(progress.currentLevel, levelId + 1))
  const next: MinerProgress = {
    ...progress,
    currentLevel: nextLevel,
    completedLevels,
    rewardedLevels,
    inventory:
      firstReward && rewardColor
        ? {
            ...progress.inventory,
            [rewardColor]: progress.inventory[rewardColor] + 1,
          }
        : progress.inventory,
  }
  await saveProgress(next)
  return next
}

export async function openTreasure(
  progress: MinerProgress,
  levelId: number,
  reward: TreasureReward,
) {
  if (progress.openedChests.includes(levelId)) {
    return progress
  }
  const next: MinerProgress = {
    ...progress,
    openedChests: [...progress.openedChests, levelId].sort((a, b) => a - b),
    starStickers:
      progress.starStickers + (reward === 'star-sticker' ? 1 : 0),
    forgeSparks:
      progress.forgeSparks + (reward === 'forge-spark' ? 1 : 0),
  }
  await saveProgress(next)
  return next
}

export function canForge(progress: MinerProgress) {
  return (Object.keys(progress.inventory) as GemColor[]).every(
    (color) => progress.inventory[color] > 0,
  )
}

export async function forgeCreation(
  progress: MinerProgress,
  creationName: string,
) {
  if (!canForge(progress)) {
    return progress
  }
  const inventory = { ...progress.inventory }
  ;(Object.keys(inventory) as GemColor[]).forEach((color) => {
    inventory[color] -= 1
  })
  const next: MinerProgress = {
    ...progress,
    inventory,
    forgedCreations: [...progress.forgedCreations, creationName],
  }
  await saveProgress(next)
  return next
}

export function weakQuestionIds(progress: MinerProgress, levelId: number) {
  return Object.entries(progress.questionRecords)
    .filter(
      ([, record]) =>
        record.wrong >= record.correct &&
        levelId - record.lastSeenLevel >= 2,
    )
    .sort(([, a], [, b]) => b.wrong - b.correct - (a.wrong - a.correct))
    .map(([id]) => id)
}

export async function resetProgress() {
  const blank = createBlankProgress()
  await saveProgress(blank)
  return blank
}
