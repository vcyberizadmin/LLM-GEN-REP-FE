import React, { useState } from 'react'

function HistoryDropdown({ history, onSelect }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="history-dropdown" style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="menu-history-btn"
        onClick={() => setOpen((o) => !o)}
        style={{ marginLeft: 8 }}
      >
        📋 History
      </button>
      {open && (
        <div className="history-dropdown-list" style={{ position: 'absolute', right: 0, top: '110%', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', borderRadius: 8, minWidth: 220, zIndex: 300 }}>
          {history.length === 0 ? (
            <div style={{ padding: '1rem', color: '#888', textAlign: 'center' }}>No past chats</div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="history-dropdown-item"
                style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                onClick={() => { setOpen(false); onSelect(item.id) }}
              >
                <div style={{ fontWeight: 600 }}>{item.title || 'Untitled Chat'}</div>
                <div style={{ fontSize: '0.9em', color: '#888' }}>{new Date(item.timestamp).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default HistoryDropdown 