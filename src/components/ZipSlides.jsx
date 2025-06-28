import React from 'react'

function ZipSlides({ slides = [], onClose }) {
  if (!slides || slides.length === 0) return null

  return (
    <div style={{ padding: '1rem' }}>
      <h3>ZIP Slides</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {slides.map((src, idx) => (
          <img key={idx} src={src} alt={`slide ${idx + 1}`} style={{ maxWidth: '100%' }} />
        ))}
      </div>
      {onClose && (
        <button onClick={onClose} style={{ marginTop: '1rem' }}>
          Close
        </button>
      )}
    </div>
  )
}

export default ZipSlides
