import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AUTH_CONFIG, isSessionExpired, setLoginTime, clearAuthData } from '../config/auth'

const PasswordProtect = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0)
  const [screenDimensions, setScreenDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })
  const navigate = useNavigate()
  const location = useLocation()

  // Check for existing authentication on mount
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated')
    
    // Check if session is expired
    if (authStatus === 'true' && !isSessionExpired()) {
      setIsAuthenticated(true)
      // If on login page and already authenticated, redirect to dashboard
      if (location.pathname === '/login') {
        navigate('/dashboard', { replace: true })
      }
    } else if (authStatus === 'true' && isSessionExpired()) {
      // Session expired, clear auth data
      clearAuthData()
      setIsAuthenticated(false)
      setError('Session expired. Please login again.')
    } else {
      // Not authenticated
      setIsAuthenticated(false)
      // If on dashboard but not authenticated, redirect to login
      if (location.pathname === '/dashboard') {
        navigate('/login', { replace: true })
      }
    }

    // Check for lockout
    checkLockoutStatus()
  }, [navigate, location.pathname])

  // Listen for storage changes (like logout from another tab or component)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'isAuthenticated' && e.newValue !== 'true') {
        setIsAuthenticated(false)
        setPassword('')
        setError('')
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom logout events
    const handleLogout = () => {
      setIsAuthenticated(false)
      setPassword('')
      setError('')
    }

    window.addEventListener('logout', handleLogout)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('logout', handleLogout)
    }
  }, [])

  // Set dark mode based on time
  useEffect(() => {
    const now = new Date()
    const hour = now.getHours()
    const isDark = hour >= 18 || hour < 6
    setIsDarkMode(isDark)
  }, [])

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setScreenDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Lockout timer effect
  useEffect(() => {
    let interval
    if (isLocked && lockoutTimeRemaining > 0) {
      interval = setInterval(() => {
        setLockoutTimeRemaining(prev => {
          if (prev <= 1000) {
            setIsLocked(false)
            setError('')
            return 0
          }
          return prev - 1000
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isLocked, lockoutTimeRemaining])

  const checkLockoutStatus = () => {
    const lockoutTime = localStorage.getItem('lockoutTime')
    if (lockoutTime) {
      const timeRemaining = parseInt(lockoutTime) + AUTH_CONFIG.lockoutDuration - Date.now()
      if (timeRemaining > 0) {
        setIsLocked(true)
        setLockoutTimeRemaining(timeRemaining)
        setError(`Too many failed attempts. Try again in ${Math.ceil(timeRemaining / 60000)} minutes.`)
      } else {
        localStorage.removeItem('lockoutTime')
        localStorage.removeItem('loginAttempts')
      }
    }
  }

  const handleFailedAttempt = () => {
    const attempts = parseInt(localStorage.getItem('loginAttempts') || '0') + 1
    localStorage.setItem('loginAttempts', attempts.toString())

    if (attempts >= AUTH_CONFIG.maxLoginAttempts) {
      localStorage.setItem('lockoutTime', Date.now().toString())
      setIsLocked(true)
      setLockoutTimeRemaining(AUTH_CONFIG.lockoutDuration)
      setError(`Too many failed attempts. Account locked for ${AUTH_CONFIG.lockoutDuration / 60000} minutes.`)
    } else {
      setError(`Incorrect password. ${AUTH_CONFIG.maxLoginAttempts - attempts} attempts remaining.`)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (isLocked) {
      setError('Account is temporarily locked. Please wait.')
      return
    }

    setIsLoading(true)
    setError('')

    // Simulate loading for better UX
    await new Promise(resolve => setTimeout(resolve, 800))
    
    if (password === AUTH_CONFIG.password) {
      setIsAuthenticated(true)
      localStorage.setItem('isAuthenticated', 'true')
      setLoginTime()
      
      // Clear failed attempts on successful login
      localStorage.removeItem('loginAttempts')
      localStorage.removeItem('lockoutTime')
      
      // Navigate to dashboard after successful login
      navigate('/dashboard', { replace: true })
    } else {
      handleFailedAttempt()
      setPassword('')
    }
    
    setIsLoading(false)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    clearAuthData()
    setPassword('')
    // Navigate to login page
    navigate('/login', { replace: true })
  }

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Responsive calculations
  const isMobile = screenDimensions.width < 768
  const isTablet = screenDimensions.width >= 768 && screenDimensions.width < 1024
  const isDesktop = screenDimensions.width >= 1024

  // If authenticated and we have children (dashboard route), render children with logout option
  if (isAuthenticated && children) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: '#ffffff',
        color: '#000000',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        overflow: 'auto'
      }}>
        {/* Main content with responsive container */}
        <div style={{
          width: '100%',
          maxWidth: isDesktop ? '1400px' : isTablet ? '100%' : '100%',
          margin: '0 auto',
          padding: isMobile ? '1rem' : isTablet ? '1.5rem' : '2rem',
          paddingTop: isMobile ? '1rem' : '2rem', // Removed extra padding for logout button
        }}>
          {children}
        </div>
      </div>
    )
  }

  // If authenticated but no children (login route), redirect to dashboard
  if (isAuthenticated && !children) {
    return null
  }

  // Login form
  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '1rem' : '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      
      <div style={{
        background: '#ffffff',
        border: '2px solid #e0e0e0',
        borderRadius: '1rem',
        padding: isMobile ? '2rem' : '3rem',
        width: '100%',
        maxWidth: isMobile ? '350px' : '400px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        position: 'relative',
      }}>
        {/* Header with vCyberiz Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <img 
              src="/vcyberiz-logo.png" 
              alt="vCyberiz Logo" 
              style={{
                height: isMobile ? '60px' : '80px',
                width: 'auto',
                objectFit: 'contain'
              }}
            />
          </div>
          <p style={{
            color: '#666666',
            fontSize: isMobile ? '0.9rem' : '1rem',
            margin: 0,
            fontWeight: '400'
          }}>
            {isLocked ? 'Account temporarily locked' : 'Enter password to access the dashboard'}
          </p>
        </div>

        {/* Lockout timer */}
        {isLocked && lockoutTimeRemaining > 0 && (
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#856404',
            fontSize: '0.875rem',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏰</div>
            <div>Account locked for: {formatTime(lockoutTimeRemaining)}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
            <label style={{
              display: 'block',
              color: '#333333',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading || isLocked}
                style={{
                  width: '100%',
                  padding: '1rem 3rem 1rem 1rem',
                  fontSize: '1rem',
                  border: error ? '2px solid #dc3545' : '2px solid #e0e0e0',
                  borderRadius: '0.5rem',
                  background: '#ffffff',
                  color: '#000000',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                  opacity: isLocked ? 0.5 : 1
                }}
                onFocus={(e) => {
                  if (!isLocked) {
                    e.target.style.border = '2px solid #007bff'
                  }
                }}
                onBlur={(e) => {
                  e.target.style.border = error ? '2px solid #dc3545' : '2px solid #e0e0e0'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLocked}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#666666',
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  fontSize: '1.25rem',
                  padding: '0.25rem',
                  borderRadius: '0.25rem',
                  transition: 'color 0.2s ease',
                  opacity: isLocked ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isLocked) {
                    e.target.style.color = '#000000'
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#666666'
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: error.includes('locked') ? '#fff3cd' : '#f8d7da',
              border: error.includes('locked') ? '1px solid #ffeaa7' : '1px solid #f5c6cb',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              marginBottom: '1.5rem',
              color: error.includes('locked') ? '#856404' : '#721c24',
              fontSize: '0.875rem',
              textAlign: 'center',
              animation: 'shake 0.5s ease-in-out'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password.trim() || isLocked}
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#ffffff',
              background: isLoading || !password.trim() || isLocked
                ? '#cccccc' 
                : '#007bff',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: isLoading || !password.trim() || isLocked ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              position: 'relative',
              overflow: 'hidden',
              opacity: isLoading || !password.trim() || isLocked ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!isLoading && password.trim() && !isLocked) {
                e.target.style.background = '#0056b3'
                e.target.style.transform = 'translateY(-1px)'
                e.target.style.boxShadow = '0 4px 12px rgba(0,123,255,0.3)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading && password.trim() && !isLocked) {
                e.target.style.background = '#007bff'
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = 'none'
              }
            }}
          >
            {isLocked ? (
              '🔒 Account Locked'
            ) : isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '1rem',
                  height: '1rem',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid #ffffff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Authenticating...
              </span>
            ) : (
              '🚀 Access Dashboard'
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          color: '#999999',
          fontSize: '0.75rem'
        }}>
          Secure access to your data analytics platform
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        input::placeholder {
          color: #999999;
        }
      `}</style>
    </div>
  )
}

export default PasswordProtect 