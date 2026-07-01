import { allQuestions, levels } from '../src/curriculum.ts'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

assert(levels.length === 100, `Expected 100 levels, received ${levels.length}`)
assert(allQuestions.length === 300, `Expected 300 questions, received ${allQuestions.length}`)
assert(new Set(allQuestions.map((question) => question.id)).size === 300, 'Question IDs must be unique')

const subjectCounts = allQuestions.reduce(
  (counts, question) => {
    counts[question.subject] += 1
    return counts
  },
  { chinese: 0, math: 0, english: 0 },
)

assert(subjectCounts.chinese === 120, 'Chinese pool must contain 120 variants')
assert(subjectCounts.math === 120, 'Math pool must contain 120 variants')
assert(subjectCounts.english === 60, 'English pool must contain 60 variants')
assert(levels.filter((level) => level.rewardColor).length === 20, 'Every fifth level must award a gem')

for (const level of levels) {
  assert(level.id >= 1 && level.id <= 100, `Invalid level ID ${level.id}`)
  assert(level.chapter === Math.ceil(level.id / 5), `Level ${level.id} is in the wrong chapter`)
  assert(level.subject === 'mixed', `Level ${level.id} must mix all three subjects`)
  assert(level.target === 9, `Level ${level.id} must require nine gems`)
  assert(level.questions.length === 9, `Level ${level.id} must have nine questions`)
  assert(
    new Set(level.questions.map((question) => question.id)).size === 9,
    `Level ${level.id} must contain nine different questions`,
  )
  for (const subject of ['chinese', 'math', 'english'] as const) {
    assert(
      level.questions.filter((question) => question.subject === subject).length === 3,
      `Level ${level.id} must contain three ${subject} questions`,
    )
  }
  assert(
    level.id % 5 === 0 ? Boolean(level.rewardColor) : !level.rewardColor,
    `Level ${level.id} has an invalid reward`,
  )

  for (const question of level.questions) {
    assert(question.options.length >= 2, `${question.id} needs at least two options`)
    assert(question.options.includes(question.answer), `${question.id} answer is missing from its options`)
    assert(question.prompt.trim().length > 0, `${question.id} has an empty prompt`)
    assert(question.explain.trim().length > 0, `${question.id} has no feedback explanation`)
  }
}

console.log(
  `Curriculum OK: ${levels.length} levels, ${allQuestions.length} variants, ` +
    `every level 3+3+3, ${subjectCounts.chinese}/${subjectCounts.math}/${subjectCounts.english} pool, 20 gem rewards.`,
)
