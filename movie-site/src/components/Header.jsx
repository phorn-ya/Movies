import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRegion, REGIONS } from '../context/RegionContext.jsx'

export default function Header() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { region, setRegion } = useRegion()

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = query.trim()
    navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/')
  }

  return (
    <header className="site-header">
      <div className="wrap">
        <a href="/" className="brand" onClick={(e) => { e.preventDefault(); navigate('/') }}>
          REEL HOUSE <span>NOW SHOWING</span>
        </a>

        <form className="search-form" onSubmit={handleSubmit} role="search">
          <input
            type="text"
            placeholder="Search titles…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search movies"
          />
          <button type="submit">GO</button>
        </form>

        <select
          className="region-select"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          aria-label="Streaming region"
        >
          {REGIONS.map((r) => (
            <option key={r.code} value={r.code}>
              {r.code}
            </option>
          ))}
        </select>
      </div>
    </header>
  )
}
