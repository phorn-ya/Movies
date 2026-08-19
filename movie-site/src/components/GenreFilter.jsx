export default function GenreFilter({ genres, activeId, onSelect }) {
  return (
    <div className="genre-row" role="tablist" aria-label="Filter by genre">
      <button
        className={`genre-chip ${activeId === null ? 'active' : ''}`}
        onClick={() => onSelect(null)}
        role="tab"
        aria-selected={activeId === null}
      >
        ALL
      </button>
      {genres.map((g) => (
        <button
          key={g.id}
          className={`genre-chip ${activeId === g.id ? 'active' : ''}`}
          onClick={() => onSelect(g.id)}
          role="tab"
          aria-selected={activeId === g.id}
        >
          {g.name.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
