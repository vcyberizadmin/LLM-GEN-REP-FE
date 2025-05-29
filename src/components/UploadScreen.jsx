import React, { useRef, useState } from 'react'
import '../styles/UploadScreen.css'

function UploadScreen({ selectedFiles = [], onFileChange, query, onQueryChange, onSubmit, submitting, error, minimalUpload }) {
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef(null)
  const isDarkMode = typeof window !== 'undefined' && document.body.classList.contains('dark-mode')

  const handleRemoveFile = (idx) => {
    const newFiles = selectedFiles.slice()
    newFiles.splice(idx, 1)
    onFileChange(newFiles)
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      const existingNames = selectedFiles.map(f => f.name)
      const merged = [...selectedFiles]
      files.forEach(f => {
        if (!existingNames.includes(f.name)) merged.push(f)
      })
      onFileChange(merged)
  }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }
  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }
  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files)
      const existingNames = selectedFiles.map(f => f.name)
      const merged = [...selectedFiles]
      files.forEach(f => {
        if (!existingNames.includes(f.name)) merged.push(f)
      })
      onFileChange(merged)
    }
  }
  const handleClick = () => {
    inputRef.current.click()
  }
  const handleQueryChange = (e) => {
    onQueryChange(e.target.value)
  }
  const handleFormSubmit = (e) => {
    e.preventDefault()
    onSubmit()
  }

  if (minimalUpload) {
    return (
      <div 
        className="modern-upload-wrapper"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          width: '100%',
          padding: '2rem',
          boxSizing: 'border-box',
          position: 'relative',
          paddingTop: '120px', // Account for fixed menu bar
        }}
      >
        <div 
          className="modern-upload-message" 
          style={{ 
            color: isDarkMode ? '#e6e6e6' : '#232323',
            textAlign: 'center',
            marginBottom: '2rem',
            fontSize: '1.5rem',
            fontWeight: '600'
          }}
        >
          CSV and Report time?
        </div>
        <form onSubmit={handleFormSubmit} className="modern-upload-form">
          <div
            className="modern-upload-row modern-upload-row-redesign"
            style={{
              background: 'none',
              boxShadow: 'none',
              padding: 0,
              minWidth: 0,
              maxWidth: 700,
              width: '100%',
              justifyContent: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div 
              className="modern-query-container"
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '600px',
              }}
            >
            <button
              type="button"
                className="modern-clip-btn redesigned"
              onClick={handleClick}
              aria-label="Attach file"
                tabIndex={0}
                style={{ left: 8, position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: 'none', boxShadow: 'none', border: 'none', padding: 0 }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isDarkMode ? '#bbb' : '#888'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a5 5 0 0 1-7.07-7.07l10.6-10.6a3 3 0 0 1 4.24 4.24l-10.6 10.6a1 1 0 0 1-1.42-1.42l9.19-9.19"/></svg>
            </button>
            <input
              type="file"
              ref={inputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
                multiple
            />
              <textarea
                className="modern-query-textarea redesigned"
              placeholder="How can I help you today?"
              value={query}
              onChange={handleQueryChange}
              disabled={submitting}
                rows={2}
              style={{
                background: isDarkMode ? '#232323' : '#fff',
                color: isDarkMode ? '#f2f2f2' : '#232323',
                border: isDarkMode ? '1.5px solid #444' : '1.5px solid #bbb',
                  borderRadius: '1.5rem',
                  fontSize: '1.15rem',
                  padding: '0.7rem 2.8rem 0.7rem 2.8rem', // left/right padding for icons
                  width: '100%',
                  minWidth: 0,
                  maxWidth: 720,
                  margin: 0,
                  display: 'block',
                  resize: 'vertical',
                  transition: 'border 0.15s, background 0.15s',
                  boxShadow: isDarkMode ? '0 2px 16px 0 rgba(0,0,0,0.18)' : '0 2px 16px 0 rgba(0,0,0,0.08)',
              }}
            />
            <button
              type="submit"
                className="modern-submit-btn redesigned"
                disabled={!selectedFiles.length || !query || submitting}
              aria-label="Submit"
                tabIndex={0}
                style={{ right: 8, position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: '#a36a4f', color: '#fff', border: 'none', boxShadow: 'none', padding: 0 }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 10h10M12 7l3 3-3 3"/></svg>
            </button>
          </div>
          </div>
          {selectedFiles.length > 0 && (
            <div 
              className="selected-files-container" 
              style={{ 
                marginTop: 20, 
                width: '100%', 
                maxWidth: '600px',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="selected-file-label" style={{ display: 'inline-block', position: 'relative', background: isDarkMode ? '#181818' : '#f2f2f2', color: isDarkMode ? '#bbb' : '#232323', borderRadius: 4, padding: '2px 8px', fontSize: 13 }}>
                  {file.name}
                  <button type="button" aria-label="Remove file" style={{ marginLeft: 6, background: 'none', border: 'none', color: '#a36a4f', cursor: 'pointer', fontWeight: 'bold', fontSize: 15, position: 'relative', top: 1 }} onClick={e => { e.stopPropagation(); handleRemoveFile(idx) }}>×</button>
                </div>
              ))}
            </div>
          )}
          {error && (
            <div 
              className="error-message"
              style={{
                marginTop: '1rem',
                textAlign: 'center',
                maxWidth: '600px'
              }}
            >
              {error}
            </div>
          )}
        </form>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: '80px' }}>
      <div
        className={`file-upload-area${dragActive ? ' active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        style={{ cursor: 'pointer', background: isDarkMode ? '#232323' : '#fff', color: isDarkMode ? '#f2f2f2' : '#222' }}
      >
        <input
          type="file"
          ref={inputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          multiple
        />
        {selectedFiles.length > 0 ? (
          <div className="selected-files-container" style={{ marginTop: 10, width: '100%' }}>
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="selected-file-label" style={{ display: 'inline-block', marginRight: 8, position: 'relative', background: isDarkMode ? '#181818' : '#f2f2f2', color: isDarkMode ? '#bbb' : '#232323', borderRadius: 4, padding: '2px 8px', fontSize: 13 }}>
                {file.name}
                <button type="button" aria-label="Remove file" style={{ marginLeft: 6, background: 'none', border: 'none', color: '#a36a4f', cursor: 'pointer', fontWeight: 'bold', fontSize: 15, position: 'relative', top: 1 }} onClick={e => { e.stopPropagation(); handleRemoveFile(idx) }}>×</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="file-upload-placeholder">
            Drag & drop file(s) here, or <span className="upload-link">browse</span>
          </div>
        )}
      </div>
      <form onSubmit={handleFormSubmit}>
        <textarea
          className="query-box custom-element"
          placeholder="Enter your query here..."
          value={query}
          onChange={handleQueryChange}
          rows={4}
          style={{ marginBottom: '1rem', background: isDarkMode ? '#232323' : '#fff', color: isDarkMode ? '#f2f2f2' : '#111', border: isDarkMode ? '1px solid #444' : '1px solid #bbb' }}
        />
        <button
          type="submit"
          className="submit-btn custom-element"
          disabled={!selectedFiles.length || !query || submitting}
          style={{ background: isDarkMode ? '#232323' : '#fff', color: isDarkMode ? '#f2f2f2' : '#111', border: isDarkMode ? '1px solid #444' : '1px solid #bbb' }}
        >
          {submitting ? 'Submitting...' : 'Submit Query'}
        </button>
      </form>
      {error && <div className="error-message">{error}</div>}
    </div>
  )
}

export default UploadScreen 