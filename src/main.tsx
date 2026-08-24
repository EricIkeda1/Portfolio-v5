import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Sempre inicia o portfólio no topo ao recarregar a página.
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

// Remove qualquer âncora (#sobre, #contato, etc.) deixada na URL.
if (window.location.hash) {
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${window.location.search}`,
  )
}

const scrollToStart = () => window.scrollTo({ top: 0, left: 0, behavior: 'auto' })

scrollToStart()
window.addEventListener('load', scrollToStart, { once: true })
window.addEventListener('beforeunload', scrollToStart)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
