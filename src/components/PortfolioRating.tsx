import { ratingCookiesAccepted } from './CookieConsent'
import { useEffect, useState } from 'react'
import { useTranslation } from '../i18n/LanguageContext'
type Summary = { average: number | null; total: number; mine: number | null }
export default function PortfolioRating() {
  const { t } = useTranslation()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [score, setScore] = useState<number | null>(null)
  const [consent,setConsent]=useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const load = async () => {
    try {
      const response = await fetch('/api/content?view=ratings', { cache: 'no-store' })
      if (!response.ok) throw Error()
      const data = await response.json(); setSummary(data); setScore(previous=>previous ?? data.mine); setNotice('')
    } catch { setNotice('Não foi possível carregar as avaliações. Tente novamente.') }
  }
  useEffect(() => { const refresh=()=>{setConsent(ratingCookiesAccepted());void load()};refresh();window.addEventListener('portfolio-consent-change',refresh);return()=>window.removeEventListener('portfolio-consent-change',refresh) }, [])
  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (score === null || busy || !consent) return
    setBusy(true); setNotice('')
    try {
      const response = await fetch('/api/content?view=ratings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rating: score }) })
      if (!response.ok) { const data = await response.json(); throw Error(data.error) }
      setSummary(await response.json()); setNotice('Obrigado! Sua avaliação foi salva.')
    } catch(error) { setNotice(error instanceof Error && error.message === 'rate_limited' ? 'Muitas tentativas. Tente novamente amanhã.' : 'Não foi possível salvar. Verifique os cookies e tente novamente.') }
    finally { setBusy(false) }
  }
  return <section className="pf-rating" aria-labelledby="rating-title">
    <div><h2 id="rating-title">{t('O que achou do portfólio?')}</h2><p>{t('De 0 a 5, quantas estrelas você dá?')}</p>
      <p className="pf-rating-note">{t('Avaliações moderadas pelo responsável do site.')}</p><div className="pf-rating-result"><strong>{summary ? summary.average === null ? '—' : summary.average.toFixed(1).replace('.', ',') : '…'}</strong><span>/ 5 <span aria-hidden="true">★</span><small>{summary ? `${summary.total} ${t('avaliações')}` : t('Carregando…')}</small></span></div>
      {summary?.total === 0 && <p>{t('Seja a primeira pessoa a avaliar.')}</p>}
    </div>
    <form onSubmit={submit}>{!consent&&<button type="button" className="pf-button" onClick={()=>window.dispatchEvent(new Event('portfolio-cookie-settings'))}>Permitir cookie para avaliar</button>}<fieldset disabled={busy || !consent}><legend>{t('Sua avaliação')}</legend><div className="pf-rating-options">
      {[0,1,2,3,4,5].map(value => <label key={value}><input type="radio" name="portfolio-rating" value={value} checked={score === value} onChange={()=>setScore(value)}/><span className={score !== null && value > 0 && value <= score ? 'filled' : ''}><b aria-hidden="true">{value === 0 ? '0' : '★'}</b><small>{value}</small><span className="pf-rating-sr">{value} {t('estrelas')}</span></span></label>)}
      </div><button className="pf-button" type="submit" disabled={score === null || busy}>{t(busy ? 'Salvando…' : summary?.mine !== null && summary?.mine !== undefined ? 'Atualizar avaliação' : 'Enviar avaliação')}</button></fieldset>
      <p className="pf-rating-note">{t('Uma avaliação por IP. Uma nova nota na mesma rede substitui a anterior. O IP é convertido em um identificador protegido; não guardamos o endereço em texto.')}</p>
      <p role="status">{t(notice)}</p>{!summary && notice && <button type="button" className="pf-button" onClick={()=>void load()}>{t('Tentar novamente')}</button>}
    </form>
  </section>
}
