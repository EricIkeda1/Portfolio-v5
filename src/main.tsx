import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Preserve links diretos às seções; a página comercial calcula o espaço do cabeçalho.
if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
if (!window.location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

const root = document.getElementById('root')!
const app = <React.StrictMode><App /></React.StrictMode>
if (root.hasChildNodes()) ReactDOM.hydrateRoot(root, app)
else ReactDOM.createRoot(root).render(app)
