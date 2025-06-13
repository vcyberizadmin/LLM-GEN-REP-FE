import React, { useState, useEffect } from 'react'
import ExportButton from './ExportButton'

const SessionHistory = ({ isDarkMode = false, onClose, onSessionSelect }) => {
  const [sessions, setSessions] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const [sessionData, setSessionData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    setLoading(true)
    try {
      const response = await fetch('https://llm-gen-rep-be.vercel.app/sessions')
      if (!response.ok) throw new Error('Failed to fetch sessions')
      
      const data = await response.json()
      setSessions(data.sessions || [])
    } catch (err) {
      setError('Failed to load sessions')
      console.error('Error fetching sessions:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSessionData = async (sessionId) => {
    setLoading(true)
    try {
      const response = await fetch(`https://llm-gen-rep-be.vercel.app/session/${sessionId}`)
      if (!response.ok) throw new Error('Failed to fetch session data')
      
      const data = await response.json()
      setSessionData(data)
      setSelectedSession(sessionId)
    } catch (err) {
      setError('Failed to load session data')
      console.error('Error fetching session data:', err)
    } finally {
      setLoading(false)
    }
  }

  const exportSessionDashboard = async (sessionId) => {
    try {
      const response = await fetch(`https://llm-gen-rep-be.vercel.app/export/session/${sessionId}/dashboard`, {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('Failed to export dashboard')
      
      const data = await response.json()
      
      if (data.success && data.image) {
        // Create download link
        const link = document.createElement('a')
        link.href = data.image
        link.download = `dashboard-${sessionId.slice(0, 8)}-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (err) {
      console.error('Error exporting dashboard:', err)
      alert('Failed to export dashboard')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const renderVisualization = (viz) => {
    const chartData = viz.chart_data
    if (!chartData || !chartData.datasets) return null

    return (
      <div 
        key={viz.id}
        style={{
          background: isDarkMode ? '#2a2a2a' : '#f9f9f9',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1rem',
          border: isDarkMode ? '1px solid #444' : '1px solid #ddd'
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '0.5rem'
        }}>
          <div>
            <h4 style={{ 
              margin: '0 0 0.25rem 0',
              color: isDarkMode ? '#f2f2f2' : '#111',
              fontSize: '1rem'
            }}>
              {viz.chart_type.charAt(0).toUpperCase() + viz.chart_type.slice(1)} Chart
            </h4>
            <p style={{ 
              margin: '0 0 0.5rem 0',
              color: isDarkMode ? '#ccc' : '#666',
              fontSize: '0.9rem',
              fontStyle: 'italic'
            }}>
              "{viz.query}"
            </p>
            <p style={{ 
              margin: 0,
              color: isDarkMode ? '#999' : '#888',
              fontSize: '0.8rem'
            }}>
              Created: {formatDate(viz.created_at)}
            </p>
          </div>
          <ExportButton 
            chartData={chartData}
            title={`${viz.chart_type}: ${viz.query}`}
            isDarkMode={isDarkMode}
            onExport={(result) => {
              if (result.success) {
                console.log('Visualization exported:', result)
              }
            }}
          />
        </div>
        
        {/* Chart preview */}
        <div style={{
          background: isDarkMode ? '#1a1a1a' : '#fff',
          borderRadius: '0.25rem',
          padding: '0.5rem',
          border: isDarkMode ? '1px solid #333' : '1px solid #eee'
        }}>
          <div style={{ fontSize: '0.8rem', color: isDarkMode ? '#ccc' : '#666' }}>
            Chart Type: {chartData.type} | 
            Data Points: {chartData.datasets?.[0]?.data?.length || 0} |
            Labels: {chartData.labels?.length || 0}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: isDarkMode ? '#1a1a1a' : '#fff',
        borderRadius: '1rem',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: isDarkMode ? '1px solid #333' : '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            margin: 0,
            color: isDarkMode ? '#f2f2f2' : '#111',
            fontSize: '1.5rem'
          }}>
            Visualization History
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: isDarkMode ? '#ccc' : '#666',
              padding: '0.25rem'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '1.5rem'
        }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ color: isDarkMode ? '#ccc' : '#666' }}>Loading...</div>
            </div>
          )}

          {error && (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem',
              color: '#e74c3c'
            }}>
              {error}
            </div>
          )}

          {!loading && !error && !selectedSession && (
            <div>
              <h3 style={{
                color: isDarkMode ? '#f2f2f2' : '#111',
                marginBottom: '1rem'
              }}>
                Recent Sessions
              </h3>
              
              {sessions.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: isDarkMode ? '#ccc' : '#666'
                }}>
                  No sessions found. Create some visualizations to see them here!
                </div>
              ) : (
                sessions.map(session => (
                  <div
                    key={session.id}
                    style={{
                      background: isDarkMode ? '#2a2a2a' : '#f9f9f9',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      marginBottom: '1rem',
                      border: isDarkMode ? '1px solid #444' : '1px solid #ddd',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => fetchSessionData(session.id)}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)'
                      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)'
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{
                          color: isDarkMode ? '#f2f2f2' : '#111',
                          fontWeight: 600,
                          marginBottom: '0.25rem'
                        }}>
                          Session {session.id.slice(0, 8)}...
                        </div>
                        <div style={{
                          color: isDarkMode ? '#ccc' : '#666',
                          fontSize: '0.9rem'
                        }}>
                          Created: {formatDate(session.created_at)}
                        </div>
                        {session.dataset_info && (
                          <div style={{
                            color: isDarkMode ? '#999' : '#888',
                            fontSize: '0.8rem',
                            marginTop: '0.25rem'
                          }}>
                            {session.dataset_info.total_rows} rows, {session.dataset_info.total_columns} columns
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (onSessionSelect) {
                              onSessionSelect(session.id)
                              onClose()
                            }
                          }}
                          style={{
                            background: isDarkMode ? '#2a4d2a' : '#e8f5e8',
                            color: isDarkMode ? '#90ee90' : '#2e7d32',
                            border: 'none',
                            borderRadius: '0.25rem',
                            padding: '0.5rem',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            fontWeight: 500
                          }}
                        >
                          🔄 Resume
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            exportSessionDashboard(session.id)
                          }}
                          style={{
                            background: isDarkMode ? '#2a3b4d' : '#e3f2fd',
                            color: isDarkMode ? '#a6e1fa' : '#1a237e',
                            border: 'none',
                            borderRadius: '0.25rem',
                            padding: '0.5rem',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >
                          📊 Export
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {!loading && !error && selectedSession && sessionData && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <button
                  onClick={() => {
                    setSelectedSession(null)
                    setSessionData(null)
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: isDarkMode ? '#a6e1fa' : '#1a237e',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    marginRight: '1rem'
                  }}
                >
                  ← Back to Sessions
                </button>
                <h3 style={{
                  color: isDarkMode ? '#f2f2f2' : '#111',
                  margin: 0
                }}>
                  Session {selectedSession.slice(0, 8)}... Visualizations
                </h3>
              </div>

              {sessionData.visualizations?.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: isDarkMode ? '#ccc' : '#666'
                }}>
                  No visualizations in this session.
                </div>
              ) : (
                sessionData.visualizations?.map(renderVisualization)
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SessionHistory 