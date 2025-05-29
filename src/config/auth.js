// Authentication configuration
export const AUTH_CONFIG = {
  // Change this password to your desired password
  password: 'p@ssw0rd',
  
  // Session timeout in milliseconds (24 hours by default)
  sessionTimeout: 24 * 60 * 60 * 1000,
  
  // Whether to remember authentication across browser sessions
  persistAuth: true,
  
  // Whether to show password strength indicator
  showPasswordStrength: false,
  
  // Maximum login attempts before temporary lockout
  maxLoginAttempts: 5,
  
  // Lockout duration in milliseconds (15 minutes)
  lockoutDuration: 15 * 60 * 1000
}

// Helper function to check if session is expired
export const isSessionExpired = () => {
  if (!AUTH_CONFIG.persistAuth) return false
  
  const loginTime = localStorage.getItem('loginTime')
  if (!loginTime) return true
  
  const elapsed = Date.now() - parseInt(loginTime)
  return elapsed > AUTH_CONFIG.sessionTimeout
}

// Helper function to set login time
export const setLoginTime = () => {
  localStorage.setItem('loginTime', Date.now().toString())
}

// Helper function to clear auth data
export const clearAuthData = () => {
  localStorage.removeItem('isAuthenticated')
  localStorage.removeItem('loginTime')
  localStorage.removeItem('loginAttempts')
  localStorage.removeItem('lockoutTime')
} 