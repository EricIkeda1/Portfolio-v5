import { useEffect, useState } from 'react'

const symbols = ['🐶', '🎮', '🎧', '💻']
function newDeck() {
  const cards = [...symbols, ...symbols]
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j], cards[i]]
  }
  return cards
}

export default function MemoryGame() {
  const [cards, setCards] = useState(newDeck)
  const [selected, setSelected] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [attempts, setAttempts] = useState(0)
  const won = matched.length === cards.length

  useEffect(() => {
    if (selected.length !== 2) return
    const timer = window.setTimeout(() => setSelected([]), 900)
    return () => window.clearTimeout(timer)
  }, [selected])

  function flip(index: number) {
    if (selected.length === 2 || selected.includes(index) || matched.includes(index)) return
    if (!selected.length) { setSelected([index]); return }
    const first = selected[0]
    setAttempts(value => value + 1)
    if (cards[first] === cards[index]) {
      setMatched(value => [...value, first, index]); setSelected([])
    } else setSelected([first, index])
  }
  function restart() {
    setCards(newDeck()); setSelected([]); setMatched([]); setAttempts(0)
  }

  return <div className="links-memory">
    <div className="links-memory-score"><span>{matched.length / 2}/4 pares</span><span>{attempts} tentativa(s)</span></div>
    <div className="links-memory-board" role="group" aria-label="Cartas do jogo da memória">
      {cards.map((symbol, index) => {
        const found = matched.includes(index), visible = found || selected.includes(index)
        return <button key={index} type="button" className={found ? 'is-matched' : visible ? 'is-revealed' : ''} disabled={found || selected.includes(index) || selected.length === 2} onClick={() => flip(index)} aria-label={`Carta ${index + 1}, ${found ? `par encontrado ${symbol}` : visible ? symbol : 'virar'}`}>
          <span aria-hidden="true">{visible ? symbol : '?'}</span>
        </button>
      })}
    </div>
    <p className="links-memory-status" role="status">{won ? `Mandou bem! Todos os pares em ${attempts} tentativa(s). 🎉` : 'Encontre os quatro pares. Toque em duas cartas.'}</p>
    <button type="button" className="links-qr-download" onClick={restart}>{won ? 'Jogar de novo' : 'Recomeçar'}</button>
  </div>
}
