import { useEffect, useState } from 'react'
import PushNotifications from './PushNotifications'
import { getAdminMessages, markMessageRead, type ContactMessage, type MessageSource } from '@/lib/api'

export default function MessagesInbox({ source = 'portfolio' }: { source?: MessageSource }) {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [next, setNext] = useState<number | null>(null)
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState<number | null>(null)

  const load = async (before?: number) => {
    setLoading(true)
    setError('')
    try {
      const result = await getAdminMessages(before, source)
      setMessages(current => before ? [...current, ...result.messages] : result.messages)
      setNext(result.next)
      setUnread(result.unread)
    } catch (error) { setError(error instanceof Error ? error.message : 'Não foi possível carregar as mensagens.') }
    finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])

  const toggleRead = async (message: ContactMessage) => {
    setUpdating(message.id)
    setError('')
    try {
      const result = await markMessageRead(message.id, !message.read_at, source)
      setMessages(current => current.map(item => item.id === message.id ? { ...item, read_at: result.read_at } : item))
      setUnread(current => Math.max(0, current + (message.read_at ? 1 : -1)))
    } catch (error) { setError(error instanceof Error ? error.message : 'Não foi possível atualizar a mensagem.') }
    finally { setUpdating(null) }
  }

  return <>
    <div className="admin-dashboard-heading"><div><span className="admin-eyebrow">Administrador</span><h1>{source === 'personal' ? 'Recados pessoais' : 'Contatos do portfólio'}</h1><p>{source === 'personal' ? 'Recadinhos anônimos da sua página de links.' : 'Contatos profissionais enviados pelo portfólio.'} {unread} não lida(s).</p></div><button className="admin-ghost-action" onClick={() => void load()} disabled={loading || updating !== null}>Atualizar</button></div>
    <PushNotifications />
    {error && <p className="admin-toast-demo admin-toast-error" role="alert">{error}</p>}
    {loading && <p role="status">Carregando mensagens…</p>}
    {!loading && !error && !messages.length && <section className="admin-panel-card"><h2>Sua caixa de entrada está vazia</h2><p className="admin-setting-description">{source === 'personal' ? 'Os recadinhos da sua página pessoal aparecerão aqui.' : 'Os contatos do portfólio aparecerão aqui.'}</p></section>}
    <div className="admin-message-list">{messages.map(message => <article className="admin-panel-card admin-message" key={message.id}>
      <div className="admin-message-heading"><div><h2>{message.name}</h2>{message.email ? <a href={`mailto:${encodeURIComponent(message.email)}`}>{message.email}</a> : <small>Links pessoais · sem nome ou e-mail</small>}</div><span>{message.read_at ? 'Lida' : 'Nova'}</span></div>
      <time dateTime={message.created_at}>{new Date(message.created_at).toLocaleString('pt-BR')}</time>
      <p className="admin-message-body">{message.message}</p>
      <div className="admin-form-row">{message.email && <a className="admin-primary-action" href={`mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent('Seu contato pelo portfólio — Eric Ikeda')}`}>Responder por e-mail</a>}<button className="admin-ghost-action" disabled={updating !== null} onClick={() => void toggleRead(message)}>{updating === message.id ? 'Atualizando…' : message.read_at ? 'Marcar como não lida' : 'Marcar como lida'}</button></div>
    </article>)}</div>
    {next && <button className="admin-ghost-action" disabled={loading || updating !== null} onClick={() => void load(next)}>Carregar mensagens anteriores</button>}
  </>
}
