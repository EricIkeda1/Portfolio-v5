import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Preserve links diretos às seções; a página comercial calcula o espaço do cabeçalho.
if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
if (!window.location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
