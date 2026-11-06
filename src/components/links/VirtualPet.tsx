import { useEffect, useState } from 'react'

type Mood = 'awake' | 'happy' | 'asleep'

export default function VirtualPet() {
  const [mood, setMood] = useState<Mood>('awake')

  useEffect(() => {
    if (mood === 'asleep') return
    const timer = setTimeout(() => setMood(mood === 'happy' ? 'awake' : 'asleep'), mood === 'happy' ? 2400 : 20000)
    return () => clearTimeout(timer)
  }, [mood])

  const asleep = mood === 'asleep'
  const happy = mood === 'happy'
  return (
    <section className={`links-pet links-pet-${mood}`} aria-label="Pet virtual Pixel">
      <button className="links-pet-touch" type="button" onClick={() => setMood(happy ? 'awake' : 'happy')} aria-label={asleep ? 'Acordar e fazer carinho no Pixel' : 'Fazer carinho no Pixel'}>
        <svg className="links-cat" viewBox="0 0 120 100" fill="none" aria-hidden="true">
          <ellipse cx="59" cy="91" rx="37" ry="5" fill="#000" opacity=".15" />
          <path className="links-cat-tail" d="M86 80c24 2 26-19 14-24-8-3-12 6-6 10" stroke="#829fcd" strokeWidth="10" strokeLinecap="round" />
          <path d="M35 62c-10 8-12 24-3 26h50c9-4 2-24-8-27" fill="#9db9e4" stroke="#bed3ef" strokeWidth="2" />
          <path d="m28 40 1-23c1-4 4-4 7-1l16 13h21l14-14c3-3 6-2 6 2l-1 28c8 29-2 38-31 38S20 73 28 40Z" fill="#bdd1ee" stroke="#d7e5fa" strokeWidth="2" strokeLinejoin="round" />
          <path d="m34 24 12 10-12 4V24Zm43 10 11-11-1 15-10-4Z" fill="#dbb9d1" />
          <path d="M56 29v10m8-10v9m8-8v7" stroke="#91add4" strokeWidth="3" strokeLinecap="round" />
          {asleep || happy ? <g stroke="#344765" strokeWidth="2.5" strokeLinecap="round"><path d={happy ? 'M39 54q5-7 10 0' : 'M39 53q5 5 10 0'} /><path d={happy ? 'M72 54q5-7 10 0' : 'M72 53q5 5 10 0'} /></g> : <g fill="#344765"><ellipse cx="44" cy="53" rx="3" ry="4" /><ellipse cx="77" cy="53" rx="3" ry="4" /></g>}
          <path d="m57 60 7 0-3.5 4L57 60Z" fill="#a47497" /><path d="M60.5 64v3m0 0q-4 4-7 0m7 0q4 4 7 0" stroke="#596c8b" strokeWidth="1.5" strokeLinecap="round" />
          <path d="m25 57 12 3m-13 4 12-1m49-3 12-3m-11 6 12 1" stroke="#91a9cb" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M40 82v5m34-5v5" stroke="#829fcd" strokeWidth="2" strokeLinecap="round" />
          {happy ? <g className="links-cat-hearts" fill="#e9aecf"><path d="M10 24c-7-7-12 3 0 9 12-6 7-16 0-9ZM105 15c-6-6-10 3 0 8 10-5 6-14 0-8Z" /></g> : null}
          {asleep ? <text x="96" y="30" fill="#a6c2ec" fontSize="13" fontFamily="monospace">zZ</text> : null}
        </svg>
      </button>
      <div><strong>Esse é o Pixel<span aria-hidden="true">.</span></strong><p role="status">{asleep ? 'Recarregando as patinhas…' : happy ? 'Carinho recebido. Ronrom ativado.' : 'Um toque, um carinho.'}</p></div>
    </section>
  )
}
