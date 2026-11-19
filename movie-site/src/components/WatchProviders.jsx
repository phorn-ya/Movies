import { getImageUrl } from '../api/tmdb.js'
import { REGIONS } from '../context/RegionContext.jsx'

const GROUPS = [
  { key: 'flatrate', label: 'Stream', icon: '▶' },
  { key: 'rent', label: 'Rent', icon: '🎟' },
  { key: 'buy', label: 'Buy', icon: '📀' },
]

export default function WatchProviders({ data, region }) {
  const regionData = data?.results?.[region]
  const regionLabel = REGIONS.find((item) => item.code === region)?.label ?? region

  return (
    <section className="providers-block" id="watch-options" aria-labelledby="watch-options-title">
      <h2 id="watch-options-title">Legal Watch Options</h2>

      {!regionData ? (
        <p className="providers-empty">
          No streaming, rental, or purchase options are listed for {regionLabel} right now.
          Try changing the region in the header.
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
                <div className="provider-options">
                  {providers.map((p) => (
                    <a
                      key={p.provider_id}
                      href={regionData.link}
                      target="_blank"
                      rel="noreferrer"
                      className="provider-option"
                      title={`Check ${p.provider_name} availability on JustWatch`}
                      aria-label={`Check ${p.provider_name} availability on JustWatch`}
                    >
                      <img
                        src={getImageUrl(p.logo_path, 'w92')}
                        alt=""
                        loading="lazy"
                      />
                      <span>{p.provider_name}</span>
                      <span className="provider-option-arrow" aria-hidden="true">↗</span>
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
              Find a service on JustWatch ↗
            </a>
          )}
        </>
      )}

      <p className="jw-attribution">
        Availability for {regionLabel} from JustWatch via TMDB. Playback takes place on the
        selected service.
        {regionData?.link && (
          <>
            {' '}
            <a href={regionData.link} target="_blank" rel="noreferrer">
              View all options on JustWatch →
            </a>
          </>
        )}
      </p>
    </section>
  )
}
