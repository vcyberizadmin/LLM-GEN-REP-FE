# Password Protection System

This frontend application now includes a robust password protection system with React Router integration. The system provides secure access to your data analytics dashboard with modern UI/UX design.

## Features

### 🔐 **Secure Authentication**
- Password-based access control
- Session management with configurable timeout
- Persistent authentication across browser sessions
- Secure logout functionality

### 🛡️ **Enhanced Security**
- Failed login attempt tracking
- Automatic account lockout after multiple failed attempts
- Configurable lockout duration
- Session expiration handling
- Secure credential storage

### 🎨 **Modern UI/UX**
- Sleek, clean aesthetic with playful touches
- Responsive design for all devices
- Dark/light mode based on time of day
- Smooth animations and micro-interactions
- Glass-morphism design elements
- Loading states and visual feedback

### 🚀 **React Router Integration**
- Protected routes
- Automatic redirects
- Clean URL structure
- Navigation state management

## Quick Setup

### 1. **Configure Your Password**

Edit the password in `src/config/auth.js`:

```javascript
export const AUTH_CONFIG = {
  // Change this to your desired password
  password: 'your_secure_password_here',
  
  // Other configuration options...
}
```

### 2. **Start the Application**

```bash
cd frontend
npm install
npm run dev
```

### 3. **Access the Dashboard**

- Navigate to `http://localhost:5173`
- You'll be automatically redirected to the login page
- Enter your password to access the dashboard
- Use the logout button in the top-right corner to sign out

## Configuration Options

The authentication system is highly configurable through `src/config/auth.js`:

```javascript
export const AUTH_CONFIG = {
  // Main password for access
  password: 'your_password_here',
  
  // Session timeout (24 hours default)
  sessionTimeout: 24 * 60 * 60 * 1000,
  
  // Remember authentication across browser sessions
  persistAuth: true,
  
  // Maximum failed login attempts before lockout
  maxLoginAttempts: 5,
  
  // Lockout duration (15 minutes default)
  lockoutDuration: 15 * 60 * 1000
}
```

## Routes

The application uses the following route structure:

- `/` - Redirects to `/dashboard`
- `/dashboard` - Protected main application (requires authentication)
- `/login` - Login page (redirects to dashboard if already authenticated)
- `/*` - Any other route redirects to `/dashboard`

## Security Features

### **Session Management**
- Sessions automatically expire after the configured timeout
- Users are prompted to re-authenticate when sessions expire
- Authentication state persists across browser restarts (configurable)

### **Brute Force Protection**
- Failed login attempts are tracked
- Account locks after reaching the maximum attempt limit
- Lockout timer displays remaining time
- Automatic unlock after the lockout period expires

### **Secure Storage**
- Authentication tokens stored in localStorage
- Automatic cleanup of expired sessions
- No sensitive data stored in plain text

## Customization

### **Styling**
The login page uses inline styles for maximum portability, but you can customize:

- Colors and gradients
- Animation timings
- Layout dimensions
- Typography

### **Behavior**
Modify the authentication logic in `src/components/PasswordProtect.jsx`:

- Add multi-factor authentication
- Integrate with external auth providers
- Add password strength requirements
- Implement remember me functionality

### **Configuration**
Extend `src/config/auth.js` with additional options:

- Different passwords for different users
- Role-based access control
- Custom session management
- Integration with backend authentication

## Development

### **File Structure**
```
src/
├── components/
│   ├── AppRouter.jsx          # Main router component
│   ├── PasswordProtect.jsx    # Authentication component
│   └── ...                    # Other components
├── config/
│   └── auth.js               # Authentication configuration
└── ...
```

### **Key Components**

1. **AppRouter** - Handles routing and route protection
2. **PasswordProtect** - Main authentication component with login UI
3. **Auth Config** - Centralized configuration for authentication settings

### **Adding New Protected Routes**

To add new protected routes, modify `src/components/AppRouter.jsx`:

```javascript
<Route 
  path="/new-protected-route" 
  element={
    <PasswordProtect>
      <YourNewComponent />
    </PasswordProtect>
  } 
/>
```

## Troubleshooting

### **Common Issues**

1. **"Session expired" message on every load**
   - Check if `persistAuth` is set to `true` in config
   - Verify localStorage is working in your browser

2. **Account locked unexpectedly**
   - Clear localStorage to reset lockout state
   - Adjust `maxLoginAttempts` in configuration

3. **Styling issues**
   - Ensure no conflicting CSS is overriding the login styles
   - Check browser compatibility for backdrop-filter support

### **Reset Authentication State**

To completely reset the authentication state:

```javascript
// Run in browser console
localStorage.removeItem('isAuthenticated')
localStorage.removeItem('loginTime')
localStorage.removeItem('loginAttempts')
localStorage.removeItem('lockoutTime')
```

## Production Considerations

### **Security**
- Use HTTPS in production
- Consider implementing server-side session validation
- Add CSRF protection for forms
- Implement proper error logging

### **Performance**
- The authentication check runs on every route change
- Consider implementing route-level code splitting
- Optimize bundle size by lazy loading components

### **Monitoring**
- Track failed login attempts
- Monitor session duration patterns
- Log authentication events for security auditing

## Browser Support

The authentication system supports:
- Chrome 88+
- Firefox 87+
- Safari 14+
- Edge 88+

Note: Some visual effects (like backdrop-filter) may degrade gracefully in older browsers.

## Automated Testing Matrix

| Layer | Trigger | Typical Duration | Tech / Command |
|-------|---------|------------------|----------------|
| **Static & Unit** | Every `git push` | < 1 min | Vitest + RTL + MSW<br>`npm test` |
| **Pact Contract** | `push` → *publish*<br>`PR` → *can-i-deploy* | ~1 min | Pact / PactFlow<br>`npm test` (consumer tests live in `src/tests/*.pact.test.js`) |
| **Local Integration** | Dev laptops (`vercel dev`) | < 1 min | Supertest (in-memory Express stubs)<br>`npm test` |
| **Preview Smoke** | Every Pull Request | 2-3 min | Playwright smoke (`*.pw.spec.ts`)<br>`npm run test:e2e` |
| **Nightly Prod** | Nightly GH Action | 2-3 min | Playwright nightly (`nightly-*.pw.spec.ts`) |
| **Perf / Security** | Weekly or Release branches | 5-10 min | Playwright budget & header checks (`perf-security.pw.spec.ts`) |

### Running tests locally

```bash
# 1. Static/unit + Pact + local integration
npm test

# 2. E2E layers (smoke, nightly, perf/security)
#    This auto-starts Vite on port 4173 for the duration of the run.
npm run test:e2e
```

* Playwright discovers any file ending with `.pw.spec.ts`.
* New tests can be dropped into the repo root or sub-dirs and will auto-run.
* The Vite dev-server is reused across test files for speed.

### Performance Budget
* Fails if first page load (navigationStart → loadEventEnd) exceeds **4 seconds**.
* Threshold can be tuned in `perf-security.pw.spec.ts` (`MAX_LOAD_TIME`).

### Security Checks
* Verifies presence (if returned) of defensive headers such as `X-Content-Type-Options` and a non-empty `Content-Security-Policy`.
* Extend the `EXPECTED_HEADERS` map to enforce stricter rules.

---
Everything passes locally with:

```bash
npm test            # 22 unit & pact & integration tests
npm run test:e2e    # 3 Playwright suites (smoke, nightly, perf/security)
```

---
**Need help?** Check the component source code for detailed implementation or modify the configuration to suit your specific requirements. 