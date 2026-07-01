export const forgeShapeOrder = [
  'bunny',
  'cat',
  'crown',
  'butterfly',
  'heart',
  'star',
  'castle',
  'flower',
] as const

export type ForgeShape = (typeof forgeShapeOrder)[number]

export type ForgedCreation = {
  id: string
  shape: ForgeShape
  name: string
  forgedAt: number
}

export const forgeShapeMeta: Record<
  ForgeShape,
  { name: string; description: string; legacyNames?: string[] }
> = {
  bunny: {
    name: '水晶小兔',
    description: '耳朵里藏着勇气的月光',
  },
  cat: {
    name: '水晶小猫',
    description: '守护宝石仓库的星光灵猫',
  },
  crown: {
    name: '公主水晶冠',
    description: '为认真闯关的研姐加冕',
  },
  butterfly: {
    name: '水晶蝴蝶',
    description: '翅膀会折射五色极光',
  },
  heart: {
    name: '心愿宝石',
    description: '把今天的愿望封进晶体',
  },
  star: {
    name: '星辰徽章',
    description: '记录一次闪亮的坚持',
  },
  castle: {
    name: '水晶城堡',
    description: '用知识宝石筑起的梦幻城堡',
  },
  flower: {
    name: '晨露晶花',
    description: '每一片花瓣都是新发现',
  },
}

export function isForgeShape(value: unknown): value is ForgeShape {
  return forgeShapeOrder.includes(value as ForgeShape)
}

export function forgeShapeFromName(name: string) {
  return forgeShapeOrder.find((shape) => {
    const meta = forgeShapeMeta[shape]
    return meta.name === name || meta.legacyNames?.includes(name)
  })
}

export function normalizeForgedCreations(value: unknown): ForgedCreation[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item, index) => {
    if (typeof item === 'string') {
      const shape = forgeShapeFromName(item)
      return shape
        ? [{
            id: `legacy-${index + 1}-${shape}`,
            shape,
            name: item,
            forgedAt: 0,
          }]
        : []
    }
    if (!item || typeof item !== 'object') return []
    const candidate = item as Partial<ForgedCreation>
    if (!isForgeShape(candidate.shape)) return []
    return [{
      id: typeof candidate.id === 'string'
        ? candidate.id
        : `legacy-${index + 1}-${candidate.shape}`,
      shape: candidate.shape,
      name: typeof candidate.name === 'string'
        ? candidate.name
        : forgeShapeMeta[candidate.shape].name,
      forgedAt: typeof candidate.forgedAt === 'number'
        ? candidate.forgedAt
        : 0,
    }]
  })
}
