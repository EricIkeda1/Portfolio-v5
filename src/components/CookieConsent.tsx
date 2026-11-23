import { useEffect, useRef, useState } from 'react'
export function ratingCookiesAccepted() { return document.cookie.split(';').some(v => v.trim() === 'portfolio_cookie_choice=accepted') }
export default function CookieConsent() {
  const [open,setOpen]=useState(false)
  const container=useRef<HTMLDivElement>(null)
  useEffect(()=>{
    const hasChoice=()=>document.cookie.split(';').some(v=>/^portfolio_cookie_choice=(accepted|rejected)$/.test(v.trim()))
    const section=container.current?.closest('section')
    const observer='IntersectionObserver' in window ? new IntersectionObserver(entries=>{
      setOpen(entries.some(entry=>entry.isIntersecting) && !hasChoice())
    },{threshold:0.1}) : null
    if(section)observer?.observe(section)
    const show=()=>setOpen(true);window.addEventListener('portfolio-cookie-settings',show)
    return()=>{observer?.disconnect();window.removeEventListener('portfolio-cookie-settings',show)}
  },[])
  function choose(value:string){
    document.cookie=`portfolio_cookie_choice=${value}; Path=/; Max-Age=15552000; SameSite=Lax; Secure`
    setOpen(false);window.dispatchEvent(new Event('portfolio-consent-change'))
    if(value==='rejected')void fetch('/api/content?view=ratings',{cache:'no-store'})
  }
  return <div ref={container} className="pf-cookie-context"><button type="button" className="pf-cookie-settings" onClick={()=>setOpen(true)}>Cookies</button>{open&&<aside className="pf-cookie-banner" role="region" aria-label="Preferências de cookies"><div><strong>Seu espaço, sua escolha.</strong><p>Podemos usar um cookie para habilitar sua avaliação? Cada IP pode ter uma nota. Você pode recusar e continuar navegando. Guardamos sua escolha; o acesso administrativo usa cookies necessários.</p></div><div className="pf-cookie-actions"><button type="button" onClick={()=>choose('rejected')}>Recusar opcionais</button><button type="button" onClick={()=>choose('accepted')}>Aceitar</button></div></aside>}</div>
}
