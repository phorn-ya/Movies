import { getImageUrl } from '../api/tmdb.js'

const GROUPS = [
  { key: 'flatrate', label: 'Stream', icon: '▶' },
  { key: 'rent', label: 'Rent', icon: '🎟' },
  { key: 'buy', label: 'Buy', icon: '📀' },
]

export default function WatchProviders({ data, region }) {
  const regionData = data?.results?.[region]

  return (
    <div className="providers-block">
      <h2>Where to Watch</h2>

      {!regionData ? (
        <p className="providers-empty">
          No streaming, rental, or purchase options found for this title in {region} right now.
        </p>
      ) : (
        <>
          {GROUPS.map((group) => {
            const providers = regionData[group.key]
            if (!providers || providers.length === 0) return null
            return (
              <div className="provider-group" key={group.key}>
                <h3>
                  <span aria-hidden="true">{group.icon}</span> {group.label}
                </h3>
                <div className="provider-logos">
                  {providers.map((p) => (
                    <a
                      key={p.provider_id}
                      href={regionData.link}
                      target="_blank"
                      rel="noreferrer"
                      className="provider-logo"
                      title={`Watch on ${p.provider_name}`}
                      aria-label={`Watch on ${p.provider_name}`}
                    >
                      <img
                        src={getImageUrl(p.logo_path, 'w92')}
                        alt={p.provider_name}
                        loading="lazy"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )
          })}

          {regionData.link && (
            <a
              href={regionData.link}
              target="_blank"
              rel="noreferrer"
              className="watch-now-btn"
            >
              ▶ Watch Now
            </a>
          )}
        </>
      )}

      <p className="jw-attribution">
        Streaming data from JustWatch via The Movie Database.
        {regionData?.link && (
          <>
            {' '}
            <a href={regionData.link} target="_blank" rel="noreferrer">
              View all options →
            </a>
          </>
        )}
      </p>
    </div>
  )
}
