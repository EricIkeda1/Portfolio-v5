import { useRef, useState } from 'react'

export function linksShareUrl(hostname: string) {
  return hostname === 'links.ericyikeda.com.br' ? 'https://links.ericyikeda.com.br/' : 'https://www.ericyikeda.com.br/links'
}

export default function ShareLinks() {
  const dialog = useRef<HTMLDialogElement>(null)
  const shareDialog = useRef<HTMLDialogElement>(null)
  const [notice, setNotice] = useState('')
  const [manualUrl, setManualUrl] = useState('')
  const [qr, setQr] = useState('')
  const [qrError, setQrError] = useState(false)
  const [generating, setGenerating] = useState(false)
  const getSafeUrl = () => linksShareUrl('links.ericyikeda.com.br')
  const getUrl = getSafeUrl

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(getUrl())
      setNotice('Link copiado!'); setManualUrl('')
    } catch {
      setManualUrl(getUrl()); setNotice('Selecione o endereço abaixo para copiar.')
    }
  }

  async function share() {
    setNotice(''); setManualUrl('')
    if (navigator.share) {
      try { await navigator.share({ title: 'Eric Yuji Ikeda · Me encontre por aqui', url: getUrl() }); return }
      catch (error) { if (error instanceof Error && error.name === 'AbortError') return }
    }
    // Browsers without native sharing still get a real sharing drawer.
    if (!shareDialog.current?.open) shareDialog.current?.showModal()
  }

  async function showQr() {
    if (!dialog.current?.open) dialog.current?.showModal()
    if (qr || generating) return
    setGenerating(true); setQrError(false)
    try {
      const { toDataURL } = await import('qrcode')
      setQr(await toDataURL(getUrl(), { width: 768, margin: 4, errorCorrectionLevel: 'M', color: { dark: '#111827', light: '#ffffff' } }))
    } catch { setQrError(true) }
    finally { setGenerating(false) }
  }

  return (
    <div className="links-sharing">
      <div className="links-share-actions">
        <button type="button" onClick={() => void share()} aria-haspopup="dialog"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 10.5 6.8-4m-6.8 7 6.8 4" /></svg>Compartilhar</button>
        <button type="button" onClick={() => void showQr()} aria-haspopup="dialog"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 14v3h3v4m3-7v4m-7 3h1m6 0h1" /></svg>QR Code</button>
      </div>
      <p className="links-share-notice" role="status">{notice}</p>
      {manualUrl ? <label className="links-copy-manual">Endereço da página<input value={manualUrl} readOnly onFocus={event => event.currentTarget.select()} /></label> : null}
      <dialog ref={shareDialog} onClose={() => { setNotice(''); setManualUrl('') }} className="links-qr-dialog links-share-sheet" aria-labelledby="links-share-title">
        <span className="links-sheet-handle" aria-hidden="true" />
        <button className="links-qr-close" type="button" onClick={() => shareDialog.current?.close()} aria-label="Fechar compartilhamento" autoFocus>×</button>
        <span className="links-eyebrow">ESPALHE ESSA CONEXÃO</span>
        <h2 id="links-share-title">Compartilhar perfil</h2>
        <p>Escolha como levar meus links com você.</p>
        <div className="links-share-destinations">
          <a href={`https://wa.me/?text=${encodeURIComponent('Eric Yuji Ikeda · ' + getSafeUrl())}`} target="_blank" rel="noopener noreferrer"><span aria-hidden="true">↗</span>WhatsApp</a>
          <a href={`https://t.me/share/url?url=${encodeURIComponent(getSafeUrl())}&text=${encodeURIComponent('Eric Yuji Ikeda')}`} target="_blank" rel="noopener noreferrer"><span aria-hidden="true">↗</span>Telegram</a>
          <a href={`mailto:?subject=${encodeURIComponent('Eric Yuji Ikeda')}&body=${encodeURIComponent(getSafeUrl())}`}><span aria-hidden="true">✉</span>E-mail</a>
          <button type="button" onClick={() => void copyLink()}><span aria-hidden="true">⧉</span>Copiar link</button>
        </div>
        <p className="links-sheet-notice" role="status">{notice}</p>
        {manualUrl && <label className="links-copy-manual">Endereço da página<input value={manualUrl} readOnly onFocus={event => event.currentTarget.select()} /></label>}
      </dialog>
      <dialog ref={dialog} className="links-qr-dialog links-qr-reveal" aria-labelledby="links-qr-title" aria-describedby="links-qr-description">
        <button className="links-qr-close" type="button" onClick={() => dialog.current?.close()} aria-label="Fechar QR Code" autoFocus>×</button>
        <span className="links-eyebrow">LEVE A CONEXÃO COM VOCÊ</span>
        <h2 id="links-qr-title">Me encontre por aqui.</h2>
        <p id="links-qr-description">Aponte a câmera do celular para abrir minha página de redes sociais.</p>
        <div className="links-qr-frame"><i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" /><div className="links-qr-image">{qr ? <img src={qr} width="256" height="256" alt="QR Code para a página de redes sociais de Eric Yuji Ikeda" /> : <p role="status">{qrError ? 'Não foi possível gerar o QR Code.' : 'Gerando QR Code…'}</p>}</div></div>
        {qr ? <a className="links-qr-download" href={qr} download="eric-ikeda-qrcode.png">Baixar QR Code</a> : qrError ? <button className="links-qr-download" type="button" onClick={() => void showQr()}>Tentar novamente</button> : null}
      </dialog>
    </div>
  )
}
