// Creates the local test users for week 2 (auth + RLS).
// Run AFTER every `npx supabase db reset` (the reset wipes auth.users):
//   npm run seed:users
//
// Uses the SECRET key: it bypasses RLS and can create users.
// This file runs in Node only. Never import it from src/ (the browser bundle).

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/database.types.ts'

type AppRole = Database['public']['Enums']['app_role']

type TestUser = {
  email: string
  fullName: string
  role: AppRole
  isActive: boolean
  companies: string[] // company abv: DLC, DLR, DFT (see supabase/seed.sql)
}

// One user per case the policies must handle.
const USERS: TestUser[] = [
  { email: 'admin@autosuite.test',        fullName: 'Admin Test',       role: 'admin',   isActive: true,  companies: [] },
  { email: 'manager.dlc@autosuite.test',  fullName: 'Manager DLC',      role: 'manager', isActive: true,  companies: ['DLC'] },
  { email: 'viewer.dlr@autosuite.test',   fullName: 'Viewer DLR',       role: 'viewer',  isActive: true,  companies: ['DLR'] },
  { email: 'viewer.multi@autosuite.test', fullName: 'Viewer DLC + DFT', role: 'viewer',  isActive: true,  companies: ['DLC', 'DFT'] },
  { email: 'inactive.dlc@autosuite.test', fullName: 'Inactive DLC',     role: 'manager', isActive: false, companies: ['DLC'] },
]

const url = requireEnv('SUPABASE_URL')
const secretKey = requireEnv('SUPABASE_SECRET_KEY')
const password = requireEnv('SEED_USERS_PASSWORD')

// Safety net: test users with a shared password must never land on staging or prod.
const host = new URL(url).hostname
if (host !== '127.0.0.1' && host !== 'localhost') {
  throw new Error(`Refusing to seed test users on ${host}: local stack only.`)
}

const admin = createClient<Database>(url, secretKey, {
  // A script has no browser storage and no long-lived session to refresh.
  auth: { persistSession: false, autoRefreshToken: false },
})

const companyIds = await loadCompanyIds()
const summary = []

for (const user of USERS) {
  const id = await findOrCreateAuthUser(user)
  await upsertProfile(id, user)
  await syncCompanies(id, user)
  summary.push({ email: user.email, role: user.role, active: user.isActive, companies: user.companies.join(', ') || '(all, via role)' })
}

console.table(summary)

// ---------------------------------------------------------------------------

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing ${name} in scripts/.env (copy scripts/.env.example)`)
  return value
}

async function loadCompanyIds(): Promise<Map<string, number>> {
  const { data, error } = await admin.from('companies').select('id, abv')
  if (error) throw error
  return new Map(data.filter((c) => c.abv).map((c) => [c.abv as string, c.id]))
}

async function findOrCreateAuthUser(user: TestUser): Promise<string> {
  const { data, error } = await admin.auth.admin.createUser({
    email: user.email,
    password,
    email_confirm: true, // no confirmation email locally: the user can log in at once
    user_metadata: { full_name: user.fullName }, // display only: NEVER the role (users can edit their own metadata)
  })
  if (!error) return data.user.id

  if (error.code !== 'email_exists') throw error

  // Script run twice without a reset: reuse the user and reset its password.
  const { data: list, error: listError } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (listError) throw listError
  const existing = list.users.find((u) => u.email === user.email)
  if (!existing) throw new Error(`${user.email} exists but was not found in listUsers`)

  const { error: pwError } = await admin.auth.admin.updateUserById(existing.id, { password })
  if (pwError) throw pwError
  return existing.id
}

async function upsertProfile(id: string, user: TestUser) {
  const { error } = await admin.from('profiles').upsert({
    id,
    full_name: user.fullName,
    role: user.role,
    is_active: user.isActive,
  })
  if (error) throw error
}

// Replace the user's company links with exactly the ones listed above.
async function syncCompanies(userId: string, user: TestUser) {
  const { error: deleteError } = await admin.from('user_companies').delete().eq('user_id', userId)
  if (deleteError) throw deleteError

  const rows = user.companies.map((abv) => {
    const companyId = companyIds.get(abv)
    if (!companyId) throw new Error(`Unknown company ${abv}: did the seed run?`)
    return { user_id: userId, company_id: companyId }
  })
  if (rows.length === 0) return

  const { error } = await admin.from('user_companies').insert(rows)
  if (error) throw error
}
