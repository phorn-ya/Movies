import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import MovieGrid from '../components/MovieGrid.jsx'
import { searchMovies } from '../api/tmdb.js'

export default function SearchResults() {
  const [params] = useSearchParams()
  const query = params.get('q') ?? ''

  const [movies, setMovies] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  const load = useCallback((q, pageNum, replace) => {
    setStatus('loading')
    searchMovies(q, pageNum)
      .then((data) => {
        setMovies((prev) => (replace ? data.results : [...prev, ...data.results]))
        setTotalPages(data.total_pages ?? 1)
        setStatus('ready')
      })
      .catch((err) => {
        setError(err.message)
        setStatus('error')
      })
  }, [])

  useEffect(() => {
    setPage(1)
    load(query, 1, true)
  }, [query, load])

  function handleLoadMore() {
    const nextPage = page + 1
    setPage(nextPage)
    load(query, nextPage, false)
  }

  return (
    <div className="wrap section">
      <div className="section-head">
        <h2 className="section-title">Results for "{query}"</h2>
        <span className="section-sub">{movies.length} Shown</span>
      </div>

      {status === 'error' && <p className="state-msg error">Search failed — {error}</p>}

      {status === 'loading' && movies.length === 0 && (
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" />
          <p className="state-msg">Searching the archive…</p>
        </div>
      )}

      <MovieGrid movies={movies} />

      {page < totalPages && movies.length > 0 && (
        <div className="load-more-row">
          <button
            className="load-more-btn"
            onClick={handleLoadMore}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="loading-spinner" style={{ width: '16px', height: '16px', margin: 0 }} />
                Loading…
              </span>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}
    </div>
  )
}
