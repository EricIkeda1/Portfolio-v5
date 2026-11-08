import { useEffect, useState } from 'react'
import { careForPixel, EMPTY_PIXEL_PROGRESS, parsePixelProgress, PIXEL_PROGRESS_KEY, PIXEL_TRICKS, pixelTotal, type PixelCare } from './pixel-progress'
import type { VisitorVibe } from './VibeWidget'

type Mood = 'awake' | 'happy' | 'asleep'

export default function VirtualPet({ reaction }: { reaction?: { vibe: VisitorVibe; id: number } | null }) {
  const [mood, setMood] = useState<Mood>('awake')
  const [pets, setPets] = useState(0)
  const [progress, setProgress] = useState(EMPTY_PIXEL_PROGRESS)
  const [loaded, setLoaded] = useState(false)
  const [action, setAction] = useState('pet')
  const [message, setMessage] = useState('')
  const [saved, setSaved] = useState(true)
  const total = pixelTotal(progress)
  const nextTrick = PIXEL_TRICKS.find(trick => total < trick.required)
  const unlocked = PIXEL_TRICKS.filter(trick => total >= trick.required)

  useEffect(() => {
    try { setProgress(parsePixelProgress(localStorage.getItem(PIXEL_PROGRESS_KEY))) }
    catch { setSaved(false) }
    setLoaded(true)
  }, [])
  useEffect(() => {
    if (!loaded) return
    try { localStorage.setItem(PIXEL_PROGRESS_KEY, JSON.stringify(progress)); setSaved(true) }
    catch { setSaved(false) }
  }, [loaded, progress])

  useEffect(() => {
    if (mood === 'asleep') return
    const timer = setTimeout(() => setMood(mood === 'happy' ? 'awake' : 'asleep'), mood === 'happy' ? 4000 : 20000)
    return () => clearTimeout(timer)
  }, [mood, pets])

  useEffect(() => {
    if (!reaction) return
    setMood('happy')
    setMessage('')
    setAction('pet')
    setPets(count => count + 1)
  }, [reaction?.id])
  const replies: Record<VisitorVibe, string> = {
    calm: 'De boa com você. Fica mais um pouquinho. 🐾',
    focused: 'Vai com tudo! Eu cuido do cantinho. 🚀',
    busy: 'Respira. Uma coisa de cada vez. Toma um carinho. 💙',
  }

  const asleep = mood === 'asleep'
  const happy = mood === 'happy'
  function interact(care: PixelCare) {
    if (!loaded) return
    const next = careForPixel(progress, care)
    const newTrick = PIXEL_TRICKS.find(trick => total < trick.required && pixelTotal(next) >= trick.required)
    setProgress(next)
    setAction(care)
    setMood('happy')
    setPets(count => count + 1)
    const responses = {
      pet: 'Carinho recebido. Rabinho a mil! 💙',
      treat: 'Croc, croc… o melhor petisco do dia! 🦴',
      play: 'Peguei a bolinha! De novo, de novo! 🎾',
    }
    setMessage(newTrick ? `${responses[care]} Desbloqueou: ${newTrick.label}!` : responses[care])
  }
  function performTrick(id: string) {
    const trick = unlocked.find(item => item.id === id)
    if (!trick) return
    setAction(id); setMood('happy'); setPets(count => count + 1)
    setMessage(id === 'paw' ? 'Toca aqui! Uma patinha só pra você. 🐾' : id === 'spin' ? 'Uma voltinha de felicidade! ✨' : 'Você é da turma do Pixel! Festa de rabinho! 🎉')
  }

  return (
    <section className={`links-pet links-pet-interactive links-pet-${mood}`} aria-label="Cachorrinho virtual Pixel">
      <button className="links-pet-touch" type="button" onClick={() => interact('pet')} disabled={!loaded} aria-label={asleep ? 'Acordar e fazer carinho no Pixel' : 'Fazer carinho no Pixel'}>
        <svg key={pets} className={`links-dog pixel-action-${happy ? action : 'idle'}`} viewBox="0 0 120 110" fill="none" aria-hidden="true">
          <ellipse cx="59" cy="100" rx="37" ry="5" fill="#000" opacity=".15" />
          <g className="links-dog-body">
            <path className="links-dog-tail" d="M84 85c20 0 24-18 18-26" stroke="#c89a70" strokeWidth="11" strokeLinecap="round" />
            <path d="M38 65c-8 7-13 26-8 31h55c5-6-1-25-10-31" fill="#c89a70" stroke="#e8c49d" strokeWidth="1.5" />
            <ellipse cx="58" cy="83" rx="16" ry="15" fill="#f1d7b6" />
            <path d="M32 89q-5 8 1 9h14q4-4-1-9m24 0q-5 7-1 9h15q5-3-1-9" fill="#e3be94" stroke="#edcda9" strokeWidth="1.5" strokeLinejoin="round" />
            <g className="links-dog-head">
              <path className="links-dog-ear links-dog-ear-left" d="M36 28C16 18 13 40 19 60c3 9 13 8 18-4l7-22" fill="#94684b" stroke="#b08563" strokeWidth="1.5" />
              <path className="links-dog-ear links-dog-ear-right" d="M79 28c20-10 23 12 17 32-3 9-13 8-18-4l-7-22" fill="#94684b" stroke="#b08563" strokeWidth="1.5" />
              <path d="M29 43c0-18 11-26 29-26s29 8 29 26v12c0 19-12 25-29 25S29 74 29 55V43Z" fill="#dfb98d" stroke="#efcfa9" strokeWidth="1.5" />
              <path d="M55 18c-4 10-2 22 3 26 5-5 7-17 4-26" fill="#f1d7b6" />
              <ellipse cx="58" cy="63" rx="20" ry="13" fill="#f5e1c6" />
              <g className="links-dog-eyes-open" fill="#3d3540"><ellipse cx="43" cy="47" rx="3.3" ry="4.3" /><ellipse cx="74" cy="47" rx="3.3" ry="4.3" /><circle cx="44" cy="46" r="1" fill="#fff" /><circle cx="75" cy="46" r="1" fill="#fff" /></g>
              <g className="links-dog-eyes-happy" stroke="#544453" strokeWidth="2.4" strokeLinecap="round"><path d="M38 48q5-7 10 0m21 0q5-7 10 0" /></g>
              <g className="links-dog-eyes-sleep" stroke="#544453" strokeWidth="2.2" strokeLinecap="round"><path d="M38 47q5 5 10 0m21 0q5 5 10 0" /></g>
              <g className="links-dog-cheeks" fill="#d69295"><ellipse cx="35" cy="57" rx="5" ry="2.4" /><ellipse cx="81" cy="57" rx="5" ry="2.4" /></g>
              <path d="M52 57q6-4 12 0l-2 4q-4 4-8 0l-2-4Z" fill="#51414a" /><path d="M58 63v4m0 0q-4 5-8 0m8 0q4 5 8 0" stroke="#795d5b" strokeWidth="1.7" strokeLinecap="round" />
              <g className="links-dog-tongue"><path d="M54 68h8v6a4 4 0 0 1-8 0v-6Z" fill="#dc929d" /><path d="M58 69v4" stroke="#b86d82" strokeLinecap="round" /></g>
              <path d="m39 75 19 5 19-5-19 14-19-14Z" fill="#779fe0" stroke="#a2c0ee" strokeWidth="1.2" /><circle cx="58" cy="81" r="2" fill="#dae8ff" />
            </g>
          </g>
          <g className="links-dog-snooze"><text x="93" y="24" fill="#a6c2ec" fontSize="12" fontFamily="monospace">zZ</text></g>
          {pets > 0 ? <g key={pets} className="links-dog-hearts" fill="#efb2ce"><path d="M17 36c-8-8-14 4 0 11 14-7 8-19 0-11Z" /><path d="M101 24c-7-7-12 3 0 9 12-6 7-16 0-9Z" /><path d="M58 8c-5-5-9 2 0 7 9-5 5-12 0-7Z" /></g> : null}
        </svg>
      </button>
      <div className="links-pet-copy"><strong>Esse é o Pixel<span aria-hidden="true">.</span></strong><p key={mood} className="links-pet-message" role="status">{asleep ? 'Recarregando as patinhas…' : happy && message ? message : reaction ? replies[reaction.vibe] : happy ? 'Carinho recebido. Rabinho a mil!' : 'Um toque, um carinho.'}</p></div>
      <div className="pixel-care-actions" aria-label="Cuidar do Pixel">
        <button type="button" disabled={!loaded} onClick={() => interact('pet')}><span aria-hidden="true">💙</span>Carinho</button>
        <button type="button" disabled={!loaded} onClick={() => interact('treat')}><span aria-hidden="true">🦴</span>Petisco</button>
        <button type="button" disabled={!loaded} onClick={() => interact('play')}><span aria-hidden="true">🎾</span>Brincar</button>
      </div>
      <details className="pixel-tricks">
        <summary>Truques do Pixel <span>{unlocked.length}/{PIXEL_TRICKS.length}</span></summary>
        <div className="pixel-trick-actions">
          {PIXEL_TRICKS.map(trick => <button key={trick.id} type="button" disabled={!loaded || total < trick.required} onClick={() => performTrick(trick.id)}>{total >= trick.required ? '✨' : '🔒'} {trick.label}<small>{total >= trick.required ? 'Desbloqueado' : `${trick.required} cuidados`}</small></button>)}
        </div>
        <p className="pixel-progress-copy">{nextTrick ? `Faltam ${nextTrick.required - total} cuidados para ${nextTrick.label.toLowerCase()}.` : 'Todos os truques desbloqueados. O Pixel adorou sua companhia!'} {saved ? 'Progresso salvo neste navegador.' : 'O navegador não permitiu salvar. Você ainda pode brincar nesta visita.'}</p>
      </details>
      {happy && action === 'treat' && <span key={`treat-${pets}`} className="pixel-prop" aria-hidden="true">🦴</span>}
      {happy && action === 'play' && <span key={`ball-${pets}`} className="pixel-prop pixel-ball" aria-hidden="true">🎾</span>}
    </section>
  )
}
