import CookieConsent, { ratingCookiesAccepted } from './CookieConsent'
import { useEffect, useState } from 'react'
import { useTranslation } from '../i18n/LanguageContext'
type Summary = { average: number | null; total: number; mine: number | null; hasRated: boolean }
export default function PortfolioRating() {
  const { t } = useTranslation()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [score, setScore] = useState<number | null>(null)
  const [consent,setConsent]=useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [locked, setLocked] = useState(false)
  const hasRated = locked || Boolean(summary?.hasRated)
  const load = async () => {
    try {
      const response = await fetch('/api/content?view=ratings', { cache: 'no-store' })
      if (!response.ok) throw Error()
      const data = await response.json(); setSummary(data); setScore(previous=>data.hasRated ? data.mine : previous); setNotice('')
    } catch { setNotice('Não foi possível carregar as avaliações. Tente novamente.') }
  }
  useEffect(() => { const refresh=()=>{setConsent(ratingCookiesAccepted());void load()};refresh();window.addEventListener('portfolio-consent-change',refresh);return()=>window.removeEventListener('portfolio-consent-change',refresh) }, [])
  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (score === null || busy || !consent || hasRated) return
    setBusy(true); setNotice('')
    try {
      const response = await fetch('/api/content?view=ratings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rating: score }) })
      if (!response.ok) { const data = await response.json(); throw Error(data.error) }
      setSummary(await response.json()); setNotice('Obrigado! Sua avaliação foi salva.')
    } catch(error) { if (error instanceof Error && error.message === 'already_rated') { setLocked(true); setNotice('Você já avaliou. A nota não pode ser alterada.'); return } setNotice(error instanceof Error && error.message === 'rate_limited' ? 'Você enviou várias notas seguidas. Aguarde 1 minuto e tente novamente.' : 'Não foi possível salvar. Verifique os cookies e tente novamente.') }
    finally { setBusy(false) }
  }
  return <section className="pf-rating" aria-labelledby="rating-title">
    <div><h2 id="rating-title">{t('O que achou do portfólio?')}</h2><p>{t('De 0 a 5, quantas estrelas você dá?')}</p>
      <p className="pf-rating-note">{t('Avaliações moderadas pelo responsável do site.')}</p><div className="pf-rating-result"><strong>{summary ? summary.average === null ? '—' : summary.average.toFixed(1).replace('.', ',') : '…'}</strong><span>/ 5 <span aria-hidden="true">★</span><small>{summary ? `${summary.total} ${t('avaliações')}` : t('Carregando…')}</small></span></div>
      {summary?.total === 0 && <p>{t('Seja a primeira pessoa a avaliar.')}</p>}
    </div>
    <form onSubmit={submit}><CookieConsent/>{!consent&&<button type="button" className="pf-button" onClick={()=>window.dispatchEvent(new Event('portfolio-cookie-settings'))}>Permitir cookie para avaliar</button>}<fieldset disabled={busy || !consent || hasRated}><legend>{t('Sua avaliação')}</legend><div className="pf-rating-options">
      {[0,1,2,3,4,5].map(value => <label key={value}><input type="radio" name="portfolio-rating" value={value} checked={score === value} onChange={()=>setScore(value)}/><span className={score !== null && value > 0 && value <= score ? 'filled' : ''}><b aria-hidden="true">{value === 0 ? '0' : '★'}</b><small>{value}</small><span className="pf-rating-sr">{value} {t('estrelas')}</span></span></label>)}
      </div><button className="pf-button" type="submit" disabled={score === null || busy}>{t(busy ? 'Salvando…' : hasRated ? 'Avaliação enviada' : 'Enviar avaliação')}</button></fieldset>
      <p className="pf-rating-note">{t('Uma avaliação por IP. Depois do envio, a nota não pode ser alterada. O IP é convertido em um identificador protegido; não guardamos o endereço em texto.')}</p>
      <p role="status">{t(notice)}</p>{!summary && notice && <button type="button" className="pf-button" onClick={()=>void load()}>{t('Tentar novamente')}</button>}
    </form>
  </section>
}
