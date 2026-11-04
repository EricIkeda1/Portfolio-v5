import { useEffect, useState } from 'react'
import { disablePushSubscription, getNotificationKey, getPushStatus, savePushSubscription, testPushNotification } from '@/lib/api'

function supportsPush() {
  return typeof window !== 'undefined' && window.isSecureContext && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

export default function PushNotifications() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [busy, setBusy] = useState(true)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState(false)
  const supported = supportsPush()

  useEffect(() => {
    if (!supported) { setBusy(false); return }
    let cancelled = false
    void (async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration('/admin')
        const existing = await registration?.pushManager.getSubscription()
        if (existing) {
          const status = await getPushStatus(existing.endpoint)
          if (!cancelled) {
            setSubscription(existing)
            setEnabled(status.enabled && Notification.permission === 'granted')
            if (status.lastError) { setNotice(status.lastError); setError(true) }
          }
        }
      } catch { if (!cancelled) { setNotice('Não foi possível verificar as notificações deste aparelho. Tente ativá-las novamente.'); setError(true) } }
      finally { if (!cancelled) setBusy(false) }
    })()
    return () => { cancelled = true }
  }, [supported])

  const enable = async () => {
    if (!supported || busy) return
    setBusy(true); setNotice(''); setError(false)
    try {
      // Solicita a permissão diretamente no clique, antes de qualquer chamada à API.
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') throw new Error('Permita as notificações nas configurações deste site no navegador e tente novamente.')
      const { publicKey } = await getNotificationKey()
      await navigator.serviceWorker.register('/admin-notifications-sw.js', { scope: '/admin' })
      const registration = await navigator.serviceWorker.ready
      const key = Uint8Array.from(atob(publicKey.replace(/-/g, '+').replace(/_/g, '/')), char => char.charCodeAt(0))
      const current = await registration.pushManager.getSubscription()
      if (current) {
        await disablePushSubscription(current.endpoint)
        await current.unsubscribe()
      }
      const next = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key })
      await savePushSubscription(next.toJSON())
      setSubscription(next); setEnabled(true)
      setNotice('Avisos ativados neste aparelho. Use o teste para conferir o recebimento.'); setError(false)
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Não foi possível ativar as notificações.'); setError(true) }
    finally { setBusy(false) }
  }

  const test = async () => {
    if (!subscription) return
    setBusy(true); setNotice(''); setError(false)
    try {
      await testPushNotification(subscription.endpoint)
      setNotice('Teste enviado ao serviço de notificações. Confira os avisos deste aparelho e se o modo Não perturbe está desativado.')
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Não foi possível enviar o teste.'); setError(true) }
    finally { setBusy(false) }
  }

  const disable = async () => {
    if (!subscription) return
    setBusy(true); setNotice(''); setError(false)
    try {
      await disablePushSubscription(subscription.endpoint)
      setEnabled(false)
      await subscription.unsubscribe()
      setSubscription(null)
      setNotice('Avisos desativados neste aparelho.')
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Não foi possível desativar.'); setError(true) }
    finally { setBusy(false) }
  }

  return <section className="admin-panel-card admin-push-panel" aria-labelledby="push-heading">
    <h2 id="push-heading">Notificações no celular</h2>
    <p>Receba um aviso para cada novo contato, mesmo com a página fechada. Ao tocar no aviso, a caixa de entrada será aberta.</p>
    <p><strong>{busy ? 'Verificando…' : enabled ? 'Ativas neste aparelho' : 'Não ativadas neste aparelho'}</strong></p>
    <div className="admin-form-row">
      {enabled ? <><button className="admin-primary-action" disabled={busy} onClick={() => void test()}>Testar notificação</button><button className="admin-ghost-action" disabled={busy} onClick={() => void disable()}>Desativar neste aparelho</button></> : <button className="admin-primary-action" disabled={busy || !supported} onClick={() => void enable()}>Ativar notificações neste celular</button>}
    </div>
    {!supported && <p>Este navegador não oferece notificações nesta janela. No Android, abra o painel no Chrome. No iPhone, use Safari → Compartilhar → Adicionar à Tela de Início e abra o painel pelo ícone criado (iOS 16.4 ou superior).</p>}
    <small>No iPhone, adicione o painel à Tela de Início antes de ativar. A entrega depende das permissões, conexão e configurações de bateria do aparelho. Os avisos não exibem os dados pessoais do visitante.</small>
    {notice && <p className={error ? 'admin-toast-demo admin-toast-error' : 'admin-toast-demo'} role={error ? 'alert' : 'status'}>{notice}</p>}
  </section>
}
