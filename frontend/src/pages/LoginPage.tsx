import { useState, type FormEvent } from 'react'
import { loginAdmin } from '@/lib/adminApi'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await loginAdmin(email.trim(), password)
      window.location.href = '/admin'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="admin-shell admin-auth-shell">
      <section className="admin-auth-card">
        <a href="/" className="admin-back-link">← Voltar ao portfólio</a>
        <div className="section-label">Área restrita</div>
        <h1 className="admin-title">Login <span>Admin</span></h1>
        <p className="admin-subtitle">
          Entre para editar projetos, a seção “Quem sou eu” e o número do WhatsApp.
        </p>

        <form onSubmit={handleSubmit} className="admin-form">
          <label>
            <span>E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@seuportfolio.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            <span>Senha</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Sua senha"
              autoComplete="current-password"
              required
            />
          </label>

          {error && <div className="admin-alert error">{error}</div>}

          <button className="admin-primary-button" type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar no painel'}
          </button>
        </form>
      </section>
    </main>
  )
}
