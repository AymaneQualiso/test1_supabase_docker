import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

// undefined = still reading the stored session (first render)
// null      = logged out
// Session   = logged in
export function useSession(): Session | null | undefined {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    // Fires once at once with INITIAL_SESSION (the session saved in localStorage, or null),
    // then on SIGNED_IN, SIGNED_OUT and TOKEN_REFRESHED (about every hour).
    // Never `await` another supabase call inside this callback: it can deadlock the client.
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  return session
}
