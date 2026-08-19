import { useEffect, useState, type FormEvent } from 'react'
import DottedBackground from '@/components/DottedBackground'
import { getSession, login } from '@/lib/portfolio'

const logoSrc = 'https://drive.google.com/thumbnail?id=19o0-cXysNK5HsufGJJSZThSlPpuury__&sz=w1000'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getSession().then(() => window.location.replace('/admin')).catch(() => undefined)
  }, [])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      window.location.replace('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DottedBackground>
      <div className="auth-shell">
        <a href="/" className="auth-brand" aria-label="Voltar ao portfólio">
          <img src={logoSrc} alt="Eric Y. Ikeda" referrerPolicy="no-referrer" />
          <div>
            <strong className="font-display">Eric Y. Ikeda</strong>
            <span className="font-mono">Portfolio Admin</span>
          </div>
        </a>

        <main className="auth-card">
          <div className="admin-eyebrow font-mono">Acesso restrito</div>
          <h1 className="font-display">Painel <span>administrativo</span></h1>
          <p>Entre para atualizar o conteúdo exibido no seu portfólio.</p>

          <form onSubmit={submit} className="admin-form auth-form">
            <label>
              <span>E-mail</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seuemail@exemplo.com" autoComplete="email" required />
            </label>
            <label>
              <span>Senha</span>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" autoComplete="current-password" required />
            </label>

            {error && <div className="admin-alert error">{error}</div>}

            <button type="submit" className="admin-primary" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar no painel'}
            </button>
          </form>

          <a href="/" className="auth-back font-mono">← Voltar para o portfólio</a>
        </main>
      </div>
    </DottedBackground>
  )
}
