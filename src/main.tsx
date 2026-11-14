import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

// Preserva links diretos às seções do portfólio.
if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
if (!window.location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

const root = document.getElementById('root')!
const path = window.location.pathname.replace(/\/+$/, '') || '/'
const isShop = path === '/loja' || (path === '/' && window.location.hostname === 'loja.ericyikeda.com.br')
const page = isShop ? import('./ShopPage') : import('./App')

void page.then(({ default: Page }) => {
  const app = <React.StrictMode><Page /></React.StrictMode>
  if (root.hasChildNodes()) ReactDOM.hydrateRoot(root, app)
  else ReactDOM.createRoot(root).render(app)
})
