export const GAME_KEY_CODES = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyR', 'KeyF', 'Digit1', 'Digit2', 'Digit3', 'Space', 'KeyE', 'KeyO', 'KeyP', 'KeyN', 'KeyT', 'KeyL', 'KeyU', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight']
const mapping: Record<string, string> = { KeyW: 'w', KeyA: 'a', KeyS: 's', KeyD: 'd', ArrowUp: 'arrowup', ArrowDown: 'arrowdown', ArrowLeft: 'arrowleft', ArrowRight: 'arrowright', KeyR: 'r', KeyF: 'f', Digit1: '1', Digit2: '2', Digit3: '3' }
export function gameKey(event: Pick<KeyboardEvent, 'code' | 'key'>) { return mapping[event.code] ?? (event.code ? '' : event.key.toLowerCase()) }
export function reservedExit(event: Pick<KeyboardEvent, 'key'>) { return ['Tab', 'Escape', 'F11'].includes(event.key) }
export type GameKeyboard = { lock?: (codes: string[]) => Promise<void>; unlock?: () => void }
export function keyboardApi() { return typeof navigator === 'undefined' ? undefined : (navigator as Navigator & { keyboard?: GameKeyboard }).keyboard }
export function releaseGameKeyboard() { try { keyboardApi()?.unlock?.() } catch { /* Navegadores sem captura continuam com eventos normais. */ } }

export function captureGameKey(event: Pick<KeyboardEvent, 'key' | 'preventDefault' | 'stopPropagation'>, playing: boolean, focused: boolean) {
  if (!playing || !focused || reservedExit(event)) return false
  event.preventDefault()
  event.stopPropagation()
  return true
}
