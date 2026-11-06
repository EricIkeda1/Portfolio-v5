import { useEffect, useState } from 'react'

const zone = 'America/Sao_Paulo'
const clock = new Intl.DateTimeFormat('pt-BR', { timeZone: zone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
const calendar = new Intl.DateTimeFormat('pt-BR', { timeZone: zone, weekday: 'short', day: 'numeric', month: 'short' })

export default function ClockWidget() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    function update() {
      clearTimeout(timer)
      if (document.hidden) return
      setNow(new Date())
      timer = setTimeout(update, 60_000 - Date.now() % 60_000)
    }
    update()
    document.addEventListener('visibilitychange', update)
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', update) }
  }, [])
  const time = now ? clock.format(now) : '--:--'
  const hour = Number(time.slice(0, 2))
  const greeting = !now ? 'Meu horário' : hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  return <section className="links-clock" aria-label="Relógio no horário de Brasília">
    <small className="links-clock-greeting"><span aria-hidden="true">{now && (hour < 6 || hour >= 18) ? '☾' : '☀'}</span>{greeting}</small>
    <time dateTime={now?.toISOString()}>{time}</time>
    <span className="links-clock-date">{now ? calendar.format(now) : 'Carregando data…'}</span>
    <small>Horário de Brasília</small>
  </section>
}
