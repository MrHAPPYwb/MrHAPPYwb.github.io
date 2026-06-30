import { allQuestions, levels } from '../src/curriculum.ts'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

assert(levels.length === 100, `Expected 100 levels, received ${levels.length}`)
assert(allQuestions.length === 300, `Expected 300 questions, received ${allQuestions.length}`)
assert(new Set(allQuestions.map((question) => question.id)).size === 300, 'Question IDs must be unique')

const subjectCounts = levels.reduce(
  (counts, level) => {
    counts[level.subject] += 1
    return counts
  },
  { chinese: 0, math: 0, english: 0 },
)

assert(subjectCounts.chinese === 40, 'Chinese course must contain 40 levels')
assert(subjectCounts.math === 40, 'Math course must contain 40 levels')
assert(subjectCounts.english === 20, 'English course must contain 20 levels')
assert(levels.filter((level) => level.rewardColor).length === 20, 'Every fifth level must award a gem')

for (const level of levels) {
  assert(level.id >= 1 && level.id <= 100, `Invalid level ID ${level.id}`)
  assert(level.chapter === Math.ceil(level.id / 5), `Level ${level.id} is in the wrong chapter`)
  assert(level.questions.length === 3, `Level ${level.id} must have three question variants`)
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
    `${subjectCounts.chinese}/${subjectCounts.math}/${subjectCounts.english} subject split, 20 gem rewards.`,
)
