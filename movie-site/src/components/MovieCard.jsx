import { Link } from 'react-router-dom'
import { getImageUrl } from '../api/tmdb.js'

function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export default function MovieCard({ movie }) {
  const year = movie.release_date ? movie.release_date.slice(0, 4) : '—'
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '—'
  const poster = getImageUrl(movie.poster_path, 'w342')
  const duration = formatDuration(movie.runtime)

  return (
    <Link to={`/movie/${movie.id}`} className="movie-card">
      <div
        className="poster"
        style={poster ? { backgroundImage: `url(${poster})` } : undefined}
      >
        <div className="play-icon" aria-hidden="true" />
        {!poster && <span className="no-art">{movie.title}</span>}
      </div>
      <div className="stub-perf" aria-hidden="true" />
      <div className="stub-info">
        <p className="title">{movie.title}</p>
        <div className="stub-row">
          <span>{year}</span>
          {duration && <span className="duration-badge">⏱ {duration}</span>}
          <span className="rating">★ {rating}</span>
        </div>
      </div>
    </Link>
  )
}
