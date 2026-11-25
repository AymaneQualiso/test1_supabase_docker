import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import CarsPage from '../cars/CarsPage'
import { fetchMyProfile, type MyProfile } from './api'
import './auth.css'

const ROLE_LABELS: Record<MyProfile['role'], string> = {
  admin: 'Administrateur',
  manager: 'Gestionnaire',
  viewer: 'Lecture seule',
}

type ProfileState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; profile: MyProfile | null }

// Mounted with key={user id} by App: a different user gets a fresh component,
// so nothing from the previous user's screen can leak into the next one.
export default function AuthedApp({ session }: { session: Session }) {
  const userId = session.user.id
  const [state, setState] = useState<ProfileState>({ status: 'loading' })

  useEffect(() => {
    let ignore = false
    fetchMyProfile(userId)
      .then((profile) => { if (!ignore) setState({ status: 'ready', profile }) })
      .catch((e: Error) => { if (!ignore) setState({ status: 'error', message: e.message }) })
    return () => { ignore = true }
  }, [userId])

  const profile = state.status === 'ready' ? state.profile : null

  return (
    <>
      <header className="app-header">
        <strong>AutoSuite</strong>
        <div className="app-user">
          <span>{profile?.full_name ?? session.user.email}</span>
          {profile && <span className={`role-badge role-${profile.role}`}>{ROLE_LABELS[profile.role]}</span>}
          <button type="button" onClick={() => supabase.auth.signOut()}>
            Se déconnecter
          </button>
        </div>
      </header>

      {state.status === 'loading' && <p className="app-message">Chargement du profil…</p>}

      {state.status === 'error' && (
        <p className="app-message auth-error" role="alert">Profil indisponible : {state.message}</p>
      )}

      {state.status === 'ready' && !state.profile && (
        <p className="app-message">Ce compte n'a pas de profil. Contactez un administrateur.</p>
      )}

      {state.status === 'ready' && state.profile && !state.profile.is_active && (
        <p className="app-message">Ce compte est désactivé. Contactez un administrateur.</p>
      )}

      {state.status === 'ready' && state.profile?.is_active && <CarsPage />}
    </>
  )
}
