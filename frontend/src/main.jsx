import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { LanguageProvider } from './context/LanguageContext'

// Replace with your Google Client ID from Google Cloud Console
const GOOGLE_CLIENT_ID = '218162675386-krf5m5841rs44q9s31kp9vrtueihfacb.apps.googleusercontent.com'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LanguageProvider>
        <BrowserRouter>
           <App />
        </BrowserRouter>
      </LanguageProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
