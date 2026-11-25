import AuthedApp from './features/auth/AuthedApp'
import LoginPage from './features/auth/LoginPage'
import { useSession } from './features/auth/useSession'

export default function App() {
  const session = useSession()

  // First render: the stored session has not been read yet. Showing the login
  // page here would make it flash for users who are already logged in.
  if (session === undefined) return <p className="app-message">Chargement…</p>

  if (!session) return <LoginPage />

  return <AuthedApp key={session.user.id} session={session} />
}
