import Dexie, { type Table } from 'dexie'
import type { GemColor } from './curriculum'

export type SkillRecord = {
  correct: number
  wrong: number
  lastSeenLevel: number
}

export type MinerProgress = {
  id: string
  playerName: string
  currentLevel: number
  completedLevels: number[]
  inventory: Record<GemColor, number>
  forgedCreations: string[]
  questionRecords: Record<string, SkillRecord>
  totalCorrect: number
  bestCombo: number
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
  }
}

function normalize(progress: MinerProgress): MinerProgress {
  const blank = createBlankProgress()
  return {
    ...blank,
    ...progress,
    playerName: '研姐',
    completedLevels: Array.isArray(progress.completedLevels)
      ? progress.completedLevels
      : [],
    forgedCreations: Array.isArray(progress.forgedCreations)
      ? progress.forgedCreations
      : [],
    inventory: { ...blank.inventory, ...progress.inventory },
    questionRecords: progress.questionRecords ?? {},
  }
}

export async function loadProgress() {
  const stored = await db.progress.get('main')
  if (stored) {
    return normalize(stored)
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
  const completedLevels = firstCompletion
    ? [...progress.completedLevels, levelId].sort((a, b) => a - b)
    : progress.completedLevels
  const nextLevel = Math.min(100, Math.max(progress.currentLevel, levelId + 1))
  const next: MinerProgress = {
    ...progress,
    currentLevel: nextLevel,
    completedLevels,
    inventory:
      firstCompletion && rewardColor
        ? {
            ...progress.inventory,
            [rewardColor]: progress.inventory[rewardColor] + 1,
          }
        : progress.inventory,
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
