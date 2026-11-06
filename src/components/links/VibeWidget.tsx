export type VisitorVibe = 'calm' | 'focused' | 'busy'
const choices: { value: VisitorVibe; icon: string; label: string }[] = [
  { value: 'calm', icon: '😌', label: 'De boa' },
  { value: 'focused', icon: '🚀', label: 'No foco' },
  { value: 'busy', icon: '🤯', label: 'Na correria' },
]
export default function VibeWidget({ selected, onSelect }: { selected?: VisitorVibe; onSelect: (vibe: VisitorVibe) => void }) {
  return <section className="links-vibe" aria-label="Sua vibe hoje">
    <strong>Como você tá?</strong>
    <div className="links-vibe-options" role="group" aria-label="Escolha sua vibe">
      {choices.map(choice => <button key={choice.value} type="button" aria-label={choice.label} aria-pressed={selected === choice.value} onClick={() => onSelect(choice.value)}><span aria-hidden="true">{choice.icon}</span></button>)}
    </div>
    <small>{choices.find(choice => choice.value === selected)?.label || 'O Pixel quer saber.'}</small>
  </section>
}
