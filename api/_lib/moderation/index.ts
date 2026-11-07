import { readFileSync } from 'node:fs'

type Model = { version: string; feature_count: number; threshold: number; intercept: number; weights: number[]; idf: number[] }
let cached: Model | null = null
function model(): Model {
  if (cached) return cached
  const value = JSON.parse(readFileSync(new URL('./model.json', import.meta.url), 'utf8'))
  if (value.version !== 'eyi-moderation-pt-v1' || value.feature_count !== 32768 || !Array.isArray(value.weights) || value.weights.length !== 32768 || !value.weights.every(Number.isFinite) || !Array.isArray(value.idf) || value.idf.length !== 32768 || !value.idf.every((v: unknown) => typeof v === 'number' && Number.isFinite(v) && v > 0) || !Number.isFinite(value.intercept) || !(value.threshold > 0 && value.threshold < 1)) throw new Error('Moderation model unavailable')
  cached = value
  return value
}

export function normalizeModerationText(text: string) {
  return text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/https?:\/\/\S+|www\.\S+|@[\w_]+/g, ' ')
    .replace(/[\u200b-\u200f\u202a-\u202e\u2060\ufeff]/g, '')
    .replace(/[^a-z0-9]+/g, ' ').trim()
}
function hash(text: string) {
  let value = 2166136261
  for (let i = 0; i < text.length; i++) value = Math.imul(value ^ text.charCodeAt(i), 16777619) >>> 0
  return value % 32768
}
export function moderationFeatures(text: string) {
  const normalized = normalizeModerationText(text), words = normalized ? normalized.split(' ') : []
  const counts = new Map<number, number>()
  const add = (key: string) => { const id = hash(key); counts.set(id, (counts.get(id) || 0) + 1) }
  for (const size of [1, 2, 3]) for (let i = 0; i <= words.length - size; i++) add('w:' + words.slice(i, i + size).join(' '))
  const padded = ' ' + normalized + ' '
  for (const size of [3, 4, 5]) for (let i = 0; i <= padded.length - size; i++) add('c:' + padded.slice(i, i + size))
  return counts
}
function score(text: string, weights: Model) {
  let value = weights.intercept
  const features = [...moderationFeatures(text)].map(([id, count]) => [id, (1 + Math.log(count)) * weights.idf[id]])
  const norm = Math.sqrt(features.reduce((sum, [, weight]) => sum + weight * weight, 0)) || 1
  for (const [id, weight] of features) value += weights.weights[id] * weight / norm
  return 1 / (1 + Math.exp(-Math.max(-50, Math.min(50, value))))
}
function deobfuscate(text: string) {
  const substitutions: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '$': 's', '!': 'i' }
  return text.toLowerCase().replace(/[\u200b-\u200f\u202a-\u202e\u2060\ufeff]/g, '')
    .replace(/[a-z][a-z013457@$!]*[013457@$!][a-z013457@$!]*/g, word => word.replace(/[013457@$!]/g, char => substitutions[char]))
    .replace(/\b(?:[a-z][.\-_]){2,}[a-z]\b/g, word => word.replace(/[.\-_]/g, ''))
}
const directThreats = [
  /\b(?:vou|vamos|irei) (?:te|lhe) (?:matar|espancar|esfaquear|estuprar|agredir|machucar|ferir)\b/,
  /\b(?:vou|vamos|irei) (?:matar|espancar|esfaquear|estuprar|agredir|machucar|ferir) (?:voce|vc|vcs|voces|sua familia|tua familia)\b/,
  /\b(?:vou|vamos|irei) (?:tirar|acabar com) (?:a )?(?:sua|tua) vida\b/,
  /\b(?:voce|vc) (?:vai|ira) pagar com (?:sangue|a vida)\b/,
  /\b(?:vou|vamos|irei) (?:quebrar|arrebentar) (?:a )?(?:sua|tua) cara\b/,
  /\b(?:vou|vamos|irei) (?:dar|meter) (?:um )?tiro (?:em voce|em vc|na sua|na tua)\b/,
  /\b(?:vou|vamos|irei) (?:incendiar|queimar) (?:a )?(?:sua|tua) casa\b/,
  /\b(?:voce|vc|vcs|voces) merece(?:m)? morrer\b/,
  /\b(?:se mata logo|vai se matar|cometa suicidio)\b/,
  /\bi (?:will|am going to) (?:kill|hurt|shoot|stab) you\b/,
]
function explicitThreat(text: string) {
  const compact = text.replace(/ /g, '')
  const hidden = /(?:vou|irei|vamos)te(?:matar|espancar|esfaquear|estuprar|machucar|ferir)/.exec(compact)
  if (hidden && !/(?:nao|nunca)$/.test(compact.slice(Math.max(0, hidden.index - 5), hidden.index))) return true
  for (const rule of directThreats) {
    const match = rule.exec(text)
    // Immediate negation is a contrast in the local model's training examples.
    if (match && !/\b(?:nao|nunca|not)\s*$/.test(text.slice(Math.max(0, match.index - 12), match.index))) return true
  }
  return false
}
export function moderateMessage(text: string) {
  const weights = model() // Fail closed if the artifact is missing or invalid.
  const normalized = normalizeModerationText(text), alternative = deobfuscate(text)
  if (explicitThreat(normalized) || explicitThreat(normalizeModerationText(alternative))) return { blocked: true, reason: 'explicit_threat' as const }
  const probability = Math.max(score(text, weights), score(alternative, weights))
  return { blocked: probability >= weights.threshold, reason: probability >= weights.threshold ? 'toxic_language' as const : 'allowed' as const }
}

export function getModerationStatus() {
  return { enabled: true, engine: 'local', version: model().version }
}
