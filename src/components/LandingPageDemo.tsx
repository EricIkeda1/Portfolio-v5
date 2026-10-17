import './LandingPageDemo.css'
import RestaurantDemo from './RestaurantDemo'
import { demoImages as photos } from './demoImages'

type Props = { kind: 'clinic' | 'architecture' | 'restaurant'; step: number; eager?: boolean }

export default function LandingPageDemo({ kind, step, eager = false }: Props) {
  if (kind === 'restaurant') return <RestaurantDemo eager={eager}/>
  const clinic = kind === 'clinic'
  return <div className={`sales-preview-page lp-demo lp-${kind} lp-step-${step}`}>
    <div className="lp-nav"><span className="lp-brand">EYI<span>.</span><small>{clinic ? 'ODONTOLOGIA' : 'ARQUITETURA'}</small></span><span className="lp-nav-links">{clinic ? 'A CLÍNICA / CUIDADOS' : 'ESTÚDIO / PROJETOS'}</span><span className="lp-nav-contact">{clinic ? 'Vamos conversar' : 'Inicie seu projeto'}</span></div>
    {step === 0 && (clinic ? <>
      <div className="lp-clinic-hero"><div className="lp-clinic-copy"><span className="lp-kicker">UM CUIDADO MAIS HUMANO</span><h3>Um novo<br/>motivo para<br/><em>sorrir.</em></h3><p>Escuta, cuidado e atenção.<br/>Do primeiro encontro ao seu sorriso.</p><span className="lp-cta">Conheça a clínica</span></div><figure className="lp-clinic-photo"><img src={photos.clinic} width="1100" height="735" alt="Ambiente de uma clínica odontológica" loading={eager ? 'eager' : 'lazy'} decoding="async"/><figcaption>O seu bem-estar<br/><em>vem primeiro.</em></figcaption><span className="lp-photo-index">01 / CUIDADO</span></figure></div>
      <div className="lp-footer"><span>SAÚDE QUE SE REFLETE NO SORRISO</span><span>ESTÉTICA & BEM-ESTAR</span></div>
    </> : <>
      <img className="lp-architecture-cover" src={photos.architecture} width="1100" height="735" alt="Casa contemporânea integrada à vegetação" loading={eager ? 'eager' : 'lazy'} decoding="async"/>
      <div className="lp-architecture-shade"/><div className="lp-architecture-copy"><span className="lp-kicker">ARQUITETURA PARA SER VIVIDA</span><h3>O essencial.<br/><em>Em cada espaço.</em></h3><div className="lp-architecture-intro"><p>Espaços que conectam<br/>a sua história ao lugar.</p><span className="lp-cta">Explore os projetos</span></div></div>
      <div className="lp-footer"><span>FORMA / LUZ / MATÉRIA</span><span>UM OLHAR SOBRE O HABITAR</span></div>
    </>)}
    {step === 1 && (clinic ? <>
      <div className="lp-care-body"><div><span className="lp-kicker">CUIDAR É OLHAR POR INTEIRO</span><h3>Cuidado em<br/><em>cada fase.</em></h3><p>Seu sorriso tem uma história.<br/>O cuidado também deve ser único.</p></div><div className="lp-care-list">{[['01','Prevenção','Saúde em primeiro lugar.'],['02','Estética dental','Naturalidade em cada detalhe.'],['03','Ortodontia','Equilíbrio para o seu sorriso.']].map(([n,t,d])=><div key={n}><span>{n}</span><div><strong>{t}</strong><p>{d}</p></div><i/></div>)}</div></div>
      <div className="lp-footer"><span>ESCUTA. ATENÇÃO. CONFIANÇA.</span><span>02 / CUIDADOS</span></div>
    </> : <>
      <div className="lp-project-body"><div className="lp-project-copy"><span className="lp-kicker">O NOSSO OLHAR</span><h3>O espaço<br/>conta uma<br/><em>história.</em></h3><p>Linhas simples. Materiais honestos.<br/>Novas formas de viver.</p><div className="lp-project-types"><span>01 / Residencial</span><span>02 / Interiores</span><span>03 / Comercial</span></div></div><figure><img src={photos.architecture} width="1100" height="735" alt="Volumes e materiais de uma residência contemporânea" loading={eager ? 'eager' : 'lazy'} decoding="async"/><figcaption>ENCONTRO ENTRE NATUREZA E CONSTRUÇÃO</figcaption></figure></div>
      <div className="lp-footer"><span>PENSADO PARA O SEU COTIDIANO</span><span>02 / PROJETOS</span></div>
    </>)}
    {step === 2 && (clinic ? <>
      <div className="lp-clinic-contact"><span className="lp-kicker">O PRIMEIRO PASSO É UMA CONVERSA</span><h3>O seu próximo<br/>sorriso começa<br/><em>aqui.</em></h3><div className="lp-contact-bottom"><p>Um encontro para conhecer você.<br/>Um cuidado pensado para sua história.</p><span className="lp-cta">Agende uma conversa</span></div><span className="lp-contact-seal" aria-hidden="true">sinta-se<br/><em>em casa.</em></span></div>
      <div className="lp-footer"><span>ATENDIMENTO INDIVIDUALIZADO</span><span>03 / VAMOS CONVERSAR</span></div>
    </> : <>
      <div className="lp-architecture-contact"><span className="lp-kicker">DO PRIMEIRO TRAÇO AO SEU LUGAR</span><h3>Seu espaço.<br/><em>Novas<br/>possibilidades.</em></h3><div className="lp-contact-bottom"><p>Vamos dar forma ao lugar<br/>que você imagina?</p><span className="lp-cta">Converse com o estúdio</span></div></div>
      <div className="lp-footer"><span>ARQUITETURA COM INTENÇÃO</span><span>03 / SEU PROJETO</span></div>
    </>)}
  </div>
}
