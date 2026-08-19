import { useEffect, useState, useCallback } from 'react'
import MarqueeHero from '../components/MarqueeHero.jsx'
import GenreFilter from '../components/GenreFilter.jsx'
import MovieGrid from '../components/MovieGrid.jsx'
import SprocketDivider from '../components/SprocketDivider.jsx'
import { getTrending, getGenres, discoverMovies } from '../api/tmdb.js'

export default function Home() {
  const [featured, setFeatured] = useState(null)
  const [genres, setGenres] = useState([])
  const [activeGenre, setActiveGenre] = useState(null)
  const [movies, setMovies] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    getTrending()
      .then((data) => setFeatured(data.results?.[0] ?? null))
      .catch(() => setFeatured(null))

    getGenres()
      .then((data) => setGenres(data.genres ?? []))
      .catch(() => setGenres([]))
  }, [])

  const loadMovies = useCallback((genreId, pageNum, replace) => {
    setStatus('loading')
    discoverMovies({ genreId, page: pageNum })
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
    loadMovies(activeGenre, 1, true)
  }, [activeGenre, loadMovies])

  function handleLoadMore() {
    const nextPage = page + 1
    setPage(nextPage)
    loadMovies(activeGenre, nextPage, false)
  }

  return (
    <>
      <MarqueeHero movie={featured} />
      <SprocketDivider />

      <div className="wrap section">
        <div className="section-head">
          <h2 className="section-title">Now on the Reel</h2>
          <span className="section-sub">Sorted by Popularity</span>
        </div>

        <GenreFilter genres={genres} activeId={activeGenre} onSelect={setActiveGenre} />

        {status === 'error' && (
          <p className="state-msg error">Couldn't load movies — {error}</p>
        )}

        <MovieGrid movies={movies} />

        {status === 'loading' && movies.length === 0 && (
          <div style={{ textAlign: 'center' }}>
            <div className="loading-spinner" />
            <p className="state-msg">Rolling the film…</p>
          </div>
        )}

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
    </>
  )
}
