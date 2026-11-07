import { useTranslation } from '@/i18n/LanguageContext'
import { Reveal } from '@/components/Reveal'
import ContactForm from '@/components/ContactForm'

export default function Contact() {
  const { t } = useTranslation()
  return (
    <section id="contato" className="section-pad">
      <div className="container" style={{ maxWidth: 760 }}>
        <Reveal from="bottom">
          <div className="section-label">{t("05 — Contato")}</div>
          <h2 className="display-heading" style={{ marginBottom: '2rem' }}>
            {t("Vamos")}{' '}<span className="accent">{t("conversar")}</span>
          </h2>
        </Reveal>
        <Reveal from="bottom" delay={80} threshold={0.08}>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  )
}
