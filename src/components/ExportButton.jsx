import React, { useState, useRef } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const ExportButton = ({ chartData, title = "", onExport, isDarkMode = false }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const chartRef = useRef(null)

  const handlePDFExport = async () => {
    setIsExporting(true)
    setIsDropdownOpen(false)
    
    try {
      // Find the chart canvas element
      const chartContainer = document.querySelector('.chart-container canvas') || 
                           document.querySelector('canvas[role="img"]') ||
                           document.querySelector('canvas')
      
      if (!chartContainer) {
        throw new Error('Chart not found for export')
      }

      // Create canvas from chart element
      const canvas = await html2canvas(chartContainer, {
        backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        logging: false
      })

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })

      // Calculate dimensions to fit the chart nicely in PDF
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      const availableWidth = pdfWidth - (margin * 2)
      const availableHeight = pdfHeight - (margin * 3) // Extra margin for title

      // Calculate aspect ratio
      const canvasAspectRatio = canvas.width / canvas.height
      let chartWidth = availableWidth
      let chartHeight = availableWidth / canvasAspectRatio

      // If height exceeds available space, scale down
      if (chartHeight > availableHeight) {
        chartHeight = availableHeight
        chartWidth = availableHeight * canvasAspectRatio
      }

      // Center the chart
      const xPosition = (pdfWidth - chartWidth) / 2
      const yPosition = margin + 15 // Leave space for title

      // Add title
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(isDarkMode ? 240 : 40)
      const titleText = title || 'Chart Visualization'
      const titleWidth = pdf.getTextWidth(titleText)
      const titleX = (pdfWidth - titleWidth) / 2
      pdf.text(titleText, titleX, margin)

      // Add chart image
      const imgData = canvas.toDataURL('image/png', 1.0)
      pdf.addImage(imgData, 'PNG', xPosition, yPosition, chartWidth, chartHeight)

      // Add metadata
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(isDarkMode ? 180 : 100)
      const timestamp = new Date().toLocaleString()
      pdf.text(`Generated on: ${timestamp}`, margin, pdfHeight - 10)
      pdf.text('LLM-GEN-REPORT', pdfWidth - margin - 40, pdfHeight - 10)

      // Save the PDF
      const filename = `chart-${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${Date.now()}.pdf`
      pdf.save(filename)
      
      if (onExport) {
        onExport({ 
          success: true, 
          format: 'pdf', 
          filename,
          stats: {
            width: chartWidth,
            height: chartHeight,
            pages: 1
          }
        })
      }
    } catch (error) {
      console.error('PDF export error:', error)
      if (onExport) {
        onExport({ success: false, error: error.message })
      }
      alert('PDF export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleDataExport = async (format) => {
    setIsExporting(true)
    setIsDropdownOpen(false)
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/export/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chart_data: chartData,
          format: format,
          title: title
        })
      })

      if (!response.ok) {
        throw new Error('Data export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `chart-data-${Date.now()}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      if (onExport) {
        onExport({ success: true, format, filename: link.download })
      }
    } catch (error) {
      console.error('Data export error:', error)
      if (onExport) {
        onExport({ success: false, error: error.message })
      }
      alert('Data export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleCopyChartData = async () => {
    setIsExporting(true)
    setIsDropdownOpen(false)
    
    try {
      const dataString = JSON.stringify(chartData, null, 2)
      await navigator.clipboard.writeText(dataString)
      
      if (onExport) {
        onExport({ success: true, format: 'clipboard' })
      }
      
      // Show success message
      const originalText = document.querySelector('.export-btn-text')?.textContent
      const textElement = document.querySelector('.export-btn-text')
      if (textElement) {
        textElement.textContent = 'Copied!'
        setTimeout(() => {
          textElement.textContent = originalText
        }, 2000)
      }
    } catch (error) {
      console.error('Copy to clipboard error:', error)
      if (onExport) {
        onExport({ success: false, error: error.message })
      }
      alert('Failed to copy to clipboard.')
    } finally {
      setIsExporting(false)
    }
  }

  const exportOptions = [
    { label: 'PDF Document', value: 'pdf', icon: '📄', action: handlePDFExport },
    { label: 'CSV Data', value: 'csv', icon: '📊', action: () => handleDataExport('csv') },
    { label: 'JSON Data', value: 'json', icon: '📋', action: () => handleDataExport('json') },
    { label: 'Copy Chart Data', value: 'clipboard', icon: '📋', action: handleCopyChartData },
  ]

  const handleOptionClick = (option) => {
    if (option.action) {
      option.action()
    }
  }

  if (!chartData) return null

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={isExporting}
        style={{
          background: isDarkMode ? '#2a3b4d' : '#e3f2fd',
          color: isDarkMode ? '#a6e1fa' : '#1a237e',
          border: isDarkMode ? '1px solid #444' : '1px solid #bbb',
          borderRadius: '0.5rem',
          padding: '0.5rem 1rem',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: isExporting ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          transition: 'all 0.2s ease',
          opacity: isExporting ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isExporting) {
            e.target.style.transform = 'translateY(-1px)'
            e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isExporting) {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = 'none'
          }
        }}
      >
        <span className="export-btn-text">
          {isExporting ? 'Exporting...' : '📤 Export'}
        </span>
        <span style={{ 
          transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }}>
          ▼
        </span>
      </button>

      {isDropdownOpen && !isExporting && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '0.25rem',
            background: isDarkMode ? '#232323' : '#fff',
            border: isDarkMode ? '1px solid #444' : '1px solid #ddd',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            minWidth: '180px',
            overflow: 'hidden',
          }}
        >
          {exportOptions.map((option, index) => (
            <button
              key={option.value}
              onClick={() => handleOptionClick(option)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'transparent',
                color: isDarkMode ? '#f2f2f2' : '#111',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderBottom: index < exportOptions.length - 1 ? 
                  (isDarkMode ? '1px solid #444' : '1px solid #eee') : 'none',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = isDarkMode ? '#333' : '#f5f5f5'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent'
              }}
            >
              <span>{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  )
}

export default ExportButton 