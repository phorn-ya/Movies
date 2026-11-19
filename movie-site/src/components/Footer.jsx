import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="site-footer__main">
          <div className="site-footer__brand">
            <Link to="/" className="site-footer__logo" aria-label="CineStream home">
              CINE<span>STREAM</span>
            </Link>
            <p>Discover your next favorite film.</p>
          </div>

          <nav className="site-footer__column" aria-label="Footer navigation">
            <h2>Explore</h2>
            <Link to="/">Home</Link>
          </nav>

          <section className="site-footer__column">
            <h2>About</h2>
            <p>
              A movie discovery site. We don't host or stream films; we help you find
              legitimate places to watch.
            </p>
          </section>

          <section className="site-footer__column site-footer__sources">
            <h2>Data sources</h2>
            <p>Movie information and images:</p>
            <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">
              The Movie Database (TMDB)
            </a>
            <p>Streaming availability:</p>
            <a href="https://www.justwatch.com/" target="_blank" rel="noopener noreferrer">
              JustWatch
            </a>
          </section>
        </div>

        <div className="site-footer__bottom">
          <span>&copy; {new Date().getFullYear()} CineStream</span>
          <span>This product uses the TMDB API but is not endorsed or certified by TMDB.</span>
        </div>
      </div>
    </footer>
  )
}
