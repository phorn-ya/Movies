import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getImageUrl, getMovieVideos, findTrailerKey } from '../api/tmdb.js'
import TrailerModal from './TrailerModal.jsx'

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
              ▶ Play
            </button>
          )}
          <Link to={`/movie/${movie.id}`} className="action-btn watch-btn">
            🍿 Find Where to Watch
          </Link>
        </div>
      </div>

      {showTrailer && trailerKey && (
        <TrailerModal
          videoKey={trailerKey}
          title={`Trailer for ${movie.title}`}
          onClose={() => setShowTrailer(false)}
        />
      )}
    </section>
  )
}
