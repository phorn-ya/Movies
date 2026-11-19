import { useEffect, useRef, useState } from 'react'

const SLEEP_TIMER_OPTIONS = [5, 10, 15, 30, 45, 60]
let youtubeApiPromise

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve()
  if (youtubeApiPromise) return youtubeApiPromise

  youtubeApiPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    script.onerror = () => {
      youtubeApiPromise = null
      reject(new Error('Could not load the YouTube player. Check your connection and try again.'))
    }

    window.onYouTubeIframeAPIReady = resolve
    document.head.appendChild(script)
  })

  return youtubeApiPromise
}

export default function VideoPlayer({ videoKey, title = 'Trailer', size = 'hero', autoPlay = false }) {
  const [started, setStarted] = useState(autoPlay)
  const [sleepTimerLabel, setSleepTimerLabel] = useState('Off')
  const [showSleepTimer, setShowSleepTimer] = useState(false)
  const [error, setError] = useState(null)

  const playerRef = useRef(null)
  const iframeRef = useRef(null)
  const sleepTimeoutRef = useRef(null)
  const sleepModeRef = useRef('off')

  useEffect(() => {
    let active = true

    function initPlayer() {
      if (!active || !iframeRef.current || !window.YT?.Player) return

      const playerElement = document.createElement('div')
      iframeRef.current.appendChild(playerElement)
      playerRef.current = new window.YT.Player(playerElement, {
        videoId: videoKey,
        playerVars: {
          autoplay: autoPlay ? 1 : 0,
          controls: 1,
          disablekb: 0,
          fs: 1,
          iv_load_policy: 3,
          rel: 0,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            if (!active) {
              event.target.destroy()
              return
            }
            if (autoPlay) setStarted(true)
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setStarted(true)
            } else if (
              event.data === window.YT.PlayerState.ENDED &&
              sleepModeRef.current === 'end'
            ) {
              clearSleepTimer()
            }
          },
          onError: () => setError('This trailer cannot be played here. Try opening it on YouTube.'),
        },
      })
    }

    loadYouTubeApi().then(initPlayer).catch((loadError) => {
      if (active) setError(loadError.message)
    })

    return () => {
      active = false
      if (sleepTimeoutRef.current) clearTimeout(sleepTimeoutRef.current)
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [autoPlay, videoKey])

  function clearSleepTimer() {
    if (sleepTimeoutRef.current) clearTimeout(sleepTimeoutRef.current)
    sleepTimeoutRef.current = null
    sleepModeRef.current = 'off'
    setSleepTimerLabel('Off')
  }

  function setSleepTimer(option) {
    if (sleepTimeoutRef.current) clearTimeout(sleepTimeoutRef.current)
    sleepTimeoutRef.current = null

    if (option === 'off') {
      sleepModeRef.current = 'off'
      setSleepTimerLabel('Off')
    } else if (option === 'end') {
      sleepModeRef.current = 'end'
      setSleepTimerLabel('End of video')
    } else {
      sleepModeRef.current = 'timer'
      setSleepTimerLabel(`${option} min`)
      sleepTimeoutRef.current = setTimeout(() => {
        playerRef.current?.pauseVideo()
        sleepTimeoutRef.current = null
        sleepModeRef.current = 'off'
        setSleepTimerLabel('Off')
      }, option * 60 * 1000)
    }

    setShowSleepTimer(false)
  }

  function playTrailer() {
    playerRef.current?.playVideo()
  }

  return (
    <div className={`yt-player-container ${size === 'full' ? 'yt-player--full' : ''}`}>
      <div ref={iframeRef} className="yt-iframe-wrap" />

      {!started && (
        <button
          type="button"
          className="yt-thumbnail"
          onClick={playTrailer}
          aria-label={`Play ${title}`}
        >
          <img
            src={`https://img.youtube.com/vi/${videoKey}/hqdefault.jpg`}
            alt=""
          />
          <span className="yt-thumb-overlay" aria-hidden="true">
            <span className="yt-thumb-play-btn">
              <svg viewBox="0 0 68 48">
                <path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="#212121" fillOpacity=".8" />
                <path d="M45 24 27 14v20" fill="#fff" />
              </svg>
            </span>
          </span>
        </button>
      )}

      <div className="video-sleep-control">
        <button
          type="button"
          className="video-sleep-trigger"
          onClick={() => setShowSleepTimer((open) => !open)}
          aria-expanded={showSleepTimer}
        >
          ◷ Sleep{sleepTimerLabel !== 'Off' ? ` · ${sleepTimerLabel}` : ''}
        </button>
        {showSleepTimer && (
          <div className="yt-settings-panel video-sleep-menu">
            <div className="yt-settings-group">
              <span className="yt-settings-label">Sleep timer</span>
              <button
                type="button"
                className={`yt-settings-item ${sleepTimerLabel === 'Off' ? 'yt-settings-item--active' : ''}`}
                onClick={() => setSleepTimer('off')}
              >
                <span>Off</span>
                {sleepTimerLabel === 'Off' && <span aria-hidden="true">✓</span>}
              </button>
              {SLEEP_TIMER_OPTIONS.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  className={`yt-settings-item ${sleepTimerLabel === `${minutes} min` ? 'yt-settings-item--active' : ''}`}
                  onClick={() => setSleepTimer(minutes)}
                >
                  <span>{minutes} minutes</span>
                  {sleepTimerLabel === `${minutes} min` && <span aria-hidden="true">✓</span>}
                </button>
              ))}
              <button
                type="button"
                className={`yt-settings-item ${sleepTimerLabel === 'End of video' ? 'yt-settings-item--active' : ''}`}
                onClick={() => setSleepTimer('end')}
              >
                <span>End of video</span>
                {sleepTimerLabel === 'End of video' && <span aria-hidden="true">✓</span>}
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <p className="yt-player-error" role="alert">{error}</p>}
    </div>
  )
}
