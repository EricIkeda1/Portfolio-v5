import { type Game, WORLD, WEAPONS } from './engine'
export function camera(game: Game, width: number, height: number) {
  const scale = Math.min(1, Math.max(.56, width / 760 + .12)), player = game.actors[0]
  const halfW = width / scale / 2, halfH = height / scale / 2
  return { x: Math.max(halfW, Math.min(WORLD - halfW, player.x)), y: Math.max(halfH, Math.min(WORLD - halfH, player.y)), scale }
}
const circle = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) => { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2); ctx.fill() }
export function render(ctx: CanvasRenderingContext2D, game: Game, width: number, height: number, reduced = false) {
  const cam = camera(game, width, height)
  ctx.clearRect(0, 0, width, height)
  ctx.save(); ctx.translate(width / 2, height / 2); ctx.scale(cam.scale, cam.scale); ctx.translate(-cam.x, -cam.y)
  ctx.fillStyle = '#7e996d'; ctx.fillRect(0, 0, WORLD, WORLD)
  const visible = (x: number, y: number, padding = 100) => Math.abs(x - cam.x) < width / cam.scale / 2 + padding && Math.abs(y - cam.y) < height / cam.scale / 2 + padding
  ctx.fillStyle = '#779366'
  for (let x = Math.max(0, Math.floor((cam.x - width / cam.scale / 2) / 90) * 90); x < Math.min(WORLD, cam.x + width / cam.scale / 2 + 90); x += 90) {
    for (let y = Math.max(0, Math.floor((cam.y - height / cam.scale / 2) / 90) * 90); y < Math.min(WORLD, cam.y + height / cam.scale / 2 + 90); y += 90) { ctx.fillRect(x + 12, y + 20, 4, 10); ctx.fillRect(x + 53, y + 60, 8, 3) }
  }
  ctx.strokeStyle = '#b7ae86'; ctx.lineWidth = 100; ctx.beginPath(); ctx.moveTo(0, 500); ctx.bezierCurveTo(600, 500, 1100, 1750, 2200, 1500); ctx.stroke()
  ctx.strokeStyle = '#c5bb96'; ctx.lineWidth = 76; ctx.stroke()
  ctx.fillStyle = '#608f9a'; ctx.beginPath(); ctx.ellipse(470, 1610, 170, 110, -.4, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#98bfc3'; ctx.lineWidth = 5; ctx.stroke()
  ctx.fillStyle = '#e4ead8'; ctx.font = '600 15px ui-monospace, monospace'; ctx.globalAlpha = .3
  ctx.fillText('BOSQUE NORTE', 260, 300); ctx.fillText('CAMPO CENTRAL', 920, 1000); ctx.fillText('LAGOA', 420, 1620); ctx.globalAlpha = 1
  for (const o of game.obstacles) {
    if (!visible(o.x, o.y)) continue
    circle(ctx, o.x + 5, o.y + 8, o.r, '#00000020')
    if (o.kind === 'tree') { circle(ctx, o.x, o.y, o.r, '#355a3d'); circle(ctx, o.x - 7, o.y - 6, o.r * .74, '#426e46'); circle(ctx, o.x + 9, o.y + 2, o.r * .5, '#4f7a4b') }
    else if (o.kind === 'rock') { circle(ctx, o.x, o.y, o.r, '#7b837c'); circle(ctx, o.x - 5, o.y - 7, o.r * .72, '#a1a99c') }
    else { ctx.fillStyle = '#795a36'; ctx.fillRect(o.x - o.r, o.y - o.r, o.r * 2, o.r * 2); ctx.strokeStyle = '#bb9562'; ctx.lineWidth = 4; ctx.strokeRect(o.x - o.r + 3, o.y - o.r + 3, o.r * 2 - 6, o.r * 2 - 6); ctx.beginPath(); ctx.moveTo(o.x - o.r + 4, o.y - o.r + 4); ctx.lineTo(o.x + o.r - 4, o.y + o.r - 4); ctx.moveTo(o.x + o.r - 4, o.y - o.r + 4); ctx.lineTo(o.x - o.r + 4, o.y + o.r - 4); ctx.stroke() }
  }
  for (const item of game.loot) {
    if (!visible(item.x, item.y, 20)) continue
    const color = item.kind === 'kit' ? '#e9faf0' : item.kind === 'ammo' ? '#f7df86' : item.kind === 'armor' ? '#b8d9e7' : item.kind === 'rifle' ? '#99c9ff' : '#f0b575'
    circle(ctx, item.x, item.y + 3, 14, '#0002'); circle(ctx, item.x, item.y, 12, color)
    ctx.fillStyle = '#263b39'; ctx.font = 'bold 14px ui-monospace, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(item.kind === 'kit' ? '+' : item.kind === 'ammo' ? '≡' : item.kind === 'armor' ? '◆' : '⌁', item.x, item.y)
  }
  for (const actor of game.actors) {
    if (!visible(actor.x, actor.y)) continue
    if (!actor.alive) { circle(ctx, actor.x, actor.y, 14, '#4b534966'); continue }
    ctx.save(); ctx.translate(actor.x, actor.y); ctx.rotate(actor.angle)
    circle(ctx, 2, 5, 18, '#0003'); circle(ctx, 0, 0, 18, actor.id === 0 ? '#e3eef6' : '#d7bda1')
    ctx.fillStyle = actor.id === 0 ? '#274a66' : '#714b3f'; ctx.fillRect(5, -7, 28, 9)
    ctx.fillStyle = WEAPONS[actor.weapon].color; ctx.fillRect(23, -6, 10, 7)
    circle(ctx, 0, 0, 13, actor.id === 0 ? '#5388ae' : '#a87459'); circle(ctx, 9, 10, 5, '#dfc8ab'); ctx.restore()
    if (actor.id === 0) { ctx.strokeStyle = '#b2e6ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(actor.x, actor.y, 22, 0, 6.29); ctx.stroke() }
    else if (actor.hp < 100) { ctx.fillStyle = '#253c33'; ctx.fillRect(actor.x - 18, actor.y - 30, 36, 4); ctx.fillStyle = '#eeac8b'; ctx.fillRect(actor.x - 18, actor.y - 30, 36 * actor.hp / 100, 4) }
  }
  ctx.strokeStyle = '#ffefb7'; ctx.lineWidth = 3; ctx.lineCap = 'round'
  for (const bullet of game.bullets) { ctx.beginPath(); ctx.moveTo(bullet.px, bullet.py); ctx.lineTo(bullet.x, bullet.y); ctx.stroke() }
  if (!reduced) for (const p of game.particles) { ctx.globalAlpha = Math.min(1, p.life * 3); circle(ctx, p.x, p.y, 4, p.color) }
  ctx.globalAlpha = 1
  ctx.fillStyle = '#75476b66'; ctx.beginPath(); ctx.rect(0, 0, WORLD, WORLD); ctx.arc(WORLD / 2, WORLD / 2, game.zone, 0, Math.PI * 2, true); ctx.fill('evenodd')
  ctx.strokeStyle = '#ece0fb'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(WORLD / 2, WORLD / 2, game.zone, 0, Math.PI * 2); ctx.stroke()
  ctx.strokeStyle = '#3f5949'; ctx.lineWidth = 12; ctx.strokeRect(0, 0, WORLD, WORLD)
  ctx.restore()
  const size = width < 600 ? 78 : 116, left = width - size - 18, top = 18
  ctx.fillStyle = '#183429df'; ctx.fillRect(left - 3, top - 3, size + 6, size + 6)
  ctx.fillStyle = '#78976c'; ctx.fillRect(left, top, size, size)
  ctx.save(); ctx.beginPath(); ctx.rect(left, top, size, size); ctx.clip(); ctx.strokeStyle = '#ede4f7'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(left + size / 2, top + size / 2, game.zone / WORLD * size, 0, Math.PI * 2); ctx.stroke(); ctx.restore()
  const player = game.actors[0]; circle(ctx, left + player.x / WORLD * size, top + player.y / WORLD * size, 3, '#fff')
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
}
