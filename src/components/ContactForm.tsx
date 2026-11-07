import { useState, type FormEvent } from 'react'
import { sendContactMessage } from '@/lib/api'

export default function ContactForm() {
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<{ error: boolean; text: string } | null>(null)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return
    const form = event.currentTarget
    const values = new FormData(form)
    setSubmitting(true)
    setNotice(null)
    try {
      await sendContactMessage({ name: String(values.get('name') ?? ''), email: String(values.get('email') ?? ''), message: String(values.get('message') ?? ''), website: String(values.get('website') ?? '') })
      form.reset()
      setNotice({ error: false, text: 'Mensagem enviada! Obrigado pelo contato. Responderei pelo e-mail informado.' })
    } catch (error) {
      setNotice({ error: true, text: error instanceof Error ? error.message : 'Não foi possível enviar. Tente novamente.' })
    } finally {
      setSubmitting(false)
    }
  }

  return <form className="contact-message-form" onSubmit={submit} aria-labelledby="contact-form-title" aria-busy={submitting}>
    <h3 id="contact-form-title">Envie uma mensagem</h3>
    <p>Uma oportunidade, um projeto ou uma ideia? Escreva por aqui.</p>
    <fieldset disabled={submitting}>
      <label htmlFor="contact-name">Nome</label><input id="contact-name" name="name" autoComplete="name" required minLength={2} maxLength={100} />
      <label htmlFor="contact-email">E-mail para resposta</label><input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} />
      <label htmlFor="contact-message">Mensagem</label><textarea id="contact-message" name="message" rows={5} required minLength={10} maxLength={5000} />
      <div className="contact-honeypot" aria-hidden="true"><label htmlFor="contact-website">Deixe este campo vazio</label><input id="contact-website" name="website" tabIndex={-1} autoComplete="off" /></div>
      <small>Seu nome e e-mail serão usados apenas para responder ao contato. A mensagem será recebida no meu painel privado. Envios passam por moderação automática contra ameaças e abuso.</small>
      <button className="btn-primary" type="submit">{submitting ? 'Enviando…' : 'Enviar mensagem'}</button>
    </fieldset>
    {notice && <p className={`contact-form-notice ${notice.error ? 'is-error' : ''}`} role={notice.error ? 'alert' : 'status'}>{notice.text}</p>}
  </form>
}
