import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getMovieDetails, getWatchProviders, getMovieVideos, findTrailerKey, getImageUrl } from '../api/tmdb.js'
import { useRegion } from '../context/RegionContext.jsx'
import WatchProviders from '../components/WatchProviders.jsx'
import VideoPlayer from '../components/VideoPlayer.jsx'

function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export default function MovieDetail() {
  const { id } = useParams()
  const { region } = useRegion()

  const [movie, setMovie] = useState(null)
  const [providers, setProviders] = useState(null)
  const [trailerKey, setTrailerKey] = useState(null)
  const [showTrailer, setShowTrailer] = useState(false)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    setStatus('loading')
    setMovie(null)
    setProviders(null)
    setTrailerKey(null)
    setShowTrailer(false)

    Promise.all([
      getMovieDetails(id),
      getWatchProviders(id),
      getMovieVideos(id),
    ])
      .then(([details, watch, videos]) => {
        setMovie(details)
        setProviders(watch)
        setTrailerKey(findTrailerKey(videos))
        setStatus('ready')
      })
      .catch((err) => {
        setError(err.message)
        setStatus('error')
      })

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  if (status === 'loading') {
    return (
      <div className="wrap" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div className="loading-spinner" />
        <p className="state-msg">Threading the film…</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="wrap" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <p className="state-msg error">Couldn't load this title — {error}</p>
        <Link to="/" className="back-link" style={{ justifyContent: 'center' }}>
          ← Back to Reel House
        </Link>
      </div>
    )
  }

  if (!movie) return null

  const backdrop = getImageUrl(movie.backdrop_path, 'original')
  const poster = getImageUrl(movie.poster_path, 'w342')
  const year = movie.release_date ? movie.release_date.slice(0, 4) : '—'
  const duration = formatDuration(movie.runtime)
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '—'

  return (
    <>
      <section className="detail-hero">
        <div
          className="backdrop"
          style={backdrop ? { backgroundImage: `url(${backdrop})` } : undefined}
        />
        <div className="wrap detail-content">
          <div className="detail-poster">
            {poster ? <img src={poster} alt={`${movie.title} poster`} /> : null}
          </div>
          <div>
            <h1 className="detail-title">{movie.title}</h1>
            {movie.tagline && <p className="detail-tagline">"{movie.tagline}"</p>}
            <div className="detail-meta">
              <span className="meta-chip">{year}</span>
              {duration && <span className="meta-chip meta-chip--accent">⏱ {duration}</span>}
              <span className="meta-chip meta-chip--rating">★ {rating}</span>
            </div>

            {/* Action buttons */}
            <div className="detail-actions">
              {trailerKey && (
                <button
                  className="action-btn play-btn"
                  onClick={() => setShowTrailer(true)}
                >
                  ▶ Play Trailer
                </button>
              )}
              {providers?.results?.[region]?.link && (
                <a
                  href={providers.results[region].link}
                  target="_blank"
                  rel="noreferrer"
                  className="action-btn watch-btn"
                >
                  🍿 Where to Watch
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Inline Trailer */}
      {showTrailer && trailerKey && (
        <div className="wrap trailer-section">
          <VideoPlayer
            videoKey={trailerKey}
            title={`Trailer for ${movie.title}`}
            size="hero"
            autoPlay
          />
          <button
            className="trailer-close-btn"
            onClick={() => setShowTrailer(false)}
          >
            ✕ Close Trailer
          </button>
        </div>
      )}

      <div className="wrap">
        <Link to="/" className="back-link">← Back to Reel House</Link>

        <div className="detail-body">
          <div className="overview-block">
            <h2>Overview</h2>
            <p>{movie.overview || 'No synopsis available for this title.'}</p>
            {movie.genres?.length > 0 && (
              <div className="genre-tags">
                {movie.genres.map((g) => (
                  <span className="genre-tag" key={g.id}>{g.name}</span>
                ))}
              </div>
            )}
          </div>

          <WatchProviders data={providers} region={region} />
        </div>
      </div>
    </>
  )
}
