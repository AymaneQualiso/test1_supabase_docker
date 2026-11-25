import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import './auth.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    // On success there is nothing to do here: onAuthStateChange (useSession)
    // receives SIGNED_IN and App switches to the logged-in screen.
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })

    if (error) {
      // Same message for "unknown email" and "wrong password": never tell an attacker which one exists.
      setError(error.code === 'invalid_credentials' ? 'Email ou mot de passe incorrect.' : error.message)
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h2>Connexion</h2>

        <label>
          Email
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label>
          Mot de passe
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <p className="auth-error" role="alert">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Connexion…' : 'Se connecter'}
        </button>

        <p className="auth-hint">Les comptes sont créés par un administrateur.</p>
      </form>
    </main>
  )
}
