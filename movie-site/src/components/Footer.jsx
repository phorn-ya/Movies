export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <p>
          <strong style={{ color: 'var(--accent)' }}>Reel House</strong> is a movie discovery site.
          It doesn't host or stream video — it points you to legitimate places to watch.
          Movie data and images are provided by{' '}
          <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">
            The Movie Database (TMDB)
          </a>
          . This product uses the TMDB API but is not endorsed or certified by TMDB.
          Streaming availability is sourced from JustWatch.
        </p>
      </div>
    </footer>
  )
}
