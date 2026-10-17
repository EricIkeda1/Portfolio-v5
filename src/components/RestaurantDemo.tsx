import { demoImages } from './demoImages'

export default function RestaurantDemo({ eager = false }: { eager?: boolean }) {
  return <div className="sales-preview-page lp-demo lp-restaurant lp-step-0 lp-restaurant-banner">
    <figure className="lp-restaurant-photo"><img src={demoImages.restaurant} width="1100" height="734" alt="Costela assada com legumes, molho e batatas" loading={eager ? 'eager' : 'lazy'} decoding="async"/></figure>
    <div className="lp-restaurant-banner-shade" aria-hidden="true"/>
    <div className="lp-nav"><span className="lp-brand">EYI<span>.</span><small>COZINHA & ENCONTROS</small></span><span className="lp-nav-links">A CASA / CARDÁPIO</span><span className="lp-nav-contact">Reserve sua mesa</span></div>
    <div className="lp-restaurant-body"><div className="lp-restaurant-copy"><span className="lp-kicker">UM CONVITE PARA FICAR</span><h3>O sabor<br/>de estar<br/><em>junto.</em></h3><p>Receitas com personalidade.<br/>Uma mesa para compartilhar histórias.</p><span className="lp-cta">Conheça o cardápio</span></div></div>
    <div className="lp-footer"><span>COZINHA / AFETO / ORIGEM</span><div className="lp-restaurant-indicators" aria-hidden="true"><b>01 / 03</b><i className="is-current"/><i/><i/></div></div>
  </div>
}
