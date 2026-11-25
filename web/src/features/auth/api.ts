import { supabase } from '../../lib/supabase'

// The "profiles: read own or admin" policy lets every user read their own row,
// even when inactive: that is what lets us show "account disabled" instead of an empty app.
export async function fetchMyProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, role, is_active')
    .eq('id', userId)
    .maybeSingle() // null (not an error) when the auth user has no profile row

  if (error) throw error
  return data
}

export type MyProfile = NonNullable<Awaited<ReturnType<typeof fetchMyProfile>>>
