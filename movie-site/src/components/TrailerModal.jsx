import { useEffect, useRef } from 'react'
import VideoPlayer from './VideoPlayer.jsx'

export default function TrailerModal({ videoKey, title, onClose }) {
  const dialogRef = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const dialog = dialogRef.current
    const previousOverflow = document.body.style.overflow
    const handleCancel = (event) => {
      event.preventDefault()
      onCloseRef.current()
    }

    dialog.addEventListener('cancel', handleCancel)
    dialog.showModal()
    document.body.style.overflow = 'hidden'

    return () => {
      dialog.removeEventListener('cancel', handleCancel)
      if (dialog.open) dialog.close()
      document.body.style.overflow = previousOverflow
    }
  }, [])

  function handleBackdropClick(event) {
    if (event.target === dialogRef.current) onCloseRef.current()
  }

  return (
    <dialog
      ref={dialogRef}
      className="trailer-modal"
      aria-labelledby="trailer-modal-title"
      onClick={handleBackdropClick}
    >
      <div className="trailer-modal__surface">
        <header className="trailer-modal__header">
          <div className="trailer-modal__heading">
            <span>Now showing</span>
            <h2 id="trailer-modal-title">{title}</h2>
          </div>
          <button
            type="button"
            className="trailer-modal__close"
            onClick={() => onCloseRef.current()}
            aria-label="Close trailer"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>
        <VideoPlayer
          videoKey={videoKey}
          title={title}
          size="hero"
          autoPlay
        />
      </div>
    </dialog>
  )
}
