import React, { useState, memo, useMemo, useRef, useEffect } from 'react'
import '../styles/ChatScreen.css'
import { Bar, Pie, Line, Doughnut, Scatter } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { marked } from 'marked'
import '../styles/App.css'
import ExportButton from './ExportButton'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler)

// Configure marked to use smaller headings
marked.setOptions({
  renderer: new marked.Renderer(),
  breaks: true,
  gfm: true
})

// Custom renderer to make headings smaller
const renderer = new marked.Renderer()
renderer.heading = function(text, level) {
  const sizes = {
    1: '1.4rem',
    2: '1.2rem', 
    3: '1.1rem',
    4: '1.05rem',
    5: '1rem',
    6: '0.95rem'
  }
  const size = sizes[level] || '1rem'
  return `<h${level} style="font-size: ${size}; margin: 0.8rem 0 0.4rem 0; font-weight: 600; line-height: 1.3;">${text}</h${level}>`
}

marked.setOptions({ renderer })

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'Chart' },
  },
  scales: {
    x: { ticks: { color: '#111' } },
    y: { ticks: { color: '#111' } },
  },
}

// Simple loading animation component
function LoadingDots() {
  return (
    <div style={{ margin: '1.5rem 0', textAlign: 'center', color: '#888', fontSize: '1.2rem' }}>
      <span className="loading-dots">Thinking<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span></span>
      <style>{`
        .loading-dots .dot {
          animation: blink 1.4s infinite both;
        }
        .loading-dots .dot:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink {
          0%, 80%, 100% { opacity: 0.2; }
          40% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function ChatScreen({ submitted, response, chartData, responseVisible, setResponseVisible, onBack, onFollowup, onNewChat, chatHistory = [], loading, csvColumns = [], currentFiles = [], sessionId = null }) {
  
  const [followup, setFollowup] = useState('')
  const [additionalFiles, setAdditionalFiles] = useState([])
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const isDarkMode = typeof window !== 'undefined' && document.body.classList.contains('dark-mode')

  // Refs for scroll management
  const scrollAnchorRef = React.useRef(null)
  const contentAreaRef = React.useRef(null)

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (scrollAnchorRef.current && !loading) {
      scrollAnchorRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatHistory.length, response, loading])

  // Handle scroll events to show/hide scroll-to-bottom button
  React.useEffect(() => {
    const handleScroll = () => {
      if (contentAreaRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentAreaRef.current
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
        setShowScrollToBottom(!isNearBottom && chatHistory.length > 0)
      }
    }

    const contentArea = contentAreaRef.current
    if (contentArea) {
      contentArea.addEventListener('scroll', handleScroll)
      return () => contentArea.removeEventListener('scroll', handleScroll)
    }
  }, [chatHistory.length])

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (scrollAnchorRef.current) {
      scrollAnchorRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Handle additional file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setAdditionalFiles(files)
  }

  // Remove a file from additional files
  const removeFile = (index) => {
    setAdditionalFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Memoized prompt suggestions based on csvColumns
  const promptSuggestions = useMemo(() => {
    if (!csvColumns || csvColumns.length === 0) {
      return [
        'Show me a summary of the data',
        'What patterns can you identify?',
        'Create a visualization of the key metrics',
        'What insights can you extract?',
      ]
    }
    
    const suggestions = []
    
    // Helper function to find columns by keywords
    const findColumn = (keywords) => {
      return csvColumns.find(col => 
        keywords.some(keyword => 
          col.toLowerCase().includes(keyword.toLowerCase())
        )
      )
    }
    
    // Smart suggestions based on common column patterns
    const timeCol = findColumn(['time', 'date', 'timestamp', 'created', 'modified', 'hour', 'day', 'month', 'year'])
    const statusCol = findColumn(['status', 'state', 'condition', 'result', 'outcome', 'compliance'])
    const categoryCol = findColumn(['category', 'type', 'kind', 'class', 'group', 'department'])
    const userCol = findColumn(['user', 'person', 'employee', 'name', 'account', 'owner'])
    const deviceCol = findColumn(['device', 'computer', 'machine', 'host', 'system'])
    const countCol = findColumn(['count', 'number', 'total', 'amount', 'quantity'])
    
    // Generate contextual suggestions
    if (timeCol && statusCol) {
      suggestions.push(`Show ${statusCol} trends over ${timeCol}`)
    }
    if (categoryCol) {
      suggestions.push(`Show a pie chart of ${categoryCol} distribution`)
    }
    if (userCol && statusCol) {
      suggestions.push(`Which ${userCol} has the most ${statusCol} issues?`)
    }
    if (deviceCol && statusCol) {
      suggestions.push(`Analyze ${statusCol} by ${deviceCol}`)
    }
    if (timeCol) {
      suggestions.push(`What patterns exist in the ${timeCol} data?`)
    }
    
    // Add some general suggestions if we have specific columns
    if (csvColumns.length >= 2) {
      suggestions.push(`Compare ${csvColumns[0]} vs ${csvColumns[1]}`)
      suggestions.push(`Find correlations between ${csvColumns[0]} and other variables`)
    }
    
    // Fallback suggestions if no patterns matched
    if (suggestions.length === 0) {
      suggestions.push(`Show a chart of ${csvColumns[0]}`)
      suggestions.push(`Analyze the distribution of ${csvColumns[0]}`)
      if (csvColumns.length > 1) {
        suggestions.push(`What's the relationship between ${csvColumns[0]} and ${csvColumns[1]}?`)
      }
    }
    
    // Limit to 4 suggestions and ensure they're unique
    return [...new Set(suggestions)].slice(0, 4)
  }, [csvColumns])
  const handlePromptClick = (prompt) => setFollowup(prompt)
  const handleViewResponse = () => setResponseVisible(true)
  const handleFollowupSubmit = (e) => {
    e.preventDefault()
    if (onFollowup && followup.trim()) {
      onFollowup(followup, additionalFiles)
      setFollowup('')
      setAdditionalFiles([])
      setShowFileUpload(false)
    }
  }
  // Helper to check if the model response contains a chart spec (triple backtick json block)
  const responseHasChartSpec = (resp) => {
    if (!resp) return false
    return /```json[\s\S]*?```/i.test(resp)
  }
  
  // Transform backend chart data to Chart.js format
  const transformChartData = (backendData) => {
    if (!backendData) {
      return null
    }
    
    // If it's already in Chart.js format, return as-is
    if (backendData.datasets && Array.isArray(backendData.datasets)) {
      return backendData
    }
    
    // Handle different backend formats
    let transformedData = null
    
    // Format 1: Direct data array with labels
    if (backendData.data && backendData.labels) {
      transformedData = {
        type: backendData.type || 'bar',
        labels: backendData.labels,
        datasets: [{
          label: backendData.label || 'Data',
          data: backendData.data,
          backgroundColor: backendData.backgroundColor || [
            '#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40'
          ],
          borderColor: backendData.borderColor || '#fff',
          borderWidth: backendData.borderWidth || 1
        }]
      }
    }
    
    // Format 2: Chart.js-like but with different structure
    else if (backendData.chart_data) {
      return transformChartData(backendData.chart_data)
    }
    
    // Format 3: Plotly-like format
    else if (backendData.x && backendData.y) {
      transformedData = {
        type: backendData.type || 'line',
        labels: backendData.x,
        datasets: [{
          label: backendData.name || 'Data',
          data: backendData.y,
          backgroundColor: backendData.backgroundColor || '#36a2eb',
          borderColor: backendData.borderColor || '#36a2eb',
          borderWidth: 2,
          fill: false
        }]
      }
    }
    
    // Format 4: Simple key-value pairs
    else if (typeof backendData === 'object' && !Array.isArray(backendData)) {
      const keys = Object.keys(backendData).filter(key => !['type', 'title', 'label'].includes(key))
      const values = keys.map(key => backendData[key])
      
      transformedData = {
        type: backendData.type || 'bar',
        labels: keys,
        datasets: [{
          label: backendData.label || backendData.title || 'Data',
          data: values,
          backgroundColor: [
            '#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40'
          ]
        }]
      }
    }
    
    // Format 5: Array of objects
    else if (Array.isArray(backendData) && backendData.length > 0 && typeof backendData[0] === 'object') {
      const firstItem = backendData[0]
      const keys = Object.keys(firstItem)
      
      if (keys.length >= 2) {
        const labelKey = keys[0]
        const valueKey = keys[1]
        
        transformedData = {
          type: 'bar',
          labels: backendData.map(item => item[labelKey]),
          datasets: [{
            label: valueKey,
            data: backendData.map(item => item[valueKey]),
            backgroundColor: [
              '#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40'
            ]
          }]
        }
      }
    }
    
    if (transformedData) {
      return transformedData
    }
    
    return null
  }

  // Static chart renderer to prevent continuous re-rendering
  const renderChart = React.useCallback((rawData) => {
    if (!rawData) {
      return null
    }
    
    // Transform the data to Chart.js format
    const data = transformChartData(rawData)
    
    if (!data) {
      return <div style={{ padding: '1rem', textAlign: 'center', color: '#ff0000' }}>
        <div>Failed to transform chart data</div>
        <pre style={{ fontSize: '0.7rem', textAlign: 'left', background: '#f5f5f5', padding: '0.5rem', marginTop: '0.5rem' }}>
          {JSON.stringify(rawData, null, 2)}
        </pre>
      </div>
    }
    
    // Check if data has the expected structure
    if (!data.datasets || !Array.isArray(data.datasets)) {
      return <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
        <div>Invalid chart data structure</div>
        <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
          Expected: datasets array, got: {typeof data.datasets}
        </div>
      </div>
    }
    
    // Validate datasets structure
    if (data.datasets.length === 0) {
      return <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
        No data to display
      </div>
    }
    
    // Check first dataset structure
    const firstDataset = data.datasets[0]
    
    if (!firstDataset.data || !Array.isArray(firstDataset.data)) {
      return <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
        <div>Invalid dataset structure</div>
      </div>
    }
    
    const type = data.type || (data.labels && data.labels.length <= 8 ? 'pie' : 'bar')
    
    // Create chart options based on chart type - disable animations for stability
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: false, // Disable animations to prevent continuous loading
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: { 
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15
          }
        },
        title: { 
          display: true, 
          text: data.datasets[0]?.label || `${type.charAt(0).toUpperCase() + type.slice(1)} Chart`,
          padding: 20,
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      }
    }
    
    // Add scales only for charts that need them (not pie/doughnut)
    if (!['pie', 'doughnut'].includes(type)) {
      baseOptions.scales = {
        x: { ticks: { color: '#111' } },
        y: { ticks: { color: '#111' } }
      }
    }
    
    const chartProps = {
      data,
      options: baseOptions
    }
      
    try {
      switch (type) {
        case 'pie':
            return <Pie {...chartProps} />
        case 'doughnut':
            return <Doughnut {...chartProps} />
        case 'line':
            return <Line {...chartProps} />
        case 'scatter':
            return <Scatter {...chartProps} />
        case 'bar':
        default:
            return <Bar {...chartProps} />
      }
    } catch (error) {
      return <div style={{ padding: '1rem', textAlign: 'center', color: '#ff0000' }}>
        <div>Error rendering chart: {error.message}</div>
        <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
          Chart type: {type}
        </div>
      </div>
    }
  }, [])

  // Static chart component to prevent unnecessary re-renders
  const StaticChart = React.memo(({ data }) => {
    if (!data) return null
    return renderChart(data)
  })
    return (
    <div className="chat-fullscreen-wrapper" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      position: 'relative',
      paddingTop: '80px' // Account for fixed menu bar
    }}>
      <div 
        ref={contentAreaRef}
        style={{ 
          flex: 1, 
          minHeight: 0, 
          height: '95%', // Reduced by 5% to prevent overlap
          display: 'flex', 
          flexDirection: 'column', 
          overflowY: 'auto', 
          scrollBehavior: 'smooth',
          paddingBottom: '2rem',
          paddingLeft: '1rem',
          paddingRight: '1rem'
        }}
      >
          <div
            className={`response-box custom-element chat-response-full${isDarkMode ? ' dark' : ''}`}
            style={{
              background: isDarkMode ? '#232323' : '#fff',
              color: isDarkMode ? '#f2f2f2' : '#111',
              borderRadius: '1rem',
              height: '100%',
              maxHeight: '100%',
              overflowY: 'auto',
              paddingRight: 12,
              marginTop: 16,
              fontSize: '0.98rem',
            }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: isDarkMode ? '#f2f2f2' : '#111' }}>Model Response:</span>
            </div>

            {/* Current Files Section */}
            {currentFiles && currentFiles.length > 0 && (
              <div style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                background: isDarkMode ? '#2a2a2a' : '#f8f9fa',
                borderRadius: '0.5rem',
                border: isDarkMode ? '1px solid #444' : '1px solid #e9ecef'
              }}>
                <div style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: isDarkMode ? '#f2f2f2' : '#111',
                  marginBottom: '0.5rem'
                }}>
                  📁 Current Files ({currentFiles.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {currentFiles.map((file, index) => (
                    <span
                      key={index}
                      style={{
                        background: isDarkMode ? '#1a1a1a' : '#fff',
                        color: isDarkMode ? '#ccc' : '#666',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.8rem',
                        border: isDarkMode ? '1px solid #333' : '1px solid #ddd',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      {(typeof file === 'object' && file.isFromSession) && (
                        <span style={{ fontSize: '0.7rem' }} title="File from restored session">🔄</span>
                      )}
                      {typeof file === 'string' ? file : file.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

          <div style={{ marginTop: '0.5rem', color: isDarkMode ? '#f2f2f2' : '#111', whiteSpace: 'pre-wrap' }}>
            
            {/* Render chat history, always show at least the initial query */}
            {chatHistory && chatHistory.length > 0 ? (
              chatHistory.map((item, idx) => (
                <div key={idx} style={{ marginBottom: '1.2rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {/* User query right-aligned */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{
                      maxWidth: '70%',
                      background: isDarkMode ? '#2a3b4d' : '#e3f2fd',
                      color: isDarkMode ? '#a6e1fa' : '#1a237e',
                      borderRadius: '1rem',
                      padding: '0.6rem 1rem',
                      marginBottom: 2,
                      fontWeight: 600,
                      textAlign: 'right',
                    }}>
                      {item.query}
                    </div>
                  </div>
                  {/* Model response left-aligned, render markdown */}
                  <div style={{ display: 'flex', justifyContent: 'flex-start', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{
                      maxWidth: '70%',
                      background: isDarkMode ? '#3a2a1a' : '#fff3e0',
                      color: isDarkMode ? '#ffd580' : '#a36a4f',
                      borderRadius: '1rem',
                      padding: '0.6rem 1rem',
                      marginBottom: 2,
                      fontWeight: 600,
                      textAlign: 'left',
                    }}>
                      <span dangerouslySetInnerHTML={{ __html: marked.parse(item.response || '') }} />
                    </div>
                    
                    {/* Show chart for this specific message if it has chart data */}
                    {item.chartData && (
                      <div style={{
                        width: '100%',
                        maxWidth: '600px',
                        marginTop: '0.5rem',
                        padding: '1rem',
                        background: isDarkMode ? '#2a2a2a' : '#f8f9fa',
                        borderRadius: '0.75rem',
                        border: isDarkMode ? '1px solid #444' : '1px solid #e9ecef'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          marginBottom: '1rem'
                        }}>
                          <h4 style={{ 
                            margin: 0, 
                            color: isDarkMode ? '#f2f2f2' : '#111',
                            fontSize: '0.9rem',
                            fontWeight: 600
                          }}>
                            📊 Visualization
                          </h4>
                          <ExportButton 
                            chartData={item.chartData}
                            title="Generated Chart"
                            isDarkMode={isDarkMode}
                            onExport={(result) => {
                              if (result.success) {
                                console.log('Chart exported successfully:', result)
                              } else {
                                console.error('Export failed:', result.error)
                              }
                            }}
                          />
                        </div>
                        <div 
                          className="chart-container"
                          style={{ 
                            height: '250px',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                          }}
                        >
                          <div style={{ width: '100%', height: '100%' }}>
                            <StaticChart data={item.chartData} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              // If no chatHistory, show the initial query and response
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                  <div style={{
                    maxWidth: '70%',
                    background: isDarkMode ? '#2a3b4d' : '#e3f2fd',
                    color: isDarkMode ? '#a6e1fa' : '#1a237e',
                    borderRadius: '1rem',
                    padding: '0.6rem 1rem',
                    fontWeight: 600,
                    textAlign: 'right',
                  }}>
                    {response ? 'Initial Query' : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-start', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{
                    maxWidth: '70%',
                    background: isDarkMode ? '#3a2a1a' : '#fff3e0',
                    color: isDarkMode ? '#ffd580' : '#a36a4f',
                    borderRadius: '1rem',
                    padding: '0.6rem 1rem',
                    fontWeight: 600,
                    textAlign: 'left',
                  }}>
                    <span dangerouslySetInnerHTML={{ __html: marked.parse(response || '') }} />
                  </div>
                  
                  {/* Show chart for current response if available */}
                  {chartData && !loading && (
                    <div style={{
                      width: '100%',
                      maxWidth: '600px',
                      marginTop: '0.5rem',
                      padding: '1rem',
                      background: isDarkMode ? '#2a2a2a' : '#f8f9fa',
                      borderRadius: '0.75rem',
                      border: isDarkMode ? '1px solid #444' : '1px solid #e9ecef'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: '1rem'
                      }}>
                        <h4 style={{ 
                          margin: 0, 
                          color: isDarkMode ? '#f2f2f2' : '#111',
                          fontSize: '0.9rem',
                          fontWeight: 600
                        }}>
                          📊 Visualization
                        </h4>
                        <ExportButton 
                          chartData={chartData}
                          title="Generated Chart"
                          isDarkMode={isDarkMode}
                          onExport={(result) => {
                            if (result.success) {
                              console.log('Chart exported successfully:', result)
                            } else {
                              console.error('Export failed:', result.error)
                            }
                          }}
                        />
                      </div>
                                             <div 
                         className="chart-container"
                         style={{ 
                           height: '250px',
                           width: '100%',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           position: 'relative'
                         }}
                       >
                         <div style={{ width: '100%', height: '100%' }}>
                           <StaticChart data={chartData} />
                         </div>
                       </div>
                    </div>
                  )}
                </div>
              </>
            )}
            {/* Loading animation at the end if loading */}
            {loading && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{
                    maxWidth: '70%',
                    background: isDarkMode ? '#3a2a1a' : '#fff3e0',
                    color: isDarkMode ? '#ffd580' : '#a36a4f',
                    borderRadius: '1rem',
                    padding: '0.6rem 1rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: `2px solid ${isDarkMode ? '#ffd580' : '#a36a4f'}`,
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <span>Analyzing your request...</span>
                    <style>{`
                      @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                      }
                    `}</style>
                  </div>
                </div>
                <LoadingDots />
              </div>
            )}

            {/* Follow-up suggestions inline below response */}
            {submitted && !loading && promptSuggestions.length > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: isDarkMode ? '1px solid #333' : '1px solid #eee',
                flexWrap: 'wrap'
              }}>
                <span style={{
                  fontSize: '1.2rem',
                  flexShrink: 0
                }}>💡</span>
                {promptSuggestions.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePromptClick(prompt)}
                    style={{
                      background: isDarkMode 
                        ? 'linear-gradient(135deg, #2a3b4d 0%, #1e2a3a 100%)' 
                        : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                      color: isDarkMode ? '#a6e1fa' : '#1a237e',
                      border: 'none',
                      borderRadius: '18px',
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontWeight: 500,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: isDarkMode 
                        ? '0 2px 8px rgba(0,0,0,0.3)' 
                        : '0 2px 8px rgba(0,0,0,0.1)',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      maxWidth: '200px',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px) scale(1.02)'
                      e.target.style.boxShadow = isDarkMode 
                        ? '0 4px 12px rgba(0,0,0,0.4)' 
                        : '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0) scale(1)'
                      e.target.style.boxShadow = isDarkMode 
                        ? '0 2px 8px rgba(0,0,0,0.3)' 
                        : '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    title={prompt}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
          
                              {/* Scroll anchor for auto-scroll */}
          <div ref={scrollAnchorRef} style={{ height: '1px' }} />
           
        </div>



      {/* Scroll to bottom button */}
      {showScrollToBottom && (
        <button
          className="scroll-to-bottom-btn"
          onClick={scrollToBottom}
          style={{
            position: 'fixed',
            bottom: '120px',
            right: '2rem',
            background: isDarkMode ? '#2a3b4d' : '#e3f2fd',
            color: isDarkMode ? '#a6e1fa' : '#1a237e',
            border: 'none',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 15,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)'
            e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)'
            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
          }}
          title="Scroll to bottom"
          aria-label="Scroll to bottom of conversation"
        >
          ↓
        </button>
      )}



      {/* Fixed bottom input section */}
      <div style={{ 
        position: 'fixed', 
        bottom: 0,
        left: 0,
        right: 0,
        background: isDarkMode ? '#1a1a1a' : '#fff',
        borderTop: isDarkMode ? '1px solid #333' : '1px solid #eee',
        padding: '1rem',
        zIndex: 10,
        boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{ width: '100%', maxWidth: '900px' }}>

        {/* File Upload Section */}
        {showFileUpload && (
          <div style={{
            padding: '1rem',
            background: isDarkMode ? '#2a2a2a' : '#f8f9fa',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            border: isDarkMode ? '1px solid #444' : '1px solid #e9ecef'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem'
            }}>
              <span style={{
                fontWeight: 600,
                color: isDarkMode ? '#f2f2f2' : '#111',
                fontSize: '0.9rem'
              }}>
                📎 Add More Files
              </span>
              <button
                onClick={() => setShowFileUpload(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isDarkMode ? '#ccc' : '#666',
                  cursor: 'pointer',
                  fontSize: '1.2rem'
                }}
              >
                ✕
              </button>
            </div>
            
            <input
              type="file"
              multiple
              accept=".csv,.xlsx,.xls,.xlsm,.xlsb,.odf,.ods,.odt"
              onChange={handleFileChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: isDarkMode ? '1px solid #444' : '1px solid #ddd',
                borderRadius: '0.25rem',
                background: isDarkMode ? '#1a1a1a' : '#fff',
                color: isDarkMode ? '#f2f2f2' : '#111',
                fontSize: '0.9rem'
              }}
            />
            
            {additionalFiles.length > 0 && (
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{
                  fontSize: '0.8rem',
                  color: isDarkMode ? '#ccc' : '#666',
                  marginBottom: '0.5rem'
                }}>
                  Selected files ({additionalFiles.length}):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {additionalFiles.map((file, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: isDarkMode ? '#1a1a1a' : '#fff',
                        color: isDarkMode ? '#ccc' : '#666',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.8rem',
                        border: isDarkMode ? '1px solid #333' : '1px solid #ddd'
                      }}
                    >
                      <span>{file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: isDarkMode ? '#ff6b6b' : '#dc3545',
                          cursor: 'pointer',
                          marginLeft: '0.5rem',
                          fontSize: '0.8rem'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

                  <form className="chat-followup-form" onSubmit={handleFollowupSubmit}>
            <div style={{ display: 'flex', alignItems: 'stretch', gap: '0.5rem', width: '100%' }}>
              <button
                type="button"
                onClick={() => setShowFileUpload(!showFileUpload)}
                disabled={loading}
                style={{
                  background: isDarkMode ? '#232323' : '#fff',
                  color: isDarkMode ? '#f2f2f2' : '#111',
                  border: isDarkMode ? '1px solid #444' : '1px solid #bbb',
                  fontSize: '0.95rem',
                  padding: '0.55rem 0.75rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  borderRadius: '0.25rem',
                  height: '2.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: loading ? 0.6 : 1
                }}
                title={loading ? "Processing..." : "Add more files"}
              >
                📎
              </button>
              
              <input
                className="chat-followup-input custom-element"
                type="text"
                placeholder={loading ? "Processing..." : "Ask a follow-up question..."}
                value={followup}
                onChange={e => setFollowup(e.target.value)}
                disabled={loading}
                style={{
                  background: isDarkMode ? '#232323' : '#fff',
                  color: isDarkMode ? '#f2f2f2' : '#111',
                  border: isDarkMode ? '1px solid #444' : '1px solid #bbb',
                  fontSize: '0.95rem',
                  padding: '0.55rem 0.9rem',
                  flex: 1.3,
                  height: '2.5rem',
                  boxSizing: 'border-box',
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'text'
                }}
              />
              
              <button
                type="submit"
                className="submit-btn custom-element"
                disabled={loading || !followup.trim()}
                style={{
                  background: isDarkMode ? '#232323' : '#fff',
                  color: isDarkMode ? '#f2f2f2' : '#111',
                  border: isDarkMode ? '1px solid #444' : '1px solid #bbb',
                  fontSize: '0.95rem',
                  padding: '0.55rem 0.3rem',
                  minWidth: 'auto',
                  height: '2.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: (loading || !followup.trim()) ? 0.6 : 1,
                  cursor: (loading || !followup.trim()) ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: `2px solid ${isDarkMode ? '#f2f2f2' : '#111'}`,
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                ) : (
                  'Send'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChatScreen 