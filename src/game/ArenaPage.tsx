import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { createGame, freshInput, step, WEAPONS, type Game, type Input } from './engine'
import { camera, render } from './render'
import './arena.css'
import { GAME_KEY_CODES, captureGameKey, gameKey, keyboardApi, releaseGameKeyboard, reservedExit } from './keyboard'

type Phase = 'ready' | 'playing' | 'paused' | 'over'
function snapshot(game: Game) {
  const player = game.actors[0]
  return { hp: Math.ceil(player.hp), armor: Math.ceil(player.armor), ammo: player.ammo, reserve: player.reserve, kits: player.kits, reload: player.reload, heal: player.heal, weapon: player.weapon, unlocked: [...game.unlocked], alive: game.actors.filter(a => a.alive).length, kills: player.kills, elapsed: Math.floor(game.elapsed), notice: game.noticeTime > 0 ? game.notice : '', outside: Math.hypot(player.x - 1100, player.y - 1100) > game.zone, rank: game.rank, victory: game.victory }
}
type Hud = ReturnType<typeof snapshot>
const initialHud: Hud = { hp: 100, armor: 25, ammo: 12, reserve: 90, kits: 2, reload: 0, heal: 0, weapon: 0, unlocked: [0], alive: 16, kills: 0, elapsed: 0, notice: '', outside: false, rank: 16, victory: false }

function Stick({ label, onMove }: { label: string; onMove: (x: number, y: number) => void }) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const active = useRef<number | null>(null)
  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (active.current !== event.pointerId) return
    const rect = event.currentTarget.getBoundingClientRect(), x = (event.clientX - rect.left - rect.width / 2) / 34, y = (event.clientY - rect.top - rect.height / 2) / 34, length = Math.max(1, Math.hypot(x, y))
    setPosition({ x: x / length * 28, y: y / length * 28 }); onMove(x / length, y / length)
  }
  const stop = () => { active.current = null; setPosition({ x: 0, y: 0 }); onMove(0, 0) }
  return <div className="arena-stick-wrap"><div className="arena-stick" role="group" aria-label={label} onPointerDown={event => { active.current = event.pointerId; event.currentTarget.setPointerCapture(event.pointerId); move(event) }} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}><span style={{ transform: `translate(${position.x}px, ${position.y}px)` }} /></div><small>{label}</small></div>
}
export default function ArenaPage() {
  const app = useRef<HTMLDivElement>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const canvas = useRef<HTMLCanvasElement>(null), gameRef = useRef<Game | null>(null), input = useRef<Input>(freshInput()), keys = useRef(new Set<string>()), phaseRef = useRef<Phase>('ready'), dirty = useRef(true), dimensions = useRef({ width: 800, height: 600 })
  const [phase, setPhase] = useState<Phase>('ready'), [hud, setHud] = useState<Hud>(initialHud), [best, setBest] = useState(0)
  const setMode = useCallback((mode: Phase) => { if (mode !== 'playing') releaseGameKeyboard(); phaseRef.current = mode; input.current.fire = false; keys.current.clear(); input.current.x = 0; input.current.y = 0; dirty.current = true; setPhase(mode) }, [])
  const immersive = useCallback(async () => {
    canvas.current?.focus({ preventScroll: true })
    try {
      if (!document.fullscreenElement && app.current?.requestFullscreen) await app.current.requestFullscreen()
      if (app.current && document.fullscreenElement === app.current && phaseRef.current === 'playing') await keyboardApi()?.lock?.(GAME_KEY_CODES)
    } catch { /* A partida continua se tela cheia/captura não for permitida. */ }
    if (phaseRef.current === 'playing' && app.current) canvas.current?.focus({ preventScroll: true })
    else releaseGameKeyboard()
  }, [])
  const resume = () => { setMode('playing'); void immersive() }
  useEffect(() => {
    const onFullscreen = () => {
      const active = document.fullscreenElement === app.current
      setFullscreen(active)
      if (!active) { releaseGameKeyboard(); if (phaseRef.current === 'playing') setMode('paused') }
    }
    document.addEventListener('fullscreenchange', onFullscreen)
    return () => { document.removeEventListener('fullscreenchange', onFullscreen); releaseGameKeyboard() }
  }, [setMode])
  useEffect(() => {
    const element = canvas.current, context = element?.getContext('2d', { alpha: false })
    if (!element || !context) return
    const game = createGame(); gameRef.current = game; setHud(snapshot(game))
    try { setBest(Number(localStorage.getItem('eyi-arena-best') || 0) || 0) } catch { /* Pontuação local é opcional. */ }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const resize = () => { const rect = element.getBoundingClientRect(), ratio = Math.min(window.devicePixelRatio || 1, 1.5); dimensions.current = { width: rect.width, height: rect.height }; element.width = Math.round(rect.width * ratio); element.height = Math.round(rect.height * ratio); context.setTransform(ratio, 0, 0, ratio, 0, 0); dirty.current = true }
    const observer = new ResizeObserver(resize); observer.observe(element); resize()
    let previous = 0, hudTime = 0, accumulator = 0, frameId = 0
    const frame = (time: number) => {
      const current = gameRef.current
      if (!current) return
      const elapsed = previous ? Math.min((time - previous) / 1000, .1) : 0; previous = time
      if (phaseRef.current === 'playing') {
        const pressed = keys.current
        if (pressed.size) { input.current.x = Number(pressed.has('d') || pressed.has('arrowright')) - Number(pressed.has('a') || pressed.has('arrowleft')); input.current.y = Number(pressed.has('s') || pressed.has('arrowdown')) - Number(pressed.has('w') || pressed.has('arrowup')) }
        accumulator += elapsed
        while (accumulator >= 1 / 60) { step(current, input.current, 1 / 60); accumulator -= 1 / 60 }
        dirty.current = true; hudTime += elapsed
        if (hudTime >= .1 || current.ended) { setHud(snapshot(current)); hudTime = 0 }
        if (current.ended) {
          const score = current.actors[0].kills * 100 + Math.floor(current.elapsed) + (current.victory ? 500 : 0)
          setBest(old => { const value = Math.max(old, score); try { localStorage.setItem('eyi-arena-best', String(value)) } catch { /* Sem armazenamento disponível. */ } return value })
          setMode('over')
        }
      } else accumulator = 0
      if (dirty.current) { render(context, current, dimensions.current.width, dimensions.current.height, reduced); dirty.current = false }
      frameId = requestAnimationFrame(frame)
    }
    frameId = requestAnimationFrame(frame)
    const down = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (event.repeat) return
        if (phaseRef.current === 'playing') { event.preventDefault(); setMode('paused') }
        else if (phaseRef.current === 'paused' && document.activeElement === element) { event.preventDefault(); setMode('playing'); element.focus({ preventScroll: true }) }
        return
      }
      if (phaseRef.current !== 'playing') return
      if (reservedExit(event)) {
        if (event.key === 'Tab') setMode('paused')
        return
      }
      // Cancela antes de verificar modificadores: Ctrl+O/R/W não são ações da partida.
      if (!captureGameKey(event, true, document.activeElement === element)) return
      if (event.ctrlKey || event.metaKey || event.altKey || ['Control', 'Meta', 'Alt'].includes(event.key)) {
        keys.current.clear(); input.current.x = 0; input.current.y = 0; input.current.fire = false
        return
      }
      const key = gameKey(event)
      if (!key) return
      keys.current.add(key)
      if (!event.repeat) {
        if (key === 'r') input.current.reload = true
        if (key === 'f') input.current.heal = true
        if (['1','2','3'].includes(key)) input.current.weapon = Number(key) - 1
      }
    }
    const up = (event: KeyboardEvent) => {
      captureGameKey(event, phaseRef.current === 'playing', document.activeElement === element)
      keys.current.delete(gameKey(event))
      if (!keys.current.size) { input.current.x = 0; input.current.y = 0 }
    }
    const pause = () => { if (phaseRef.current === 'playing') setMode('paused') }
    const visibility = () => { if (document.hidden) pause() }
    const release = (event: PointerEvent) => { if (event.pointerType !== 'touch') input.current.fire = false }
    window.addEventListener('keydown', down, true); window.addEventListener('keyup', up, true); window.addEventListener('blur', pause); window.addEventListener('pointerup', release); document.addEventListener('visibilitychange', visibility)
    return () => { cancelAnimationFrame(frameId); observer.disconnect(); window.removeEventListener('keydown', down, true); window.removeEventListener('keyup', up, true); window.removeEventListener('blur', pause); window.removeEventListener('pointerup', release); document.removeEventListener('visibilitychange', visibility) }
  }, [setMode])
  const start = () => { gameRef.current = createGame(); input.current = freshInput(); setHud(snapshot(gameRef.current)); setMode('playing'); void immersive() }
  const aim = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!gameRef.current || event.pointerType === 'touch') return
    const rect = event.currentTarget.getBoundingClientRect(), cam = camera(gameRef.current, rect.width, rect.height), player = gameRef.current.actors[0]
    input.current.aim = Math.atan2(cam.y + (event.clientY - rect.top - rect.height / 2) / cam.scale - player.y, cam.x + (event.clientX - rect.left - rect.width / 2) / cam.scale - player.x)
  }
  const time = `${Math.floor(hud.elapsed / 60)}:${String(hud.elapsed % 60).padStart(2, '0')}`
  return <div ref={app} className="arena-app" onClick={event => { if (phaseRef.current === 'playing' && event.target instanceof Element && event.target.closest('button')) canvas.current?.focus({ preventScroll: true }) }}>
    <header className="arena-header"><a href="/" aria-label="Voltar ao portfólio">EYI <span>PLAYGROUND</span></a><div>LAST <b>CIRCLE</b><span className="arena-version">SOLO · CONTRA BOTS</span></div><div className="arena-header-actions"><button onClick={() => { if (fullscreen) void document.exitFullscreen().catch(() => {}); else void immersive() }}>{fullscreen ? 'Sair da tela cheia' : 'Tela cheia'}</button><button onClick={() => { if (phase === 'playing') setMode('paused'); else if (phase === 'paused') resume() }} disabled={phase === 'ready' || phase === 'over'} aria-label={phase === 'paused' ? 'Continuar partida' : 'Pausar partida'}>{phase === 'paused' ? 'Continuar' : 'Pausar'} <kbd>Esc</kbd></button></div></header>
    <main className="arena-stage">
      <canvas ref={canvas} tabIndex={0} aria-label="Arena de sobrevivência. Use WASD ou setas para mover, mouse para mirar, clique para atirar, R para recarregar e F para curar." onPointerMove={aim} onPointerDown={event => { if (phaseRef.current !== 'playing') return; event.currentTarget.focus(); aim(event); if (event.pointerType !== 'touch') { input.current.fire = true; event.currentTarget.setPointerCapture(event.pointerId) } }} onPointerUp={() => { input.current.fire = false }} onPointerCancel={() => { input.current.fire = false }} />
      <div className="arena-hud" aria-label="Estado da partida"><div><span className="arena-live-dot" /> <strong>{hud.alive}</strong><small>vivos</small></div><div><strong>{hud.kills}</strong><small>eliminações</small></div><div><strong>{time}</strong><small>tempo</small></div></div>
      {phase === 'playing' && <>
        <div className={`arena-zone-note ${hud.outside ? 'danger' : ''}`}>{hud.outside ? 'FORA DA ZONA · volte para o círculo!' : hud.elapsed < 15 ? 'Explore, encontre equipamentos e sobreviva.' : 'A zona está encolhendo.'}</div>
        {hud.notice && <div className="arena-toast">{hud.notice}</div>}
        <div className="arena-bottom"><div className="arena-health"><div><span>VIDA</span><strong>{hud.hp}</strong><span className="arena-armor">COLETE {hud.armor}</span></div><div className="arena-health-track"><i style={{ width: `${hud.hp}%`, background: hud.hp < 30 ? '#f07864' : '#a6d494' }} /></div></div><div className="arena-weapon-info"><span>{WEAPONS[hud.weapon].name}</span><strong>{hud.ammo}<em> / {hud.reserve}</em></strong><small>{hud.heal > 0 ? 'Usando kit…' : hud.reload > 0 ? 'Recarregando…' : 'Munição'}</small></div></div>
        <div className="arena-inventory">{WEAPONS.map((weapon, index) => <button key={weapon.short} className={hud.weapon === index ? 'active' : ''} disabled={!hud.unlocked.includes(index)} onClick={() => { input.current.weapon = index }}><kbd>{index + 1}</kbd>{weapon.short}{!hud.unlocked.includes(index) && <span>coletar</span>}</button>)}<button onClick={() => { input.current.reload = true }} aria-label="Recarregar arma"><kbd>R</kbd>Recarregar</button><button onClick={() => { input.current.heal = true }} disabled={!hud.kits || hud.hp >= 100 || hud.heal > 0}><kbd>F</kbd>+ Kit ({hud.kits})</button></div>
        <div className="arena-touch"><Stick label="Mover" onMove={(x, y) => { input.current.x = x; input.current.y = y }} /><Stick label="Mirar / atirar" onMove={(x, y) => { if (Math.hypot(x, y) > .15) input.current.aim = Math.atan2(y, x); input.current.fire = Math.hypot(x, y) > .2 }} /></div>
      </>}
      {phase !== 'playing' && <div className="arena-overlay"><section className="arena-menu" aria-labelledby="arena-title"><span className="arena-eyebrow">EYI ORIGINAL · MINI BATTLE ROYALE</span><h1 id="arena-title">{phase === 'ready' ? <>LAST<br /><em>CIRCLE.</em></> : phase === 'paused' ? <>Respira.<br /><em>Tá pausado.</em></> : hud.victory ? <>O último<br /><em>sobrevivente.</em></> : <>Mais uma<br /><em>tentativa?</em></>}</h1><p>{phase === 'ready' ? 'Você, 15 bots e um círculo cada vez menor. Colete armas, proteja-se e fique por último.' : phase === 'paused' ? 'A partida fica congelada enquanto você estiver por aqui.' : `Posição #${hud.rank} · ${hud.kills} eliminações · ${time} de sobrevivência.`}</p><button className="arena-start" onClick={phase === 'paused' ? resume : start}>{phase === 'ready' ? 'Jogar em tela cheia' : phase === 'paused' ? 'Voltar para a partida' : 'Jogar de novo'} <span>↗</span></button><div className="arena-instructions"><span><kbd>W A S D</kbd> mover</span><span><kbd>Mouse</kbd> mirar / atirar</span><span><kbd>R</kbd> recarregar</span><span><kbd>F</kbd> kit médico</span></div><p className="arena-mobile-help">No celular: controle esquerdo para mover e direito para mirar e atirar.</p><p className="arena-focus-help">Clique na arena para focar o teclado. Esc pausa; Tab libera a navegação. Alguns atalhos do sistema não podem ser bloqueados pelo navegador.</p><div className="arena-menu-footer"><span>Recorde local <strong>{best}</strong></span><a href="/">Voltar ao portfólio</a></div></section></div>}
    </main>
  </div>
}
