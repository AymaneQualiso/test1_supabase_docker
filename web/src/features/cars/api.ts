import type { QueryData } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

// Must stay ONE string literal: `'a' + 'b'` widens the type to `string`,
// and supabase-js can no longer infer the row type (GenericStringError).
const CARS_SELECT = `
  id, immat, couleur, km_dernier, date_mce,
  marque:societe_marques(libelle),
  societe:companies(label),
  statut:car_statuses(label)
`

function carsQuery() {
    return supabase.from('cars').select(CARS_SELECT, { count: 'exact' })
}

export type CarRow = QueryData<ReturnType<typeof carsQuery>>[number]

export type CarFilters = {
  page: number          // 0-based
  pageSize: number
  search?: string
  statusId?: number
  companyId?: number
}

// % and _ are LIKE wildcards: make them literal if the user types them
function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, '\\$&')
}

export async function fetchCars(
  { page, pageSize, search, statusId, companyId }: CarFilters,
): Promise<{ rows: CarRow[]; total: number }> {
  let query = carsQuery()

  const term = search?.trim()
  if (term) query = query.ilike('immat', `%${escapeLike(term)}%`)
  if (statusId) query = query.eq('car_statut_id', statusId)
  if (companyId) query = query.eq('achat_societe_id', companyId)

  const from = page * pageSize
  const { data, count, error } = await query
    .order('immat')
    .range(from, from + pageSize - 1)

  if (error) throw error
  return { rows: data, total: count ?? 0 }
}

export async function fetchStatuses() {
  const { data, error } = await supabase
    .from('car_statuses')
    .select('id, label')
    .order('label')

  if (error) throw error
  return data
}

export async function fetchCompanies() {
  const { data, error } = await supabase
    .from('companies')
    .select('id, label')
    .order('label')

  if (error) throw error
  return data
}