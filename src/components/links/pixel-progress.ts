export const PIXEL_PROGRESS_KEY = 'eyi-pixel-progress-v1'
export type PixelCare = 'pet' | 'treat' | 'play'
export type PixelProgress = { version: 1; pet: number; treat: number; play: number }
export const EMPTY_PIXEL_PROGRESS: PixelProgress = { version: 1, pet: 0, treat: 0, play: 0 }
export const PIXEL_TRICKS = [
  { id: 'paw', label: 'Dar patinha', required: 3 },
  { id: 'spin', label: 'Rodopiar', required: 8 },
  { id: 'celebrate', label: 'Comemorar', required: 15 },
] as const

export function parsePixelProgress(raw: string | null): PixelProgress {
  try {
    const value = JSON.parse(raw ?? 'null')
    if (!value || value.version !== 1) return { ...EMPTY_PIXEL_PROGRESS }
    const count = (input: unknown) => typeof input === 'number' && Number.isSafeInteger(input) && input >= 0 ? Math.min(input, 9999) : 0
    return { version: 1, pet: count(value.pet), treat: count(value.treat), play: count(value.play) }
  } catch { return { ...EMPTY_PIXEL_PROGRESS } }
}
export function pixelTotal(progress: PixelProgress) { return progress.pet + progress.treat + progress.play }
export function careForPixel(progress: PixelProgress, action: PixelCare): PixelProgress {
  return { ...progress, [action]: Math.min(progress[action] + 1, 9999) }
}
