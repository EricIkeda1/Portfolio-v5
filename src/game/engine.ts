export const WORLD = 2200
export const WEAPONS = [
  { name: 'Pistola', short: 'P12', clip: 12, delay: .27, reload: 1.15, damage: 24, pellets: 1, spread: .035, speed: 720, color: '#e4d7b4' },
  { name: 'Rifle', short: 'AR24', clip: 24, delay: .12, reload: 1.7, damage: 16, pellets: 1, spread: .065, speed: 860, color: '#9bc9ff' },
  { name: 'Escopeta', short: 'SG6', clip: 6, delay: .8, reload: 2.1, damage: 15, pellets: 6, spread: .25, speed: 650, color: '#f0b575' },
]
export type Actor = { id: number; x: number; y: number; hp: number; armor: number; angle: number; weapon: number; ammo: number; reserve: number; cooldown: number; reload: number; heal: number; kits: number; alive: boolean; target: number; think: number; wander: number; kills: number }
export type Obstacle = { x: number; y: number; r: number; kind: 'tree' | 'rock' | 'crate'; hp: number }
export type Loot = { x: number; y: number; kind: 'ammo' | 'kit' | 'armor' | 'rifle' | 'shotgun' }
export type Bullet = { x: number; y: number; px: number; py: number; vx: number; vy: number; life: number; damage: number; owner: number }
export type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string }
export type Input = { x: number; y: number; aim: number; fire: boolean; reload: boolean; heal: boolean; weapon: number | null }
export type Game = { actors: Actor[]; obstacles: Obstacle[]; loot: Loot[]; bullets: Bullet[]; particles: Particle[]; elapsed: number; zone: number; unlocked: number[]; ended: boolean; victory: boolean; rank: number; notice: string; noticeTime: number; random: () => number }
export const freshInput = (): Input => ({ x: 0, y: 0, aim: 0, fire: false, reload: false, heal: false, weapon: null })
export const distance = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y)
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))
export function createGame(seed = Date.now()): Game {
  let state = seed >>> 0
  const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296 }
  const obstacles: Obstacle[] = []
  for (let i = 0; i < 115; i++) {
    const item: Obstacle = { x: 70 + random() * (WORLD - 140), y: 70 + random() * (WORLD - 140), r: 18 + random() * 21, kind: i % 5 === 0 ? 'crate' : i % 3 === 0 ? 'rock' : 'tree', hp: i % 5 === 0 ? 65 : Infinity }
    if (Math.hypot(item.x - WORLD / 2, item.y - WORLD / 2) > 145 && obstacles.every(other => distance(item, other) > item.r + other.r + 30)) obstacles.push(item)
  }
  const actors: Actor[] = []
  for (let id = 0; id < 16; id++) {
    const angle = random() * Math.PI * 2, r = id === 0 ? 0 : 300 + random() * 650
    let x = WORLD / 2 + Math.cos(angle) * r, y = WORLD / 2 + Math.sin(angle) * r
    for (let tries = 0; tries < 100 && obstacles.some(o => distance({ x, y }, o) < o.r + 25); tries++) { x = 70 + random() * (WORLD - 140); y = 70 + random() * (WORLD - 140) }
    const weapon = id > 0 && id % 4 === 0 ? 1 : 0
    actors.push({ id, x, y, hp: 100, armor: id ? 0 : 25, angle: 0, weapon, ammo: WEAPONS[weapon].clip, reserve: id ? 9999 : 90, cooldown: 0, reload: 0, heal: 0, kits: id ? 0 : 2, alive: true, target: -1, think: 0, wander: random() * 6.28, kills: 0 })
  }
  const loot: Loot[] = [{ x: 1180, y: 1100, kind: 'rifle' }, { x: 1080, y: 1190, kind: 'shotgun' }]
  const kinds: Loot['kind'][] = ['ammo', 'kit', 'armor', 'rifle', 'shotgun']
  for (let i = 0; i < 48; i++) {
    const item = { x: 60 + random() * (WORLD - 120), y: 60 + random() * (WORLD - 120), kind: kinds[i % kinds.length] }
    if (!obstacles.some(o => distance(item, o) < o.r + 20)) loot.push(item)
  }
  return { actors, obstacles, loot, bullets: [], particles: [], elapsed: 0, zone: 1500, unlocked: [0], ended: false, victory: false, rank: 16, notice: 'Pegue o rifle azul à direita. Boa partida!', noticeTime: 5, random }
}
function tell(game: Game, text: string) { game.notice = text; game.noticeTime = 2.8 }
function move(actor: Actor, x: number, y: number, dt: number, game: Game) {
  const magnitude = Math.max(1, Math.hypot(x, y)), speed = actor.id === 0 ? 182 : 126
  actor.x = clamp(actor.x + x / magnitude * speed * dt, 18, WORLD - 18)
  actor.y = clamp(actor.y + y / magnitude * speed * dt, 18, WORLD - 18)
  for (const o of game.obstacles) {
    const d = distance(actor, o), min = o.r + 17
    if (d < min) { const angle = d > .001 ? Math.atan2(actor.y - o.y, actor.x - o.x) : actor.wander; actor.x = o.x + Math.cos(angle) * min; actor.y = o.y + Math.sin(angle) * min }
  }
}
function damage(game: Game, actor: Actor, amount: number, owner = -1) {
  if (!actor.alive) return
  const absorbed = Math.min(actor.armor, amount * .55)
  actor.armor -= absorbed; actor.hp = Math.max(0, actor.hp - amount + absorbed)
  if (actor.hp > 0) return
  actor.alive = false
  if (owner >= 0) game.actors[owner].kills++
  if (owner === 0) tell(game, 'Eliminação confirmada +100')
  game.loot.push({ x: actor.x, y: actor.y, kind: 'ammo' })
  for (let i = 0; i < 7; i++) game.particles.push({ x: actor.x, y: actor.y, vx: (game.random() - .5) * 120, vy: (game.random() - .5) * 120, life: .4, color: '#efce86' })
}
function shoot(game: Game, actor: Actor) {
  if (actor.cooldown > 0 || actor.reload > 0 || actor.heal > 0) return
  const weapon = WEAPONS[actor.weapon]
  if (actor.ammo <= 0) { if (actor.reserve > 0) actor.reload = weapon.reload; return }
  actor.ammo--; actor.cooldown = weapon.delay
  for (let i = 0; i < weapon.pellets; i++) {
    const angle = actor.angle + (game.random() - .5) * weapon.spread * 2
    const x = actor.x + Math.cos(actor.angle) * 27, y = actor.y + Math.sin(actor.angle) * 27
    game.bullets.push({ x, y, px: x, py: y, vx: Math.cos(angle) * weapon.speed, vy: Math.sin(angle) * weapon.speed, life: .75, damage: weapon.damage * (actor.id === 0 ? 1 : .72), owner: actor.id })
  }
}
function hitSegment(b: Bullet, x: number, y: number, r: number) {
  const dx = b.x - b.px, dy = b.y - b.py, length = dx * dx + dy * dy
  const t = length ? clamp(((x - b.px) * dx + (y - b.py) * dy) / length, 0, 1) : 0
  return Math.hypot(x - b.px - dx * t, y - b.py - dy * t) < r
}
export function step(game: Game, input: Input, delta: number) {
  if (game.ended) return
  const dt = clamp(delta, 0, .033)
  game.elapsed += dt; game.zone = Math.max(55, 1500 - Math.max(0, game.elapsed - 15) * 8)
  game.noticeTime = Math.max(0, game.noticeTime - dt)
  const player = game.actors[0]
  for (const actor of game.actors) {
    if (!actor.alive) continue
    actor.cooldown = Math.max(0, actor.cooldown - dt)
    if (actor.reload > 0) {
      actor.reload = Math.max(0, actor.reload - dt)
      if (!actor.reload) { const amount = Math.min(WEAPONS[actor.weapon].clip - actor.ammo, actor.reserve); actor.ammo += amount; actor.reserve -= amount }
    }
    if (actor.heal > 0) { actor.heal = Math.max(0, actor.heal - dt); if (!actor.heal) actor.hp = Math.min(100, actor.hp + 55) }
    if (actor.id === 0) {
      actor.angle = input.aim
      if (input.weapon !== null && game.unlocked.includes(input.weapon) && actor.weapon !== input.weapon) { actor.weapon = input.weapon; actor.ammo = 0; actor.reload = WEAPONS[actor.weapon].reload }
      if (input.reload && !actor.reload && actor.ammo < WEAPONS[actor.weapon].clip && actor.reserve > 0) actor.reload = WEAPONS[actor.weapon].reload
      if (input.heal && !actor.heal && actor.hp < 100 && actor.kits > 0) { actor.kits--; actor.heal = 2.2 }
      move(actor, input.x, input.y, dt, game)
      if (input.fire) shoot(game, actor)
    } else {
      actor.think -= dt
      if (actor.think <= 0) {
        actor.think = .35 + game.random() * .25
        const targets = game.actors.filter(other => other.alive && other.id !== actor.id)
        targets.sort((a, b) => distance(a, actor) - distance(b, actor))
        actor.target = targets[0]?.id ?? -1
        actor.wander += (game.random() - .5) * 1.5
      }
      const target = game.actors[actor.target], outside = Math.hypot(actor.x - WORLD / 2, actor.y - WORLD / 2) > game.zone - 65
      let mx = Math.cos(actor.wander), my = Math.sin(actor.wander)
      if (outside) { const a = Math.atan2(WORLD / 2 - actor.y, WORLD / 2 - actor.x); mx = Math.cos(a); my = Math.sin(a) }
      else if (target?.alive) {
        const a = Math.atan2(target.y - actor.y, target.x - actor.x), d = distance(actor, target)
        actor.angle = a + Math.sin(game.elapsed * 2 + actor.id) * .15
        if (d > 260) { mx = Math.cos(a); my = Math.sin(a) }
        else { mx = Math.cos(a + Math.PI / 2) * .65; my = Math.sin(a + Math.PI / 2) * .65 }
        if (d < 480) shoot(game, actor)
      }
      move(actor, mx, my, dt, game)
    }
    if (Math.hypot(actor.x - WORLD / 2, actor.y - WORLD / 2) > game.zone) damage(game, actor, (3 + game.elapsed / 22) * dt)
  }
  input.reload = false; input.heal = false; input.weapon = null
  for (const bullet of game.bullets) {
    bullet.px = bullet.x; bullet.py = bullet.y; bullet.x += bullet.vx * dt; bullet.y += bullet.vy * dt; bullet.life -= dt
    for (const o of game.obstacles) {
      if (!hitSegment(bullet, o.x, o.y, o.r)) continue
      bullet.life = 0; o.hp -= bullet.damage
      if (o.hp <= 0) { game.loot.push({ x: o.x, y: o.y, kind: game.random() > .4 ? 'ammo' : 'kit' }); o.r = 0 }
      break
    }
    if (bullet.life <= 0) continue
    for (const actor of game.actors) if (actor.alive && actor.id !== bullet.owner && hitSegment(bullet, actor.x, actor.y, 17)) { damage(game, actor, bullet.damage, bullet.owner); bullet.life = 0; break }
  }
  game.obstacles = game.obstacles.filter(o => o.hp > 0)
  game.bullets = game.bullets.filter(b => b.life > 0)
  for (const particle of game.particles) { particle.x += particle.vx * dt; particle.y += particle.vy * dt; particle.life -= dt }
  game.particles = game.particles.filter(p => p.life > 0)
  game.loot = game.loot.filter(item => {
    if (distance(item, player) > 32 || !player.alive) return true
    if (item.kind === 'ammo') { if (player.reserve >= 240) return true; player.reserve = Math.min(240, player.reserve + 36); tell(game, '+36 munições') }
    else if (item.kind === 'kit') { if (player.kits >= 5) return true; player.kits++; tell(game, '+1 kit médico · F para usar') }
    else if (item.kind === 'armor') { if (player.armor >= 75) return true; player.armor = 75; tell(game, 'Colete equipado') }
    else {
      const weapon = item.kind === 'rifle' ? 1 : 2
      if (!game.unlocked.includes(weapon)) game.unlocked.push(weapon)
      player.weapon = weapon; player.ammo = WEAPONS[weapon].clip; player.reserve = Math.min(240, player.reserve + 24); player.reload = 0
      tell(game, `${WEAPONS[weapon].name} equipada · teclas 1 / 2 / 3 para trocar`)
    }
    return false
  })
  const alive = game.actors.filter(a => a.alive).length
  if (!player.alive || alive <= 1) { game.ended = true; game.victory = player.alive; game.rank = player.alive ? 1 : alive + 1 }
}
