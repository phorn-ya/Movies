import { useState, useRef, useEffect, useCallback } from 'react'

/**
 * VideoPlayer — YouTube-style embedded player with full custom controls.
 *
 * Controls: progress bar, play/pause, volume, time, CC, settings, fullscreen
 */
export default function VideoPlayer({ videoKey, title = 'Trailer', size = 'hero', autoPlay = false }) {
  const [playing, setPlaying] = useState(autoPlay)
  const [started, setStarted] = useState(autoPlay)
  const [ccOn, setCcOn] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [volume, setVolume] = useState(80)
  const [muted, setMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [hovering, setHovering] = useState(false)
  const [hideTimer, setHideTimer] = useState(null)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [progressHover, setProgressHover] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const playerRef = useRef(null)
  const iframeRef = useRef(null)
  const progressRef = useRef(null)
  const timerRef = useRef(null)
  const ytPlayerRef = useRef(null)

  const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]

  // Load YouTube IFrame API
  useEffect(() => {
    if (!videoKey) return
    if (window.YT && window.YT.Player) {
      initPlayer()
      return
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScript = document.getElementsByTagName('script')[0]
    firstScript.parentNode.insertBefore(tag, firstScript)
    window.onYouTubeIframeAPIReady = () => initPlayer()
  }, [videoKey])

  function initPlayer() {
    const playerDiv = document.createElement('div')
    playerDiv.id = `yt-player-${videoKey}`
    playerDiv.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;'
    
    const container = iframeRef.current
    if (!container) return
    
    // Remove existing child divs
    const existing = container.querySelector('[id^="yt-player-"]')
    if (existing) existing.remove()
    container.appendChild(playerDiv)

    const ytPlayer = new window.YT.Player(playerDiv.id, {
      videoId: videoKey,
      playerVars: {
        autoplay: autoPlay ? 1 : 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        cc_load_policy: ccOn ? 1 : 0,
        cc_lang_pref: 'en',
        playsinline: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: (e) => {
          ytPlayerRef.current = e.target
          e.target.setVolume(volume)
          if (autoPlay) {
            setPlaying(true)
            setStarted(true)
          }
        },
        onStateChange: (e) => {
          const state = e.data
          if (state === window.YT.PlayerState.PLAYING) {
            setPlaying(true)
            setStarted(true)
            startTimeUpdate()
          } else if (state === window.YT.PlayerState.PAUSED) {
            setPlaying(false)
            stopTimeUpdate()
          } else if (state === window.YT.PlayerState.ENDED) {
            setPlaying(false)
            stopTimeUpdate()
          }
        },
      },
    })
  }

  function startTimeUpdate() {
    stopTimeUpdate()
    timerRef.current = setInterval(() => {
      const p = ytPlayerRef.current
      if (!p) return
      try {
        setCurrentTime(p.getCurrentTime())
        setDuration(p.getDuration())
        // buffered: approximate from loaded fraction
        const loaded = p.getVideoLoadedFraction?.() ?? 0
        setBuffered(loaded * p.getDuration())
      } catch {}
    }, 250)
  }

  function stopTimeUpdate() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => {
    return () => stopTimeUpdate()
  }, [])

  // Auto-hide controls after 3s of inactivity
  const resetHideTimer = useCallback(() => {
    if (hideTimer) clearTimeout(hideTimer)
    if (playing) {
      const t = setTimeout(() => setHovering(false), 3000)
      setHideTimer(t)
    }
  }, [playing, hideTimer])

  useEffect(() => {
    if (playing && hovering) resetHideTimer()
    return () => { if (hideTimer) clearTimeout(hideTimer) }
  }, [playing])

  // Control actions
  function togglePlay() {
    const p = ytPlayerRef.current
    if (!p) return
    if (playing) { p.pauseVideo(); setPlaying(false) }
    else { p.playVideo(); setPlaying(true) }
  }

  function handleSeek(e) {
    const bar = progressRef.current
    if (!bar || !ytPlayerRef.current) return
    const rect = bar.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const time = pct * (duration || 0)
    ytPlayerRef.current.seekTo(time, true)
    setCurrentTime(time)
  }

  function handleProgressHover(e) {
    const bar = progressRef.current
    if (!bar) return
    const rect = bar.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setProgressHover({ pct, time: pct * (duration || 0), x: e.clientX - rect.left })
  }

  function handleVolumeChange(e) {
    const val = parseInt(e.target.value)
    setVolume(val)
    setMuted(val === 0)
    ytPlayerRef.current?.setVolume(val)
    if (val > 0) ytPlayerRef.current?.unMute()
  }

  function toggleMute() {
    const p = ytPlayerRef.current
    if (!p) return
    if (muted) { p.unMute(); setMuted(false); setVolume(volume || 80) }
    else { p.mute(); setMuted(true) }
  }

  function changeSpeed(s) {
    setSpeed(s)
    ytPlayerRef.current?.setPlaybackRate(s)
    setShowSettings(false)
  }

  function toggleCc() {
    const next = !ccOn
    setCcOn(next)
    ytPlayerRef.current?.setOption('captions', 'track', next ? { languageCode: 'en' } : '')
  }

  function toggleFullscreen() {
    const el = playerRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().then(() => setIsFullscreen(true))
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false))
    }
  }

  function formatTime(s) {
    if (!s || !isFinite(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  if (!videoKey) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const bufferProgress = duration > 0 ? (buffered / duration) * 100 : 0

  const thumbUrl = `https://img.youtube.com/vi/${videoKey}/hqdefault.jpg`

  return (
    <div
      ref={playerRef}
      className={`yt-player-container ${size === 'full' ? 'yt-player--full' : ''}`}
      onMouseEnter={() => { setHovering(true); resetHideTimer() }}
      onMouseMove={() => { setHovering(true); resetHideTimer() }}
      onMouseLeave={() => { setHovering(false); setProgressHover(null); setShowSettings(false); setShowVolumeSlider(false) }}
    >
      {/* YouTube iframe (hidden, real player) */}
      <div ref={iframeRef} className="yt-iframe-wrap" />

      {/* Thumbnail before play */}
      {!started && (
        <div className="yt-thumbnail" onClick={togglePlay}>
          <img src={thumbUrl} alt={title} />
          <div className="yt-thumb-overlay">
            <div className="yt-thumb-play-btn">
              <svg viewBox="0 0 68 48"><path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#212121" fillOpacity="0.8"/><path d="M 45,24 27,14 27,34" fill="#fff"/></svg>
            </div>
          </div>
        </div>
      )}

      {/* Center play/pause button (when playing) */}
      {started && (
        <div className="yt-center-controls" onClick={togglePlay}>
          <div className={`yt-center-btn ${playing ? 'yt-center-btn--hidden' : ''}`}>
            <svg viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      )}

      {/* Bottom control bar */}
      {started && (
        <div className={`yt-controls ${hovering ? 'yt-controls--visible' : ''}`}>
          {/* Progress bar */}
          <div className="yt-progress-bar" ref={progressRef} onClick={handleSeek} onMouseMove={handleProgressHover} onMouseLeave={() => setProgressHover(null)}>
            <div className="yt-progress-buffered" style={{ width: `${bufferProgress}%` }} />
            <div className="yt-progress-played" style={{ width: `${progress}%` }}>
              <div className="yt-progress-handle" />
            </div>
            {progressHover && (
              <div className="yt-progress-tooltip" style={{ left: progressHover.x }}>
                <span>{formatTime(progressHover.time)}</span>
              </div>
            )}
          </div>

          <div className="yt-controls-row">
            <div className="yt-controls-left">
              {/* Play / Pause */}
              <button className="yt-btn" onClick={togglePlay} title={playing ? 'Pause' : 'Play'}>
                {playing ? (
                  <svg viewBox="0 0 24 24" fill="white"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>

              {/* Volume */}
              <div className="yt-volume-group" onMouseEnter={() => setShowVolumeSlider(true)} onMouseLeave={() => setShowVolumeSlider(false)}>
                <button className="yt-btn" onClick={toggleMute} title={muted ? 'Unmute' : 'Mute'}>
                  {muted || volume === 0 ? (
                    <svg viewBox="0 0 24 24" fill="white"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                  ) : volume < 50 ? (
                    <svg viewBox="0 0 24 24" fill="white"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="white"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                  )}
                </button>
                {showVolumeSlider && (
                  <div className="yt-volume-slider">
                    <input type="range" min="0" max="100" value={muted ? 0 : volume} onChange={handleVolumeChange} className="yt-volume-input" />
                  </div>
                )}
              </div>

              {/* Time */}
              <span className="yt-time">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>

            <div className="yt-controls-right">
              {/* CC */}
              <button className={`yt-btn ${ccOn ? 'yt-btn--active' : ''}`} onClick={toggleCc} title="Subtitles/closed captions">
                <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
                  <rect x="1" y="4" width="22" height="16" rx="2" fill="none" stroke="white" strokeWidth="1.5"/>
                  <text x="12" y="15.5" textAnchor="middle" fontSize="8.5" fill="white" fontWeight="700" stroke="none">CC</text>
                </svg>
              </button>

              {/* Settings */}
              <div className="yt-settings-wrap">
                <button className="yt-btn" onClick={() => setShowSettings(!showSettings)} title="Settings">
                  <svg viewBox="0 0 24 24" fill="white"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>
                </button>
                {showSettings && (
                  <div className="yt-settings-panel">
                    <div className="yt-settings-group">
                      <span className="yt-settings-label">Playback speed</span>
                      {speeds.map((s) => (
                        <button key={s} className={`yt-settings-item ${speed === s ? 'yt-settings-item--active' : ''}`} onClick={() => changeSpeed(s)}>
                          {s === 1 ? 'Normal' : `${s}×`}
                          {speed === s && <svg viewBox="0 0 24 24" fill="var(--accent)" width="16" height="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button className="yt-btn" onClick={toggleFullscreen} title="Fullscreen">
                {isFullscreen ? (
                  <svg viewBox="0 0 24 24" fill="white"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="white"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
