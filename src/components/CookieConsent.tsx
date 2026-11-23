import { useEffect, useState } from 'react'
export function ratingCookiesAccepted() { return document.cookie.split(';').some(v => v.trim() === 'portfolio_cookie_choice=accepted') }
export default function CookieConsent() {
  const [open,setOpen]=useState(false)
  useEffect(()=>{
    setOpen(!document.cookie.split(';').some(v=>/^portfolio_cookie_choice=(accepted|rejected)$/.test(v.trim())))
    const show=()=>setOpen(true);window.addEventListener('portfolio-cookie-settings',show)
    return()=>window.removeEventListener('portfolio-cookie-settings',show)
  },[])
  function choose(value:string){
    document.cookie=`portfolio_cookie_choice=${value}; Path=/; Max-Age=15552000; SameSite=Lax; Secure`
    setOpen(false);window.dispatchEvent(new Event('portfolio-consent-change'))
    if(value==='rejected')void fetch('/api/content?view=ratings',{cache:'no-store'})
  }
  return <><button className="pf-cookie-settings" onClick={()=>setOpen(true)}>Cookies</button>{open&&<aside className="pf-cookie-banner" role="region" aria-label="Preferências de cookies"><div><strong>Seu espaço, sua escolha.</strong><p>Podemos usar um cookie para lembrar sua avaliação? Você pode recusar e continuar navegando. Guardamos sua escolha; o acesso administrativo usa cookies necessários.</p></div><div className="pf-cookie-actions"><button onClick={()=>choose('rejected')}>Recusar opcionais</button><button onClick={()=>choose('accepted')}>Aceitar</button></div></aside>}</>
}
