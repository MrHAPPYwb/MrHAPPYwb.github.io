import Dexie, { type Table } from 'dexie'
import type { SubjectId } from './content'

export type LearnerProgress = {
  id: string
  playerName: string
  stars: number
  streakDays: number
  lastPlayed: string
  completedTaskIds: string[]
  subjectStars: Record<SubjectId, number>
  crystalDust: number
  paintingsSaved: number
  craftedGems: string[]
  petLevel: number
}

class RainbowQuestDB extends Dexie {
  progress!: Table<LearnerProgress, string>

  constructor() {
    super('rainbowQuestDB')
    this.version(1).stores({
      progress: 'id',
    })
  }
}

const db = new RainbowQuestDB()

export function createBlankProgress(): LearnerProgress {
  return {
    id: 'main',
    playerName: '研姐',
    stars: 0,
    streakDays: 0,
    lastPlayed: '',
    completedTaskIds: [],
    subjectStars: {
      chinese: 0,
      math: 0,
      english: 0,
    },
    crystalDust: 0,
    paintingsSaved: 0,
    craftedGems: [],
    petLevel: 1,
  }
}

function normalizeProgress(progress: LearnerProgress) {
  const blank = createBlankProgress()

  return {
    ...blank,
    ...progress,
    subjectStars: {
      ...blank.subjectStars,
      ...progress.subjectStars,
    },
    completedTaskIds: Array.isArray(progress.completedTaskIds)
      ? progress.completedTaskIds
      : [],
    playerName: '研姐',
    craftedGems: Array.isArray(progress.craftedGems)
      ? progress.craftedGems
      : [],
  }
}

export async function loadProgress() {
  const stored = await db.progress.get('main')
  if (stored) {
    return normalizeProgress(stored)
  }

  const blank = createBlankProgress()
  await db.progress.put(blank)
  return blank
}

export async function saveProgress(progress: LearnerProgress) {
  await db.progress.put(progress)
  return progress
}

export async function recordTaskDone(
  progress: LearnerProgress,
  taskId: string,
  subject: SubjectId,
  reward: number,
) {
  const today = new Date().toISOString().slice(0, 10)
  const alreadyDone = progress.completedTaskIds.includes(taskId)
  const nextCompleted = alreadyDone
    ? progress.completedTaskIds
    : [...progress.completedTaskIds, taskId]

  const nextStars = alreadyDone ? progress.stars : progress.stars + reward
  const nextSubjectStars = alreadyDone
    ? progress.subjectStars
    : {
        ...progress.subjectStars,
        [subject]: progress.subjectStars[subject] + reward,
      }

  const nextProgress: LearnerProgress = {
    ...progress,
    stars: nextStars,
    subjectStars: nextSubjectStars,
    completedTaskIds: nextCompleted,
    lastPlayed: today,
    streakDays:
      progress.lastPlayed === today
        ? progress.streakDays || 1
        : progress.streakDays + 1,
    petLevel: Math.max(1, Math.floor(nextStars / 9) + 1),
  }

  await saveProgress(nextProgress)
  return nextProgress
}

export async function resetProgress() {
  const blank = createBlankProgress()
  await saveProgress(blank)
  return blank
}

export async function recordPainting(progress: LearnerProgress) {
  const nextProgress: LearnerProgress = {
    ...progress,
    paintingsSaved: progress.paintingsSaved + 1,
    crystalDust: progress.crystalDust + 2,
  }
  await saveProgress(nextProgress)
  return nextProgress
}

export async function recordGem(
  progress: LearnerProgress,
  gemName: string,
) {
  const alreadyCrafted = progress.craftedGems.includes(gemName)
  const nextProgress: LearnerProgress = {
    ...progress,
    craftedGems: alreadyCrafted
      ? progress.craftedGems
      : [...progress.craftedGems, gemName],
    crystalDust: progress.crystalDust + (alreadyCrafted ? 1 : 5),
    stars: progress.stars + (alreadyCrafted ? 0 : 5),
  }
  await saveProgress(nextProgress)
  return nextProgress
}
