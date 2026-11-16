import { useEffect, useState } from 'react'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { fetchCars, fetchCompanies, fetchStatuses, type CarRow } from './api'
import './CarsPage.css'

const PAGE_SIZE = 10

type Option = { id: number; label: string }

// Each answer remembers which request it belongs to (`key`).
// "Loading" is then derived: the latest answer is not for the current filters yet.
type CarsResult =
  | { key: string; status: 'error'; message: string }
  | { key: string; status: 'ready'; rows: CarRow[]; total: number }

export default function CarsPage() {
  // --- Filters (what the user picked) ---
  const [search, setSearch] = useState('')
  const [statusId, setStatusId] = useState<number | undefined>()
  const [companyId, setCompanyId] = useState<number | undefined>()
  const [page, setPage] = useState(0)
  const debouncedSearch = useDebouncedValue(search, 300)

  // --- Dropdown options (loaded once) ---
  const [statuses, setStatuses] = useState<Option[]>([])
  const [companies, setCompanies] = useState<Option[]>([])
  const [lookupError, setLookupError] = useState<string | null>(null)

  // --- Table data ---
  const [result, setResult] = useState<CarsResult | null>(null)
  const [lastReady, setLastReady] = useState<{ rows: CarRow[]; total: number } | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const requestKey = JSON.stringify([page, debouncedSearch, statusId, companyId, reloadKey])

  useEffect(() => {
    Promise.all([fetchStatuses(), fetchCompanies()])
      .then(([s, c]) => {
        setStatuses(s)
        setCompanies(c)
      })
      .catch((e: Error) => setLookupError(e.message))
  }, [])

  useEffect(() => {
    // `ignore` protects against race conditions: if the filters change while a
    // request is in flight, the older (slower) answer must not overwrite the newer one.
    let ignore = false

    fetchCars({ page, pageSize: PAGE_SIZE, search: debouncedSearch, statusId, companyId })
      .then(({ rows, total }) => {
        if (ignore) return
        setResult({ key: requestKey, status: 'ready', rows, total })
        setLastReady({ rows, total })
      })
      .catch((e: Error) => {
        if (!ignore) setResult({ key: requestKey, status: 'error', message: e.message })
      })

    return () => {
      ignore = true
    }
  }, [requestKey, page, debouncedSearch, statusId, companyId])

  const isLoading = result?.key !== requestKey
  const errorMessage = !isLoading && result?.status === 'error' ? result.message : null

  // Any filter change goes back to page 0: otherwise we could ask for a page
  // past the end of the new result set, and PostgREST answers 416.
  function onSearchChange(value: string) {
    setSearch(value)
    setPage(0)
  }
  function onStatusChange(value: string) {
    setStatusId(value ? Number(value) : undefined)
    setPage(0)
  }
  function onCompanyChange(value: string) {
    setCompanyId(value ? Number(value) : undefined)
    setPage(0)
  }
  function resetFilters() {
    setSearch('')
    setStatusId(undefined)
    setCompanyId(undefined)
    setPage(0)
  }

  // While a new page loads, keep showing the previous rows (dimmed) instead of
  // flashing an empty table.
  const shown = lastReady
  const total = shown?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const firstRow = total === 0 ? 0 : page * PAGE_SIZE + 1
  const lastRow = Math.min(total, (page + 1) * PAGE_SIZE)
  const hasFilters = search !== '' || statusId !== undefined || companyId !== undefined

  return (
    <main className="cars-page">
      <header className="cars-header">
        <h2>Véhicules</h2>
        {shown && <span className="cars-total">{total} au total</span>}
      </header>

      <div className="cars-filters">
        <input
          type="search"
          placeholder="Rechercher une immatriculation…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Rechercher une immatriculation"
        />
        <select
          value={statusId ?? ''}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Filtrer par statut"
        >
          <option value="">Tous les statuts</option>
          {statuses.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
        <select
          value={companyId ?? ''}
          onChange={(e) => onCompanyChange(e.target.value)}
          aria-label="Filtrer par société"
        >
          <option value="">Toutes les sociétés</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        {hasFilters && (
          <button type="button" className="link-button" onClick={resetFilters}>
            Réinitialiser
          </button>
        )}
      </div>

      {lookupError && (
        <p className="cars-warning">Filtres indisponibles : {lookupError}</p>
      )}

      {errorMessage ? (
        <div className="cars-state cars-error" role="alert">
          <p>Impossible de charger les véhicules.</p>
          <code>{errorMessage}</code>
          <button type="button" onClick={() => setReloadKey((k) => k + 1)}>
            Réessayer
          </button>
        </div>
      ) : !shown ? (
        <div className="cars-state">Chargement…</div>
      ) : shown.rows.length === 0 ? (
        <div className="cars-state">
          <p>Aucun véhicule ne correspond à ces filtres.</p>
          {hasFilters && (
            <button type="button" onClick={resetFilters}>Réinitialiser les filtres</button>
          )}
        </div>
      ) : (
        <div className="cars-table-wrap" aria-busy={isLoading}>
          <table className={isLoading ? 'cars-table is-loading' : 'cars-table'}>
            <thead>
              <tr>
                <th>Immatriculation</th>
                <th>Marque</th>
                <th>Société</th>
                <th>Statut</th>
                <th>Couleur</th>
                <th className="num">Kilométrage</th>
                <th>Mise en circulation</th>
              </tr>
            </thead>
            <tbody>
              {shown.rows.map((car) => (
                <tr key={car.id}>
                  <td className="mono">{car.immat}</td>
                  <td>{car.marque?.libelle ?? '—'}</td>
                  <td>{car.societe?.label ?? '—'}</td>
                  <td>{car.statut?.label ?? '—'}</td>
                  <td>{car.couleur ?? '—'}</td>
                  <td className="num">{formatKm(car.km_dernier)}</td>
                  <td>{formatDate(car.date_mce)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {shown && total > 0 && (
        <nav className="cars-pagination" aria-label="Pagination">
          <span>{firstRow}–{lastRow} sur {total}</span>
          <div>
            <button type="button" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>
              ← Précédent
            </button>
            <span>Page {page + 1} / {pageCount}</span>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={page + 1 >= pageCount}
            >
              Suivant →
            </button>
          </div>
        </nav>
      )}
    </main>
  )
}

function formatKm(km: number | null) {
  return km === null ? '—' : `${km.toLocaleString('fr-FR')} km`
}

// date_mce is a Postgres `date` ("2024-01-11"): format the string directly.
// `new Date("2024-01-11")` is parsed as UTC midnight and can shift a day in some time zones.
function formatDate(value: string | null) {
  if (!value) return '—'
  const [y, m, d] = value.split('-')
  return `${d}/${m}/${y}`
}
