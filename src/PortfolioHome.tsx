import { useEffect, useRef, useState } from 'react'
import { PortfolioContentProvider, usePortfolioContent } from './context/PortfolioContentContext'
import { LanguageSelector, useTranslation } from './i18n/LanguageContext'
import ProtectedLogo from './components/ProtectedLogo'
import ProjectCarousel from './components/ProjectCarousel'
import DeveloperRoles from './components/DeveloperRoles'
import PortfolioJourney from './components/PortfolioJourney'
import PortfolioRating from './components/PortfolioRating'
import ContactForm from './components/ContactForm'
import ScrollProgress from './components/ScrollProgress'
import type { PortfolioProject } from './lib/portfolio'
import './portfolio-home.css'
import { usePortfolioMotion } from './usePortfolioMotion'

const imageRequests = new Map<string, Promise<string | null>>()
const stack = [['React','react'],['TypeScript','typescript'],['Flutter','flutter'],['Node.js','nodejs'],['PostgreSQL','postgresql'],['Django','django'],['Python','python'],['HTML','html5'],['CSS','css3'],['WordPress','wordpress']]
const versions = ['https://ericikedaportfolio.vercel.app/','https://ericyikedaportfolio.vercel.app/','https://ericyikedaportfolio32.vercel.app/','https://ericyikedaportfolio4.vercel.app/', '#inicio']
function ThemeIcon({ dark }: { dark: boolean }) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">{dark ? <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></> : <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"/>}</svg> }
function WebShopPreview() {
  const { t } = useTranslation()
  const viewport = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)
  useEffect(() => {
    const element = viewport.current
    if (!element) return
    const resize = () => setScale(element.clientWidth / 1200)
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return <div className="pf-browser pf-webshop">
    <div className="pf-browser-bar"><i/><i/><i/><span>webshopeyi.vercel.app</span></div>
    <div ref={viewport} className="pf-live-preview">
      {scale > 0 && <iframe src="https://webshopeyi.vercel.app/?portfolioPreview=1" title="WebShop — site real" width="1200" height="675" tabIndex={-1} style={{ zoom: scale }} referrerPolicy="strict-origin-when-cross-origin"/>}
      <a href="https://webshopeyi.vercel.app/" target="_blank" rel="noopener noreferrer" aria-label={t('Abrir WebShop')}><span>{t('Abrir WebShop')}</span></a>
    </div>
  </div>
}
function ProjectPreview({ project }: { project: PortfolioProject }) {
  const { t } = useTranslation()
  const [broken, setBroken] = useState(false)
  const [discovered, setDiscovered] = useState<string | null>(null)
  const preview = useRef<HTMLDivElement>(null)
  useEffect(()=>{
    setDiscovered(null)
    if(project.image_url || !preview.current)return
    let active=true
    const key=String(project.id)+':'+project.github
    const load=()=>{
      if(!imageRequests.has(key))imageRequests.set(key,fetch(`/api/content?view=project-image&id=${encodeURIComponent(project.id)}`)
        .then(r=>r.ok?r.json():null).then(data=>data?.image_url || null).catch(()=>null))
      void imageRequests.get(key)!.then(url=>{if(active)setDiscovered(url)})
    }
    if(!('IntersectionObserver' in window)){load();return()=>{active=false}}
    const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){load();observer.disconnect()}},{rootMargin:'250px'})
    observer.observe(preview.current)
    return()=>{active=false;observer.disconnect()}
  },[project.id,project.github,project.image_url])
  useEffect(()=>setBroken(false),[project.image_url])
  if ((project.image_url || discovered) && !broken) return <img className="pf-project-image" src={project.image_url || discovered!} alt={project.name} loading="lazy" onError={()=>setBroken(true)}/>
  const mobile = /mobile|flutter|ademicon/i.test(`${project.type} ${project.name} ${project.tags.join(' ')}`)
  return <div ref={preview} className={`pf-concept ${mobile ? 'pf-mobile-concept' : ''}`} aria-hidden="true">
    {[0,...(mobile ? [1] : [])].map(n=><div className={mobile ? 'pf-phone' : 'pf-laptop'} key={n}>
      <div className="pf-concept-top"><b>{project.name}</b><span>•••</span></div>
      <div className="pf-concept-body"><span className="pf-concept-kicker">{project.type}</span><strong>{n ? t('Tudo organizado.') : project.name}</strong>{mobile ? <><div className="pf-mobile-summary"><small>{t(n ? 'Próxima visita' : 'Minha agenda')}</small><b>{n ? '14:30' : '03'}</b><span>{t(n ? 'Visita agendada' : 'Atividades do dia')}</span></div><div className="pf-mobile-tabs"><b>{t('Hoje')}</b><span>{t('Clientes')}</span></div>{[t('Visita agendada'),t('Acompanhamento'),t('Novo contato')].map((label,i)=><div className="pf-mobile-row" key={label}><i>{i+1}</i><span>{label}<small>{t('Ver detalhes')}</small></span></div>)}</> : <><div className="pf-web-feature"><div><strong>{/webshop/i.test(project.name) ? t('Tecnologia para o seu dia.') : t('Tudo em um só lugar.')}</strong><span>{t('Conheça o projeto')}</span></div><svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8"><path d="M20 60V45a30 30 0 0 1 60 0v15"/><rect x="12" y="48" width="18" height="35" rx="8" fill="currentColor"/><rect x="70" y="48" width="18" height="35" rx="8" fill="currentColor"/></svg></div><div className="pf-web-products">{project.tags.slice(0,3).map(tag=><span key={tag}>{tag}</span>)}</div></>}</div>
    </div>)}<span className="pf-concept-caption">{t('Prévia ilustrativa')}</span>
  </div>
}
function AnimatedNumber({ value }: { value: number | undefined }) {
  const element = useRef<HTMLElement>(null)
  const [display, setDisplay] = useState<number | undefined>(undefined)
  useEffect(() => {
    if (value === undefined) return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    let timer: ReturnType<typeof setTimeout> | undefined
    let current = 0, started = false
    const tick = () => {
      current = Math.min(value, current + 1)
      setDisplay(current)
      if (current < value) timer = setTimeout(tick, Math.max(16, Math.min(65, 1800 / Math.max(1, value))))
    }
    const start = () => {
      if (started) return
      started = true
      if (reduced.matches) setDisplay(value)
      else { setDisplay(0); tick() }
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { start(); observer.disconnect() }
    }, { threshold: .5 })
    if (element.current) observer.observe(element.current)
    const stop = () => { if(reduced.matches){clearTimeout(timer);setDisplay(value)} }
    reduced.addEventListener('change', stop)
    return () => { clearTimeout(timer); observer.disconnect(); reduced.removeEventListener('change', stop) }
  }, [value])
  return <strong ref={element} aria-label={value === undefined ? undefined : String(value)}><span aria-hidden="true">{display ?? '—'}</span></strong>
}
function GitHubNumbers({ github }: { github: string }) {
  const {t}=useTranslation()
  const [stats,setStats]=useState<{repos:number;languages:number}|null>(null)
  useEffect(()=>{
    const controller=new AbortController()
    let username='EricIkeda1'
    try { const url=new URL(github); if(url.hostname==='github.com') username=url.pathname.split('/').filter(Boolean)[0] || username } catch { /* Default public profile. */ }
    async function fetchStats(){
      const response=await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`,{signal:controller.signal})
      if(!response.ok)throw Error('GitHub unavailable')
      const user=await response.json()
      const languages=new Set<string>()
      for(let page=1;page<=Math.ceil(user.public_repos/100);page++){
        const response=await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&page=${page}`,{signal:controller.signal})
        if(!response.ok)throw Error('GitHub unavailable')
        const repos=await response.json();repos.forEach((repo:{language:string|null})=>{if(repo.language)languages.add(repo.language)})
      }
      if(!controller.signal.aborted)setStats({repos:user.public_repos,languages:languages.size})
    }
    void fetchStats().catch(()=>{})
    return ()=>controller.abort()
  },[github])
  return <div className="pf-numbers"><h2>{t('Números reais')}</h2><div className="pf-stats"><a href={github} target="_blank" rel="noreferrer" aria-label="GitHub"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1a11 11 0 0 0-3.48 21.44c.55.1.75-.24.75-.53v-2.05c-3.06.67-3.71-1.3-3.71-1.3-.5-1.27-1.22-1.61-1.22-1.61-1-.69.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.98 1.68 2.57 1.19 3.2.91.1-.71.38-1.19.69-1.46-2.44-.28-5.01-1.22-5.01-5.44 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.91 0 0 .92-.3 3.03 1.13a10.5 10.5 0 0 1 5.5 0c2.1-1.43 3.02-1.13 3.02-1.13.6 1.51.22 2.63.11 2.91.7.77 1.13 1.75 1.13 2.95 0 4.23-2.58 5.16-5.03 5.43.4.35.75 1.02.75 2.06v3c0 .29.2.64.76.53A11 11 0 0 0 12 1Z"/></svg></a><div><span>{t('Repositórios públicos')}</span><AnimatedNumber value={stats?.repos}/></div><div><span>{t('Linguagens principais')}</span><AnimatedNumber value={stats?.languages}/></div></div><small>{t('Dados públicos do GitHub. As contagens aparecem quando disponíveis.')}</small></div>
}
function PortfolioView(){
  const {content}=usePortfolioContent(); const {t}=useTranslation()
  const [journeyXp, setJourneyXp] = useState(0)
  const [mobileMenu,setMobileMenu]=useState(false);const [dark,setDark]=useState(false);const [menu,setMenu]=useState(false);const [selected,setSelected]=useState<PortfolioProject|null>(null)
  const root=useRef<HTMLDivElement>(null);const nav=useRef<HTMLElement>(null);const dialog=useRef<HTMLDialogElement>(null);const toggle=useRef<HTMLButtonElement>(null)
  useEffect(()=>{const query=matchMedia('(max-width:760px)');const sync=()=>{setMobileMenu(query.matches);if(!query.matches)setMenu(false)};sync();query.addEventListener('change',sync);return()=>query.removeEventListener('change',sync)},[])
  usePortfolioMotion(root)
  const projects=content.projects.filter(p=>p.published!==false).sort((a,b)=>a.sort_order-b.sort_order)
  useEffect(()=>{try{const stored=localStorage.getItem('portfolio-theme');setDark(stored?stored==='dark':matchMedia('(prefers-color-scheme: dark)').matches)}catch{/* optional storage */}},[])
  useEffect(()=>{const meta=document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');const old=meta?.content;if(meta)meta.content=dark?'#27231f':'#d9cec2';return()=>{if(meta&&old)meta.content=old}},[dark])
  useEffect(()=>{if(!menu)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape'){setMenu(false);toggle.current?.focus()}};const outside=(e:PointerEvent)=>{if(!nav.current?.contains(e.target as Node))setMenu(false)};document.addEventListener('keydown',close);document.addEventListener('pointerdown',outside);return()=>{document.removeEventListener('keydown',close);document.removeEventListener('pointerdown',outside)}},[menu])
  useEffect(()=>{if(!selected)return;dialog.current?.showModal();const old=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=old}},[selected])
  const changeTheme=()=>{setDark(!dark);try{localStorage.setItem('portfolio-theme',dark?'light':'dark')}catch{/* optional storage */}}
  useEffect(()=>{
    const media=matchMedia('(prefers-reduced-motion: reduce)')
    if(media.matches || !('IntersectionObserver' in window))return
    const elements=root.current?.querySelectorAll<HTMLElement>('main > section, .pf-project-card, .pf-tech, .pf-contact')
    const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{
      entry.target.classList.toggle('pf-visible',entry.isIntersecting)
    })},{threshold:0,rootMargin:'0px 0px -24px 0px'})
    elements?.forEach(element=>{element.classList.add('pf-reveal');observer.observe(element)})
    const restore=()=>{if(media.matches){observer.disconnect();elements?.forEach(element=>element.classList.remove('pf-reveal'))}}
    media.addEventListener('change',restore)
    return()=>{observer.disconnect();media.removeEventListener('change',restore);elements?.forEach(element=>element.classList.remove('pf-reveal'))}
  },[projects.map(p=>p.id).join(',')])
  return <div ref={root} className="pf-home" data-theme={dark?'dark':'light'} id="inicio">
    <ScrollProgress/>
    <header className="pf-nav" ref={nav}><a className="pf-brand" href="#inicio" onClick={()=>setMenu(false)}><ProtectedLogo className="pf-brand-logo"/></a><nav id="pf-menu" className={menu?'is-open':''} aria-label={t('Navegação principal')} inert={mobileMenu && !menu}><div className="pf-menu-inner">{[['Início','#inicio'],['Projetos','#experiencia'],['Sobre','#sobre'],['Contato','#contato']].map(([label,href])=><a key={href} href={href} onClick={()=>setMenu(false)}>{t(label)}</a>)}</div></nav><div className="pf-nav-tools"><a className="pf-nav-xp" href="#jornada" aria-label={`${journeyXp} XP · ${t('Suas conquistas')}`}><span key={journeyXp}>{journeyXp}</span><small>XP</small></a><LanguageSelector/><button className="pf-theme" onClick={changeTheme} aria-label={t(dark?'Ativar tema claro':'Ativar tema escuro')}><ThemeIcon dark={dark}/></button><button ref={toggle} className="pf-menu-button" onClick={()=>setMenu(!menu)} aria-expanded={menu} aria-controls="pf-menu" aria-label={t(menu?'Fechar menu':'Abrir menu')}><span/><span/><span/></button></div></header>
    <main className="pf-content">
      <section className="pf-hero"><div><span className="pf-eyebrow">{t('PORTFÓLIO • WEB & MOBILE')}</span><h1>Eric Ikeda</h1><DeveloperRoles/><a className="pf-button" href="#experiencia">{t('Ver projetos')}</a></div><div className="pf-hero-art"><WebShopPreview/><span className="pf-art-caption">{t('WebShop • prévia do projeto')}</span></div></section>
      <PortfolioJourney onProgress={setJourneyXp}/>
      <section className="pf-about-row" id="sobre"><div className="pf-about"><img className="pf-about-photo" src="/api/profile-image?size=avatar" alt="Eric Ikeda" width="160" height="160" loading="eager" decoding="async"/><h2>{t('Sobre')}</h2><p>{t('Sou de Ibiporã, PR. Crio interfaces web e mobile com React, TypeScript e Flutter.')}</p><details><summary>{t('Mais sobre meu trabalho')}</summary>{content.about_text.split(/\n\s*\n/).map((paragraph,i)=><p key={i}>{t(paragraph)}</p>)}</details><span className="pf-signature" aria-label="Eric">Eric.</span></div><GitHubNumbers github={content.github}/></section>
      <section className="pf-projects" id="experiencia"><div className="pf-section-title"><h2>{t('Projetos')}</h2><span>{t('Ideias que viraram experiências.')}</span></div><ProjectCarousel count={projects.length}>{projects.map(project=><button className="pf-project-card" key={project.id} onClick={()=>{setSelected(project);window.dispatchEvent(new Event('portfolio-project-open'))}}><ProjectPreview project={project}/><div className="pf-project-info"><div><h3>{project.name}</h3><p>{t(project.type)}{project.tags.length ? ` · ${project.tags.slice(0,2).join(' / ')}`:''}</p></div><span className="pf-project-plus" aria-hidden="true">+</span></div></button>)}</ProjectCarousel>{!projects.length&&<p>{t('Nenhum projeto cadastrado.')}</p>}</section>
      <section className="pf-stack" id="habilidades"><h2>{t('Stack técnica')}</h2><div>{stack.map(([name,slug])=><div className="pf-tech" key={name}><img src={`/tech/${slug}.svg`} alt="" width="38" height="38" loading="lazy"/><span>{name}</span></div>)}</div></section>
      <section className="pf-academic" id="formacao"><div><h2>{t('Trajetória acadêmica')}</h2><h3>{t('Engenharia de Software')}</h3><p>UniSenaiPR · Londrina</p></div><dl><div><dt>{t('Ingresso')}</dt><dd>{t('Julho de 2021')}</dd></div><div><dt>{t('Conclusão')}</dt><dd>{t('Agosto de 2026')}</dd></div></dl><svg className="pf-building" viewBox="0 0 400 260" fill="none" stroke="currentColor" strokeWidth=".8" aria-hidden="true"><path d="M40 260V120L370 10v250M40 120l200 35 130-75M40 155l200 35 130-75M40 195l200 35 130-75M240 155v105M40 120v-20L370 0v10M80 107v153M120 94v166M160 81v179M200 68v192M280 40v220M320 27v233M360 14v246"/></svg></section>
      <section className="pf-evolution" id="evolucao"><h2>{t('Evolução do portfólio')}</h2><ol>{versions.map((url,i)=><li key={url}><a href={url} target={i<4?'_blank':undefined} rel={i<4?'noreferrer':undefined} aria-label={`${t('Portfólio')} V${i+1}`}><div className={`pf-version-preview pf-version-${i}`} aria-hidden="true"><i/><div><b/><b/><b/></div></div><span className="pf-version-dot"/><strong>V{i+1}</strong>{i===4&&<small>{t('Atual')}</small>}</a></li>)}</ol></section>
      <PortfolioRating/>
    </main>
    <footer className="pf-footer" id="contato"><div className="pf-contact"><h2>{t('Vamos conversar')}</h2><ContactForm/></div><div className="pf-footer-bottom"><a href="#inicio"><ProtectedLogo className="pf-brand-logo" loading="lazy"/></a><a className="pf-footer-domain" href="https://ericyikeda.com.br/">ericyikeda.com.br</a><span>{t('Desenvolvido por Eric Y. Ikeda')}</span></div></footer>
    {selected&&<dialog ref={dialog} className="pf-dialog" aria-labelledby="pf-project-title" onCancel={()=>setSelected(null)} onClick={e=>{if(e.target===e.currentTarget)setSelected(null)}}><button className="pf-dialog-close" aria-label={t('Fechar')} onClick={()=>setSelected(null)}>×</button><ProjectPreview project={selected}/><div className="pf-dialog-copy"><span className="pf-eyebrow">{t(selected.type)}</span><h2 id="pf-project-title">{selected.name}</h2><p>{t(selected.description)}</p><div className="pf-tags">{selected.tags.map(tag=><span key={tag}>{tag}</span>)}</div><ul>{selected.highlights.map(item=><li key={item}>{t(item)}</li>)}</ul>{/^https?:\/\//i.test(selected.github)&&<a className="pf-button" href={selected.github} target="_blank" rel="noreferrer">{t('Acessar projeto')}</a>}</div></dialog>}
  </div>
}
export default function PortfolioHome(){return <PortfolioContentProvider><PortfolioView/></PortfolioContentProvider>}
