import { useEffect, useState, type FormEvent } from 'react'

type Run = { distanceKm: number; durationSeconds: number; date: string; url: string }
const endpoint = '/api/admin-content?personal_run=1'
export default function PersonalLinksEditor() {
  const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(''), [error, setError] = useState(false)
  const [run, setRun] = useState<Run | null>(null)
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    void fetch(endpoint, { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error('Não foi possível carregar a corrida. Reabra esta aba para tentar novamente.')
      setRun((await response.json()).run); setLoading(false)
    }).catch(error => { if (!controller.signal.aborted) { setNotice(error.message); setError(true); setLoading(false) } })
    return () => controller.abort()
  }, [])
  async function save(value: Run | null) {
    if (saving) return
    setSaving(true); setNotice(''); setError(false)
    try {
      const response = await fetch(endpoint, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ run: value }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Falha ao salvar.')
      setRun(value); setRevision(v => v + 1); setNotice(value ? 'Corrida publicada na página de links.' : 'Cartão restaurado para o link do Strava.')
    } catch (error) { setError(true); setNotice(error instanceof Error ? error.message : 'Falha ao salvar.') }
    finally { setSaving(false) }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    void save({ distanceKm: Number(data.get('distance')), durationSeconds: Number(data.get('minutes')) * 60 + Number(data.get('seconds')), date: String(data.get('date')), url: String(data.get('url')).trim() })
  }
  return <>
    <div className="admin-dashboard-heading"><div><span className="admin-eyebrow">Página pessoal</span><h1>Links pessoais</h1><p>Atualize o cartão da sua última corrida. Os recadinhos aparecem na aba Recados pessoais.</p></div></div>
    <section className="admin-panel-card"><h2>Última corrida</h2><p className="admin-setting-description">Preencha os dados da sua corrida diretamente. Não há sincronização automática com a API do Strava. Publique somente informações que deseja tornar públicas.</p>
      {loading ? <p role="status">Carregando…</p> : <form key={revision} onSubmit={submit} className="admin-form-grid">
        <fieldset disabled={saving} className="personal-run-fields">
          <label>Distância (km)<input name="distance" type="number" min="0.01" max="500" step="0.01" required defaultValue={run?.distanceKm} /></label>
          <label>Tempo em minutos<input name="minutes" type="number" min="0" max="10080" step="1" required defaultValue={run ? Math.floor(run.durationSeconds / 60) : ''} /></label>
          <label>Segundos adicionais<input name="seconds" type="number" min="0" max="59" step="1" required defaultValue={run ? run.durationSeconds % 60 : 0} /></label>
          <label>Data<input name="date" type="date" required defaultValue={run?.date} /></label>
          <label>Link direto da atividade<input name="url" type="url" maxLength={300} required placeholder="https://www.strava.com/activities/123456789" defaultValue={run?.url} /></label>
          <div className="admin-form-row"><button className="admin-primary-action" type="submit">{saving ? 'Salvando…' : 'Publicar corrida'}</button><button className="admin-ghost-action" type="button" onClick={() => void save(null)}>Ocultar dados da corrida</button></div>
        </fieldset>
      </form>}
      {notice && <p role={error ? 'alert' : 'status'} className={error ? 'admin-toast-demo admin-toast-error' : 'admin-toast-demo'}>{notice}</p>}
    </section>
  </>
}
