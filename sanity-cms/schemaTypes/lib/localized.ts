import type {Rule} from 'sanity'
import {BASE_LANGUAGE, LANGUAGES} from './languages'

type LocalizedItem = {_key: string; language?: string; value?: unknown}

function isLocalizedItem(item: unknown): item is LocalizedItem {
  return typeof item === 'object' && item !== null && '_key' in item
}

function findBaseItem(items: unknown): LocalizedItem | undefined {
  if (!Array.isArray(items)) return undefined
  return items.filter(isLocalizedItem).find((item) => item.language === BASE_LANGUAGE)
}

function textOf(node: unknown): string {
  return typeof node === 'object' &&
    node !== null &&
    'text' in node &&
    typeof node.text === 'string'
    ? node.text
    : ''
}

function childrenOf(block: unknown): unknown[] {
  return typeof block === 'object' &&
    block !== null &&
    'children' in block &&
    Array.isArray(block.children)
    ? block.children
    : []
}

/** Base-language value of an internationalized array as plain text, for previews. */
export function baseText(items: unknown): string | undefined {
  const value = findBaseItem(items)?.value
  if (typeof value === 'string') return value || undefined
  if (Array.isArray(value)) return portableTextToPlain(value) || undefined
  return undefined
}

function portableTextToPlain(blocks: unknown[]): string {
  return blocks.flatMap(childrenOf).map(textOf).join('')
}

// Portable Text counts only if it has visible text: a cleared editor still leaves one empty block.
function hasContent(value: unknown): boolean {
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return portableTextToPlain(value).trim().length > 0
  return false
}

/** Requires a value in every language. */
export function requiredInAllLanguages(rule: Rule) {
  return rule.custom((items: unknown) => {
    const localized = Array.isArray(items) ? items.filter(isLocalizedItem) : []
    const errors = LANGUAGES.flatMap(({id}) => {
      const item = localized.find((candidate) => candidate.language === id)
      if (item && hasContent(item.value)) return []
      const message = `Required in ${id}`
      // An existing item gets the error on its value; a missing one has no path to point at.
      return [item ? {message, path: [{_key: item._key}, 'value']} : {message}]
    })
    return errors.length > 0 ? errors : true
  })
}
