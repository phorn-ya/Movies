import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getImageUrl, getMovieVideos, findTrailerKey } from '../api/tmdb.js'
import VideoPlayer from './VideoPlayer.jsx'

export default function MarqueeHero({ movie }) {
  const [trailerKey, setTrailerKey] = useState(null)
  const [showTrailer, setShowTrailer] = useState(false)

  useEffect(() => {
    if (!movie?.id) return
    getMovieVideos(movie.id)
      .then((data) => setTrailerKey(findTrailerKey(data)))
      .catch(() => setTrailerKey(null))
  }, [movie?.id])

  if (!movie) return null

  const backdrop = getImageUrl(movie.backdrop_path, 'original')
  const year = movie.release_date ? movie.release_date.slice(0, 4) : '—'
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '—'

  return (
    <section className="marquee-hero">
      <div
        className="backdrop"
        style={backdrop ? { backgroundImage: `url(${backdrop})` } : undefined}
      />
      <div className="wrap content">
        <span className="eyebrow-bulbs">Trending This Week</span>
        <h1 className="marquee-title">{movie.title}</h1>
        {movie.tagline && <p className="tagline">{movie.tagline}</p>}
        {movie.overview && <p className="overview">{movie.overview}</p>}
        <div className="hero-meta">
          <span>{year}</span>
          <span className="rating">★ {rating}</span>
        </div>
        <div className="detail-actions" style={{ marginTop: 0 }}>
          {trailerKey && (
            <button
              className="action-btn play-btn"
              onClick={() => setShowTrailer(true)}
            >
              ▶ Play Trailer
            </button>
          )}
          <Link to={`/movie/${movie.id}`} className="action-btn watch-btn">
            🍿 Find Where to Watch
          </Link>
        </div>
      </div>

      {showTrailer && trailerKey && (
        <div className="trailer-section" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, background: 'var(--bg)', padding: '20px 24px 0' }}>
          <div className="wrap">
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
        </div>
      )}
    </section>
  )
}
