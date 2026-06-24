import Dexie, { type Table } from 'dexie'
import type { SubjectId } from './content'

export type LearnerProgress = {
  id: string
  stars: number
  streakDays: number
  lastPlayed: string
  completedTaskIds: string[]
  subjectStars: Record<SubjectId, number>
  petName: string
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
    stars: 0,
    streakDays: 0,
    lastPlayed: '',
    completedTaskIds: [],
    subjectStars: {
      chinese: 0,
      math: 0,
      english: 0,
    },
    petName: '小露',
    petLevel: 1,
  }
}

export async function loadProgress() {
  const stored = await db.progress.get('main')
  if (stored) {
    return stored
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
    petLevel: Math.max(1, Math.floor(nextStars / 6) + 1),
  }

  await saveProgress(nextProgress)
  return nextProgress
}

export async function resetProgress() {
  const blank = createBlankProgress()
  await saveProgress(blank)
  return blank
}
