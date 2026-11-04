import { useEffect, useRef, useState } from 'react'
import { generateProjectPreview, inspectProjectRepository, previewConfiguration, type RepositoryPreview } from '@/lib/api'

type Props = { projectId: number; repository: string; onUse: (url: string) => void }

export default function ProjectPreviewAssistant({ projectId, repository, onUse }: Props) {
  const [configured, setConfigured] = useState<boolean | null>(null)
  const [result, setResult] = useState<RepositoryPreview | null>(null)
  const [busy, setBusy] = useState<'inspect' | 'generate' | null>(null)
  const [notice, setNotice] = useState('')
  const selection = useRef('')
  selection.current = `${projectId}:${repository}`
  useEffect(() => { void previewConfiguration().then((value) => setConfigured(value.configured)).catch(() => setConfigured(false)) }, [])
  useEffect(() => { setResult(null); setNotice('') }, [projectId, repository])
  const run = async (action: 'inspect' | 'generate') => {
    const selectionAtStart = selection.current
    setBusy(action); setNotice('')
    try {
      const next = action === 'inspect' ? await inspectProjectRepository(projectId, repository) : await generateProjectPreview(projectId, repository)
      if (selection.current !== selectionAtStart) return
      setResult(next)
      setNotice(action === 'generate' ? 'Prévia gerada. Revise antes de usar; depois salve o projeto.' : next.images.length ? 'Imagens encontradas no repositório. Revise a opção desejada antes de usar.' : 'Não encontrei capturas identificadas no repositório. Você pode gerar uma prévia com IA baseada nos arquivos lidos.')
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Não foi possível analisar o repositório.') }
    finally { setBusy(null) }
  }
  return <section className="admin-ai-preview" aria-label="Assistente de prévias do GitHub"><span className="admin-eyebrow">GitHub + IA</span><h3>Uma prévia do seu projeto.</h3><p>Analisa o README e os arquivos da interface do repositório público. O código não é executado. A imagem só vai ao portfólio quando você a escolher e salvar.</p>
    {configured === false && <p className="admin-ai-config">Geração ainda não configurada: adicione AI_GATEWAY_API_KEY no servidor. A busca de capturas do GitHub continua disponível.</p>}
    <div className="admin-form-row"><button type="button" className="admin-outline-action" disabled={Boolean(busy)} onClick={() => void run('inspect')}>{busy === 'inspect' ? 'Analisando GitHub...' : 'Buscar capturas no GitHub'}</button><button type="button" className="admin-primary-action" disabled={Boolean(busy) || configured !== true} onClick={() => void run('generate')}>{busy === 'generate' ? 'Lendo código e gerando...' : 'Gerar prévia com IA'}</button></div>
    <small>Gerar usa o saldo do serviço de IA configurado e pode levar alguns minutos. Não há geração automática nem repetição de requisições pagas.</small>
    {busy && <p role="status">{busy === 'generate' ? 'Aguarde. A IA está analisando os arquivos e criando uma imagem; sua capa atual será preservada.' : 'Lendo arquivos e procurando imagens no GitHub...'}</p>}
    {notice && <p className="admin-ai-notice" role="status">{notice}</p>}
    {result && <div className="admin-ai-evidence"><a href={result.repository} target="_blank" rel="noopener noreferrer">Ver repositório analisado ↗</a><details><summary>{result.files.length} arquivos lidos</summary><ul>{result.files.map((path) => <li key={path}>{path}</li>)}</ul></details></div>}
    {result?.image_url && <figure className="admin-ai-result"><img src={result.image_url} alt="Prévia ilustrativa gerada por IA a partir do código do projeto" /><figcaption>Prévia gerada por IA. Pode diferir da interface real.</figcaption><button type="button" className="admin-primary-action" onClick={() => { onUse(result.image_url!); setNotice('Prévia selecionada. Clique em Salvar projeto para publicá-la.') }}>Usar esta prévia</button></figure>}
    {Boolean(result?.images.length) && <div className="admin-github-images">{result!.images.map((item) => <figure key={item.url}><img src={item.url} alt={`Imagem encontrada: ${item.path}`} loading="lazy" onError={(event) => { event.currentTarget.hidden = true }} /><figcaption>{item.path}</figcaption><button type="button" className="admin-outline-action" onClick={() => { onUse(item.url); setNotice('Imagem selecionada. Salve o projeto para publicá-la.') }}>Usar imagem do GitHub</button><a href={item.url} target="_blank" rel="noopener noreferrer">Abrir original ↗</a></figure>)}</div>}
  </section>
}
