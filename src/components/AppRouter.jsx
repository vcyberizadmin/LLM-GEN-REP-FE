import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import PasswordProtect from './PasswordProtect'
import App from '../App'

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Protected route - main app */}
        <Route 
          path="/dashboard" 
          element={
            <PasswordProtect>
              <App />
            </PasswordProtect>
          } 
        />
        
        {/* Login route */}
        <Route 
          path="/login" 
          element={<PasswordProtect />} 
        />
        
        {/* Default redirect to dashboard (which will show login if not authenticated) */}
        <Route 
          path="/" 
          element={<Navigate to="/dashboard" replace />} 
        />
        
        {/* Catch all other routes and redirect to dashboard */}
        <Route 
          path="*" 
          element={<Navigate to="/dashboard" replace />} 
        />
      </Routes>
    </Router>
  )
}

export default AppRouter 