import MovieCard from './MovieCard.jsx'

export default function MovieGrid({ movies }) {
  if (!movies || movies.length === 0) {
    return <p className="state-msg">No titles found here. Try another search or genre.</p>
  }

  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}
