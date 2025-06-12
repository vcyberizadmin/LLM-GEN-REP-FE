import './styles/App.css'
import UploadScreen from './components/UploadScreen.jsx'
import ChatScreen from './components/ChatScreen.jsx'
import SessionHistory from './components/SessionHistory.jsx'
import { useState, useEffect } from 'react'
import HistoryDropdown from './components/HistoryDropdown.jsx'
import { useNavigate } from 'react-router-dom'

function App() {
  const navigate = useNavigate()
  const [selectedFiles, setSelectedFiles] = useState([])
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [responseVisible, setResponseVisible] = useState(false)
  const [history, setHistory] = useState([])
  const [chatHistory, setChatHistory] = useState([])
  const [csvColumns, setCsvColumns] = useState([])
  const [showSessionHistory, setShowSessionHistory] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [sessionRestored, setSessionRestored] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  // Set consistent white background theme
  useEffect(() => {
    document.body.classList.remove('dark-mode')
    document.body.classList.add('light-mode')
    document.body.style.backgroundColor = '#ffffff'
    document.body.style.color = '#000000'
  }, [])

  // Load session from localStorage on app start
  useEffect(() => {
    const loadPersistedSession = async () => {
      const storedSessionId = localStorage.getItem('currentSessionId')
      if (storedSessionId) {
        try {
          const response = await fetch(`https://llm-gen-rep-be.vercel.app/session/${storedSessionId}`)
          if (response.ok) {
            const sessionData = await response.json()
            setSessionId(storedSessionId)
            
            // Load chat history from backend
            if (sessionData.chatHistory && sessionData.chatHistory.length > 0) {
              setChatHistory(sessionData.chatHistory)
              
              // Set the latest response if available
              const latestChat = sessionData.chatHistory[sessionData.chatHistory.length - 1]
              if (latestChat) {
                setResponse(latestChat.response)
                setQuery(latestChat.query)
                setSubmitted(true)
                setResponseVisible(true)
                
                // Load chart data from latest visualization if available
                const latestViz = sessionData.visualizations && sessionData.visualizations.length > 0 
                  ? sessionData.visualizations[sessionData.visualizations.length - 1] 
                  : null
                if (latestViz) {
                  setChartData(latestViz.chart_data)
                }
              }
            }
            
            // Load dataset info for CSV columns
            if (sessionData.session && sessionData.session.dataset_info) {
              setCsvColumns(sessionData.session.dataset_info.columns || [])
              
              // Create file placeholders from session metadata
              if (sessionData.session.dataset_info.file_names) {
                const fileNames = sessionData.session.dataset_info.file_names
                const filePlaceholders = fileNames.map(name => ({
                  name: name,
                  size: 0, // We don't have the original size
                  type: name.endsWith('.csv') ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                  lastModified: Date.now(),
                  isFromSession: true // Flag to indicate this is from a restored session
                }))
                setSelectedFiles(filePlaceholders)
              }
            }
            
            console.log('Loaded persisted session:', storedSessionId)
            setSessionRestored(true)
            
            // Clear the notification after 5 seconds
            setTimeout(() => setSessionRestored(false), 5000)
          } else {
            // Session not found, clear localStorage
            localStorage.removeItem('currentSessionId')
          }
        } catch (error) {
          console.error('Failed to load persisted session:', error)
          localStorage.removeItem('currentSessionId')
        }
      }
      
      // Load localStorage history as fallback (for backward compatibility)
      const stored = localStorage.getItem('chatHistory')
      if (stored) setHistory(JSON.parse(stored))
    }
    
    loadPersistedSession()
  }, [])

  // Save session ID to localStorage when it changes
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('currentSessionId', sessionId)
    }
  }, [sessionId])

  // Keep localStorage history for backward compatibility
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(history))
  }, [history])

  const handleUpload = (files) => setSelectedFiles(files)
  const handleQueryChange = (q) => setQuery(q)
  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    setResponseVisible(false)
    setResponse(null)
    setChartData(null)
    setSubmitted(false)
    try {
      const formData = new FormData()
      formData.append('query', query)
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          formData.append('files', file)
        })
      }
      formData.append('chat_history', JSON.stringify(chatHistory))
      const res = await fetch('https://llm-gen-rep-be.vercel.app/analyze', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Server error')
      }
      const data = await res.json()
      setResponse(data.response)
      setChartData(data.chartData || null)
      setSubmitted(true)
      setResponseVisible(true)
      setChatHistory(data.chatHistory || [])
      // Use columns directly from backend response
      if (data.csvColumns && data.csvColumns.length > 0) {
        setCsvColumns(data.csvColumns)
      }
      
      // Update session ID if returned
      if (data.sessionId) {
        setSessionId(data.sessionId)
      }
      
      const newId = Date.now().toString()
      setHistory(prev => [
        { id: newId, title: query.slice(0, 40) || 'Untitled', timestamp: Date.now(), query, response: data.response, chartData: data.chartData || null },
        ...prev
      ])
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleBack = () => {
    setSubmitted(false)
    setResponseVisible(false)
    setResponse(null)
    setChartData(null)
    setSelectedFiles([])
    setQuery('')
    setError(null)
    setChatHistory([])
  }

  const handleNewChat = () => {
    setSubmitted(false)
    setResponseVisible(false)
    setResponse(null)
    setChartData(null)
    setSelectedFiles([])
    setQuery('')
    setError(null)
    setChatHistory([])
    setSessionId(null)
    setCsvColumns([])
    
    // Clear persisted session
    localStorage.removeItem('currentSessionId')
    console.log('Started new chat session')
  }

  const handleFollowup = async (followupQuery, additionalFiles = []) => {
    setSubmitting(true)
    setError(null)
    setResponseVisible(false)
    setResponse(null)
    setChartData(null)
    try {
      const formData = new FormData()
      formData.append('query', followupQuery)
      
      // Add existing files
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          formData.append('files', file)
        })
      }
      
      // Add additional files
      if (additionalFiles.length > 0) {
        additionalFiles.forEach((file) => {
          formData.append('files', file)
        })
      }
      
      // If no files at all, add an empty file field to satisfy FastAPI
      if (selectedFiles.length === 0 && additionalFiles.length === 0) {
        // Create an empty blob to satisfy the files field requirement
        const emptyFile = new File([''], '', { type: 'text/plain' })
        formData.append('files', emptyFile)
      }
      
      formData.append('chat_history', JSON.stringify(chatHistory))
      
      // Include session ID if available
      if (sessionId) {
        formData.append('session_id', sessionId)
      }
      
      const res = await fetch('https://llm-gen-rep-be.vercel.app/analyze', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Server error')
      }
      const data = await res.json()
      setResponse(data.response)
      setChartData(data.chartData || null)
      setSubmitted(true)
      setResponseVisible(true)
      setChatHistory(data.chatHistory || [])
      
      // Update session ID if returned
      if (data.sessionId) {
        setSessionId(data.sessionId)
      }
      
      // Use columns directly from backend response for followup queries too
      if (data.csvColumns && data.csvColumns.length > 0) {
        setCsvColumns(data.csvColumns)
      }
      
      // Update selected files to include additional files
      if (additionalFiles.length > 0) {
        setSelectedFiles(prev => [...prev, ...additionalFiles])
      }
      
      const newId = Date.now().toString()
      setHistory(prev => [
        { id: newId, title: followupQuery.slice(0, 40) || 'Untitled', timestamp: Date.now(), query: followupQuery, response: data.response, chartData: data.chartData || null },
        ...prev
      ])
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleHistorySelect = async (id) => {
    // First try to find in localStorage history (backward compatibility)
    const item = history.find(h => h.id === id)
    if (item) {
      setResponse(item.response)
      setChartData(item.chartData)
      setSubmitted(true)
      setResponseVisible(true)
      setQuery(item.query)
      setChatHistory([])
      return
    }
    
    // If not found in localStorage, try to load as session ID from backend
    try {
      const response = await fetch(`https://llm-gen-rep-be.vercel.app/session/${id}`)
      if (response.ok) {
        const sessionData = await response.json()
        setSessionId(id)
        
        // Load complete session data
        if (sessionData.chatHistory && sessionData.chatHistory.length > 0) {
          setChatHistory(sessionData.chatHistory)
          
          // Set the latest response
          const latestChat = sessionData.chatHistory[sessionData.chatHistory.length - 1]
          if (latestChat) {
            setResponse(latestChat.response)
            setQuery(latestChat.query)
            setSubmitted(true)
            setResponseVisible(true)
            
            // Load chart data from latest visualization if available
            const latestViz = sessionData.visualizations && sessionData.visualizations.length > 0 
              ? sessionData.visualizations[sessionData.visualizations.length - 1] 
              : null
            if (latestViz) {
              setChartData(latestViz.chart_data)
            }
          }
        }
        
        // Load dataset info for CSV columns and file information
        if (sessionData.session && sessionData.session.dataset_info) {
          setCsvColumns(sessionData.session.dataset_info.columns || [])
          
          // Create file placeholders from session metadata
          if (sessionData.session.dataset_info.file_names) {
            const fileNames = sessionData.session.dataset_info.file_names
            const filePlaceholders = fileNames.map(name => ({
              name: name,
              size: 0, // We don't have the original size
              type: name.endsWith('.csv') ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              lastModified: Date.now(),
              isFromSession: true // Flag to indicate this is from a restored session
            }))
            setSelectedFiles(filePlaceholders)
          }
        }
        
        console.log('Loaded session from history:', id)
        setSessionRestored(true)
        
        // Clear the notification after 5 seconds
        setTimeout(() => setSessionRestored(false), 5000)
      }
    } catch (error) {
      console.error('Failed to load session from history:', error)
    }
  }

  // Logout function
  const handleLogout = () => {
    // Clear all app state
    setSelectedFiles([])
    setQuery('')
    setResponse(null)
    setChartData(null)
    setSubmitted(false)
    setError(null)
    setSubmitting(false)
    setResponseVisible(false)
    setHistory([])
    setChatHistory([])
    setCsvColumns([])
    setSessionId(null)
    setSessionRestored(false)
    
    // Clear localStorage - this is the key part for proper logout
    localStorage.removeItem('currentSessionId')
    localStorage.removeItem('chatHistory')
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('loginTime')
    localStorage.removeItem('loginAttempts')
    localStorage.removeItem('lockoutTime')
    
    // Dispatch custom logout event to notify PasswordProtect component
    window.dispatchEvent(new Event('logout'))
    
    // Navigate to login page
    navigate('/login', { replace: true })
  }

  return (
    <>
      {/* Fixed Menu Bar */}
      <div className="menu-bar">
        <div className="menu-left-section">
          {/* Logout Button */}
          <button 
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
        
        <div className="menu-center-section">
          {/* VCB Logo */}
          <img 
            src="/vcyberiz-logo.png" 
            alt="vCyberiz Logo" 
            className="vcb-logo"
          />
        </div>
        
        <div className="menu-bar-actions">
          <div className="history-dropdown">
            <button 
              className="menu-history-btn"
              onClick={() => setShowHistory(!showHistory)}
            >
              History
            </button>
            {showHistory && (
              <div className="history-dropdown-list">
                {history.map((item) => (
                  <div 
                    key={item.id} 
                    className="history-dropdown-item"
                    onClick={() => handleHistorySelect(item.id)}
                  >
                    <div className="history-item-content">
                      <span className="history-item-text">{item.query}</span>
                      <span className="history-item-time">
                        {new Date(item.timestamp).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button 
            className="menu-new-chat-btn"
            onClick={handleNewChat}
          >
            + New
          </button>
        </div>
      </div>

      {/* Session Restored Notification */}
      {sessionRestored && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          background: document.body.classList.contains('dark-mode') ? '#2a4d2a' : '#e8f5e8',
          color: document.body.classList.contains('dark-mode') ? '#90ee90' : '#2e7d32',
          padding: '1rem 1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 500,
          animation: 'slideInRight 0.3s ease-out'
        }}>
          <span>🔄</span>
          Session restored successfully!
          <button
            onClick={() => setSessionRestored(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              marginLeft: '0.5rem',
              fontSize: '1.2rem'
            }}
          >
            ✕
          </button>
        </div>
      )}
      
      {!submitted && (
        <div className="main-content">
          <div className="content-left">
            <div className="content-section">
              <h2 className="section-title">CSV and Report time</h2>
              <div className="search-wrapper">
                <input
                  type="text"
                  className="search-input"
                  placeholder="How can I help you"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                />
                <button className="attachment-button">
                  📎
                </button>
                <button 
                  className="search-submit"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  →
                </button>
              </div>
            </div>
          </div>
          <div className="content-right">
            <img src="/rad-image.png" alt="Workflow Diagram" className="workflow-image" />
          </div>
        </div>
      )}
      
      {submitted && (
        <ChatScreen
          submitted={submitted}
          response={response}
          chartData={chartData}
          responseVisible={responseVisible}
          setResponseVisible={setResponseVisible}
          onBack={handleBack}
          onFollowup={handleFollowup}
          chatHistory={chatHistory}
          loading={submitting}
          csvColumns={csvColumns}
          currentFiles={selectedFiles}
          sessionId={sessionId}
        />
      )}
      
      {/* Session History Modal */}
      {showSessionHistory && (
        <SessionHistory 
          isDarkMode={document.body.classList.contains('dark-mode')}
          onClose={() => setShowSessionHistory(false)}
          onSessionSelect={handleHistorySelect}
        />
      )}
    </>
  )
}

export default App
