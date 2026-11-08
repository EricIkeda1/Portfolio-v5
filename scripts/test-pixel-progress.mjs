import assert from 'node:assert/strict'
import { parsePixelProgress, careForPixel, pixelTotal, PIXEL_TRICKS } from '../src/components/links/pixel-progress.ts'
for (const invalid of [null, '', 'broken', '{"version":2,"pet":99}', '[]']) assert.equal(pixelTotal(parsePixelProgress(invalid)), 0)
let progress = parsePixelProgress(null)
for (const action of ['pet', 'treat', 'play']) progress = careForPixel(progress, action)
assert.equal(pixelTotal(progress), 3)
assert.equal(PIXEL_TRICKS.filter(t => pixelTotal(progress) >= t.required).length, 1)
assert.deepEqual(parsePixelProgress(JSON.stringify(progress)), progress, 'saved care survives reload')
for (let i = 0; i < 12; i++) progress = careForPixel(progress, 'play')
assert.equal(PIXEL_TRICKS.filter(t => pixelTotal(progress) >= t.required).length, 3)
assert.deepEqual(parsePixelProgress('{"version":1,"pet":-1,"treat":"10","play":1000000}'), {version:1,pet:0,treat:0,play:9999})
const original = { version:1, pet:9999, treat:0, play:0 }
assert.equal(careForPixel(original, 'pet').pet, 9999)
assert.equal(original.pet, 9999)
console.log('Pixel: corrupted saves, persistence, progression, unlocks and limits passed.')
