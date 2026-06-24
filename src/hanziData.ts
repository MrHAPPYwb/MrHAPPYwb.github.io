import type { CharacterJson, CharDataLoaderFn } from 'hanzi-writer'
import daData from 'hanzi-writer-data/大.json'
import huoData from 'hanzi-writer-data/火.json'
import muData from 'hanzi-writer-data/木.json'
import riData from 'hanzi-writer-data/日.json'
import shanData from 'hanzi-writer-data/山.json'
import shuiData from 'hanzi-writer-data/水.json'
import xiaoData from 'hanzi-writer-data/小.json'
import yueData from 'hanzi-writer-data/月.json'

const characterData: Record<string, CharacterJson> = {
  大: daData as CharacterJson,
  火: huoData as CharacterJson,
  木: muData as CharacterJson,
  日: riData as CharacterJson,
  山: shanData as CharacterJson,
  水: shuiData as CharacterJson,
  小: xiaoData as CharacterJson,
  月: yueData as CharacterJson,
}

export const loadLocalCharacterData: CharDataLoaderFn = (
  char,
  onLoad,
  onError,
) => {
  const data = characterData[char]
  if (data) {
    onLoad(data)
    return
  }

  onError(new Error(`Missing local stroke data for ${char}`))
}
