import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import ProtectedLogo from '@/components/ProtectedLogo'
import './not-found.css'

const codeBits = ['React', 'TypeScript', 'Flutter', 'Vite', 'PostgreSQL']

export default function NotFoundPage() {
  const shellRef = useRef<HTMLDivElement>(null)
  const [scanning, setScanning] = useState(false)
  const [scanLabel, setScanLabel] = useState('ROTA NÃO LOCALIZADA')

  const path = decodeURI(window.location.pathname)

  useEffect(() => {
    const previousTitle = document.title
    document.title = '404 — Eric Y. Ikeda'

    return () => {
      document.title = previousTitle
    }
  }, [])

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const shell = shellRef.current
    if (!shell) return

    const rect = shell.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const nx = x / rect.width - 0.5
    const ny = y / rect.height - 0.5

    shell.style.setProperty('--pointer-x', `${x}px`)
    shell.style.setProperty('--pointer-y', `${y}px`)
    shell.style.setProperty('--tilt-x', `${ny * -5}deg`)
    shell.style.setProperty('--tilt-y', `${nx * 7}deg`)
    shell.style.setProperty('--float-x', `${nx * 14}px`)
    shell.style.setProperty('--float-y', `${ny * 10}px`)
  }

  const resetPointer = () => {
    const shell = shellRef.current
    if (!shell) return

    shell.style.setProperty('--tilt-x', '0deg')
    shell.style.setProperty('--tilt-y', '0deg')
    shell.style.setProperty('--float-x', '0px')
    shell.style.setProperty('--float-y', '0px')
  }

  const handleScan = () => {
    if (scanning) return

    setScanning(true)
    setScanLabel('ANALISANDO CAMINHO...')

    window.setTimeout(() => {
      setScanLabel('NENHUMA ROTA ENCONTRADA')
    }, 650)

    window.setTimeout(() => {
      setScanning(false)
      setScanLabel('ROTA NÃO LOCALIZADA')
    }, 1800)
  }

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back()
      return
    }

    window.location.assign('/')
  }

  return (
    <div
      ref={shellRef}
      className="not-found-shell"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
    >
      <div className="not-found-grid" aria-hidden="true" />
      <div className="not-found-cursor-glow" aria-hidden="true" />

      <header className="not-found-header">
        <a className="not-found-brand" href="/" aria-label="Voltar para a página inicial">
          <ProtectedLogo className="not-found-logo" />
          <span>Eric Y. Ikeda</span>
        </a>

        <div className="not-found-status font-mono">
          <span className="not-found-status-dot" />
          <span>HTTP / 404</span>
        </div>
      </header>

      <main className="not-found-main">
        <section className={`not-found-card${scanning ? ' is-scanning' : ''}`}>
          <div className="not-found-card-grid" aria-hidden="true" />
          <div className="not-found-scan-line" aria-hidden="true" />

          <div className="not-found-kicker font-mono">
            <span>ERROR_CODE</span>
            <span>PAGE_NOT_FOUND</span>
          </div>

          <div className="not-found-number-wrap" aria-label="Erro 404">
            <div className="not-found-number-shadow" aria-hidden="true">404</div>
            <h1 className="not-found-number">404</h1>
            <div className="not-found-crosshair not-found-crosshair-a" aria-hidden="true" />
            <div className="not-found-crosshair not-found-crosshair-b" aria-hidden="true" />
          </div>

          <div className="not-found-copy">
            <div>
              <p className="not-found-label font-mono">// {scanLabel}</p>
              <h2>Essa página saiu da rota.</h2>
            </div>

            <p className="not-found-description">
              O endereço que você tentou acessar não existe, foi movido ou talvez nunca tenha feito parte deste projeto.
              O portfólio continua funcionando normalmente.
            </p>
          </div>

          <div className="not-found-path font-mono" title={path}>
            <span className="not-found-prompt">$</span>
            <span className="not-found-path-label">request</span>
            <span className="not-found-path-value">{path}</span>
            <span className="not-found-caret" aria-hidden="true" />
          </div>

          <div className="not-found-actions">
            <a className="not-found-primary font-mono" href="/">
              <span>Voltar ao início</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>

            <button className="not-found-secondary font-mono" type="button" onClick={goBack}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 12H5M11 18l-6-6 6-6" />
              </svg>
              <span>Página anterior</span>
            </button>

            <button
              className="not-found-scan-button font-mono"
              type="button"
              onClick={handleScan}
              disabled={scanning}
            >
              <span className="not-found-scan-icon" aria-hidden="true" />
              <span>{scanning ? 'Escaneando...' : 'Escanear rota'}</span>
            </button>
          </div>
        </section>

        <aside className="not-found-side" aria-label="Informações da página">
          <div className="not-found-side-block">
            <span className="not-found-side-index font-mono">01</span>
            <p className="font-mono">STATUS</p>
            <strong>Lost in cyberspace</strong>
          </div>

          <div className="not-found-side-block">
            <span className="not-found-side-index font-mono">02</span>
            <p className="font-mono">STACK ONLINE</p>
            <div className="not-found-techs">
              {codeBits.map((item, index) => (
                <span key={item} style={{ '--delay': `${index * 90}ms` } as CSSProperties}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="not-found-side-block not-found-system-block">
            <span className="not-found-side-index font-mono">03</span>
            <p className="font-mono">SYSTEM</p>
            <div className="not-found-system-row font-mono">
              <span>PORTFOLIO_V5</span>
              <span className="not-found-online"><i /> ONLINE</span>
            </div>
          </div>
        </aside>
      </main>

      <footer className="not-found-footer font-mono">
        <span>© {new Date().getFullYear()} ERIC Y. IKEDA</span>
        <span>ERR / 404 / ROUTE_MISSING</span>
      </footer>
    </div>
  )
}
