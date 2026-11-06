import { useEffect, useRef, useState, type FormEvent } from 'react'

type Run = { distanceKm: number; durationSeconds: number; date: string; url: string }
function duration(seconds: number) {
  const hours = Math.floor(seconds / 3600), minutes = Math.floor(seconds % 3600 / 60)
  return hours ? `${hours}h ${minutes}min` : `${minutes}min ${seconds % 60}s`
}

export default function PersonalExtras() {
  const [run, setRun] = useState<Run | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState('')
  const [failed, setFailed] = useState(false)
  const [sent, setSent] = useState(false)
  const [anonymous, setAnonymous] = useState(true)
  useEffect(() => {
    const controller = new AbortController()
    void fetch('/api/content?view=run', { signal: controller.signal }).then(async response => {
      if (!response.ok) return
      const data = await response.json()
      if (!controller.signal.aborted && data.run && typeof data.run.distanceKm === 'number' && typeof data.run.durationSeconds === 'number' && /^https:\/\/(?:www\.)?strava\.com\/activities\/[0-9]+$/.test(data.run.url)) setRun(data.run)
    }).catch(() => {})
    return () => controller.abort()
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending || sent) return
    const form = event.currentTarget, data = new FormData(form)
    setSending(true); setNotice(''); setFailed(false)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'personal', anonymous, ...(anonymous ? {} : { name: data.get('name') }), message: data.get('message'), website: data.get('website') }),
        signal: AbortSignal.timeout(15000),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível enviar agora.')
      form.reset(); setSent(true); setNotice('Recadinho entregue! Só o Eric pode ler no painel. 💌')
    } catch (error) {
      setFailed(true); setNotice(error instanceof Error && error.name !== 'TimeoutError' ? error.message : 'A conexão demorou. Tente novamente em instantes.')
    } finally { setSending(false) }
  }

  return <>
    <section className="links-personal-extras" aria-label="Além dos links">
      <a className="links-run" href={run?.url || 'https://strava.app.link/abHHLSIVP7b'} target="_blank" rel="noopener noreferrer">
        <svg className="links-extra-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="15" cy="4" r="2"/><path d="m12 8-3 5 4 3-2 5m1-13 4 4h4M5 11l4-3h3m-4 9-3 4"/></svg>
        <span><small>{run ? 'Última corrida · ' + new Date(run.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'Fora das telas'}</small>
          <strong>{run ? `${run.distanceKm.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} km · ${duration(run.durationSeconds)}` : 'Minhas corridas'}</strong>
          <small>{run ? 'Ver atividade no Strava' : 'Me acompanhe no Strava'}</small></span>
      </a>
      <button className="links-note-open" type="button" aria-haspopup="dialog" onClick={() => { setNotice(''); setSent(false); setFailed(false); dialog.current?.showModal() }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="4"/><path d="m4 7 8 6 8-6"/></svg><span>Deixe um recado<small>Privado, do seu jeito</small></span>
      </button>
    </section>
    <dialog ref={dialog} className="links-qr-dialog links-note-dialog" aria-labelledby="links-note-title" onCancel={event => { if (sending) event.preventDefault() }}>
      <button className="links-qr-close" type="button" disabled={sending} aria-label="Fechar recadinho" onClick={() => dialog.current?.close()}>×</button>
      <span className="links-eyebrow">UMA MENSAGEM SÓ SUA</span>
      <h2 id="links-note-title">Um recadinho?</h2>
      <p>Você escolhe: manter o mistério ou me contar quem é. O recado continua privado.</p>
      <form onSubmit={submit} aria-busy={sending}>
        <fieldset disabled={sending || sent}>
          <div className="links-note-identity" role="radiogroup" aria-label="Como deseja enviar?">
            <label><input type="radio" name="identity" checked={anonymous} onChange={() => setAnonymous(true)} />Anônimo</label>
            <label><input type="radio" name="identity" checked={!anonymous} onChange={() => setAnonymous(false)} />Com meu nome</label>
          </div>
          {!anonymous && <div className="links-note-name"><label htmlFor="note-name">Seu nome</label><input id="note-name" name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder="Como posso te chamar?" /></div>}
          <label htmlFor="anonymous-message">Seu recado</label>
          <textarea id="anonymous-message" name="message" rows={4} minLength={10} maxLength={1000} required placeholder="O que você quer me contar?" aria-describedby="note-privacy" />
          <div className="links-note-trap" aria-hidden="true"><label htmlFor="note-website">Deixe vazio</label><input id="note-website" name="website" tabIndex={-1} autoComplete="off" /></div>
          <small id="note-privacy">De 10 a 1.000 caracteres. O texto e o nome, quando informado, ficam criptografados no banco e são lidos apenas no painel privado do Eric. Evite enviar dados sensíveis.</small>
          <button className="links-qr-download" type="submit">{sending ? 'Enviando…' : sent ? 'Entregue ✓' : 'Enviar recadinho'}</button>
        </fieldset>
        {notice && <p className={failed ? 'links-note-error' : 'links-note-success'} role={failed ? 'alert' : 'status'}>{notice}</p>}
      </form>
      <details className="links-note-privacy"><summary>Privacidade e proteção contra spam</summary><p>O nome é solicitado apenas quando você escolhe se identificar; não pedimos e-mail. No modo anônimo, nenhum nome é enviado ou guardado. Para limitar envios, o servidor usa temporariamente um identificador protegido derivado do IP; o provedor de hospedagem também pode manter registros técnicos. O anonimato não é absoluto. Os recados não são publicados. Limite de cinco mensagens por 15 minutos por conexão, compartilhado com o formulário de contato.</p></details>
    </dialog>
  </>
}
